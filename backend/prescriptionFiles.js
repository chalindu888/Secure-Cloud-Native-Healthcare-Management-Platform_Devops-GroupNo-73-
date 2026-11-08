import express from 'express';

// Prescription papers: the treating doctor uploads a PDF or a picture (photo / scan) for an
// appointment, and the patient of that appointment can open it. Files are kept in the database and
// are only served to the doctor and the patient of that appointment.

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FILES_PER_APPOINTMENT = 5;

// Type is decided from the file's own first bytes, never from what the browser claims
const detectType = (buf) => {
  if (buf.length > 4 && buf.slice(0, 5).toString('latin1') === '%PDF-') return { mime: 'application/pdf', ext: 'pdf' };
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' };
  if (buf.length > 8 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: 'image/png', ext: 'png' };
  if (buf.length > 12 && buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP') return { mime: 'image/webp', ext: 'webp' };
  return null;
};

const cleanName = (raw, ext) => {
  const base = String(raw || '').replace(/[\\/:*?"<>|\x00-\x1f]/g, '').trim().slice(0, 100);
  return base || `prescription.${ext}`;
};

export const initPrescriptionTables = async (pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS prescription_files (
      id SERIAL PRIMARY KEY,
      appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
      filename VARCHAR(120) NOT NULL,
      mime VARCHAR(50) NOT NULL,
      size INTEGER NOT NULL,
      data BYTEA NOT NULL,
      uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_prescription_files_appointment ON prescription_files (appointment_id)');
};

export const registerPrescriptionRoutes = (app, pool, { authenticate, requireRole }) => {
  const fail = (res, err) => {
    console.error(err.message);
    res.status(500).json({ error: 'A server error occurred.' });
  };

  // Loads the appointment only if the signed-in person is its doctor or its patient
  const ownAppointment = async (appointmentId, user) => {
    if (!Number.isInteger(appointmentId)) return null;
    const result = await pool.query('SELECT id, patient_id, doctor_id, status FROM appointments WHERE id = $1', [appointmentId]);
    const apt = result.rows[0];
    if (!apt) return null;
    const mine = user.role === 'doctor' ? apt.doctor_id === user.id : user.role === 'patient' ? apt.patient_id === user.id : false;
    return mine ? apt : null;
  };

  const LIST_SQL = `SELECT id, filename, mime, size, uploaded_at AS "uploadedAt"
                    FROM prescription_files WHERE appointment_id = $1 ORDER BY id`;

  app.get('/api/appointments/:id/prescription-files', authenticate, requireRole('doctor', 'patient'), async (req, res) => {
    try {
      const apt = await ownAppointment(Number(req.params.id), req.user);
      if (!apt) return res.status(404).json({ error: 'Appointment not found.' });
      const files = await pool.query(LIST_SQL, [apt.id]);
      res.json({ files: files.rows });
    } catch (err) {
      fail(res, err);
    }
  });

  // The file itself is the request body (not JSON): ?filename=... names it
  const rawBody = express.raw({ type: () => true, limit: MAX_BYTES });
  app.post('/api/appointments/:id/prescription-files', authenticate, requireRole('doctor'), rawBody, async (req, res) => {
    try {
      const apt = await ownAppointment(Number(req.params.id), req.user);
      if (!apt) return res.status(404).json({ error: 'Appointment not found.' });
      if (apt.status === 'cancelled') return res.status(409).json({ error: 'This appointment was cancelled.' });

      const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
      if (body.length === 0) return res.status(400).json({ error: 'Please choose a file.' });
      const type = detectType(body);
      if (!type) return res.status(400).json({ error: 'Only PDF, JPG, PNG or WebP files can be uploaded.' });

      const count = await pool.query('SELECT COUNT(*)::int AS n FROM prescription_files WHERE appointment_id = $1', [apt.id]);
      if (count.rows[0].n >= MAX_FILES_PER_APPOINTMENT) {
        return res.status(409).json({ error: `You can attach up to ${MAX_FILES_PER_APPOINTMENT} files to one appointment.` });
      }

      await pool.query(
        'INSERT INTO prescription_files (appointment_id, filename, mime, size, data) VALUES ($1,$2,$3,$4,$5)',
        [apt.id, cleanName(req.query.filename, type.ext), type.mime, body.length, body]
      );
      const files = await pool.query(LIST_SQL, [apt.id]);
      res.status(201).json({ message: 'File uploaded.', files: files.rows });
    } catch (err) {
      fail(res, err);
    }
  });

  // Too-large uploads are rejected by express.raw before reaching the route
  // eslint-disable-next-line no-unused-vars
  app.use('/api/appointments/:id/prescription-files', (err, _req, res, next) => {
    if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'The file is too large. The limit is 5 MB.' });
    return next(err);
  });

  const loadFile = async (fileId, user) => {
    if (!Number.isInteger(fileId)) return null;
    const result = await pool.query('SELECT f.*, a.patient_id, a.doctor_id FROM prescription_files f JOIN appointments a ON a.id = f.appointment_id WHERE f.id = $1', [fileId]);
    const file = result.rows[0];
    if (!file) return null;
    const mine = user.role === 'doctor' ? file.doctor_id === user.id : user.role === 'patient' ? file.patient_id === user.id : false;
    return mine ? file : null;
  };

  app.get('/api/prescription-files/:id', authenticate, requireRole('doctor', 'patient'), async (req, res) => {
    try {
      const file = await loadFile(Number(req.params.id), req.user);
      if (!file) return res.status(404).json({ error: 'File not found.' });
      res.set({
        'Content-Type': file.mime,
        'Content-Length': String(file.size),
        'Content-Disposition': `inline; filename="${file.filename.replace(/[^\w.\- ]/g, '_')}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      });
      res.send(file.data);
    } catch (err) {
      fail(res, err);
    }
  });

  app.delete('/api/prescription-files/:id', authenticate, requireRole('doctor'), async (req, res) => {
    try {
      const file = await loadFile(Number(req.params.id), req.user);
      if (!file) return res.status(404).json({ error: 'File not found.' });
      await pool.query('DELETE FROM prescription_files WHERE id = $1', [file.id]);
      res.json({ message: 'File removed.' });
    } catch (err) {
      fail(res, err);
    }
  });
};

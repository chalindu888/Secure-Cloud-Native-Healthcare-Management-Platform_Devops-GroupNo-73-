// Hospital admissions: every admitted patient gets an admission number (ADM-0001...), a room and a
// bed in the hospital building, and the doctor in charge. Rooms have map coordinates so the
// frontend can draw the floor plan and show where each patient is.

// Floor plan grid: viewBox 0 0 100 60. A corridor runs through the middle of every floor, with five
// rooms along the north side (top) and five along the south side (bottom).
const FLOORS = {
  1: {
    north: [
      ['General Ward A (Male)', 'General Ward', 6],
      ['General Ward B (Female)', 'General Ward', 6],
      ['Children Ward', 'Paediatric Ward', 6],
      ['Maternity Ward', 'Maternity Ward', 4],
      ['Isolation Room', 'Isolation', 2],
    ],
    south: Array.from({ length: 5 }, () => [null, 'Private Room', 1]),
  },
  2: {
    north: [
      ['Intensive Care Unit', 'ICU', 6],
      ['High Dependency Unit', 'HDU', 4],
      ['Cardiac Care Unit', 'Cardiac Care', 4],
      ['Surgical Ward', 'Surgical Ward', 6],
      ['Post-op Recovery', 'Recovery', 4],
    ],
    south: Array.from({ length: 5 }, () => [null, 'Private Room', 1]),
  },
  3: {
    north: Array.from({ length: 5 }, () => [null, 'Deluxe Room', 1]),
    south: Array.from({ length: 5 }, () => [null, 'Semi-private Room', 2]),
  },
};

const buildRooms = () => {
  const rooms = [];
  Object.entries(FLOORS).forEach(([floor, sides]) => {
    [['north', 4], ['south', 36]].forEach(([side, y], sideIndex) => {
      sides[side].forEach(([name, type, beds], i) => {
        const number = sideIndex * 5 + i + 1;
        const code = String(Number(floor) * 100 + number);
        rooms.push({
          code, name: name || `Room ${code}`, type, floor: Number(floor), beds, x: 14 + i * 17, y, w: 16, h: 20,
        });
      });
    });
  });
  return rooms;
};

export const initAdmissionTables = async (pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id SERIAL PRIMARY KEY,
      code VARCHAR(10) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      room_type VARCHAR(50) NOT NULL,
      floor INTEGER NOT NULL,
      beds INTEGER NOT NULL CHECK (beds > 0),
      x NUMERIC(6, 2) NOT NULL,
      y NUMERIC(6, 2) NOT NULL,
      w NUMERIC(6, 2) NOT NULL,
      h NUMERIC(6, 2) NOT NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admissions (
      id SERIAL PRIMARY KEY,
      admission_number VARCHAR(20) UNIQUE,
      patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      room_id INTEGER NOT NULL REFERENCES rooms(id),
      bed_no INTEGER NOT NULL,
      reason TEXT NOT NULL,
      notes TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'admitted',
      admitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
      discharged_at TIMESTAMP,
      discharge_note TEXT
    )
  `);
  // The database itself refuses two patients in one bed, or one patient admitted twice
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_admitted_bed ON admissions (room_id, bed_no) WHERE status = 'admitted'
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_admitted_patient ON admissions (patient_id) WHERE status = 'admitted'
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_admissions_doctor ON admissions (doctor_id)');
  // Every place a patient has been kept: the first bed plus each later transfer
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admission_moves (
      id SERIAL PRIMARY KEY,
      admission_id INTEGER NOT NULL REFERENCES admissions(id) ON DELETE CASCADE,
      room_id INTEGER NOT NULL REFERENCES rooms(id),
      bed_no INTEGER NOT NULL,
      moved_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_admission_moves_admission ON admission_moves (admission_id)');

  const existing = await pool.query('SELECT COUNT(*)::int AS n FROM rooms');
  if (existing.rows[0].n === 0) {
    for (const r of buildRooms()) {
      await pool.query(
        'INSERT INTO rooms (code, name, room_type, floor, beds, x, y, w, h) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [r.code, r.name, r.type, r.floor, r.beds, r.x, r.y, r.w, r.h]
      );
    }
  }
};

const ADMISSION_SELECT = `
  SELECT ad.id, ad.admission_number AS "admissionNumber", ad.status, ad.reason, ad.notes,
         ad.admitted_at AS "admittedAt", ad.discharged_at AS "dischargedAt", ad.discharge_note AS "dischargeNote",
         ad.bed_no AS "bedNo",
         p.id AS "patientId", p.name AS "patientName", p.phone AS "patientPhone",
         d.id AS "doctorId", d.name AS "doctorName",
         rm.id AS "roomId", rm.code AS "roomCode", rm.name AS "roomName", rm.room_type AS "roomType", rm.floor,
         rm.beds AS "roomBeds", rm.x::float AS x, rm.y::float AS y, rm.w::float AS w, rm.h::float AS h,
         COALESCE((
           SELECT json_agg(json_build_object('roomCode', mr.code, 'roomName', mr.name, 'floor', mr.floor, 'bedNo', m.bed_no, 'movedAt', m.moved_at) ORDER BY m.id)
           FROM admission_moves m JOIN rooms mr ON mr.id = m.room_id WHERE m.admission_id = ad.id
         ), '[]'::json) AS moves
  FROM admissions ad
  JOIN users p ON p.id = ad.patient_id
  LEFT JOIN users d ON d.id = ad.doctor_id
  JOIN rooms rm ON rm.id = ad.room_id`;

const UNIQUE_VIOLATION = '23505';

export const registerAdmissionRoutes = (app, pool, { authenticate, requireRole, textField, requiredText }) => {
  const fail = (res, err) => {
    console.error(err.message);
    res.status(500).json({ error: 'A server error occurred.' });
  };

  // The building: every room with the beds that are taken right now (no patient details here)
  app.get('/api/hospital/rooms', authenticate, async (_req, res) => {
    try {
      const result = await pool.query(`
        SELECT rm.id, rm.code, rm.name, rm.room_type AS "roomType", rm.floor, rm.beds,
               rm.x::float AS x, rm.y::float AS y, rm.w::float AS w, rm.h::float AS h,
               COALESCE(array_agg(ad.bed_no ORDER BY ad.bed_no) FILTER (WHERE ad.id IS NOT NULL), '{}') AS "occupiedBeds"
        FROM rooms rm
        LEFT JOIN admissions ad ON ad.room_id = rm.id AND ad.status = 'admitted'
        GROUP BY rm.id
        ORDER BY rm.floor, rm.code`);
      res.json({ rooms: result.rows });
    } catch (err) {
      fail(res, err);
    }
  });

  // Patients see their own admissions, doctors the patients they admitted, admins everything
  app.get('/api/admissions', authenticate, requireRole('patient', 'doctor', 'admin'), async (req, res) => {
    try {
      let where = '';
      let params = [];
      if (req.user.role === 'patient') { where = 'WHERE ad.patient_id = $1'; params = [req.user.id]; }
      else if (req.user.role === 'doctor') { where = 'WHERE ad.doctor_id = $1'; params = [req.user.id]; }
      const result = await pool.query(
        `${ADMISSION_SELECT} ${where} ORDER BY (ad.status = 'admitted') DESC, ad.admitted_at DESC, ad.id DESC`,
        params
      );
      res.json({ admissions: result.rows });
    } catch (err) {
      fail(res, err);
    }
  });

  // Reads the room / bed from a request body and checks they exist. Runs inside a transaction
  // and locks the room so two doctors cannot take the same bed at the same time.
  const lockBed = async (client, body) => {
    const roomId = Number(body.roomId);
    const bedNo = Number(body.bedNo);
    if (!Number.isInteger(roomId)) return { error: 'Please choose a room.' };
    const found = await client.query('SELECT id, beds, name, code FROM rooms WHERE id = $1 FOR UPDATE', [roomId]);
    const room = found.rows[0];
    if (!room) return { error: 'That room could not be found.' };
    if (!Number.isInteger(bedNo) || bedNo < 1 || bedNo > room.beds) {
      return { error: `Please choose a bed from 1 to ${room.beds} in ${room.name}.` };
    }
    return { room, bedNo };
  };

  app.post('/api/admissions', authenticate, requireRole('doctor'), async (req, res) => {
    try {
      const patientId = Number(req.body.patientId);
      let reason; let notes;
      try {
        reason = requiredText('Reason for admission', 1000)(req.body.reason);
        notes = textField('Notes', 1000)(req.body.notes);
      } catch (validationError) {
        return res.status(400).json({ error: validationError.message });
      }
      if (!Number.isInteger(patientId)) return res.status(400).json({ error: 'Please choose the patient.' });

      // A doctor can only admit someone who has an appointment with them
      const link = await pool.query(
        "SELECT 1 FROM appointments a JOIN users u ON u.id = a.patient_id WHERE a.doctor_id = $1 AND a.patient_id = $2 AND u.role = 'patient' LIMIT 1",
        [req.user.id, patientId]
      );
      if (!link.rows[0]) return res.status(403).json({ error: 'You can only admit one of your own patients.' });

      const client = await pool.connect();
      let admissionId;
      try {
        await client.query('BEGIN');
        const bed = await lockBed(client, req.body);
        if (bed.error) { await client.query('ROLLBACK'); return res.status(400).json({ error: bed.error }); }

        const already = await client.query("SELECT admission_number FROM admissions WHERE patient_id = $1 AND status = 'admitted'", [patientId]);
        if (already.rows[0]) {
          await client.query('ROLLBACK');
          return res.status(409).json({ error: `This patient is already admitted (${already.rows[0].admission_number}).` });
        }
        const taken = await client.query("SELECT 1 FROM admissions WHERE room_id = $1 AND bed_no = $2 AND status = 'admitted'", [bed.room.id, bed.bedNo]);
        if (taken.rows[0]) {
          await client.query('ROLLBACK');
          return res.status(409).json({ error: `Bed ${bed.bedNo} in ${bed.room.name} is already taken.` });
        }

        const inserted = await client.query(
          'INSERT INTO admissions (patient_id, doctor_id, room_id, bed_no, reason, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
          [patientId, req.user.id, bed.room.id, bed.bedNo, reason, notes]
        );
        admissionId = inserted.rows[0].id;
        await client.query(
          "UPDATE admissions SET admission_number = 'ADM-' || LPAD(id::text, 4, '0') WHERE id = $1",
          [admissionId]
        );
        await client.query('INSERT INTO admission_moves (admission_id, room_id, bed_no) VALUES ($1,$2,$3)', [admissionId, bed.room.id, bed.bedNo]);
        await client.query('COMMIT');
      } catch (txError) {
        await client.query('ROLLBACK').catch(() => {});
        if (txError.code === UNIQUE_VIOLATION) {
          return res.status(409).json({ error: 'That bed or patient was just taken. Please check and try again.' });
        }
        throw txError;
      } finally {
        client.release();
      }

      const created = await pool.query(`${ADMISSION_SELECT} WHERE ad.id = $1`, [admissionId]);
      res.status(201).json({ message: 'Patient admitted.', admission: created.rows[0] });
    } catch (err) {
      fail(res, err);
    }
  });

  // The doctor in charge can move the patient to another room / bed, update notes, or discharge
  app.patch('/api/admissions/:id', authenticate, requireRole('doctor'), async (req, res) => {
    try {
      const admissionId = Number(req.params.id);
      if (!Number.isInteger(admissionId)) return res.status(404).json({ error: 'Admission not found.' });

      const wantsDischarge = req.body.status === 'discharged';
      const wantsMove = req.body.roomId !== undefined || req.body.bedNo !== undefined;
      let notes; let dischargeNote;
      try {
        notes = req.body.notes === undefined ? undefined : textField('Notes', 1000)(req.body.notes);
        dischargeNote = textField('Discharge note', 1000)(req.body.dischargeNote);
      } catch (validationError) {
        return res.status(400).json({ error: validationError.message });
      }
      if (req.body.status !== undefined && !wantsDischarge) {
        return res.status(400).json({ error: 'The only status change allowed is "discharged".' });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const found = await client.query('SELECT * FROM admissions WHERE id = $1 FOR UPDATE', [admissionId]);
        const admission = found.rows[0];
        // Same answer for "missing" and "not yours" so ids can't be probed
        if (!admission || admission.doctor_id !== req.user.id) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'Admission not found.' });
        }
        if (admission.status !== 'admitted') {
          await client.query('ROLLBACK');
          return res.status(409).json({ error: 'This patient has already been discharged.' });
        }

        if (wantsMove) {
          const bed = await lockBed(client, { roomId: req.body.roomId ?? admission.room_id, bedNo: req.body.bedNo });
          if (bed.error) { await client.query('ROLLBACK'); return res.status(400).json({ error: bed.error }); }
          const unchanged = bed.room.id === admission.room_id && bed.bedNo === admission.bed_no;
          if (!unchanged) {
            const taken = await client.query(
              "SELECT 1 FROM admissions WHERE room_id = $1 AND bed_no = $2 AND status = 'admitted' AND id <> $3",
              [bed.room.id, bed.bedNo, admission.id]
            );
            if (taken.rows[0]) {
              await client.query('ROLLBACK');
              return res.status(409).json({ error: `Bed ${bed.bedNo} in ${bed.room.name} is already taken.` });
            }
            await client.query('UPDATE admissions SET room_id = $1, bed_no = $2 WHERE id = $3', [bed.room.id, bed.bedNo, admission.id]);
            await client.query('INSERT INTO admission_moves (admission_id, room_id, bed_no) VALUES ($1,$2,$3)', [admission.id, bed.room.id, bed.bedNo]);
          }
        }
        if (notes !== undefined) {
          await client.query('UPDATE admissions SET notes = $1 WHERE id = $2', [notes, admission.id]);
        }
        if (wantsDischarge) {
          await client.query(
            "UPDATE admissions SET status = 'discharged', discharged_at = NOW(), discharge_note = $1 WHERE id = $2",
            [dischargeNote, admission.id]
          );
        }
        await client.query('COMMIT');
      } catch (txError) {
        await client.query('ROLLBACK').catch(() => {});
        if (txError.code === UNIQUE_VIOLATION) {
          return res.status(409).json({ error: 'That bed was just taken. Please choose another.' });
        }
        throw txError;
      } finally {
        client.release();
      }

      const updated = await pool.query(`${ADMISSION_SELECT} WHERE ad.id = $1`, [admissionId]);
      res.json({ message: 'Admission updated.', admission: updated.rows[0] });
    } catch (err) {
      fail(res, err);
    }
  });
};

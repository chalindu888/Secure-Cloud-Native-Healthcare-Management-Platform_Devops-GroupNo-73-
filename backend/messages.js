// Online chat between a patient and a doctor. A patient and a doctor can message each other once
// they share an appointment (any status). The browser polls for new messages every few seconds.

const MAX_LENGTH = 2000;
const MAX_PER_MINUTE = 20;

export const initMessageTables = async (pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      sender_role VARCHAR(10) NOT NULL CHECK (sender_role IN ('patient', 'doctor')),
      body TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      read_at TIMESTAMP
    )
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages (patient_id, doctor_id, id)');
};

export const registerMessageRoutes = (app, pool, { authenticate, requireRole }) => {
  const chatUser = [authenticate, requireRole('patient', 'doctor')];
  const fail = (res, err) => {
    console.error(err.message);
    res.status(500).json({ error: 'A server error occurred.' });
  };

  // For the signed-in person, which column is "me" and which is "the other side"
  const sides = (user) => (user.role === 'patient'
    ? { me: 'patient_id', other: 'doctor_id', otherRole: 'doctor', myRole: 'patient' }
    : { me: 'doctor_id', other: 'patient_id', otherRole: 'patient', myRole: 'doctor' });

  // The other person, but only if they are the right role and share an appointment with me
  const findPartner = async (user, otherId) => {
    if (!Number.isInteger(otherId)) return null;
    const s = sides(user);
    const result = await pool.query(
      `SELECT u.id, u.name, u.specialty FROM users u
       WHERE u.id = $1 AND u.role = $2
         AND EXISTS (SELECT 1 FROM appointments a WHERE a.${s.me} = $3 AND a.${s.other} = u.id)`,
      [otherId, s.otherRole, user.id]
    );
    return result.rows[0] || null;
  };

  app.get('/api/messages/unread-count', ...chatUser, async (req, res) => {
    try {
      const s = sides(req.user);
      const result = await pool.query(
        `SELECT COUNT(*)::int AS n FROM messages WHERE ${s.me} = $1 AND sender_role = $2 AND read_at IS NULL`,
        [req.user.id, s.otherRole]
      );
      res.json({ unread: result.rows[0].n });
    } catch (err) {
      fail(res, err);
    }
  });

  // The people I can talk to (everyone I share an appointment with), latest conversation first
  app.get('/api/messages/conversations', ...chatUser, async (req, res) => {
    try {
      const s = sides(req.user);
      const result = await pool.query(
        `SELECT u.id, u.name, u.specialty, lm.body AS "lastBody", lm.created_at AS "lastAt", lm.sender_role = $3 AS "lastIsMine",
                (SELECT COUNT(*)::int FROM messages m
                 WHERE m.${s.me} = $1 AND m.${s.other} = u.id AND m.sender_role = $2 AND m.read_at IS NULL) AS unread
         FROM users u
         LEFT JOIN LATERAL (
           SELECT body, created_at, sender_role FROM messages m
           WHERE m.${s.me} = $1 AND m.${s.other} = u.id ORDER BY m.id DESC LIMIT 1
         ) lm ON TRUE
         WHERE u.role = $2
           AND EXISTS (SELECT 1 FROM appointments a WHERE a.${s.me} = $1 AND a.${s.other} = u.id)
         ORDER BY lm.created_at DESC NULLS LAST, u.name`,
        [req.user.id, s.otherRole, s.myRole]
      );
      res.json({ conversations: result.rows });
    } catch (err) {
      fail(res, err);
    }
  });

  // Messages with one person. ?after=ID returns only newer ones (used for polling).
  // Opening the conversation marks the other side's messages as read.
  app.get('/api/messages/with/:otherId', ...chatUser, async (req, res) => {
    try {
      const other = await findPartner(req.user, Number(req.params.otherId));
      if (!other) return res.status(404).json({ error: 'Conversation not found.' });
      const s = sides(req.user);
      const after = Math.max(0, Number(req.query.after) || 0);

      await pool.query(
        `UPDATE messages SET read_at = NOW()
         WHERE ${s.me} = $1 AND ${s.other} = $2 AND sender_role = $3 AND read_at IS NULL`,
        [req.user.id, other.id, s.otherRole]
      );

      const rows = await pool.query(
        `SELECT * FROM (
           SELECT id, sender_role, body, created_at FROM messages
           WHERE ${s.me} = $1 AND ${s.other} = $2 AND id > $3 ORDER BY id DESC LIMIT 200
         ) recent ORDER BY id`,
        [req.user.id, other.id, after]
      );
      // Everything I sent up to this message id has been read by the other person
      const seen = await pool.query(
        `SELECT COALESCE(MAX(id), 0)::int AS id FROM messages
         WHERE ${s.me} = $1 AND ${s.other} = $2 AND sender_role = $3 AND read_at IS NOT NULL`,
        [req.user.id, other.id, s.myRole]
      );

      res.json({
        other,
        seenUpTo: seen.rows[0].id,
        messages: rows.rows.map((m) => ({ id: m.id, mine: m.sender_role === s.myRole, body: m.body, createdAt: m.created_at })),
      });
    } catch (err) {
      fail(res, err);
    }
  });

  const recentSends = new Map();
  const tooFast = (userId) => {
    const now = Date.now();
    const times = (recentSends.get(userId) || []).filter((t) => now - t < 60000);
    if (times.length >= MAX_PER_MINUTE) { recentSends.set(userId, times); return true; }
    times.push(now);
    recentSends.set(userId, times);
    return false;
  };

  app.post('/api/messages/with/:otherId', ...chatUser, async (req, res) => {
    try {
      const body = String(req.body.body ?? '').trim();
      if (!body) return res.status(400).json({ error: 'Please type a message.' });
      if (body.length > MAX_LENGTH) return res.status(400).json({ error: `A message can be up to ${MAX_LENGTH} characters.` });

      const other = await findPartner(req.user, Number(req.params.otherId));
      if (!other) return res.status(404).json({ error: 'Conversation not found.' });
      if (tooFast(req.user.id)) return res.status(429).json({ error: 'You are sending messages too quickly. Please wait a moment.' });

      const s = sides(req.user);
      const patientId = req.user.role === 'patient' ? req.user.id : other.id;
      const doctorId = req.user.role === 'doctor' ? req.user.id : other.id;
      const inserted = await pool.query(
        'INSERT INTO messages (patient_id, doctor_id, sender_role, body) VALUES ($1, $2, $3, $4) RETURNING id, body, created_at',
        [patientId, doctorId, s.myRole, body]
      );
      const m = inserted.rows[0];
      res.status(201).json({ message: { id: m.id, mine: true, body: m.body, createdAt: m.created_at } });
    } catch (err) {
      fail(res, err);
    }
  });
};

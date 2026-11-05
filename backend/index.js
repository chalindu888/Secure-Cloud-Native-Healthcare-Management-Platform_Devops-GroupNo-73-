import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();
const { Pool } = pkg;

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const isLocalFrontend = !origin
      || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

    if (isLocalFrontend) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Roles that may be chosen on the public sign-up form. 'admin' accounts can
// never be self-registered.
const SIGNUP_ROLES = ['patient', 'doctor'];

app.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Create the users table / add any missing columns, so an existing
// (email, password only) table is upgraded automatically.
const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `);
  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'patient',
      ADD COLUMN IF NOT EXISTS blood_group VARCHAR(5),
      ADD COLUMN IF NOT EXISTS specialty VARCHAR(100),
      ADD COLUMN IF NOT EXISTS license VARCHAR(100),
      ADD COLUMN IF NOT EXISTS department VARCHAR(150),
      ADD COLUMN IF NOT EXISTS qualifications VARCHAR(255),
      ADD COLUMN IF NOT EXISTS clinic_location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS consultation_fee NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      appointment_date DATE NOT NULL,
      time_slot VARCHAR(20) NOT NULL,
      reason TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      notes TEXT,
      prescription TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(
    'CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments (doctor_id)'
  );
};

// --- AUTH MIDDLEWARE ---
// Verifies the Bearer JWT and attaches the decoded payload to req.user.
const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication token is required.' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// Allows only the listed roles through (use after authenticate).
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'You do not have permission to do this.' });
  }
  next();
};

// A doctor may only act on their own record: the :param id must match the token's id.
const requireSelf = (param) => (req, res, next) => {
  if (String(req.user.id) !== String(req.params[param])) {
    return res.status(403).json({ error: 'You can only access your own data.' });
  }
  next();
};

// --- 1. SIGN-UP ROUTE ---
app.post('/api/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      blood_group,
      specialty,
      license,
      department,
      qualifications,
      clinic_location,
      consultation_fee,
      bio
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (!SIGNUP_ROLES.includes(role)) {
      return res.status(400).json({ error: "Role must be 'patient' or 'doctor'." });
    }

    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'This email address is already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users
       (name, email, password, phone, role, blood_group, specialty, license,
        department, qualifications, clinic_location, consultation_fee, bio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, name, email, phone, role, blood_group, specialty, license,
                 department, qualifications, clinic_location, consultation_fee, bio`,
      [
        name || null,
        email,
        hashedPassword,
        phone || null,
        role,
        role === 'patient' ? blood_group || null : null,
        role === 'doctor' ? specialty || null : null,
        role === 'doctor' ? license || null : null,
        role === 'doctor' ? department || null : null,
        role === 'doctor' ? qualifications || null : null,
        role === 'doctor' ? clinic_location || null : null,
        role === 'doctor' && consultation_fee !== '' ? consultation_fee || null : null,
        role === 'doctor' ? bio || null : null,
      ]
    );

    res.status(201).json({ message: 'Registration successful!', user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'A server error occurred.' });
  }
});

// --- 2. DOCTOR DIRECTORY ---
app.get('/api/doctors', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        specialty,
        department,
        qualifications,
        clinic_location,
        consultation_fee,
        bio,
        license,
        created_at
      FROM users
      WHERE role = 'doctor'
      ORDER BY name ASC NULLS LAST, id ASC
    `);

    res.json({
      success: true,
      doctors: result.rows
    });
  } catch (err) {
    console.error('Doctor directory query failed:', err.message);
    res.status(500).json({ error: 'Unable to load doctors.' });
  }
});

// --- DOCTOR: READ OWN PROFILE ---
app.get(
  '/api/doctor/profile/:id',
  authenticate,
  requireRole('doctor'),
  requireSelf('id'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, name, email, phone, specialty, department, qualifications,
                clinic_location, consultation_fee, bio, license
         FROM users WHERE id = $1 AND role = 'doctor'`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Doctor not found.' });
      }

      res.json({ doctor: result.rows[0] });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'A server error occurred.' });
    }
  }
);

// --- DOCTOR: UPDATE OWN PROFILE ---
app.put(
  '/api/doctor/profile/:id',
  authenticate,
  requireRole('doctor'),
  requireSelf('id'),
  async (req, res) => {
    try {
      const { specialty, qualifications, clinic_location, consultation_fee } = req.body;

      if (
        consultation_fee !== undefined &&
        consultation_fee !== null &&
        consultation_fee !== '' &&
        !(Number(consultation_fee) >= 0)
      ) {
        return res.status(400).json({ error: 'Consultation fee must be a non-negative number.' });
      }

      // COALESCE keeps the existing value for any field not sent
      const result = await pool.query(
        `UPDATE users
         SET specialty = COALESCE($1, specialty),
             qualifications = COALESCE($2, qualifications),
             clinic_location = COALESCE($3, clinic_location),
             consultation_fee = COALESCE($4, consultation_fee)
         WHERE id = $5 AND role = 'doctor'
         RETURNING id, name, email, specialty, department, qualifications,
                   clinic_location, consultation_fee, bio, license`,
        [
          specialty ?? null,
          qualifications ?? null,
          clinic_location ?? null,
          consultation_fee === '' ? null : consultation_fee ?? null,
          req.params.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Doctor not found.' });
      }

      res.json({ message: 'Profile updated.', doctor: result.rows[0] });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'A server error occurred.' });
    }
  }
);

// --- DOCTOR: OWN APPOINTMENTS ---
app.get(
  '/api/doctor/appointments/:doctorId',
  authenticate,
  requireRole('doctor'),
  requireSelf('doctorId'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT a.id,
                a.patient_id,
                p.name  AS patient_name,
                p.email AS patient_email,
                p.phone AS patient_phone,
                a.appointment_date,
                a.time_slot,
                a.reason,
                a.status,
                a.notes,
                a.prescription,
                a.created_at
         FROM appointments a
         JOIN users p ON p.id = a.patient_id
         WHERE a.doctor_id = $1
         ORDER BY a.appointment_date DESC, a.time_slot ASC`,
        [req.params.doctorId]
      );

      res.json({ appointments: result.rows });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'A server error occurred.' });
    }
  }
);

// --- 2. LOGIN ROUTE ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    // Same message for unknown email and wrong password, so accounts can't be enumerated
    const validPassword = user && (await bcrypt.compare(password, user.password));
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password!' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful!',
      token,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        blood_group: user.blood_group,
        specialty: user.specialty,
        license: user.license,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'A server error occurred.' });
  }
});

const PORT = process.env.PORT || 5000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database initialisation failed:', err.message);
    process.exit(1);
  });

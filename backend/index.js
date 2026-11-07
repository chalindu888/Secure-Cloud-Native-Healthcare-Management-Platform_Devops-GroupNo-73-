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
// Profile photos arrive as small resized data URLs, so allow a bit more than the 100kb default
app.use(express.json({ limit: '1mb' }));

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

// Profile photo: a base64 image data URL, max ~500 KB
const PHOTO_PATTERN = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_PHOTO_LENGTH = 500 * 1024;

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
      ADD COLUMN IF NOT EXISTS photo TEXT,
      ADD COLUMN IF NOT EXISTS years_experience INTEGER,
      ADD COLUMN IF NOT EXISTS max_patients_per_day INTEGER,
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
        photo,
        years_experience,
        max_patients_per_day,
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

// Columns a doctor sees on their own profile
const DOCTOR_PROFILE_COLUMNS = `id, name, email, phone, specialty, department, qualifications,
  clinic_location, consultation_fee, bio, license, photo, years_experience, max_patients_per_day`;

const textField = (label, max) => (value) => {
  const text = String(value ?? '').trim();
  if (text.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return text || null;
};

const numberField = (label, { min, max, integer }) => (value) => {
  if (value === '' || value === null) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) {
    throw new Error(`${label} must be ${integer ? 'a whole number' : 'a number'} between ${min} and ${max}.`);
  }
  return n;
};

// Editable doctor profile fields: request key -> { column, validate }.
// Only fields present in the request body are updated; '' clears a field.
const DOCTOR_PROFILE_FIELDS = {
  specialty: { column: 'specialty', validate: textField('Specialty', 100) },
  qualifications: { column: 'qualifications', validate: textField('Qualifications', 255) },
  clinic_location: { column: 'clinic_location', validate: textField('Clinic location', 255) },
  consultation_fee: { column: 'consultation_fee', validate: numberField('Consultation fee', { min: 0, max: 10000000 }) },
  bio: { column: 'bio', validate: textField('Biography', 2000) },
  years_experience: { column: 'years_experience', validate: numberField('Years of experience', { min: 0, max: 70, integer: true }) },
  max_patients_per_day: { column: 'max_patients_per_day', validate: numberField('Max patients per day', { min: 1, max: 200, integer: true }) },
  license: {
    column: 'license',
    validate: (value) => {
      const text = textField('SLMC registration number', 30)(value);
      if (text && !/^[A-Za-z0-9][A-Za-z0-9/\- ]*$/.test(text)) {
        throw new Error('SLMC registration number may only contain letters, numbers, spaces, "-" and "/".');
      }
      return text;
    },
  },
  photo: {
    column: 'photo',
    validate: (value) => {
      if (!value) return null;
      if (!PHOTO_PATTERN.test(value) || value.length > MAX_PHOTO_LENGTH) {
        throw new Error('Photo must be a JPEG, PNG or WebP image under 500 KB.');
      }
      return value;
    },
  },
};

// --- DOCTOR: READ OWN PROFILE ---
app.get(
  '/api/doctor/profile/:id',
  authenticate,
  requireRole('doctor'),
  requireSelf('id'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT ${DOCTOR_PROFILE_COLUMNS} FROM users WHERE id = $1 AND role = 'doctor'`,
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
      const assignments = [];
      const values = [];

      for (const [key, { column, validate }] of Object.entries(DOCTOR_PROFILE_FIELDS)) {
        if (req.body[key] === undefined) continue;
        try {
          values.push(validate(req.body[key]));
        } catch (validationError) {
          return res.status(400).json({ error: validationError.message });
        }
        assignments.push(`${column} = $${values.length}`);
      }

      if (assignments.length === 0) {
        return res.status(400).json({ error: 'No profile fields were provided.' });
      }

      values.push(req.params.id);
      const result = await pool.query(
        `UPDATE users SET ${assignments.join(', ')}
         WHERE id = $${values.length} AND role = 'doctor'
         RETURNING ${DOCTOR_PROFILE_COLUMNS}`,
        values
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
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
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

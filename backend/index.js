import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(express.json());
app.use(cors());

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
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
  `);
};

// --- 1. SIGN-UP ROUTE ---
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, phone, role, blood_group, specialty, license } = req.body;

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
      `INSERT INTO users (name, email, password, phone, role, blood_group, specialty, license)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, phone, role, blood_group, specialty, license`,
      [
        name || null,
        email,
        hashedPassword,
        phone || null,
        role,
        role === 'patient' ? blood_group || null : null,
        role === 'doctor' ? specialty || null : null,
        role === 'doctor' ? license || null : null,
      ]
    );

    res.status(201).json({ message: 'Registration successful!', user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'A server error occurred.' });
  }
});

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

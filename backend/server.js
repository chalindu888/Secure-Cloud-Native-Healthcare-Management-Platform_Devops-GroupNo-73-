const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

const ensureConfiguredAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return;
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE
     SET password = EXCLUDED.password, role = 'admin'`,
    ['System Administrator', email, passwordHash]
  );

  console.log(`Configured administrator account ready: ${email}`);
};


// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'HealthOps Backend Working'
  });
});


// Database test
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      success: true,
      message: 'PostgreSQL connected successfully',
      time: result.rows[0].now
    });
  } catch (error) {
    console.error('Database connection error:', error);

    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
});


// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      admin_signup_secret,
      blood_group,
      specialty,
      license
    } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const requestedRole = role || 'patient';

    const existingUser = await pool.query(
      'SELECT 1 FROM users WHERE LOWER(email) = $1 LIMIT 1',
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    if (!['patient', 'doctor', 'admin'].includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account role'
      });
    }

    if (requestedRole === 'admin') {
      if (!process.env.ADMIN_SIGNUP_SECRET || admin_signup_secret !== process.env.ADMIN_SIGNUP_SECRET) {
        return res.status(403).json({
          success: false,
          message: 'A valid administrator invite secret is required'
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const result = await pool.query(
      `INSERT INTO users
       (name, email, password, phone, role, blood_group, specialty, license)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, phone, role, blood_group, specialty, license, created_at`,
      [
        name.trim(),
        normalizedEmail,
        hashedPassword,
        phone || null,
        requestedRole,
        blood_group || null,
        specialty || null,
        license || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result.rows[0]
    });

  } catch (error) {

    // Duplicate email
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    console.error('Registration error:', error);

    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = $1',
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Compare entered password with bcrypt hash
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );

    // Don't send password back to frontend
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        blood_group: user.blood_group,
        specialty: user.specialty,
        license: user.license
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await ensureConfiguredAdmin();
    app.listen(PORT, () => {
      console.log(`HealthOps Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to initialize configured administrator account:', error);
    process.exitCode = 1;
  }
};

startServer();
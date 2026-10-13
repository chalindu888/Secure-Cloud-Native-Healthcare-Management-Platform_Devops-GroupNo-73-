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

// PostgreSQL Connection Pool (අපි .env එකේ දුන් විස්තර මෙතැනට ගන්නවා)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// --- 1. SIGN-UP (ලියාපදිංචි වීමේ) ROUTE ---
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // මෙම ඊමේල් ලිපිනයෙන් දැනටමත් යූසර් කෙනෙක් ඉන්නවද බලන්න
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'මෙම ඊමේල් ලිපිනය දැනටමත් භාවිතයේ ඇත!' });
    }

    // පාස්වර්ඩ් එක ආරක්ෂිතව Hash කිරීම (Bcrypt හරහා)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ඩේටාබේස් එකට අලුත් යූසර් ඇතුළත් කිරීම
    const newUser = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    res.status(201).json({ message: 'ලියාපදිංචි වීම සාර්ථකයි!', user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'සර්වර් දෝෂයක් සිදු විය.' });
  }
});

// --- 2. LOGIN (ඇතුල් වීමේ) ROUTE ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // යූසර් ඩේටාබේස් එකේ ඉන්නවද බලන්න
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'වැරදි ඊමේල් ලිපිනයක් හෝ මුරපදයකි!' });
    }

    // යූසර් දුන් පාස්වර්ඩ් එකයි ඩේටාබේස් එකේ තියෙන Hash එකයි සමානද බලන්න
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: 'වැරදි ඊමේල් ලිපිනයක් හෝ මුරපදයකි!' });
    }

    // ලොගින් වීම සාර්ථක නම් JWT Token එකක් ජෙනරේට් කිරීම
    const token = jwt.sign({ id: user.rows[0].id, email: user.rows[0].email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ message: 'පිවිසීම සාර්ථකයි!', token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'සර්වර් දෝෂයක් සිදු විය.' });
  }
});

// සර්වර් එක ස්ටාර්ට් කිරීම
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
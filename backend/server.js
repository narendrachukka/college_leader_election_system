import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getLoginIdentifier } from './src/auth.js';

dotenv.config();

const app = express();
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  waitForConnections: true,
  connectionLimit: 10,
});

function verifyToken(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

function isAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
}

async function initDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        roll_number VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) NOT NULL,
        department VARCHAR(100) NOT NULL,
        year VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'Voter',
        party VARCHAR(50) DEFAULT NULL,
        has_voted TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS elections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        status VARCHAR(20) NOT NULL DEFAULT 'Inactive',
        started_at TIMESTAMP NULL,
        stopped_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        voter_id INT NOT NULL,
        candidate_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [adminRows] = await connection.query('SELECT * FROM admins WHERE username = ?', ['admin']);
    if (adminRows.length === 0) {
      const hashed = await bcrypt.hash('admin123', 10);
      await connection.query('INSERT INTO admins (username, password_hash) VALUES (?, ?)', ['admin', hashed]);
    }

    const [electionRows] = await connection.query('SELECT * FROM elections LIMIT 1');
    if (electionRows.length === 0) {
      await connection.query('INSERT INTO elections (status) VALUES (?)', ['Inactive']);
    }
  } finally {
    connection.release();
  }
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/register', async (req, res) => {
  try {
    const { name, rollNumber, email, phone, department, year, password, role, party } = req.body;
    if (!name || !rollNumber || !email || !phone || !department || !year || !password) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO students (name, roll_number, email, phone, department, year, password, role, party) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, rollNumber, email, phone, department, year, hashed, role || 'Voter', party || null]
    );
    res.status(201).json({ message: 'Registration successful', studentId: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Roll number or email already exists.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Registration failed.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { password } = req.body;
    const loginId = getLoginIdentifier(req.body);

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Login ID and password are required.' });
    }

    const [adminRows] = await pool.query('SELECT * FROM admins WHERE username = ?', [loginId]);
    if (adminRows.length > 0) {
      const valid = await bcrypt.compare(password, adminRows[0].password_hash || adminRows[0].password);
      if (!valid) {
        return res.status(401).json({ message: 'Invalid admin credentials.' });
      }
      const token = jwt.sign({ id: adminRows[0].id, role: 'admin' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });
      return res.json({ token, role: 'admin', user: { username: adminRows[0].username } });
    }

    const [studentRows] = await pool.query('SELECT * FROM students WHERE roll_number = ?', [loginId]);
    if (!studentRows.length) return res.status(401).json({ message: 'Invalid student credentials.' });
    const student = studentRows[0];
    const valid = await bcrypt.compare(password, student.password);
    if (!valid) return res.status(401).json({ message: 'Invalid student credentials.' });
    const token = jwt.sign({ id: student.id, role: 'student' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });
    return res.json({ token, role: 'student', user: { id: student.id, name: student.name, rollNumber: student.roll_number, department: student.department, role: student.role, party: student.party, hasVoted: Boolean(student.has_voted) } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed.' });
  }
});

app.get('/api/profile', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'No token provided.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    if (decoded.role === 'admin') {
      const [rows] = await pool.query('SELECT id, username FROM admins WHERE id = ?', [decoded.id]);
      return res.json({ user: rows[0] });
    }
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [decoded.id]);
    return res.json({ user: rows[0] });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
});

app.get('/api/students', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch students.' });
  }
});

app.get('/api/candidates', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM students WHERE role = 'Contestant' ORDER BY name ASC");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch candidates.' });
  }
});

app.get('/api/election/status', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM elections ORDER BY id DESC LIMIT 1');
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch election status.' });
  }
});

app.post('/api/election/start', verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE elections SET status = ?, started_at = NOW(), stopped_at = NULL ORDER BY id DESC LIMIT 1', ['Active']);
    res.json({ message: 'Election started.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to start election.' });
  }
});

app.post('/api/election/stop', verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE elections SET status = ?, stopped_at = NOW() ORDER BY id DESC LIMIT 1', ['Inactive']);
    res.json({ message: 'Election stopped.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to stop election.' });
  }
});

app.post('/api/vote', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'No token provided.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const { candidateId } = req.body;
    const [studentRows] = await pool.query('SELECT * FROM students WHERE id = ?', [decoded.id]);
    if (!studentRows.length) return res.status(404).json({ message: 'Student not found.' });
    const student = studentRows[0];
    if (student.has_voted) return res.status(400).json({ message: 'You have already voted.' });
    const [electionRows] = await pool.query('SELECT * FROM elections ORDER BY id DESC LIMIT 1');
    if (!electionRows[0] || electionRows[0].status !== 'Active') return res.status(400).json({ message: 'Election is not active.' });
    const [result] = await pool.execute('INSERT INTO votes (voter_id, candidate_id) VALUES (?, ?)', [student.id, candidateId]);
    await pool.query('UPDATE students SET has_voted = 1 WHERE id = ?', [student.id]);
    res.status(201).json({ message: 'Vote recorded', voteId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not record vote.' });
  }
});

app.get('/api/results', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id, s.name, s.department, s.party, COUNT(v.id) AS vote_count
      FROM students s
      LEFT JOIN votes v ON v.candidate_id = s.id
      WHERE s.role = 'Contestant'
      GROUP BY s.id
      ORDER BY vote_count DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch results.' });
  }
});

app.get('/api/dashboard/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const [students] = await pool.query('SELECT COUNT(*) AS total FROM students');
    const [voters] = await pool.query("SELECT COUNT(*) AS total FROM students WHERE role = 'Voter'");
    const [contestants] = await pool.query("SELECT COUNT(*) AS total FROM students WHERE role = 'Contestant'");
    const [votes] = await pool.query('SELECT COUNT(*) AS total FROM votes');
    const [election] = await pool.query('SELECT status FROM elections ORDER BY id DESC LIMIT 1');
    res.json({ totalStudents: students[0].total, totalVoters: voters[0].total, totalContestants: contestants[0].total, votesCast: votes[0].total, electionStatus: election[0]?.status || 'Inactive' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch dashboard stats.' });
  }
});

initDatabase().catch((error) => console.error('DB init failed', error));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));

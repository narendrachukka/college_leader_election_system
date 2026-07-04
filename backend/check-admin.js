import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

try {
  const [schema] = await pool.query('DESCRIBE admins');
  console.log('admins schema:', schema);
  const [admins] = await pool.query('SELECT * FROM admins LIMIT 5');
  console.log('admins data:', admins);
  const [students] = await pool.query('SELECT id, roll_number FROM students LIMIT 5');
  console.log('students:', students);
} catch (e) {
  console.error('error', e);
  process.exit(1);
} finally {
  await pool.end();
}

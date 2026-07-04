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
  const [res1] = await pool.execute('DELETE FROM students WHERE roll_number = ?', ['RTEST1234']);
  const [res2] = await pool.execute('DELETE FROM students WHERE roll_number = ?', ['RTEST123456']);
  console.log('deleted RTEST1234 rows:', res1.affectedRows);
  console.log('deleted RTEST123456 rows:', res2.affectedRows);
} catch (e) {
  console.error('error deleting students:', e);
  process.exit(1);
} finally {
  await pool.end();
}

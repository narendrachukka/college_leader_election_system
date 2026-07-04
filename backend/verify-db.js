import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  waitForConnections: true,
  connectionLimit: 1,
});

try {
  const conn = await pool.getConnection();
  const [rows] = await conn.query('SELECT 1 AS ok');
  console.log('DB_OK', rows[0]);
  conn.release();
  await pool.end();
} catch (error) {
  console.error('DB_ERROR', error.message);
  process.exit(1);
}

import dotenv from 'dotenv';
dotenv.config();
import pool from './db/index.js';

const doctors = await pool.query("SELECT id, full_name, specialization, approval_status FROM doctors LIMIT 10");
console.log('Doctors:', doctors.rows);

const schedules = await pool.query("SELECT * FROM doctor_schedules LIMIT 10");
console.log('Schedules:', schedules.rows);

await pool.end();

import dotenv from 'dotenv';
dotenv.config();
import pool from './db/index.js';

// Add future schedules for all approved doctors
const approved = await pool.query(
  "SELECT id, full_name FROM doctors WHERE approval_status = 'approved'"
);

console.log('Adding schedules for:', approved.rows.map(d => d.full_name));

const today = new Date();
today.setHours(0, 0, 0, 0);

for (const doctor of approved.rows) {
  // Add 10 future dates spread over next 3 weeks
  for (let i = 1; i <= 14; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();
    // Skip Sundays (0)
    if (dayOfWeek === 0) continue;

    const dateStr = date.toISOString().split('T')[0];

    // Check if slot already exists
    const exists = await pool.query(
      'SELECT id FROM doctor_schedules WHERE doctor_id = $1 AND schedule_date = $2',
      [doctor.id, dateStr]
    );
    if (exists.rows.length > 0) continue;

    await pool.query(
      `INSERT INTO doctor_schedules (doctor_id, schedule_date, start_time, end_time, is_available)
       VALUES ($1, $2, $3, $4, TRUE)`,
      [doctor.id, dateStr, '09:00:00', '17:00:00']
    );
    console.log(`  Added schedule for Dr. ${doctor.full_name} on ${dateStr}`);
  }
}

console.log('Done!');
await pool.end();

import dotenv from 'dotenv';
dotenv.config();
import pool from './db/index.js';

// Find all deleted patients
const deleted = await pool.query("SELECT id, full_name FROM patients WHERE status = 'deleted'");
console.log('Deleted patients:', deleted.rows);

for (const patient of deleted.rows) {
  // Anonymise all their appointments
  const r = await pool.query(
    `UPDATE appointments
     SET patient_first_name = 'Deleted',
         patient_last_name = 'User',
         patient_email = 'deleted@account.com',
         patient_phone = '—',
         updated_at = NOW()
     WHERE patient_id = $1
     RETURNING id, status, appointment_date`,
    [patient.id]
  );
  console.log(`Updated ${r.rows.length} appointments for ${patient.full_name}`);
}

console.log('Done');
await pool.end();

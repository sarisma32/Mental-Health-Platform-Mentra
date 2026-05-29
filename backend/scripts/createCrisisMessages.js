import pool from '../db/index.js';

const sql = `
CREATE TABLE IF NOT EXISTS crisis_messages (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'custom',  -- 'quick' | 'custom' | 'resolved'
  status VARCHAR(20) DEFAULT 'active',         -- 'active' | 'resolved'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crisis_messages_patient ON crisis_messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_crisis_messages_doctor ON crisis_messages(doctor_id);
`;

try {
  await pool.query(sql);
  console.log('crisis_messages table created successfully');
} catch (e) {
  console.error('Error:', e.message);
}
process.exit(0);

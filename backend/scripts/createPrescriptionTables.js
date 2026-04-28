import dotenv from 'dotenv';
dotenv.config();
import pool from '../db/index.js';

await pool.query(`
  CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    therapy_advice TEXT,
    lifestyle_advice TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(appointment_id)
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS prescription_medications (
    id SERIAL PRIMARY KEY,
    prescription_id INTEGER NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    instructions TEXT
  )
`);

await pool.query(`CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id)`);
await pool.query(`CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id)`);
await pool.query(`CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment ON prescriptions(appointment_id)`);

console.log('Prescription tables created successfully');
await pool.end();

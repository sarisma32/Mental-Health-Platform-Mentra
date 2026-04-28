import dotenv from 'dotenv';
dotenv.config();
import pool from '../db/index.js';

await pool.query(`
  CREATE TABLE IF NOT EXISTS therapy_tasks (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('CBT', 'Journaling', 'Mindfulness', 'Breathing', 'Exercise', 'Social', 'Other')),
    deadline DATE NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('once', 'daily', 'weekly')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS therapy_task_completions (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES therapy_tasks(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS therapy_task_feedback (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES therapy_tasks(id) ON DELETE CASCADE,
    difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id)
  )
`);

await pool.query(`CREATE INDEX IF NOT EXISTS idx_therapy_tasks_patient ON therapy_tasks(patient_id)`);
await pool.query(`CREATE INDEX IF NOT EXISTS idx_therapy_tasks_doctor ON therapy_tasks(doctor_id)`);
await pool.query(`CREATE INDEX IF NOT EXISTS idx_therapy_tasks_status ON therapy_tasks(status)`);

console.log('Therapy tables created successfully');
await pool.end();

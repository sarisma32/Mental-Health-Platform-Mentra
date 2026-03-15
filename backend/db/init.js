import pool from './index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Create tables one by one
    
    // Patients table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patients (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone_number VARCHAR(20) NOT NULL,
          age INTEGER NOT NULL CHECK (age >= 13 AND age <= 120),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Doctors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctors (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone_number VARCHAR(20) NOT NULL,
          experience VARCHAR(100) NOT NULL,
          license_number VARCHAR(100) NOT NULL,
          hospital_name VARCHAR(255) NOT NULL,
          specialization VARCHAR(100) NOT NULL,
          document_path VARCHAR(500),
          approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Admins table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Appointments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
          id SERIAL PRIMARY KEY,
          patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
          doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
          appointment_date DATE NOT NULL,
          appointment_time TIME NOT NULL,
          appointment_type VARCHAR(20) NOT NULL CHECK (appointment_type IN ('initial', 'followup')),
          session_fee DECIMAL(10,2) NOT NULL,
          duration_minutes INTEGER NOT NULL DEFAULT 60,
          status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
          
          -- Patient information
          patient_first_name VARCHAR(255) NOT NULL,
          patient_last_name VARCHAR(255) NOT NULL,
          patient_email VARCHAR(255) NOT NULL,
          patient_phone VARCHAR(20) NOT NULL,
          patient_date_of_birth DATE,
          emergency_contact_name VARCHAR(255),
          emergency_contact_phone VARCHAR(20),
          
          -- Session details
          reason_for_visit TEXT,
          previous_therapy TEXT,
          current_medications TEXT,
          special_requests TEXT,
          
          -- Professional information (denormalized for easy access)
          doctor_name VARCHAR(255) NOT NULL,
          doctor_specialization VARCHAR(100) NOT NULL,
          doctor_location VARCHAR(255) NOT NULL,
          doctor_address VARCHAR(500) NOT NULL,
          doctor_phone VARCHAR(20) NOT NULL,
          
          -- Confirmation details
          confirmation_number VARCHAR(20) UNIQUE NOT NULL,
          
          -- Timestamps
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Specializations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS specializations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(150) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default specializations if table is empty
    const specCount = await pool.query('SELECT COUNT(*) FROM specializations');
    if (parseInt(specCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO specializations (name) VALUES
          ('Clinical Psychology'),
          ('Counseling Psychology'),
          ('Psychiatry'),
          ('Marriage & Family Therapy'),
          ('Addiction Counseling'),
          ('Child Psychology'),
          ('Cognitive Behavioral Therapy'),
          ('Trauma Therapy')
        ON CONFLICT (name) DO NOTHING
      `);
      console.log('✅ Default specializations seeded');
    }

    // Reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
          patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
          doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          review_text TEXT,
          is_visible BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(appointment_id)
      )
    `);

    // OTP table for password reset functionality
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_otps (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          otp VARCHAR(6) NOT NULL,
          user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('patient', 'doctor', 'admin')),
          expires_at TIMESTAMP NOT NULL,
          is_used BOOLEAN DEFAULT FALSE,
          attempts INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes (only if tables exist and have the columns)
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email)`);
      
      // Check if approval_status column exists before creating index
      const columnCheck = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'doctors' AND column_name = 'approval_status'
      `);
      
      if (columnCheck.rows.length > 0) {
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_doctors_approval_status ON doctors(approval_status)`);
      }

      // Appointments indexes
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_appointments_confirmation_number ON appointments(confirmation_number)`);

      // OTP table indexes
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email ON password_reset_otps(email)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_password_reset_otps_otp ON password_reset_otps(otp)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_password_reset_otps_expires_at ON password_reset_otps(expires_at)`);
    } catch (indexError) {
      console.warn('⚠️  Warning: Some indexes could not be created:', indexError.message);
    }
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
};

// Test database connection
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};
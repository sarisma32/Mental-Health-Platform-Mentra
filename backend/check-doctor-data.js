import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: parseInt(process.env.DB_PORT),
});

async function checkDoctorData() {
  try {
    console.log('Checking doctor data...\n');
    
    const result = await pool.query(`
      SELECT id, full_name, email, specialization, hospital_name, location,
             initial_session_fee, followup_session_fee, bio, credentials,
             availability_hours, profile_photo
      FROM doctors 
      WHERE id = 11
    `);
    
    if (result.rows.length > 0) {
      console.log('Doctor ID 11 data:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('No doctor found with ID 11');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDoctorData();

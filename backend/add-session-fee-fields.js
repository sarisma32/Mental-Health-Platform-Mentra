import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

console.log('DB Config:', {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: parseInt(process.env.DB_PORT),
});

async function addSessionFeeFields() {
  try {
    console.log('Adding session fee fields to doctors table...');
    
    // Add initial_session_fee and followup_session_fee columns
    await pool.query(`
      ALTER TABLE doctors 
      ADD COLUMN IF NOT EXISTS initial_session_fee DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS followup_session_fee DECIMAL(10, 2);
    `);
    
    console.log('✓ Session fee fields added successfully');
    
    // Update existing doctors with default values if they have session_fee
    await pool.query(`
      UPDATE doctors 
      SET initial_session_fee = session_fee,
          followup_session_fee = session_fee * 0.88
      WHERE session_fee IS NOT NULL 
        AND initial_session_fee IS NULL;
    `);
    
    console.log('✓ Existing doctors updated with default session fees');
    
    // Show current doctors
    const result = await pool.query(`
      SELECT id, full_name, session_fee, initial_session_fee, followup_session_fee 
      FROM doctors 
      LIMIT 5
    `);
    
    console.log('\nSample doctors with session fees:');
    console.table(result.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding session fee fields:', error);
    process.exit(1);
  }
}

addSessionFeeFields();

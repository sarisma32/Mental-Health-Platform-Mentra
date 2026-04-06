import pool from './db/index.js';

async function addPatientStatus() {
  try {
    console.log(' Checking patients table structure...');
    
    // Check if status column exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'patients' AND column_name = 'status'
    `);

    if (checkColumn.rows.length === 0) {
      console.log('Adding status column to patients table...');
      
      // Add status column with default value 'active'
      await pool.query(`
        ALTER TABLE patients 
        ADD COLUMN status VARCHAR(20) DEFAULT 'active'
      `);
      
      console.log(' Status column added successfully');
      
      // Update existing patients to have 'active' status
      const updateResult = await pool.query(`
        UPDATE patients 
        SET status = 'active' 
        WHERE status IS NULL
      `);
      
      console.log(` Updated ${updateResult.rowCount} existing patients to 'active' status`);
    } else {
      console.log(' Status column already exists');
    }

    // Display current patients
    const patients = await pool.query('SELECT id, full_name, email, status, created_at FROM patients ORDER BY created_at DESC');
    console.log('\n Current patients:');
    console.table(patients.rows);

    await pool.end();
    console.log('\n Done!');
  } catch (error) {
    console.error(' Error:', error);
    process.exit(1);
  }
}

addPatientStatus();

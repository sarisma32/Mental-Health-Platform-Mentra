import pool from './db/index.js';

async function addSessionNotesColumn() {
  try {
    console.log(' Adding session_notes column to appointments table...');
    
    // Check if column already exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' 
        AND column_name = 'session_notes'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log(' session_notes column already exists');
    } else {
      // Add session_notes column
      await pool.query(`
        ALTER TABLE appointments 
        ADD COLUMN session_notes TEXT
      `);
      console.log(' session_notes column added successfully');
    }
    
    // Add index for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_appointments_status 
      ON appointments(status)
    `);
    console.log(' Index created for status column');
    
    // Verify the column
    const verify = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' 
        AND column_name = 'session_notes'
    `);
    
    if (verify.rows.length > 0) {
      console.log(' Verification successful:', verify.rows[0]);
    }
    
    console.log('\n Database update complete!');
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error);
    process.exit(1);
  }
}

addSessionNotesColumn();

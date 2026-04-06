import pool from './db/index.js';

async function updateAppointmentDefaultStatus() {
  try {
    console.log(' Updating appointments table default status to "confirmed"...');
    
    // Update the default value for status column
    await pool.query(`
      ALTER TABLE appointments 
      ALTER COLUMN status SET DEFAULT 'confirmed'
    `);
    console.log(' Default status updated to "confirmed"');
    
    // Update existing "scheduled" appointments to "confirmed"
    const result = await pool.query(`
      UPDATE appointments 
      SET status = 'confirmed' 
      WHERE status = 'scheduled'
      RETURNING id
    `);
    console.log(` Updated ${result.rows.length} existing appointments from "scheduled" to "confirmed"`);
    
    // Verify
    const verify = await pool.query(`
      SELECT column_default 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' 
        AND column_name = 'status'
    `);
    console.log(' Verification:', verify.rows[0]);
    
    console.log('\n Database update complete!');
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error);
    process.exit(1);
  }
}

updateAppointmentDefaultStatus();

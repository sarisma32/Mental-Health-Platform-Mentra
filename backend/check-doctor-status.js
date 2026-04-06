import pool from './db/index.js';

const checkDoctorStatus = async () => {
  try {
    console.log(' Checking doctor status in database...');

    const email = 'gsaru952@gmail.com';
    
    // Check doctor in database
    const doctor = await pool.query(
      "SELECT id, full_name, email, approval_status FROM doctors WHERE email = $1",
      [email]
    );

    if (doctor.rows.length > 0) {
      console.log(' Doctor found in database:');
      console.log(doctor.rows[0]);
      
      // Check the exact column name in the database
      const tableInfo = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'doctors' 
        AND column_name LIKE '%status%'
      `);
      
      console.log('\n Status-related columns in doctors table:');
      console.log(tableInfo.rows);
      
    } else {
      console.log(' Doctor not found in database');
    }

  } catch (error) {
    console.error(' Error checking doctor:', error.message);
  } finally {
    process.exit(0);
  }
};

checkDoctorStatus();
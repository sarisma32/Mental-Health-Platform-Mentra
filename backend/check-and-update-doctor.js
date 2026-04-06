// Script to check and update doctor approval status
import pool from './db/index.js';

async function checkAndUpdateDoctor() {
  try {
    console.log(' Checking doctors in database...\n');

    // Get all doctors
    const result = await pool.query(`
      SELECT id, full_name, email, approval_status, created_at 
      FROM doctors 
      ORDER BY created_at DESC
    `);

    if (result.rows.length === 0) {
      console.log(' No doctors found in database');
      return;
    }

    console.log(`Found ${result.rows.length} doctor(s):\n`);
    result.rows.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.full_name}`);
      console.log(`   Email: ${doctor.email}`);
      console.log(`   Status: ${doctor.approval_status}`);
      console.log(`   Created: ${new Date(doctor.created_at).toLocaleString()}`);
      console.log('');
    });

    // Update the test doctor to pending status for testing
    const testEmail = 'gsaru952@gmail.com';
    console.log(`\n Updating ${testEmail} to 'pending' status for testing...`);
    
    const updateResult = await pool.query(
      `UPDATE doctors 
       SET approval_status = 'pending' 
       WHERE email = $1 
       RETURNING id, full_name, email, approval_status`,
      [testEmail]
    );

    if (updateResult.rows.length > 0) {
      console.log(' Doctor updated successfully!');
      console.log(`   Name: ${updateResult.rows[0].full_name}`);
      console.log(`   Email: ${updateResult.rows[0].email}`);
      console.log(`   New Status: ${updateResult.rows[0].approval_status}`);
    } else {
      console.log(` Doctor with email ${testEmail} not found`);
    }

    process.exit(0);
  } catch (error) {
    console.error(' Error:', error.message);
    process.exit(1);
  }
}

checkAndUpdateDoctor();

import bcrypt from 'bcrypt';
import pool from './db/index.js';

const debugLogin = async () => {
  try {
    console.log(' Debugging login process step by step...');

    const email = 'gsaru952@gmail.com';
    const password = 'saruG@32';

    // Step 1: Check if doctor exists
    console.log('\n Checking if doctor exists...');
    const doctorCheck = await pool.query(
      "SELECT * FROM doctors WHERE email = $1",
      [email]
    );

    if (doctorCheck.rows.length === 0) {
      console.log(' Doctor not found');
      return;
    }

    const doctor = doctorCheck.rows[0];
    console.log(' Doctor found:');
    console.log('ID:', doctor.id);
    console.log('Name:', doctor.full_name);
    console.log('Email:', doctor.email);
    console.log('Approval Status:', doctor.approval_status);
    console.log('Raw doctor object keys:', Object.keys(doctor));

    // Step 2: Check password
    console.log('\n Checking password...');
    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log(' Invalid password');
      return;
    }

    // Step 3: Check approval status
    console.log('\n Checking approval status...');
    console.log('doctor.approval_status:', doctor.approval_status);
    console.log('typeof doctor.approval_status:', typeof doctor.approval_status);
    console.log('doctor.approval_status === "approved":', doctor.approval_status === 'approved');

    if (doctor.approval_status !== 'approved') {
      console.log(` Doctor not approved. Status: ${doctor.approval_status}`);
      return;
    }

    console.log(' All checks passed! Doctor should be able to login.');

  } catch (error) {
    console.error(' Debug failed:', error.message);
  } finally {
    process.exit(0);
  }
};

debugLogin();
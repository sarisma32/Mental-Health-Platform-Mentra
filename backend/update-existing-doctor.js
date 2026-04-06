import bcrypt from 'bcrypt';
import pool from './db/index.js';

const updateExistingDoctor = async () => {
  try {
    console.log(' Updating existing doctor account...');

    const email = 'gsaru952@gmail.com';
    const newPassword = 'saruG@32';
    
    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the existing doctor with new details
    const updatedDoctor = await pool.query(
      `UPDATE doctors SET 
        full_name = $1,
        password = $2,
        phone_number = $3,
        experience = $4,
        license_number = $5,
        hospital_name = $6,
        specialization = $7,
        approval_status = $8,
        updated_at = CURRENT_TIMESTAMP
       WHERE email = $9 
       RETURNING *`,
      [
        'Lizan Ghimire',
        hashedPassword,
        '+977-9841234567',
        '5 years',
        'NMC-PSY-2024-002',
        'Kathmandu Mental Health Center',
        'Clinical Psychology',
        'approved',
        email
      ]
    );

    if (updatedDoctor.rows.length > 0) {
      console.log(' Doctor account updated successfully!');
      console.log('Updated Doctor Details:', {
        id: updatedDoctor.rows[0].id,
        name: updatedDoctor.rows[0].full_name,
        email: updatedDoctor.rows[0].email,
        phone: updatedDoctor.rows[0].phone_number,
        specialization: updatedDoctor.rows[0].specialization,
        hospital: updatedDoctor.rows[0].hospital_name,
        experience: updatedDoctor.rows[0].experience,
        license: updatedDoctor.rows[0].license_number,
        status: updatedDoctor.rows[0].approval_status
      });

      console.log('\n Ready to login with original email!');
      console.log('Email:', email);
      console.log('Password:', newPassword);
      console.log('Status: APPROVED ');
    } else {
      console.log(' No doctor found with that email');
    }

  } catch (error) {
    console.error(' Error updating doctor:', error.message);
  } finally {
    process.exit(0);
  }
};

updateExistingDoctor();
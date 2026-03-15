import bcrypt from 'bcrypt';
import pool from './db/index.js';

const createTestDoctor = async () => {
  try {
    console.log('🩺 Creating test doctor account...');

    // Doctor details
    const doctorData = {
      fullName: 'Lizan Ghimire',
      email: 'lizan.ghimire@gmail.com', // Changed email to avoid conflict
      password: 'saruG@32',
      phoneNumber: '+977-9841234567',
      experience: '5 years',
      licenseNumber: 'NMC-PSY-2024-001',
      hospitalName: 'Kathmandu Mental Health Center',
      specialization: 'Clinical Psychology',
      documentPath: 'uploads/test-license.pdf' // Mock document path
    };

    // Check if doctor already exists
    const existingDoctor = await pool.query(
      "SELECT * FROM doctors WHERE email = $1",
      [doctorData.email]
    );

    if (existingDoctor.rows.length > 0) {
      console.log('⚠️  Doctor already exists. Updating approval status...');
      
      // Update to approved status
      const updatedDoctor = await pool.query(
        "UPDATE doctors SET approval_status = 'approved' WHERE email = $1 RETURNING *",
        [doctorData.email]
      );
      
      console.log('✅ Doctor status updated to approved!');
      console.log('Doctor Details:', {
        id: updatedDoctor.rows[0].id,
        name: updatedDoctor.rows[0].full_name,
        email: updatedDoctor.rows[0].email,
        status: updatedDoctor.rows[0].approval_status
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(doctorData.password, saltRounds);

    // Insert new doctor with approved status
    const newDoctor = await pool.query(
      `INSERT INTO doctors (
        full_name, email, password, phone_number, experience, 
        license_number, hospital_name, specialization, document_path, approval_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING id, full_name, email, phone_number, experience, license_number, 
                hospital_name, specialization, approval_status, created_at`,
      [
        doctorData.fullName, 
        doctorData.email, 
        hashedPassword, 
        doctorData.phoneNumber, 
        doctorData.experience,
        doctorData.licenseNumber, 
        doctorData.hospitalName, 
        doctorData.specialization, 
        doctorData.documentPath, 
        'approved' // Set as approved directly
      ]
    );

    console.log('✅ Doctor account created successfully!');
    console.log('Doctor Details:', {
      id: newDoctor.rows[0].id,
      name: newDoctor.rows[0].full_name,
      email: newDoctor.rows[0].email,
      phone: newDoctor.rows[0].phone_number,
      specialization: newDoctor.rows[0].specialization,
      hospital: newDoctor.rows[0].hospital_name,
      experience: newDoctor.rows[0].experience,
      license: newDoctor.rows[0].license_number,
      status: newDoctor.rows[0].approval_status,
      created: newDoctor.rows[0].created_at
    });

    console.log('\n🎉 Ready to login!');
    console.log('Email:', doctorData.email);
    console.log('Password:', doctorData.password);
    console.log('Status: APPROVED ✅');

  } catch (error) {
    console.error('❌ Error creating doctor:', error.message);
  } finally {
    process.exit(0);
  }
};

createTestDoctor();
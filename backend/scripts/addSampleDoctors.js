import pool from "../db/index.js";
import bcrypt from "bcrypt";

const addSampleDoctors = async () => {
  try {
    console.log(' Adding sample doctors...');

    const sampleDoctors = [
      {
        fullName: "Dr. Sarah Johnson",
        email: "sarah.johnson@mentra.com",
        password: "Doctor123!",
        phoneNumber: "(01) 4412303",
        experience: "15 years",
        licenseNumber: "NMC-12345",
        hospitalName: "Tribhuvan University Teaching Hospital",
        specialization: "Clinical Psychology"
      },
      {
        fullName: "Dr. Michael Chen",
        email: "michael.chen@mentra.com", 
        password: "Doctor123!",
        phoneNumber: "(01) 4412304",
        experience: "12 years",
        licenseNumber: "NMC-12346",
        hospitalName: "Bir Hospital",
        specialization: "Psychiatry"
      },
      {
        fullName: "Dr. Emily Rodriguez",
        email: "emily.rodriguez@mentra.com",
        password: "Doctor123!",
        phoneNumber: "(01) 4412305", 
        experience: "10 years",
        licenseNumber: "NMC-12347",
        hospitalName: "Patan Hospital",
        specialization: "Marriage & Family Therapy"
      }
    ];

    for (const doctor of sampleDoctors) {
      // Check if doctor already exists
      const existing = await pool.query(
        "SELECT id FROM doctors WHERE email = $1",
        [doctor.email]
      );

      if (existing.rows.length === 0) {
        // Hash password
        const hashedPassword = await bcrypt.hash(doctor.password, 12);

        // Insert doctor
        const result = await pool.query(
          `INSERT INTO doctors (
            full_name, email, password, phone_number, experience, 
            license_number, hospital_name, specialization, approval_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'approved') RETURNING id, full_name`,
          [
            doctor.fullName,
            doctor.email,
            hashedPassword,
            doctor.phoneNumber,
            doctor.experience,
            doctor.licenseNumber,
            doctor.hospitalName,
            doctor.specialization
          ]
        );

        console.log(` Added doctor: ${result.rows[0].full_name} (ID: ${result.rows[0].id})`);
      } else {
        console.log(`  Doctor ${doctor.fullName} already exists`);
      }
    }

    console.log(' Sample doctors added successfully');
    process.exit(0);
  } catch (error) {
    console.error(' Error adding sample doctors:', error);
    process.exit(1);
  }
};

addSampleDoctors();
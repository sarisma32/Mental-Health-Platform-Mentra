import pool from "./db/index.js";
import bcrypt from "bcrypt";

const addSampleData = async () => {
  try {
    console.log('🏥 Adding sample doctors...');

    const sampleDoctors = [
      {
        fullName: "Dr. Sarah Johnson",
        email: "sarah.johnson@mentra.com",
        password: "Doctor123!",
        phoneNumber: "(01) 4412303",
        experience: "15 years",
        licenseNumber: "NMC-12345",
        hospitalName: "Tribhuvan University Teaching Hospital",
        specialization: "Clinical Psychology",
        location: "Kathmandu, Nepal",
        bio: "Experienced clinical psychologist specializing in anxiety and depression treatment.",
        sessionFee: 2000,
        yearsExperience: 15
      },
      {
        fullName: "Dr. Michael Chen",
        email: "michael.chen@mentra.com", 
        password: "Doctor123!",
        phoneNumber: "(01) 4412304",
        experience: "12 years",
        licenseNumber: "NMC-12346",
        hospitalName: "Bir Hospital",
        specialization: "Psychiatry",
        location: "Kathmandu, Nepal",
        bio: "Board-certified psychiatrist with expertise in mood disorders and ADHD.",
        sessionFee: 2500,
        yearsExperience: 12
      },
      {
        fullName: "Dr. Emily Rodriguez",
        email: "emily.rodriguez@mentra.com",
        password: "Doctor123!",
        phoneNumber: "(01) 4412305", 
        experience: "10 years",
        licenseNumber: "NMC-12347",
        hospitalName: "Patan Hospital",
        specialization: "Marriage & Family Therapy",
        location: "Lalitpur, Nepal",
        bio: "Licensed marriage and family therapist helping couples and families.",
        sessionFee: 1800,
        yearsExperience: 10
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
            license_number, hospital_name, specialization, location,
            bio, session_fee, years_experience, approval_status, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'approved', 'active') 
          RETURNING id, full_name`,
          [
            doctor.fullName,
            doctor.email,
            hashedPassword,
            doctor.phoneNumber,
            doctor.experience,
            doctor.licenseNumber,
            doctor.hospitalName,
            doctor.specialization,
            doctor.location,
            doctor.bio,
            doctor.sessionFee,
            doctor.yearsExperience
          ]
        );

        console.log(`✅ Added doctor: ${result.rows[0].full_name} (ID: ${result.rows[0].id})`);
      } else {
        console.log(`⚠️  Doctor ${doctor.fullName} already exists`);
      }
    }

    console.log('🎉 Sample doctors added successfully');
  } catch (error) {
    console.error('❌ Error adding sample doctors:', error);
    throw error;
  }
};

export default addSampleData;
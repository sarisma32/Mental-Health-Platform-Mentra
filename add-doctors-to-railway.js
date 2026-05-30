import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from "bcrypt";

// Railway database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres.railway.internal',
  user: process.env.DB_USER || 'postgres', 
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const addSampleDoctors = async () => {
  try {
    console.log('🏥 Adding sample doctors to Railway database...');

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
      },
      {
        fullName: "Dr. Raj Sharma",
        email: "raj.sharma@mentra.com",
        password: "Doctor123!",
        phoneNumber: "(01) 4412306",
        experience: "8 years",
        licenseNumber: "NMC-12348", 
        hospitalName: "Nepal Medical College",
        specialization: "Child Psychology",
        location: "Kathmandu, Nepal",
        bio: "Child psychologist specializing in developmental and behavioral issues.",
        sessionFee: 1500,
        yearsExperience: 8
      },
      {
        fullName: "Dr. Priya Patel",
        email: "priya.patel@mentra.com",
        password: "Doctor123!",
        phoneNumber: "(01) 4412307",
        experience: "20 years",
        licenseNumber: "NMC-12349",
        hospitalName: "Grande International Hospital", 
        specialization: "Trauma Therapy",
        location: "Kathmandu, Nepal",
        bio: "Trauma specialist with extensive experience in PTSD and crisis intervention.",
        sessionFee: 3000,
        yearsExperience: 20
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

        // Insert doctor with all fields
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
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding sample doctors:', error);
    await pool.end();
    process.exit(1);
  }
};

addSampleDoctors();
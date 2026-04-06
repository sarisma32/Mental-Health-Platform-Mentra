import pool from "../db/index.js";

const checkDoctors = async () => {
  try {
    const doctors = await pool.query(
      "SELECT id, full_name, email, specialization, hospital_name FROM doctors WHERE approval_status = 'approved'"
    );

    console.log(' Available doctors:');
    doctors.rows.forEach(doctor => {
      console.log(`ID: ${doctor.id}, Name: ${doctor.full_name}, Specialization: ${doctor.specialization}`);
    });

    process.exit(0);
  } catch (error) {
    console.error(' Error checking doctors:', error);
    process.exit(1);
  }
};

checkDoctors();
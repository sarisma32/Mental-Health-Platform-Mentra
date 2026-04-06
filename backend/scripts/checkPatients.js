import pool from "../db/index.js";

const checkPatients = async () => {
  try {
    const patients = await pool.query(
      "SELECT id, full_name, email FROM patients ORDER BY id"
    );

    console.log(' Available patients:');
    if (patients.rows.length === 0) {
      console.log('  No patients found in database');
    } else {
      patients.rows.forEach(patient => {
        console.log(`  ID: ${patient.id}, Name: ${patient.full_name}, Email: ${patient.email}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error(' Error checking patients:', error);
    process.exit(1);
  }
};

checkPatients();
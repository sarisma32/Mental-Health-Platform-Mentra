import pool from "../db/index.js";

const createDisputesTable = async () => {
  try {
    await pool.query(`DROP TABLE IF EXISTS disputes;`);
    await pool.query(`
      CREATE TABLE disputes (
        id VARCHAR(30) PRIMARY KEY,
        appointment_id INT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
        patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        issue_type VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'rejected')),
        admin_response TEXT,
        responded_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("disputes table created successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error creating disputes table:", err);
    process.exit(1);
  }
};

createDisputesTable();

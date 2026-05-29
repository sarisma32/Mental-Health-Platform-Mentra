import pool from "../db/index.js";

const run = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctor_warnings (
        id SERIAL PRIMARY KEY,
        doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        dispute_id VARCHAR(30) REFERENCES disputes(id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("doctor_warnings table created");
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

run();

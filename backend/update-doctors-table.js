import pool from "./db/index.js";

const updateDoctorsTable = async () => {
  try {
    console.log('🔧 Updating doctors table schema...');

    // Add missing columns to doctors table
    const alterQueries = [
      `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS location VARCHAR(255)`,
      `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS bio TEXT`,
      `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS session_fee INTEGER`,
      `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS initial_session_fee INTEGER`,
      `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS followup_session_fee INTEGER`,
      `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS years_experience INTEGER`,
      `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS credentials TEXT`,
      `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS languages VARCHAR(255)`,
      `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS availability_hours TEXT`,
      `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(500)`,
      `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`
    ];

    for (const query of alterQueries) {
      await pool.query(query);
      console.log('✅ Executed:', query.substring(0, 50) + '...');
    }

    console.log('🎉 Doctors table updated successfully');
  } catch (error) {
    console.error('❌ Error updating doctors table:', error);
    throw error;
  }
};

export default updateDoctorsTable;
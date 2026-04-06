// Script to add profile fields to doctors table
import pool from './db/index.js';

async function addDoctorProfileFields() {
  try {
    console.log(' Adding profile fields to doctors table...\n');

    // Add all profile-related columns
    await pool.query(`
      ALTER TABLE doctors
      ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(500),
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS session_fee DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS years_experience INTEGER,
      ADD COLUMN IF NOT EXISTS credentials TEXT,
      ADD COLUMN IF NOT EXISTS languages VARCHAR(255),
      ADD COLUMN IF NOT EXISTS availability_hours TEXT
    `);
    console.log(' Profile columns added successfully');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_doctors_rating ON doctors(rating);
      CREATE INDEX IF NOT EXISTS idx_doctors_session_fee ON doctors(session_fee);
    `);
    console.log(' Indexes created successfully');

    // Verify columns were added
    const verifyResult = await pool.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'doctors' 
      AND column_name IN ('profile_photo', 'bio', 'session_fee', 'rating', 'review_count', 
                          'years_experience', 'credentials', 'languages', 'availability_hours')
      ORDER BY column_name
    `);

    console.log('\n Verification successful! Added columns:');
    verifyResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
    });

    // Show current doctors table structure
    console.log('\n Complete doctors table structure:');
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'doctors'
      ORDER BY ordinal_position
    `);
    
    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n Migration completed successfully!');
    console.log('\n Next steps:');
    console.log('  1. Update backend controllers to handle new fields');
    console.log('  2. Create doctor profile edit page');
    console.log('  3. Update professionals page to fetch real data');
    
    process.exit(0);

  } catch (error) {
    console.error(' Error adding profile fields:', error.message);
    process.exit(1);
  }
}

addDoctorProfileFields();

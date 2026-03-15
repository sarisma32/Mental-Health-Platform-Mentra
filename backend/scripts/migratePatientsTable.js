import pool from '../db/index.js';

const migratePatientsTable = async () => {
  try {
    console.log('🔄 Migrating patients table...\n');

    // Check if patients table needs phone_number and age to be NOT NULL
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'patients' AND column_name IN ('phone_number', 'age')
      ORDER BY ordinal_position
    `);

    console.log('Current patients table structure for phone_number and age:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Update columns to be NOT NULL if they are currently nullable
    const phoneCol = columns.rows.find(col => col.column_name === 'phone_number');
    const ageCol = columns.rows.find(col => col.column_name === 'age');

    if (phoneCol && phoneCol.is_nullable === 'YES') {
      console.log('1. Making phone_number NOT NULL...');
      await pool.query('ALTER TABLE patients ALTER COLUMN phone_number SET NOT NULL');
    }

    if (ageCol && ageCol.is_nullable === 'YES') {
      console.log('2. Making age NOT NULL...');
      await pool.query('ALTER TABLE patients ALTER COLUMN age SET NOT NULL');
    }

    // Add updated_at column if it doesn't exist
    const updatedAtExists = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'patients' AND column_name = 'updated_at'
    `);

    if (updatedAtExists.rows.length === 0) {
      console.log('3. Adding updated_at column...');
      await pool.query('ALTER TABLE patients ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    }

    console.log('✅ Patients table migration completed successfully!');

    // Verify the new structure
    const finalColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'patients' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Final patients table structure:');
    finalColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    process.exit(0);
  }
};

migratePatientsTable();
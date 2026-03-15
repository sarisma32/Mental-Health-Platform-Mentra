import pool from '../db/index.js';

const migrateDoctorsTable = async () => {
  try {
    console.log('🔄 Migrating doctors table...\n');

    // Drop the existing doctors table and recreate it with correct structure
    console.log('1. Dropping existing doctors table...');
    await pool.query('DROP TABLE IF EXISTS doctors CASCADE');

    // Create the new doctors table with correct structure
    console.log('2. Creating new doctors table with correct structure...');
    await pool.query(`
      CREATE TABLE doctors (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone_number VARCHAR(20) NOT NULL,
          experience VARCHAR(100) NOT NULL,
          license_number VARCHAR(100) NOT NULL,
          hospital_name VARCHAR(255) NOT NULL,
          specialization VARCHAR(100) NOT NULL,
          document_path VARCHAR(500),
          approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    console.log('3. Creating indexes...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_doctors_approval_status ON doctors(approval_status)');

    console.log('✅ Doctors table migration completed successfully!');

    // Verify the new structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'doctors' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n🩺 New doctors table structure:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    process.exit(0);
  }
};

migrateDoctorsTable();
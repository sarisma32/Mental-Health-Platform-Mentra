import pool from "../db/index.js";

const checkTables = async () => {
  try {
    // Check if appointments table exists
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'appointments'
    `);

    if (tableCheck.rows.length > 0) {
      console.log(' Appointments table exists');
      
      // Check table structure
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'appointments'
        ORDER BY ordinal_position
      `);
      
      console.log(' Appointments table columns:');
      columns.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log(' Appointments table does not exist');
    }

    process.exit(0);
  } catch (error) {
    console.error(' Error checking tables:', error);
    process.exit(1);
  }
};

checkTables();
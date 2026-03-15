import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mentra_db',
  password: 'Sarismasql@32',
  port: 5432,
});

async function createScheduleTable() {
  try {
    console.log('Creating doctor_schedules table...\n');

    // Read the SQL file
    const sqlFile = fs.readFileSync(
      path.join(__dirname, 'db', 'add-doctor-schedule-table.sql'),
      'utf8'
    );

    // Execute the SQL
    await pool.query(sqlFile);

    console.log('✓ doctor_schedules table created successfully!\n');

    // Check if table was created
    const checkTable = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'doctor_schedules'
      ORDER BY ordinal_position;
    `);

    console.log('Table structure:');
    checkTable.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error creating schedule table:', error);
    await pool.end();
    process.exit(1);
  }
}

createScheduleTable();

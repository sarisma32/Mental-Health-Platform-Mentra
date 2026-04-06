import pool from './db/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateScheduleTable() {
  try {
    console.log(' Updating doctor_schedules table to date-based system...');
    
    const sqlPath = path.join(__dirname, 'db', 'update-schedule-to-date-based.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    
    console.log(' Schedule table updated successfully!');
    console.log(' New schema: date-based scheduling (specific dates instead of day-of-week)');
    
    process.exit(0);
  } catch (error) {
    console.error(' Error updating schedule table:', error);
    process.exit(1);
  }
}

updateScheduleTable();

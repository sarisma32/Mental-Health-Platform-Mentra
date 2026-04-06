// Script to add location column to doctors table
import pool from './db/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function addLocationColumn() {
  try {
    console.log(' Adding location column to doctors table...\n');

    // Add location column
    await pool.query(`
      ALTER TABLE doctors 
      ADD COLUMN IF NOT EXISTS location VARCHAR(255)
    `);
    console.log(' Location column added successfully');

    // Update existing doctors with default location
    const updateResult = await pool.query(`
      UPDATE doctors 
      SET location = 'Not specified' 
      WHERE location IS NULL
    `);
    console.log(` Updated ${updateResult.rowCount} existing doctor(s) with default location`);

    // Create index for location searches
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_doctors_location ON doctors(location)
    `);
    console.log(' Index created for location column');

    // Verify the column was added
    const verifyResult = await pool.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'doctors' AND column_name = 'location'
    `);

    if (verifyResult.rows.length > 0) {
      console.log('\n Verification successful!');
      console.log('Column details:', verifyResult.rows[0]);
    } else {
      console.log('\n Verification failed - column not found');
    }

    // Show current doctors table structure
    console.log('\n Current doctors table columns:');
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
    process.exit(0);

  } catch (error) {
    console.error(' Error adding location column:', error.message);
    process.exit(1);
  }
}

addLocationColumn();

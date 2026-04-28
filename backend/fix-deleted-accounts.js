import dotenv from 'dotenv';
dotenv.config();
import pool from './db/index.js';

// Check current state
const check = await pool.query("SELECT id, full_name, email, status FROM patients WHERE email LIKE 'deleted_%'");
console.log('Accounts with deleted_ email:', check.rows);

// Fix: set status to deleted for any account whose email starts with deleted_
const fix = await pool.query("UPDATE patients SET status = 'deleted' WHERE email LIKE 'deleted_%' RETURNING id, full_name, status");
console.log('Fixed:', fix.rows);

await pool.end();

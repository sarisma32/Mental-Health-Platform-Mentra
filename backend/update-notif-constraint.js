import dotenv from 'dotenv';
dotenv.config();
import pool from './db/index.js';

await pool.query(`ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_recipient_type_check`);
await pool.query(`ALTER TABLE notifications ADD CONSTRAINT notifications_recipient_type_check CHECK (recipient_type IN ('doctor', 'admin', 'patient'))`);
console.log('Constraint updated successfully');
await pool.end();

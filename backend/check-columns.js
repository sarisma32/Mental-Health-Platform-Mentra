import dotenv from 'dotenv';
dotenv.config();
import pool from './db/index.js';

const r = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'doctors'");
console.log(r.rows.map(x => x.column_name).join(', '));
await pool.end();

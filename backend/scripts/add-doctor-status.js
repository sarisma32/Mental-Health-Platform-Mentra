import pool from '../db/index.js';

try {
  // Add status column with default 'active'
  await pool.query(`
    ALTER TABLE doctors 
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active'
  `);
  console.log('Added status column');

  // Mark any doctor whose email starts with 'deleted_' as deleted
  const updated = await pool.query(`
    UPDATE doctors SET status = 'deleted' WHERE email LIKE 'deleted_%' RETURNING id, full_name
  `);
  console.log('Marked as deleted:', updated.rows);

  // Confirm
  const check = await pool.query(`SELECT id, full_name, email, status FROM doctors ORDER BY id`);
  console.log('\nAll doctors:');
  check.rows.forEach(r => console.log(` - [${r.status}] ${r.full_name} (${r.email})`));

  process.exit(0);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}

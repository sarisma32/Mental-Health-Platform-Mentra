import pool from './db/index.js';

const setup = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS specializations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log(' specializations table ready');

  const count = await pool.query('SELECT COUNT(*) FROM specializations');
  if (parseInt(count.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO specializations (name) VALUES
        ('Clinical Psychology'),('Counseling Psychology'),('Psychiatry'),
        ('Marriage & Family Therapy'),('Addiction Counseling'),('Child Psychology'),
        ('Cognitive Behavioral Therapy'),('Trauma Therapy')
      ON CONFLICT (name) DO NOTHING
    `);
    console.log(' Default specializations seeded');
  }

  const result = await pool.query('SELECT name FROM specializations ORDER BY name');
  console.log('Specializations:', result.rows.map(r => r.name));
  process.exit(0);
};

setup().catch(e => { console.error(e); process.exit(1); });

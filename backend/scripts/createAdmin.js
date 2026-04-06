import bcrypt from 'bcrypt';
import pool from '../db/index.js';
import { testConnection, initializeDatabase } from '../db/init.js';

const createDefaultAdmin = async () => {
  try {
    console.log(' Creating default admin user...');

    // Test connection and initialize database
    await testConnection();
    await initializeDatabase();

    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      ['admin@mentra.com']
    );

    if (existingAdmin.rows.length > 0) {
      console.log(' Default admin already exists');
      return;
    }

    // Create default admin
    const defaultPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    const newAdmin = await pool.query(
      'INSERT INTO admins (full_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role',
      ['Admin User', 'admin@mentra.com', hashedPassword, 'admin']
    );

    console.log(' Default admin created successfully:');
    console.log(' Email: admin@mentra.com');
    console.log(' Password: Admin@123');
    console.log('  Please change the default password after first login!');
    console.log(' Admin details:', newAdmin.rows[0]);

  } catch (error) {
    console.error(' Error creating admin:', error);
  } finally {
    process.exit(0);
  }
};

createDefaultAdmin();
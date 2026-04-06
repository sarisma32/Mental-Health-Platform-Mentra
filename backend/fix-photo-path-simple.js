import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mentra_db',
  password: 'Sarismasql@32',
  port: 5432,
});

async function fixPhotoPath() {
  try {
    console.log('Fixing profile photo paths...\n');

    // Get all doctors with profile photos
    const result = await pool.query(
      'SELECT id, full_name, profile_photo FROM doctors WHERE profile_photo IS NOT NULL'
    );

    if (result.rows.length === 0) {
      console.log('No doctors with profile photos found.');
      await pool.end();
      process.exit(0);
    }

    console.log(`Found ${result.rows.length} doctor(s) with profile photos.\n`);

    for (const doctor of result.rows) {
      const oldPath = doctor.profile_photo;
      
      // Extract just the relative path from the full Windows path
      let newPath = oldPath;
      
      if (oldPath.includes('backend\\uploads')) {
        // Windows path format
        newPath = oldPath.split('backend\\')[1].replace(/\\/g, '/');
      } else if (oldPath.includes('backend/uploads')) {
        // Unix path format
        newPath = oldPath.split('backend/')[1];
      }

      if (newPath !== oldPath) {
        console.log(`Doctor ID ${doctor.id} (${doctor.full_name}):`);
        console.log(`  Old path: ${oldPath}`);
        console.log(`  New path: ${newPath}`);

        // Update the database
        await pool.query(
          'UPDATE doctors SET profile_photo = $1 WHERE id = $2',
          [newPath, doctor.id]
        );

        console.log('  Updated\n');
      } else {
        console.log(`Doctor ID ${doctor.id} (${doctor.full_name}): Path already correct\n`);
      }
    }

    console.log('All photo paths fixed successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error fixing photo paths:', error);
    await pool.end();
    process.exit(1);
  }
}

fixPhotoPath();

/**
 * Migration Script: Upload existing local files to Cloudinary
 * 
 * Migrates:
 * 1. Doctor profile photos (doctors.profile_photo)
 * 2. Doctor videos (doctor_videos.video_path)
 * 3. Doctor license documents (doctors.document_path)
 * 
 * Run with: node scripts/migrateToCloudinary.js
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import pool from '../db/index.js';

dotenv.config({ path: '../.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.join(__dirname, '..');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: check if a path is already a Cloudinary/full URL
const isAlreadyUrl = (p) => p && (p.startsWith('http://') || p.startsWith('https://'));

// Helper: upload a local file to Cloudinary
const uploadFile = async (localPath, options) => {
  // Handle both absolute paths and relative paths
  let fullPath;
  if (path.isAbsolute(localPath)) {
    fullPath = localPath; // already absolute
  } else {
    fullPath = path.join(BACKEND_ROOT, localPath);
  }

  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠ File not found: ${fullPath}`);
    return null;
  }
  try {
    const result = await cloudinary.uploader.upload(fullPath, options);
    return result;
  } catch (err) {
    console.error(`  ✗ Upload failed for ${localPath}:`, err.message);
    return null;
  }
};

const migrate = async () => {
  console.log(' Starting Cloudinary migration...\n');

  // ── 1. Migrate doctor profile photos ──────────────────────────────────────
  console.log(' Migrating profile photos...');
  const doctors = await pool.query(
    "SELECT id, full_name, profile_photo FROM doctors WHERE profile_photo IS NOT NULL"
  );

  for (const doctor of doctors.rows) {
    if (isAlreadyUrl(doctor.profile_photo)) {
      console.log(`   Dr. ${doctor.full_name} — already on Cloudinary, skipping`);
      continue;
    }

    console.log(`  → Uploading photo for Dr. ${doctor.full_name} (${doctor.profile_photo})`);
    const result = await uploadFile(doctor.profile_photo, {
      folder: `mentra/doctors/doctor_${doctor.id}/profile`,
      resource_type: 'image',
      public_id: `photo_migrated`,
      overwrite: true,
    });

    if (result) {
      await pool.query(
        "UPDATE doctors SET profile_photo = $1 WHERE id = $2",
        [result.secure_url, doctor.id]
      );
      console.log(`   Dr. ${doctor.full_name} — photo migrated`);
    }
  }

  // ── 2. Migrate doctor license documents ───────────────────────────────────
  console.log('\n Migrating license documents...');
  const doctorsWithDocs = await pool.query(
    "SELECT id, full_name, email, document_path FROM doctors WHERE document_path IS NOT NULL"
  );

  for (const doctor of doctorsWithDocs.rows) {
    if (isAlreadyUrl(doctor.document_path)) {
      console.log(`   Dr. ${doctor.full_name} — document already on Cloudinary, skipping`);
      continue;
    }

    console.log(`   Uploading document for Dr. ${doctor.full_name} (${doctor.document_path})`);
    const result = await uploadFile(doctor.document_path, {
      folder: `mentra/doctors/doctor_${doctor.id}/documents`,
      resource_type: 'auto',
      public_id: `license_migrated`,
      overwrite: true,
    });

    if (result) {
      await pool.query(
        "UPDATE doctors SET document_path = $1 WHERE id = $2",
        [result.secure_url, doctor.id]
      );
      console.log(`   Dr. ${doctor.full_name} — document migrated`);
    }
  }

  // ── 3. Migrate doctor videos ───────────────────────────────────────────────
  console.log('\n Migrating videos...');
  const videos = await pool.query(
    "SELECT id, doctor_id, title, video_path FROM doctor_videos"
  );

  for (const video of videos.rows) {
    if (isAlreadyUrl(video.video_path)) {
      console.log(`   Video "${video.title}" — already on Cloudinary, skipping`);
      continue;
    }

    console.log(`   Uploading video "${video.title}" (${video.video_path})`);
    const result = await uploadFile(video.video_path, {
      folder: `mentra/doctors/doctor_${video.doctor_id}/videos`,
      resource_type: 'video',
      public_id: `video_migrated_${video.id}`,
      overwrite: true,
    });

    if (result) {
      await pool.query(
        "UPDATE doctor_videos SET video_path = $1, cloudinary_public_id = $2 WHERE id = $3",
        [result.secure_url, result.public_id, video.id]
      );
      console.log(`   Video "${video.title}" — migrated`);
    }
  }

  console.log('\n Migration complete!');
  process.exit(0);
};

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

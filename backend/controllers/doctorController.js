import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/index.js";
import { createNotification } from "./notificationController.js";
import { sendOTPEmail } from "../utils/emailService.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// REGISTER DOCTOR
export const registerDoctor = async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      password, 
      phoneNumber, 
      experience, 
      licenseNumber, 
      hospitalName, 
      specialization,
      location
    } = req.body;

    // Check if doctor already exists
    const existingDoctor = await pool.query(
      "SELECT * FROM doctors WHERE email = $1 OR license_number = $2",
      [email, licenseNumber]
    );

    if (existingDoctor.rows.length > 0) {
      const existing = existingDoctor.rows[0];
      if (existing.email === email) {
        return res.status(400).json({
          success: false,
          message: "This email is already registered. Please use a different email address."
        });
      }
      if (existing.license_number === licenseNumber) {
        return res.status(400).json({
          success: false,
          message: "License number already registered. Please check your license number."
        });
      }
    }

    // Check if email is already used by a patient
    const existingPatient = await pool.query(
      "SELECT id FROM patients WHERE email = $1",
      [email]
    );
    if (existingPatient.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Please use a different email address."
      });
    }

    // Check if document was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload your license/certificate document."
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Upload document to Cloudinary in doctor's folder
    // We use a temporary folder name based on email since we don't have doctorId yet
    const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
      folder: `mentra/doctors/pending_${sanitizedEmail}/documents`,
      resource_type: 'auto',  // auto detects image or pdf
      public_id: `license_${Date.now()}`,
      use_filename: false,
    });

    const documentPath = cloudinaryResult.secure_url; // Cloudinary URL

    // Insert into database
    const newDoctor = await pool.query(
      `INSERT INTO doctors (
        full_name, email, password, phone_number, experience, 
        license_number, hospital_name, specialization, location, document_path, approval_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING id, full_name, email, phone_number, experience, license_number, 
                hospital_name, specialization, location, approval_status, created_at`,
      [
        fullName, email, hashedPassword, phoneNumber, experience,
        licenseNumber, hospitalName, specialization, location, documentPath, 'pending'
      ]
    );

    res.status(201).json({
      success: true,
      message: "Registration submitted successfully! Your profile will be reviewed within 24-72 hours. You'll receive an email notification once approved.",
      doctor: newDoctor.rows[0]
    });

    // Notify admin about new doctor registration
    createNotification({
      recipientType: 'admin',
      type: 'new_doctor',
      title: 'New Doctor Registration',
      message: `Dr. ${fullName} (${specialization}) submitted a registration and is awaiting approval.`
    });

  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// LOGIN DOCTOR
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctorCheck = await pool.query(
      "SELECT * FROM doctors WHERE email = $1",
      [email]
    );

    if (doctorCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password. Please check your credentials."
      });
    }

    const doctor = doctorCheck.rows[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, doctor.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password. Please check your credentials."
      });
    }

    // Check approval status
    if (doctor.approval_status === 'pending') {
      return res.status(403).json({
        success: false,
        message: "Your account is still under review. Please wait for admin approval.",
        status: 'pending'
      });
    }

    if (doctor.approval_status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: "Your account has been rejected. Please contact support for more information.",
        status: 'rejected'
      });
    }

    // Create JWT Token
    const token = jwt.sign(
      {
        id: doctor.id,
        email: doctor.email,
        role: 'doctor'
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: _, ...doctorWithoutPassword } = doctor;

    res.json({
      success: true,
      message: "Login successful! Welcome back, Dr. " + doctor.full_name.split(' ')[0],
      doctor: doctorWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET DOCTOR PROFILE
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await pool.query(
      `SELECT id, full_name, email, phone_number, experience, license_number, 
              hospital_name, specialization, location, approval_status, created_at,
              bio, profile_photo, session_fee, initial_session_fee, followup_session_fee,
              rating, review_count, years_experience, credentials, languages, availability_hours
       FROM doctors WHERE id = $1`,
      [req.user.id]
    );

    if (doctor.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found."
      });
    }

    res.json({
      success: true,
      doctor: doctor.rows[0]
    });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// UPDATE DOCTOR PROFILE
export const updateDoctorProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, experience, hospitalName } = req.body;

    const updatedDoctor = await pool.query(
      `UPDATE doctors SET 
        full_name = $1, phone_number = $2, experience = $3, 
        hospital_name = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 
       RETURNING id, full_name, email, phone_number, experience, 
                 license_number, hospital_name, specialization, approval_status, updated_at`,
      [fullName, phoneNumber, experience, hospitalName, req.user.id]
    );

    if (updatedDoctor.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found."
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully.",
      doctor: updatedDoctor.rows[0]
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET ALL APPROVED DOCTORS (for patients to browse)
export const getApprovedDoctors = async (req, res) => {
  try {
    const { specialization, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let queryParams = [];
    let whereExtra = '';

    if (specialization && specialization !== 'all') {
      queryParams.push(specialization);
      whereExtra = ` AND d.specialization = $${queryParams.length}`;
    }

    queryParams.push(limit, offset);
    const limitParam = `$${queryParams.length - 1}`;
    const offsetParam = `$${queryParams.length}`;

    const query = `
      SELECT d.id, d.full_name, d.email, d.specialization, d.hospital_name, d.location,
             d.experience, d.bio, d.profile_photo, d.session_fee, d.initial_session_fee,
             d.followup_session_fee, d.years_experience, d.credentials, d.languages,
             d.availability_hours, d.phone_number, d.created_at,
             0 AS rating,
             0 AS review_count
      FROM doctors d
      WHERE d.approval_status = 'approved' AND d.status = 'active'${whereExtra}
      ORDER BY d.created_at DESC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `;
    const doctors = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM doctors WHERE approval_status = 'approved' AND status = 'active'`;
    let countParams = [];

    if (specialization && specialization !== 'all') {
      countQuery += ` AND specialization = $1`;
      countParams.push(specialization);
    }

    const totalCount = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      doctors: doctors.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount.rows[0].count / limit),
        totalDoctors: parseInt(totalCount.rows[0].count),
        hasNext: offset + doctors.rows.length < totalCount.rows[0].count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get approved doctors error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// UPDATE DOCTOR PROFILE (additional information)
export const updateDoctorProfileInfo = async (req, res) => {
  try {
    const doctorId = req.user.id; // From JWT token
    const { 
      bio, 
      session_fee, 
      initial_session_fee,
      followup_session_fee,
      years_experience, 
      credentials, 
      languages, 
      availability_hours 
    } = req.body;

    // Convert empty strings to null for numeric fields
    const sessionFee = session_fee === '' || session_fee === undefined ? null : session_fee;
    const initialSessionFee = initial_session_fee === '' || initial_session_fee === undefined ? null : initial_session_fee;
    const followupSessionFee = followup_session_fee === '' || followup_session_fee === undefined ? null : followup_session_fee;
    const yearsExperience = years_experience === '' || years_experience === undefined ? null : years_experience;

    const updatedDoctor = await pool.query(
      `UPDATE doctors SET 
        bio = $1, 
        session_fee = $2, 
        initial_session_fee = $3,
        followup_session_fee = $4,
        years_experience = $5, 
        credentials = $6, 
        languages = $7, 
        availability_hours = $8,
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $9 
       RETURNING id, full_name, email, bio, session_fee, initial_session_fee, 
                 followup_session_fee, years_experience, credentials, languages, availability_hours`,
      [bio, sessionFee, initialSessionFee, followupSessionFee, yearsExperience, 
       credentials, languages, availability_hours, doctorId]
    );

    if (updatedDoctor.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found."
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully.",
      doctor: updatedDoctor.rows[0]
    });
  } catch (error) {
    console.error('Update doctor profile info error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// UPLOAD PROFILE PHOTO
export const uploadProfilePhoto = async (req, res) => {
  try {
    const doctorId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a profile photo." });
    }

    // Upload to Cloudinary in doctor's folder
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
      folder: `mentra/doctors/doctor_${doctorId}/profile`,
      resource_type: 'image',
      public_id: `photo_${Date.now()}`,
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
    });

    const photoPath = cloudinaryResult.secure_url; // Cloudinary URL

    const updatedDoctor = await pool.query(
      `UPDATE doctors SET 
        profile_photo = $1,
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, full_name, profile_photo`,
      [photoPath, doctorId]
    );

    if (updatedDoctor.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Doctor not found." });
    }

    res.json({
      success: true,
      message: "Profile photo uploaded successfully.",
      doctor: updatedDoctor.rows[0]
    });
  } catch (error) {
    console.error('Upload profile photo error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to upload photo.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET SINGLE DOCTOR BY ID (for booking page)
export const getDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await pool.query(
      `SELECT id, full_name, email, specialization, hospital_name, location, experience, 
              bio, profile_photo, session_fee, initial_session_fee, followup_session_fee,
              rating, review_count, years_experience, credentials, languages, 
              availability_hours, phone_number, approval_status, created_at
       FROM doctors 
       WHERE id = $1 AND approval_status = 'approved'`,
      [doctorId]
    );

    if (doctor.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found or not approved."
      });
    }

    res.json({
      success: true,
      doctor: doctor.rows[0]
    });
  } catch (error) {
    console.error('Get doctor by ID error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor details.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// UPDATE COMPLETE DOCTOR PROFILE (all fields except license)
export const updateCompleteProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { 
      full_name,
      email,
      phone_number,
      specialization,
      experience,
      hospital_name,
      location,
      initial_session_fee,
      followup_session_fee,
      bio,
      credentials,
      availability_hours
    } = req.body;

    // Convert empty strings to null for numeric fields
    const initialFee = initial_session_fee === '' || initial_session_fee === undefined ? null : initial_session_fee;
    const followupFee = followup_session_fee === '' || followup_session_fee === undefined ? null : followup_session_fee;

    const updatedDoctor = await pool.query(
      `UPDATE doctors SET 
        full_name = $1,
        email = $2,
        phone_number = $3,
        specialization = $4,
        experience = $5,
        hospital_name = $6,
        location = $7,
        initial_session_fee = $8,
        followup_session_fee = $9,
        bio = $10,
        credentials = $11,
        availability_hours = $12,
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $13 
       RETURNING id, full_name, email, phone_number, specialization, experience,
                 hospital_name, location, initial_session_fee, followup_session_fee,
                 bio, credentials, availability_hours, license_number, approval_status`,
      [full_name, email, phone_number, specialization, experience, hospital_name,
       location, initialFee, followupFee, bio, credentials, availability_hours, doctorId]
    );

    if (updatedDoctor.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found."
      });
    }

    // Update localStorage user data
    const updatedUser = updatedDoctor.rows[0];

    res.json({
      success: true,
      message: "Profile updated successfully.",
      doctor: updatedUser
    });
  } catch (error) {
    console.error('Update complete profile error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// UPLOAD DOCTOR VIDEO
export const uploadDoctorVideo = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No video file uploaded." });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Video title is required." });
    }

    // Upload video to Cloudinary in doctor's dedicated folder
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
      folder: `mentra/doctors/doctor_${doctorId}/videos`,
      resource_type: 'video',
      public_id: `video_${Date.now()}`,
    });

    const videoPath = cloudinaryResult.secure_url;       // Cloudinary URL
    const cloudinaryPublicId = cloudinaryResult.public_id; // for future deletion

    const result = await pool.query(
      `INSERT INTO doctor_videos (doctor_id, title, description, video_path, cloudinary_public_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [doctorId, title.trim(), description || null, videoPath, cloudinaryPublicId]
    );

    res.status(201).json({ success: true, message: "Video uploaded successfully!", video: result.rows[0] });
  } catch (err) {
    console.error("Upload video error:", err);
    res.status(500).json({ success: false, message: "Failed to upload video." });
  }
};

// GET DOCTOR VIDEOS (by doctorId — public)
export const getDoctorVideos = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const result = await pool.query(
      "SELECT * FROM doctor_videos WHERE doctor_id = $1 ORDER BY created_at DESC",
      [doctorId]
    );
    res.json({ success: true, videos: result.rows });
  } catch (err) {
    console.error("Get videos error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch videos." });
  }
};

// DELETE DOCTOR VIDEO
export const deleteDoctorVideo = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { videoId } = req.params;

    const result = await pool.query(
      "DELETE FROM doctor_videos WHERE id = $1 AND doctor_id = $2 RETURNING *",
      [videoId, doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Video not found." });
    }

    // Also delete from Cloudinary if public_id is stored
    const deleted = result.rows[0];
    if (deleted.cloudinary_public_id) {
      await deleteFromCloudinary(deleted.cloudinary_public_id, 'video');
    }

    res.json({ success: true, message: "Video deleted successfully." });
  } catch (err) {
    console.error("Delete video error:", err);
    res.status(500).json({ success: false, message: "Failed to delete video." });
  }
};

// SEND EMAIL VERIFICATION OTP (before doctor registration)
export const sendDoctorEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('[sendDoctorEmailVerification] called with email:', email);
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    // Check if email already registered as a doctor
    const existing = await pool.query('SELECT id FROM doctors WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'This email is already registered. Please use a different email address.' });
    }

    // Check if email is already used by a patient
    const existingPatient = await pool.query('SELECT id FROM patients WHERE email = $1', [email]);
    if (existingPatient.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'This email is already registered. Please use a different email address.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this email
    await pool.query(
      "DELETE FROM password_reset_otps WHERE email = $1 AND user_type = 'email_verify'",
      [email]
    );

    // Store OTP
    await pool.query(
      "INSERT INTO password_reset_otps (email, otp, user_type, expires_at) VALUES ($1, $2, 'email_verify', $3)",
      [email, otp, expiresAt]
    );

    // Send OTP email — log to console as fallback if delivery fails
    try {
      const result = await sendOTPEmail(email, otp, 'Doctor', 'verification');
      if (!result.success) {
        console.log(`[DOCTOR EMAIL VERIFY] OTP for ${email}: ${otp}`);
      }
    } catch (emailErr) {
      console.error('SMTP error (non-blocking):', emailErr.message);
      console.log(`[DOCTOR EMAIL VERIFY FALLBACK] OTP for ${email}: ${otp}`);
    }

    res.json({ success: true, message: 'Verification code sent to your email.' });
  } catch (err) {
    console.error('Send doctor email verification error:', err.message, err.stack);
    res.status(500).json({ success: false, message: err.message || 'Failed to send verification email.' });
  }
};

// VERIFY EMAIL OTP (during doctor registration)
export const verifyDoctorEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

    const record = await pool.query(
      "SELECT * FROM password_reset_otps WHERE email = $1 AND otp = $2 AND user_type = 'email_verify' AND is_used = FALSE AND expires_at > NOW()",
      [email, otp]
    );

    if (record.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    // Mark as used
    await pool.query('UPDATE password_reset_otps SET is_used = TRUE WHERE id = $1', [record.rows[0].id]);

    res.json({ success: true, message: 'Email verified successfully.' });
  } catch (err) {
    console.error('Verify doctor email OTP error:', err);
    res.status(500).json({ success: false, message: 'Verification failed.' });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const doctorId = req.user.id;
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Both passwords are required.' });
    if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    const result = await pool.query('SELECT password FROM doctors WHERE id = $1', [doctorId]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE doctors SET password = $1 WHERE id = $2', [hashed, doctorId]);
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};

// CHECK UPCOMING APPOINTMENTS (used before deactivation)
export const checkUpcomingAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const result = await pool.query(
      `SELECT COUNT(*) FROM appointments
       WHERE doctor_id = $1
         AND status IN ('pending', 'confirmed', 'scheduled')
         AND appointment_date >= CURRENT_DATE`,
      [doctorId]
    );
    const count = parseInt(result.rows[0].count);
    res.json({ success: true, upcomingCount: count });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to check appointments.' });
  }
};

// DELETE ACCOUNT (soft delete — marks as deleted, allows re-registration)
export const deleteAccount = async (req, res) => {
  const client = await pool.connect();
  try {
    const doctorId = req.user.id;
    await client.query('BEGIN');

    // Get doctor info
    const doctorResult = await client.query('SELECT full_name, email FROM doctors WHERE id = $1', [doctorId]);
    if (!doctorResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    const { full_name, email } = doctorResult.rows[0];

    // Check for upcoming appointments
    const upcomingCheck = await client.query(
      `SELECT COUNT(*) FROM appointments
       WHERE doctor_id = $1
         AND status IN ('pending', 'confirmed', 'scheduled')
         AND appointment_date >= CURRENT_DATE`,
      [doctorId]
    );
    const upcomingCount = parseInt(upcomingCheck.rows[0].count);
    if (upcomingCount > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `You have ${upcomingCount} upcoming appointment${upcomingCount > 1 ? 's' : ''}. You cannot delete your account until they are completed or cancelled.`
      });
    }

    // Cancel all future appointments (if any remain)
    await client.query(
      `UPDATE appointments
       SET status = 'cancelled',
           updated_at = NOW()
       WHERE doctor_id = $1
         AND appointment_date >= CURRENT_DATE
         AND status NOT IN ('completed', 'cancelled')`,
      [doctorId]
    );

    // Anonymize past appointments
    await client.query(
      `UPDATE appointments
       SET doctor_name = 'Deleted Doctor',
           updated_at = NOW()
       WHERE doctor_id = $1
         AND appointment_date < CURRENT_DATE`,
      [doctorId]
    );

    // Soft delete doctor account
    await client.query(
      `UPDATE doctors
       SET email = $1,
           status = 'deleted',
           approval_status = 'rejected',
           updated_at = NOW()
       WHERE id = $2`,
      [`deleted_${Date.now()}_${email}`, doctorId]
    );

    // Create admin notification
    await client.query(`
      INSERT INTO notifications (recipient_type, recipient_id, type, title, message, is_read, created_at)
      VALUES ('admin', NULL, $1, $2, $3, false, NOW())
    `, [
      'account_deleted',
      'Doctor Account Deleted',
      `Dr. ${full_name} (${email}) has deleted their account.`
    ]);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Delete doctor account error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete account.' });
  } finally {
    client.release();
  }
};

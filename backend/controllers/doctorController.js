import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/index.js";
import path from "path";
import { createNotification } from "./notificationController.js";

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
          message: "Email already registered. Please use a different email address."
        });
      }
      if (existing.license_number === licenseNumber) {
        return res.status(400).json({
          success: false,
          message: "License number already registered. Please check your license number."
        });
      }
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

    // Store document path
    const documentPath = req.file.path;

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

    let query = `
      SELECT id, full_name, email, specialization, hospital_name, location, experience, 
             bio, profile_photo, session_fee, initial_session_fee, followup_session_fee,
             rating, review_count, years_experience, credentials, languages, 
             availability_hours, phone_number, created_at
      FROM doctors 
      WHERE approval_status = 'approved'
    `;
    let queryParams = [];

    if (specialization && specialization !== 'all') {
      query += ` AND specialization = $${queryParams.length + 1}`;
      queryParams.push(specialization);
    }

    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const doctors = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM doctors WHERE approval_status = 'approved'`;
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
    const doctorId = req.user.id; // From JWT token

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a profile photo."
      });
    }

    // Store only the relative path (not the full system path)
    // Convert backslashes to forward slashes for consistency
    const photoPath = req.file.path.replace(/\\/g, '/').split('backend/')[1] || req.file.path;

    const updatedDoctor = await pool.query(
      `UPDATE doctors SET 
        profile_photo = $1,
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, full_name, profile_photo`,
      [photoPath, doctorId]
    );

    if (updatedDoctor.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found."
      });
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

    const videoPath = `uploads/videos/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO doctor_videos (doctor_id, title, description, video_path)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [doctorId, title.trim(), description || null, videoPath]
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

    res.json({ success: true, message: "Video deleted successfully." });
  } catch (err) {
    console.error("Delete video error:", err);
    res.status(500).json({ success: false, message: "Failed to delete video." });
  }
};

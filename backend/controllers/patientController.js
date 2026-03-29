import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/index.js";
import { createNotification } from "./notificationController.js";

// REGISTER PATIENT
export const registerPatient = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, age } = req.body;

    // Check if user exists
    const existing = await pool.query(
      "SELECT * FROM patients WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Email already exists. Please use a different email address." 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert into database
    const newPatient = await pool.query(
      "INSERT INTO patients (full_name, email, password, phone_number, age) VALUES ($1,$2,$3,$4,$5) RETURNING id, full_name, email, phone_number, age, created_at",
      [fullName, email, hashedPassword, phoneNumber, parseInt(age)]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newPatient.rows[0].id, 
        email: newPatient.rows[0].email,
        role: 'patient'
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ 
      success: true,
      message: "Account created successfully! Welcome to Mentra.",
      user: newPatient.rows[0],
      token
    });

    // Notify admin about new user registration (non-blocking)
    createNotification({
      recipientType: 'admin',
      type: 'new_user',
      title: 'New User Registered',
      message: `${fullName} (${email}) just created a new patient account.`
    });

  } catch (err) {
    console.error('Patient registration error:', err);
    res.status(500).json({ 
      success: false,
      message: "Registration failed. Please try again.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// LOGIN PATIENT
export const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userCheck = await pool.query(
      "SELECT * FROM patients WHERE email = $1",
      [email]
    );

    if (userCheck.rows.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email or password. Please check your credentials." 
      });
    }

    const user = userCheck.rows[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email or password. Please check your credentials." 
      });
    }

    // Create JWT Token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: 'patient'
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({ 
      success: true,
      message: "Login successful! Welcome back.",
      user: userWithoutPassword,
      token 
    });

  } catch (err) {
    console.error('Patient login error:', err);
    res.status(500).json({ 
      success: false,
      message: "Login failed. Please try again.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// GET PATIENT PROFILE
export const getPatientProfile = async (req, res) => {
  try {
    const patient = await pool.query(
      "SELECT id, full_name, email, phone_number, age, created_at FROM patients WHERE id = $1",
      [req.user.id]
    );

    if (patient.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found."
      });
    }

    res.json({
      success: true,
      user: patient.rows[0]
    });
  } catch (err) {
    console.error('Get patient profile error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// UPDATE PATIENT PROFILE
export const updatePatientProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, age } = req.body;
    
    const updatedPatient = await pool.query(
      "UPDATE patients SET full_name = $1, phone_number = $2, age = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, full_name, email, phone_number, age, updated_at",
      [fullName, phoneNumber, parseInt(age), req.user.id]
    );

    if (updatedPatient.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found."
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedPatient.rows[0]
    });
  } catch (err) {
    console.error('Update patient profile error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

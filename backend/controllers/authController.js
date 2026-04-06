import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/index.js";
import { generateOTP, storeOTP, verifyOTP as verifyOTPUtil, incrementOTPAttempts } from "../utils/otpUtils.js";
import { sendOTPEmail, sendPasswordResetConfirmation } from "../utils/emailService.js";

// UNIFIED LOGIN - checks both patients and doctors tables
export const unifiedLogin = async (req, res) => {
  console.log(' UNIFIED LOGIN CALLED - Auth Controller');
  console.log('Request body:', req.body);
  
  try {
    const { email, password } = req.body;

    // First, check in patients table
    const patientCheck = await pool.query(
      "SELECT * FROM patients WHERE email = $1",
      [email]
    );

    // If found in patients table
    if (patientCheck.rows.length > 0) {
      const user = patientCheck.rows[0];
      
      // Check if user account is active
      if (user.status === 'inactive') {
        return res.status(403).json({ 
          success: false,
          message: "Your account has been deactivated. Please contact support for assistance.",
          status: 'inactive'
        });
      }
      
      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid email or password. Please check your credentials." 
        });
      }

      // Create JWT Token for patient
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: 'patient',
          status: user.status
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return res.json({ 
        success: true,
        message: "Login successful! Welcome back.",
        user: userWithoutPassword,
        role: 'patient',
        token 
      });
    }

    // If not found in patients, check in doctors table
    const doctorCheck = await pool.query(
      "SELECT * FROM doctors WHERE email = $1",
      [email]
    );

    // If found in doctors table
    if (doctorCheck.rows.length > 0) {
      const doctor = doctorCheck.rows[0];
      
      // Compare password
      const isPasswordValid = await bcrypt.compare(password, doctor.password);

      if (!isPasswordValid) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid email or password. Please check your credentials." 
        });
      }

      // Check if doctor is approved
      console.log(' Debug - Doctor approval check:');
      console.log('doctor.approval_status:', doctor.approval_status);
      
      // Allow login for pending doctors, but they'll see a different page
      if (doctor.approval_status === 'rejected') {
        console.log('Doctor rejected');
        return res.status(403).json({ 
          success: false,
          message: `Your account has been rejected. Please contact support for more information.`,
          status: doctor.approval_status
        });
      }

      console.log(' Doctor login allowed, status:', doctor.approval_status);

      // Create JWT Token for doctor (works for both pending and approved)
      const token = jwt.sign(
        { 
          id: doctor.id, 
          email: doctor.email,
          role: 'doctor',
          approvalStatus: doctor.approval_status
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Remove password from response
      const { password: _, ...doctorWithoutPassword } = doctor;

      return res.json({ 
        success: true,
        message: "Login successful! Welcome back, Dr. " + doctor.full_name.split(' ')[0] + ".",
        user: doctorWithoutPassword,
        role: 'doctor',
        token 
      });
    }

    // If not found in either table
    return res.status(400).json({ 
      success: false,
      message: "Invalid email or password. Please check your credentials." 
    });

  } catch (err) {
    console.error('Unified login error:', err);
    res.status(500).json({ 
      success: false,
      message: "Login failed. Please try again.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// FORGOT PASSWORD - Send OTP
export const forgotPassword = async (req, res) => {
  try {
    console.log(' FORGOT PASSWORD REQUEST RECEIVED');
    const { email } = req.body;
    console.log('Email:', email);

    if (!email) {
      console.log(' No email provided');
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Check if user exists in patients table
    let user = null;
    let userType = null;

    const patientCheck = await pool.query(
      "SELECT id, full_name, email FROM patients WHERE email = $1",
      [email]
    );

    if (patientCheck.rows.length > 0) {
      user = patientCheck.rows[0];
      userType = 'patient';
    } else {
      // Check in doctors table
      const doctorCheck = await pool.query(
        "SELECT id, full_name, email FROM doctors WHERE email = $1",
        [email]
      );

      if (doctorCheck.rows.length > 0) {
        user = doctorCheck.rows[0];
        userType = 'doctor';
      }
    }

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: "If an account with this email exists, you will receive an OTP shortly."
      });
    }

    // Generate and store OTP
    console.log(' User found:', user.full_name, '- Type:', userType);
    const otp = generateOTP();
    console.log(' Generated OTP:', otp);
    await storeOTP(email, otp, userType);
    console.log(' OTP stored in database');

    // Send OTP via email
    console.log(' Attempting to send email...');
    const emailResult = await sendOTPEmail(email, otp, user.full_name);
    console.log(' Email result:', emailResult);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again."
      });
    }

    res.json({
      success: true,
      message: "OTP sent to your email address. Please check your inbox."
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// VERIFY OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    // Verify OTP
    const verification = await verifyOTPUtil(email, otp);

    if (!verification.valid) {
      // Increment attempts for invalid OTP
      await incrementOTPAttempts(email, otp);
      
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    // Generate a temporary token for password reset (valid for 15 minutes)
    const resetToken = jwt.sign(
      { 
        email: email,
        userType: verification.userType,
        purpose: 'password_reset'
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
      resetToken: resetToken
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token"
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in appropriate table
    let updateResult;
    if (decoded.userType === 'patient') {
      updateResult = await pool.query(
        "UPDATE patients SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING full_name",
        [hashedPassword, decoded.email]
      );
    } else if (decoded.userType === 'doctor') {
      updateResult = await pool.query(
        "UPDATE doctors SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING full_name",
        [hashedPassword, decoded.email]
      );
    }

    if (!updateResult || updateResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    // Send confirmation email
    await sendPasswordResetConfirmation(decoded.email, updateResult.rows[0].full_name);

    res.json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// CHECK DOCTOR APPROVAL STATUS
export const checkDoctorStatus = async (req, res) => {
  try {
    // Get doctor ID from JWT token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    if (decoded.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only doctors can check approval status."
      });
    }

    // Get current doctor status from database
    const result = await pool.query(
      "SELECT id, full_name, email, approval_status FROM doctors WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const doctor = result.rows[0];

    // Generate new token with updated status
    const newToken = jwt.sign(
      { 
        id: doctor.id, 
        email: doctor.email,
        role: 'doctor',
        approvalStatus: doctor.approval_status
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      approvalStatus: doctor.approval_status,
      doctor: {
        id: doctor.id,
        full_name: doctor.full_name,
        email: doctor.email,
        approval_status: doctor.approval_status
      },
      token: newToken
    });

  } catch (error) {
    console.error('Check doctor status error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to check status. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
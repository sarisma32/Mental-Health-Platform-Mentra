import crypto from 'crypto';
import pool from '../db/index.js';

// Generate 6-digit OTP
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Store OTP in database
export const storeOTP = async (email, otp, userType) => {
  try {
    // Delete any existing OTPs for this email
    await pool.query(
      'DELETE FROM password_reset_otps WHERE email = $1',
      [email]
    );

    // Store new OTP (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    const result = await pool.query(
      `INSERT INTO password_reset_otps (email, otp, user_type, expires_at) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [email, otp, userType, expiresAt]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error storing OTP:', error);
    throw error;
  }
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  try {
    const result = await pool.query(
      `SELECT * FROM password_reset_otps 
       WHERE email = $1 AND otp = $2 AND is_used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );

    if (result.rows.length === 0) {
      return { valid: false, message: 'Invalid or expired OTP' };
    }

    const otpRecord = result.rows[0];

    // Check attempts (max 3 attempts)
    if (otpRecord.attempts >= 3) {
      return { valid: false, message: 'Too many attempts. Please request a new OTP.' };
    }

    // Mark OTP as used
    await pool.query(
      'UPDATE password_reset_otps SET is_used = TRUE WHERE id = $1',
      [otpRecord.id]
    );

    return { 
      valid: true, 
      userType: otpRecord.user_type,
      message: 'OTP verified successfully' 
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Increment OTP attempts
export const incrementOTPAttempts = async (email, otp) => {
  try {
    await pool.query(
      `UPDATE password_reset_otps 
       SET attempts = attempts + 1 
       WHERE email = $1 AND otp = $2 AND is_used = FALSE`,
      [email, otp]
    );
  } catch (error) {
    console.error('Error incrementing OTP attempts:', error);
  }
};

// Clean expired OTPs (can be called periodically)
export const cleanExpiredOTPs = async () => {
  try {
    const result = await pool.query(
      'DELETE FROM password_reset_otps WHERE expires_at < NOW() OR is_used = TRUE'
    );
    console.log(`Cleaned ${result.rowCount} expired/used OTPs`);
  } catch (error) {
    console.error('Error cleaning expired OTPs:', error);
  }
};
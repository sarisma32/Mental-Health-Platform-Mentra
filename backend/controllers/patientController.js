import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/index.js";
import { createNotification } from "./notificationController.js";
import { sendOTPEmail } from "../utils/emailService.js";

// REGISTER PATIENT
export const registerPatient = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, age } = req.body;

    // Check if user exists (exclude deleted accounts — they can re-register)
    const existing = await pool.query(
      "SELECT * FROM patients WHERE email = $1 AND status != 'deleted'",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Email already exists. Please use a different email address." 
      });
    }

    // Check if email is already used by a doctor
    const existingDoctor = await pool.query(
      "SELECT id FROM doctors WHERE email = $1",
      [email]
    );
    if (existingDoctor.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered as a doctor account. Please use a different email address."
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
      process.env.JWT_SECRET,//This is a secret password that only your server knows, stored safely in a .env file (never hardcoded).
      { expiresIn: "7d" }
    );//PartWhat it isHeaderAlgorithm used to sign (e.g. HS256)PayloadYour data (id, email, role) — base64 encodedSignatureHeader + Payload locked with the secret key

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

    // Block deleted accounts
    if (user.status === 'deleted') {
      return res.status(400).json({ success: false, message: 'This account has been deleted.' });
    }
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


// SEND EMAIL VERIFICATION OTP (before registration)
export const sendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    // Check if email already registered
    const existing = await pool.query('SELECT id FROM patients WHERE email = $1 AND status != \'deleted\'', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please use a different email.' });
    }

    // Check if email is already used by a doctor
    const existingDoctor = await pool.query('SELECT id FROM doctors WHERE email = $1', [email]);
    if (existingDoctor.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'This email is already registered as a doctor account. Please use a different email.' });
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
      const result = await sendOTPEmail(email, otp, 'New User', 'verification');
      if (!result.success) {
        console.log(`[PATIENT EMAIL VERIFY] OTP for ${email}: ${otp}`);
      }
    } catch (emailErr) {
      console.error('SMTP error (non-blocking):', emailErr.message);
      console.log(`[PATIENT EMAIL VERIFY FALLBACK] OTP for ${email}: ${otp}`);
    }

    res.json({ success: true, message: 'Verification code sent to your email.' });
  } catch (err) {
    console.error('Send email verification error:', err);
    res.status(500).json({ success: false, message: 'Failed to send verification email.' });
  }
};

// VERIFY EMAIL OTP (during registration)
export const verifyEmailOTP = async (req, res) => {
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
    console.error('Verify email OTP error:', err);
    res.status(500).json({ success: false, message: 'Verification failed.' });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const patientId = req.user.id;
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Both passwords are required.' });
    if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    const result = await pool.query('SELECT password FROM patients WHERE id = $1', [patientId]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Patient not found.' });
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE patients SET password = $1 WHERE id = $2', [hashed, patientId]);
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};

// DELETE ACCOUNT (soft delete — marks as deleted, allows re-registration)
export const deleteAccount = async (req, res) => {
  const client = await pool.connect();
  try {
    const patientId = req.user.id;

    const patient = await client.query('SELECT full_name, email FROM patients WHERE id = $1', [patientId]);
    if (!patient.rows.length) return res.status(404).json({ success: false, message: 'Account not found.' });

    const { full_name, email } = patient.rows[0];

    await client.query('BEGIN');

    // 1. Soft delete — rename email so same address can re-register
    const deletedEmail = `deleted_${Date.now()}_${email}`;
    await client.query(
      "UPDATE patients SET status = 'deleted', email = $1, updated_at = NOW() WHERE id = $2",
      [deletedEmail, patientId]
    );

    // 2. Future pending/confirmed appointments → cancel them & free the slot
    //    (slot becomes available by simply cancelling — no appointment blocks it)
    await client.query(
      `UPDATE appointments
       SET status = 'cancelled',
           patient_first_name = 'Deleted',
           patient_last_name = 'User',
           patient_email = 'deleted@account.com',
           patient_phone = '—',
           updated_at = NOW()
       WHERE patient_id = $1
         AND status IN ('pending', 'confirmed', 'scheduled')
         AND appointment_date >= CURRENT_DATE`,
      [patientId]
    );

    // 3. Past / completed appointments → keep for records, anonymise patient info
    await client.query(
      `UPDATE appointments
       SET patient_first_name = 'Deleted',
           patient_last_name = 'User',
           patient_email = 'deleted@account.com',
           patient_phone = '—',
           updated_at = NOW()
       WHERE patient_id = $1
         AND status IN ('completed', 'cancelled', 'no_show')`,
      [patientId]
    );

    await client.query('COMMIT');

    // 4. Notify admin
    createNotification({
      recipientType: 'admin',
      type: 'account_deleted',
      title: 'Patient Account Deleted',
      message: `Patient "${full_name}" (${email}) has deleted their account. Future appointments have been cancelled and slots freed.`,
    });

    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Delete account error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete account.' });
  } finally {
    client.release();
  }
};

import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';

// Verify Google credential token and return payload
const verifyGoogleToken = async (credential) => {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
  if (!res.ok) throw new Error('Failed to verify Google token');
  const payload = await res.json();
  if (payload.error) throw new Error(payload.error_description || 'Invalid Google token');
  // Verify audience matches our client ID
  if (payload.aud !== process.env.GOOGLE_CLIENT_ID) throw new Error('Token audience mismatch');
  return payload;
};

const issueJwt = (user, role) =>
  jwt.sign({ id: user.id, email: user.email, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/google/login
// Used on the Login page — finds existing patient account and logs them in
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, message: 'Google credential required' });

    const payload = await verifyGoogleToken(credential);
    const { email, name, picture } = payload;

    // Only patients can log in via Google on the patient login page
    const result = await pool.query('SELECT * FROM patients WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this Google account. Please sign up first.',
        notFound: true,
      });
    }

    const user = result.rows[0];
    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.', status: 'inactive' });
    }

    const { password: _, ...userWithoutPassword } = user;
    return res.json({
      success: true,
      message: 'Login successful!',
      user: userWithoutPassword,
      role: 'patient',
      token: issueJwt(user, 'patient'),
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ success: false, message: err.message || 'Google login failed' });
  }
};

// POST /api/auth/google/verify
// Used on the Sign Up page — verifies token, checks for duplicates, returns prefill data
export const googleVerify = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, message: 'Google credential required' });

    const payload = await verifyGoogleToken(credential);
    const { email, name, picture } = payload;

    // Check duplicate in patients table
    const existing = await pool.query('SELECT id FROM patients WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this Google email already exists. Please log in instead.',
        duplicate: true,
      });
    }

    // Return prefill data — frontend will show completion form
    return res.json({
      success: true,
      prefill: { fullName: name || '', email, picture: picture || '' },
    });
  } catch (err) {
    console.error('Google verify error:', err);
    res.status(500).json({ success: false, message: err.message || 'Google verification failed' });
  }
};

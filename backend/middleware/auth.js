import jwt from 'jsonwebtoken';
import pool from '../db/index.js';

// Verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Verify patient role
export const verifyPatient = async (req, res, next) => {
  try {
    const patient = await pool.query(
      'SELECT id, full_name, email FROM patients WHERE id = $1',
      [req.user.id]
    );

    if (patient.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Patient not found.'
      });
    }

    req.patient = patient.rows[0];
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Verify doctor role
export const verifyDoctor = async (req, res, next) => {
  try {
    const doctor = await pool.query(
      'SELECT id, full_name, email, approval_status FROM doctors WHERE id = $1',
      [req.user.id]
    );

    if (doctor.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor not found.'
      });
    }

    req.doctor = doctor.rows[0];
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Verify admin role (for future use)
export const verifyAdmin = async (req, res, next) => {
  try {
    // Add admin verification logic here
    // For now, just check if user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};
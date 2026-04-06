import pool from "../db/index.js";

// Get all doctors with their registration details
export const getAllDoctors = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        full_name,
        email,
        phone_number,
        experience,
        license_number,
        hospital_name,
        specialization,
        location,
        document_path,
        approval_status,
        bio,
        profile_photo,
        session_fee,
        rating,
        review_count,
        years_experience,
        credentials,
        languages,
        availability_hours,
        created_at,
        updated_at
      FROM doctors 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      doctors: result.rows
    });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all patients (users)
export const getAllPatients = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        full_name,
        email,
        phone_number,
        age,
        status,
        created_at
      FROM patients 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      patients: result.rows
    });

  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patients",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update patient status (activate/deactivate)
export const updatePatientStatus = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'active' or 'inactive'"
      });
    }

    // Update patient status
    const result = await pool.query(
      `UPDATE patients 
       SET status = $1 
       WHERE id = $2 
       RETURNING id, full_name, email, status`,
      [status, patientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    const patient = result.rows[0];

    res.json({
      success: true,
      message: `Patient ${patient.full_name} status updated to ${status}`,
      patient: patient
    });

  } catch (error) {
    console.error('Error updating patient status:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update patient status",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update doctor approval status
export const updateDoctorStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'pending', 'approved', or 'rejected'"
      });
    }

    // Update doctor status
    const result = await pool.query(
      `UPDATE doctors 
       SET approval_status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, full_name, email, approval_status`,
      [status, doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const doctor = result.rows[0];

    res.json({
      success: true,
      message: `Doctor ${doctor.full_name} status updated to ${status}`,
      doctor: doctor
    });

  } catch (error) {
    console.error('Error updating doctor status:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update doctor status",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get doctor details by ID
export const getDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const result = await pool.query(`
      SELECT 
        id,
        full_name,
        email,
        phone_number,
        experience,
        license_number,
        hospital_name,
        specialization,
        document_path,
        approval_status,
        created_at,
        updated_at
      FROM doctors 
      WHERE id = $1
    `, [doctorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    res.json({
      success: true,
      doctor: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor details",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get admin dashboard statistics
export const getAdminStats = async (req, res) => {
  try {
    // Get doctor statistics
    const doctorStats = await pool.query(`
      SELECT 
        COUNT(*) as total_doctors,
        COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending_doctors,
        COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved_doctors,
        COUNT(CASE WHEN approval_status = 'rejected' THEN 1 END) as rejected_doctors
      FROM doctors
    `);

    // Get patient statistics
    const patientStats = await pool.query(`
      SELECT COUNT(*) as total_patients FROM patients
    `);

    // Get recent registrations (last 7 days)
    const recentRegistrations = await pool.query(`
      SELECT COUNT(*) as recent_registrations 
      FROM doctors 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);

    res.json({
      success: true,
      stats: {
        doctors: doctorStats.rows[0],
        patients: patientStats.rows[0],
        recent_registrations: recentRegistrations.rows[0].recent_registrations
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete doctor (soft delete by setting status to 'deleted')
export const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const result = await pool.query(
      `UPDATE doctors 
       SET approval_status = 'deleted', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING id, full_name, email`,
      [doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const doctor = result.rows[0];

    res.json({
      success: true,
      message: `Doctor ${doctor.full_name} has been deleted`,
      doctor: doctor
    });

  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete doctor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all appointments for admin view
export const getAllAppointments = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = `
      SELECT 
        a.id,
        a.confirmation_number,
        a.appointment_date,
        a.appointment_time,
        a.appointment_type,
        a.session_fee,
        a.duration_minutes,
        a.status,
        a.reason_for_visit,
        a.session_notes,
        a.created_at,
        -- Patient info
        a.patient_first_name,
        a.patient_last_name,
        a.patient_email,
        a.patient_phone,
        -- Doctor info
        a.doctor_name,
        a.doctor_specialization,
        a.doctor_location,
        d.profile_photo as doctor_photo
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id
      WHERE 1=1
    `;

    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND a.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (
        a.patient_first_name ILIKE $${params.length} OR
        a.patient_last_name ILIKE $${params.length} OR
        a.patient_email ILIKE $${params.length} OR
        a.doctor_name ILIKE $${params.length} OR
        a.confirmation_number ILIKE $${params.length}
      )`;
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

    const result = await pool.query(query, params);

    // Get summary stats
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'confirmed') as upcoming,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
      FROM appointments
    `);

    res.json({
      success: true,
      appointments: result.rows,
      stats: stats.rows[0]
    });

  } catch (error) {
    console.error('Error fetching all appointments:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ── Specializations ──────────────────────────────────────────────────────────

export const getSpecializations = async (req, res) => {
  try {
    // Include doctor_count so the frontend knows which ones are in use
    const result = await pool.query(`
      SELECT s.*, COUNT(d.id)::int AS doctor_count
      FROM specializations s
      LEFT JOIN doctors d ON d.specialization = s.name
      GROUP BY s.id
      ORDER BY s.name ASC
    `);
    res.json({ success: true, specializations: result.rows });
  } catch (error) {
    console.error('Error fetching specializations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch specializations' });
  }
};

export const createSpecialization = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const result = await pool.query(
      'INSERT INTO specializations (name) VALUES ($1) RETURNING *',
      [name.trim()]
    );
    res.status(201).json({ success: true, specialization: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Specialization already exists' });
    }
    console.error('Error creating specialization:', error);
    res.status(500).json({ success: false, message: 'Failed to create specialization' });
  }
};

export const updateSpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    // Block edit if any doctor is using this specialization
    const inUse = await pool.query(
      `SELECT COUNT(d.id) FROM specializations s
       JOIN doctors d ON d.specialization = s.name
       WHERE s.id = $1`, [id]
    );
    if (parseInt(inUse.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit — this specialization is assigned to one or more doctors.'
      });
    }

    const result = await pool.query(
      'UPDATE specializations SET name = $1 WHERE id = $2 RETURNING *',
      [name.trim(), id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Specialization not found' });
    }
    res.json({ success: true, specialization: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Specialization already exists' });
    }
    console.error('Error updating specialization:', error);
    res.status(500).json({ success: false, message: 'Failed to update specialization' });
  }
};

export const deleteSpecialization = async (req, res) => {
  try {
    const { id } = req.params;

    // Block delete if any doctor is using this specialization
    const inUse = await pool.query(
      `SELECT COUNT(d.id) FROM specializations s
       JOIN doctors d ON d.specialization = s.name
       WHERE s.id = $1`, [id]
    );
    if (parseInt(inUse.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete — this specialization is assigned to one or more doctors.'
      });
    }

    const result = await pool.query(
      'DELETE FROM specializations WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Specialization not found' });
    }
    res.json({ success: true, message: `"${result.rows[0].name}" deleted` });
  } catch (error) {
    console.error('Error deleting specialization:', error);
    res.status(500).json({ success: false, message: 'Failed to delete specialization' });
  }
};

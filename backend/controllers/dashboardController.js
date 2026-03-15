import pool from "../db/index.js";

// GET DOCTOR DASHBOARD STATS
export const getDoctorDashboardStats = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Get today's appointments count
    const todayAppointments = await pool.query(
      `SELECT COUNT(*) as count FROM appointments 
       WHERE doctor_id = $1 AND appointment_date = $2 AND status NOT IN ('cancelled', 'no_show')`,
      [doctorId, today]
    );

    // Get total unique patients
    const totalPatients = await pool.query(
      `SELECT COUNT(DISTINCT patient_id) as count FROM appointments 
       WHERE doctor_id = $1 AND status IN ('completed', 'confirmed', 'scheduled')`,
      [doctorId]
    );

    // Get weekly revenue (completed appointments this week)
    const weeklyRevenue = await pool.query(
      `SELECT COALESCE(SUM(session_fee), 0) as revenue FROM appointments 
       WHERE doctor_id = $1 AND appointment_date >= $2 AND status = 'completed'`,
      [doctorId, weekStartStr]
    );

    // Get total completed sessions
    const completedSessions = await pool.query(
      `SELECT COUNT(*) as count FROM appointments 
       WHERE doctor_id = $1 AND status = 'completed'`,
      [doctorId]
    );

    // Get upcoming appointments (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const upcomingAppointments = await pool.query(
      `SELECT COUNT(*) as count FROM appointments 
       WHERE doctor_id = $1 AND appointment_date BETWEEN $2 AND $3 AND status IN ('scheduled', 'confirmed')`,
      [doctorId, today, nextWeekStr]
    );

    // Get recent appointments for activity feed
    const recentAppointments = await pool.query(
      `SELECT a.*, p.full_name as patient_name 
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.id
       WHERE a.doctor_id = $1 
       ORDER BY a.created_at DESC 
       LIMIT 5`,
      [doctorId]
    );

    res.json({
      success: true,
      stats: {
        todayAppointments: parseInt(todayAppointments.rows[0].count),
        totalPatients: parseInt(totalPatients.rows[0].count),
        weeklyRevenue: parseFloat(weeklyRevenue.rows[0].revenue),
        completedSessions: parseInt(completedSessions.rows[0].count),
        upcomingAppointments: parseInt(upcomingAppointments.rows[0].count)
      },
      recentActivity: recentAppointments.rows
    });

  } catch (error) {
    console.error('Get doctor dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET PATIENT DASHBOARD STATS
export const getPatientDashboardStats = async (req, res) => {
  try {
    const patientId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Get total completed sessions
    const completedSessions = await pool.query(
      `SELECT COUNT(*) as count FROM appointments 
       WHERE patient_id = $1 AND status = 'completed'`,
      [patientId]
    );

    // Get upcoming appointments
    const upcomingAppointments = await pool.query(
      `SELECT COUNT(*) as count FROM appointments 
       WHERE patient_id = $1 AND appointment_date >= $2 AND status IN ('scheduled', 'confirmed')`,
      [patientId, today]
    );

    // Get total spent
    const totalSpent = await pool.query(
      `SELECT COALESCE(SUM(session_fee), 0) as total FROM appointments 
       WHERE patient_id = $1 AND status = 'completed'`,
      [patientId]
    );

    // Get recent appointments for activity feed
    const recentAppointments = await pool.query(
      `SELECT * FROM appointments 
       WHERE patient_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [patientId]
    );

    // Calculate progress score (mock calculation based on completed sessions)
    const progressScore = Math.min(85 + (parseInt(completedSessions.rows[0].count) * 2), 100);

    res.json({
      success: true,
      stats: {
        completedSessions: parseInt(completedSessions.rows[0].count),
        upcomingAppointments: parseInt(upcomingAppointments.rows[0].count),
        totalSpent: parseFloat(totalSpent.rows[0].total),
        progressScore: progressScore
      },
      recentActivity: recentAppointments.rows
    });

  } catch (error) {
    console.error('Get patient dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET DOCTOR'S PATIENTS LIST
export const getDoctorPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get unique patients who have appointments with this doctor
    const patients = await pool.query(
      `SELECT DISTINCT 
        p.id, p.full_name, p.email, p.phone_number, p.age,
        COUNT(a.id) as total_appointments,
        MAX(a.appointment_date) as last_appointment,
        SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed_sessions
       FROM patients p
       INNER JOIN appointments a ON p.id = a.patient_id
       WHERE a.doctor_id = $1
       GROUP BY p.id, p.full_name, p.email, p.phone_number, p.age
       ORDER BY MAX(a.appointment_date) DESC
       LIMIT $2 OFFSET $3`,
      [doctorId, limit, offset]
    );

    // Get total count for pagination
    const totalCount = await pool.query(
      `SELECT COUNT(DISTINCT patient_id) as count 
       FROM appointments 
       WHERE doctor_id = $1`,
      [doctorId]
    );

    res.json({
      success: true,
      patients: patients.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount.rows[0].count / limit),
        totalPatients: parseInt(totalCount.rows[0].count),
        hasNext: offset + patients.rows.length < totalCount.rows[0].count,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get doctor patients error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patients list.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
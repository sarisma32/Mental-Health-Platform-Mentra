import pool from "../db/index.js";
import { createNotification } from "./notificationController.js";

// Patient: submit a dispute for a completed appointment
export const submitDispute = async (req, res) => {
  try {
    const { appointmentId, issueType, description } = req.body;
    if (!appointmentId || !issueType || !description) {
      return res.status(400).json({ success: false, message: "appointmentId, issueType, and description are required" });
    }

    // Verify appointment exists, is completed, and belongs to this patient
    const aptResult = await pool.query(
      "SELECT * FROM appointments WHERE id = $1 AND status = 'completed'",
      [appointmentId]
    );
    if (aptResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Completed appointment not found" });
    }
    const apt = aptResult.rows[0];

    // Check for duplicate dispute on same appointment
    const existing = await pool.query(
      "SELECT id FROM disputes WHERE appointment_id = $1",
      [appointmentId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: "A dispute has already been raised for this appointment" });
    }

    const disputeId = `DISP${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const result = await pool.query(
      `INSERT INTO disputes (id, appointment_id, patient_id, doctor_id, issue_type, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
      [disputeId, appointmentId, apt.patient_id, apt.doctor_id, issueType, description]
    );

    // Notify admin
    await createNotification({
      recipientType: 'admin',
      type: 'new_dispute',
      title: 'New Dispute Submitted',
      message: `A patient raised a dispute: "${issueType}" for appointment #${appointmentId}.`
    });

    res.status(201).json({ success: true, message: "Dispute submitted successfully", dispute: result.rows[0] });
  } catch (err) {
    console.error("Submit dispute error:", err);
    res.status(500).json({ success: false, message: "Failed to submit dispute" });
  }
};

// Patient: get their own disputes
export const getPatientDisputes = async (req, res) => {
  try {
    const { patientId } = req.params;
    const result = await pool.query(
      `SELECT d.*, 
        a.appointment_date, a.appointment_time, a.confirmation_number,
        doc.full_name as doctor_name, doc.specialization as doctor_specialization
       FROM disputes d
       JOIN appointments a ON d.appointment_id = a.id
       JOIN doctors doc ON d.doctor_id = doc.id
       WHERE d.patient_id = $1
       ORDER BY d.created_at DESC`,
      [patientId]
    );
    res.json({ success: true, disputes: result.rows });
  } catch (err) {
    console.error("Get patient disputes error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch disputes" });
  }
};

// Doctor: get disputes related to them
export const getDoctorDisputes = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const result = await pool.query(
      `SELECT d.*,
        a.appointment_date, a.appointment_time, a.confirmation_number,
        p.full_name as patient_name
       FROM disputes d
       JOIN appointments a ON d.appointment_id = a.id
       JOIN patients p ON d.patient_id = p.id
       WHERE d.doctor_id = $1
       ORDER BY d.created_at DESC`,
      [doctorId]
    );
    res.json({ success: true, disputes: result.rows });
  } catch (err) {
    console.error("Get doctor disputes error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch disputes" });
  }
};

// Admin: get all disputes
export const getAllDisputes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*,
        a.appointment_date, a.appointment_time, a.confirmation_number,
        p.full_name as patient_name,
        doc.full_name as doctor_name, doc.specialization as doctor_specialization
       FROM disputes d
       JOIN appointments a ON d.appointment_id = a.id
       JOIN patients p ON d.patient_id = p.id
       JOIN doctors doc ON d.doctor_id = doc.id
       ORDER BY d.created_at DESC`
    );

    const stats = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'under_review') as under_review,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
      FROM disputes
    `);

    res.json({ success: true, disputes: result.rows, stats: stats.rows[0] });
  } catch (err) {
    console.error("Get all disputes error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch disputes" });
  }
};

// Admin: update dispute status and send response
export const updateDisputeStatus = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { status, adminResponse, doctorWarning } = req.body;

    const validStatuses = ['pending', 'under_review', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const result = await pool.query(
      `UPDATE disputes 
       SET status = $1, admin_response = $2, doctor_warning = $3,
           responded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [status, adminResponse || null, doctorWarning || null, disputeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Dispute not found" });
    }

    const dispute = result.rows[0];

    // Notify patient only
    await createNotification({
      recipientType: 'patient',
      recipientId: dispute.patient_id,
      type: 'dispute_update',
      title: adminResponse
        ? `Dispute ${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}`
        : 'Dispute Status Updated',
      message: adminResponse || `Your dispute has been marked as "${status.replace('_', ' ')}".`,
    });

    // If admin wrote a warning, persist it in doctor_warnings and notify doctor
    if (doctorWarning && doctorWarning.trim()) {
      await pool.query(
        `INSERT INTO doctor_warnings (doctor_id, dispute_id, message) VALUES ($1, $2, $3)`,
        [dispute.doctor_id, disputeId, doctorWarning.trim()]
      );
      await createNotification({
        recipientType: 'doctor',
        recipientId: dispute.doctor_id,
        type: 'admin_warning',
        title: 'Warning from Admin',
        message: doctorWarning.trim(),
      });
    }

    res.json({ success: true, message: "Dispute updated successfully", dispute });
  } catch (err) {
    console.error("Update dispute status error:", err);
    res.status(500).json({ success: false, message: "Failed to update dispute" });
  }
};

// Check if a dispute already exists for an appointment
export const checkDisputeExists = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const result = await pool.query("SELECT id FROM disputes WHERE appointment_id = $1", [appointmentId]);
    res.json({ success: true, hasDispute: result.rows.length > 0 });
  } catch (err) {
    console.error("Check dispute error:", err);
    res.status(500).json({ success: false, message: "Failed to check dispute" });
  }
};

// Doctor: get their warnings from admin
export const getDoctorWarnings = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const result = await pool.query(
      `SELECT w.*, d.issue_type as dispute_issue, d.status as dispute_status
       FROM doctor_warnings w
       LEFT JOIN disputes d ON w.dispute_id = d.id
       WHERE w.doctor_id = $1
       ORDER BY w.created_at DESC`,
      [doctorId]
    );
    res.json({ success: true, warnings: result.rows });
  } catch (err) {
    console.error("Get doctor warnings error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch warnings" });
  }
};

// Doctor: mark a warning as read
export const markWarningRead = async (req, res) => {
  try {
    const { warningId } = req.params;
    await pool.query("UPDATE doctor_warnings SET is_read = true WHERE id = $1", [warningId]);
    res.json({ success: true });
  } catch (err) {
    console.error("Mark warning read error:", err);
    res.status(500).json({ success: false, message: "Failed to mark warning as read" });
  }
};

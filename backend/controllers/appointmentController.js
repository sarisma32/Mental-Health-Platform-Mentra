import pool from "../db/index.js";
import { sendAppointmentBookedEmail, sendSessionCompletedEmail } from "../utils/emailService.js";
import { createNotification } from "./notificationController.js";

// Generate unique confirmation number
const generateConfirmationNumber = () => {
  const prefix = 'MEN';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};


// CREATE APPOINTMENT
export const createAppointment = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      appointmentType,
      sessionFee,
      durationMinutes,
      
      // Patient information
      patientFirstName,
      patientLastName,
      patientEmail,
      patientPhone,
      patientDateOfBirth,
      emergencyContactName,
      emergencyContactPhone,
      
      // Session details
      reasonForVisit,
      previousTherapy,
      currentMedications,
      specialRequests,
      
      // Professional information
      doctorName,
      doctorSpecialization,
      doctorLocation,
      doctorAddress,
      doctorPhone
    } = req.body;

    // Check if the time slot is already CONFIRMED (pending doesn't block the slot)
    const existingAppointment = await pool.query(
      "SELECT id FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status = 'confirmed'",
      [doctorId, appointmentDate, appointmentTime]
    );

    if (existingAppointment.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked. Please select a different time."
      });
    }

    // Enforce 24-hour advance booking rule
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const hoursUntilAppointment = (appointmentDateTime - new Date()) / (1000 * 60 * 60);
    if (hoursUntilAppointment < 24) {
      return res.status(400).json({
        success: false,
        message: "Appointments must be booked at least 24 hours in advance."
      });
    }

    // Generate confirmation number
    const confirmationNumber = generateConfirmationNumber();

    // Insert appointment with PENDING status — doctor must confirm
    const newAppointment = await pool.query(
      `INSERT INTO appointments (
        patient_id, doctor_id, appointment_date, appointment_time, appointment_type, 
        session_fee, duration_minutes, patient_first_name, patient_last_name, 
        patient_email, patient_phone, patient_date_of_birth, emergency_contact_name, 
        emergency_contact_phone, reason_for_visit, previous_therapy, current_medications, 
        special_requests, doctor_name, doctor_specialization, doctor_location, 
        doctor_address, doctor_phone, confirmation_number, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, 'pending'
      ) RETURNING *`,
      [
        patientId, doctorId, appointmentDate, appointmentTime, appointmentType,
        sessionFee, durationMinutes || 60, patientFirstName, patientLastName,
        patientEmail, patientPhone, patientDateOfBirth, emergencyContactName,
        emergencyContactPhone, reasonForVisit, previousTherapy, currentMedications,
        specialRequests, doctorName, doctorSpecialization, doctorLocation,
        doctorAddress, doctorPhone, confirmationNumber
      ]
    );

    // Send booking confirmation email (non-blocking)
    sendAppointmentBookedEmail(newAppointment.rows[0]).catch(e =>
      console.error('Booking email error:', e)
    );

    // Notify the doctor about new appointment
    createNotification({
      recipientType: 'doctor',
      recipientId: doctorId,
      type: 'new_appointment',
      title: 'New Appointment Booked',
      message: `${patientFirstName} ${patientLastName} booked a ${appointmentType} session on ${appointmentDate} at ${appointmentTime}.`
    });

    // Notify admin about new appointment
    createNotification({
      recipientType: 'admin',
      type: 'new_appointment',
      title: 'New Appointment Booked',
      message: `${patientFirstName} ${patientLastName} booked a session with Dr. ${doctorName} on ${appointmentDate}.`
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully!",
      appointment: newAppointment.rows[0]
    });

  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to book appointment. Please try again.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// GET PATIENT APPOINTMENTS
export const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, limit = 10, offset = 0 } = req.query;

    let query = `
      SELECT * FROM appointments 
      WHERE patient_id = $1
    `;
    let queryParams = [patientId];

    if (status) {
      query += ` AND status = $2`;
      queryParams.push(status);
    }

    query += ` ORDER BY appointment_date DESC, appointment_time DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const appointments = await pool.query(query, queryParams);

    res.json({
      success: true,
      appointments: appointments.rows,
      total: appointments.rows.length
    });

  } catch (err) {
    console.error('Get patient appointments error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// GET DOCTOR APPOINTMENTS
export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, date, limit = 10, offset = 0 } = req.query;

    let query = `
      SELECT * FROM appointments 
      WHERE doctor_id = $1
    `;
    let queryParams = [doctorId];

    if (status) {
      query += ` AND status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }

    if (date) {
      query += ` AND appointment_date = $${queryParams.length + 1}`;
      queryParams.push(date);
    }

    query += ` ORDER BY appointment_date ASC, appointment_time ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const appointments = await pool.query(query, queryParams);

    res.json({
      success: true,
      appointments: appointments.rows,
      total: appointments.rows.length
    });

  } catch (err) {
    console.error('Get doctor appointments error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// GET APPOINTMENT BY ID
export const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await pool.query(
      "SELECT * FROM appointments WHERE id = $1",
      [appointmentId]
    );

    if (appointment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found."
      });
    }

    res.json({
      success: true,
      appointment: appointment.rows[0]
    });

  } catch (err) {
    console.error('Get appointment by ID error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// UPDATE APPOINTMENT STATUS
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: " + validStatuses.join(', ')
      });
    }

    const updatedAppointment = await pool.query(
      "UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, appointmentId]
    );

    if (updatedAppointment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found."
      });
    }

    res.json({
      success: true,
      message: "Appointment status updated successfully.",
      appointment: updatedAppointment.rows[0]
    });

  } catch (err) {
    console.error('Update appointment status error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to update appointment status.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// CONFIRM APPOINTMENT (doctor confirms a pending appointment)
export const confirmAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Check it exists and is still pending
    const existing = await pool.query(
      "SELECT * FROM appointments WHERE id = $1 AND status = 'pending'",
      [appointmentId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Pending appointment not found." });
    }

    const apt = existing.rows[0];

    // Check no other confirmed appointment exists for this slot
    const conflict = await pool.query(
      "SELECT id FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status = 'confirmed' AND id != $4",
      [apt.doctor_id, apt.appointment_date, apt.appointment_time, appointmentId]
    );

    if (conflict.rows.length > 0) {
      return res.status(400).json({ success: false, message: "This time slot has already been confirmed for another patient." });
    }

    const updated = await pool.query(
      "UPDATE appointments SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [appointmentId]
    );

    // Notify patient (skip — patients don't have a notification panel yet)
    // createNotification for patient would go here when patient notifications are added

    res.json({ success: true, message: "Appointment confirmed!", appointment: updated.rows[0] });
  } catch (err) {
    console.error('Confirm appointment error:', err);
    res.status(500).json({ success: false, message: "Failed to confirm appointment." });
  }
};

// CANCEL APPOINTMENT
export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const cancelledAppointment = await pool.query(
      "UPDATE appointments SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [appointmentId]
    );

    if (cancelledAppointment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found."
      });
    }

    res.json({
      success: true,
      message: "Appointment cancelled successfully.",
      appointment: cancelledAppointment.rows[0]
    });

  } catch (err) {
    console.error('Cancel appointment error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


// COMPLETE SESSION WITH NOTES
export const completeSession = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { sessionNotes } = req.body;

    // Verify appointment exists and belongs to this doctor
    const appointment = await pool.query(
      "SELECT * FROM appointments WHERE id = $1",
      [appointmentId]
    );

    if (appointment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found."
      });
    }

    // Update appointment status to completed and add session notes
    const updatedAppointment = await pool.query(
      `UPDATE appointments 
       SET status = 'completed', 
           session_notes = $1, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [sessionNotes, appointmentId]
    );

    // Send session completed email with notes (non-blocking)
    sendSessionCompletedEmail(updatedAppointment.rows[0]).catch(e =>
      console.error('Session completed email error:', e)
    );

    // Notify admin about completed session
    const apt = updatedAppointment.rows[0];
    createNotification({
      recipientType: 'admin',
      type: 'session_completed',
      title: 'Session Completed',
      message: `Dr. ${apt.doctor_name} completed a session with ${apt.patient_first_name} ${apt.patient_last_name}.`
    });

    res.json({
      success: true,
      message: "Session completed successfully!",
      appointment: updatedAppointment.rows[0]
    });

  } catch (err) {
    console.error('Complete session error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to complete session.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// GET DOCTOR'S PATIENTS (from all non-cancelled appointments)
export const getDoctorPatients = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const patients = await pool.query(
      `SELECT 
        patient_id,
        MAX(patient_first_name) as patient_first_name,
        MAX(patient_last_name) as patient_last_name,
        MAX(patient_email) as patient_email,
        MAX(patient_phone) as patient_phone,
        MAX(patient_date_of_birth) as patient_date_of_birth,
        MAX(appointment_date) FILTER (WHERE status = 'completed') as last_visit,
        COUNT(*) FILTER (WHERE status = 'completed') as total_sessions,
        COUNT(*) FILTER (WHERE status IN ('confirmed','scheduled') AND appointment_date >= CURRENT_DATE) as upcoming_count
      FROM appointments 
      WHERE doctor_id = $1 AND status NOT IN ('cancelled', 'no_show')
      GROUP BY patient_id
      ORDER BY MAX(appointment_date) DESC`,
      [doctorId]
    );

    res.json({
      success: true,
      patients: patients.rows
    });

  } catch (err) {
    console.error('Get doctor patients error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patients.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// CHECK IF PATIENT IS RETURNING (has previous appointment with same doctor)
export const checkReturningPatient = async (req, res) => {
  try {
    const { patientId, doctorId } = req.params;

    const result = await pool.query(
      `SELECT id FROM appointments 
       WHERE patient_id = $1 AND doctor_id = $2 
       AND status NOT IN ('cancelled', 'no_show')
       LIMIT 1`,
      [patientId, doctorId]
    );

    res.json({
      success: true,
      isReturning: result.rows.length > 0
    });

  } catch (err) {
    console.error('Check returning patient error:', err);
    res.status(500).json({ success: false, message: "Failed to check patient history." });
  }
};


export const getPatientSessionHistory = async (req, res) => {
  try {
    const { patientId, doctorId } = req.params;

    // Completed sessions — newest first
    const sessions = await pool.query(
      `SELECT id, appointment_date, appointment_time, appointment_type,
        session_fee, duration_minutes, reason_for_visit,
        session_notes, status, created_at
      FROM appointments 
      WHERE patient_id = $1 AND doctor_id = $2 AND status = 'completed'
      ORDER BY appointment_date DESC, appointment_time DESC`,
      [patientId, doctorId]
    );

    // Upcoming appointments
    const upcoming = await pool.query(
      `SELECT id, appointment_date, appointment_time, appointment_type,
        session_fee, duration_minutes, reason_for_visit, status, created_at
      FROM appointments 
      WHERE patient_id = $1 AND doctor_id = $2 
        AND status IN ('confirmed', 'scheduled', 'pending')
        AND appointment_date >= CURRENT_DATE
      ORDER BY appointment_date ASC, appointment_time ASC`,
      [patientId, doctorId]
    );

    // Cancelled appointments — newest first
    const cancelled = await pool.query(
      `SELECT id, appointment_date, appointment_time, appointment_type,
        session_fee, duration_minutes, reason_for_visit, status, created_at
      FROM appointments 
      WHERE patient_id = $1 AND doctor_id = $2 AND status = 'cancelled'
      ORDER BY appointment_date DESC, appointment_time DESC`,
      [patientId, doctorId]
    );

    res.json({
      success: true,
      sessions: sessions.rows,
      upcoming: upcoming.rows,
      cancelled: cancelled.rows
    });

  } catch (err) {
    console.error('Get patient session history error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch session history.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

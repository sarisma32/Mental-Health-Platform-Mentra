import pool from "../db/index.js";
import { sendAppointmentBookedEmail, sendSessionCompletedEmail } from "../utils/emailService.js";

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

    // Check if the time slot is already booked
    const existingAppointment = await pool.query(
      "SELECT id FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status NOT IN ('cancelled', 'no_show')",
      [doctorId, appointmentDate, appointmentTime]
    );

    if (existingAppointment.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked. Please select a different time."
      });
    }

    // Generate confirmation number
    const confirmationNumber = generateConfirmationNumber();

    // Insert appointment into database with confirmed status
    const newAppointment = await pool.query(
      `INSERT INTO appointments (
        patient_id, doctor_id, appointment_date, appointment_time, appointment_type, 
        session_fee, duration_minutes, patient_first_name, patient_last_name, 
        patient_email, patient_phone, patient_date_of_birth, emergency_contact_name, 
        emergency_contact_phone, reason_for_visit, previous_therapy, current_medications, 
        special_requests, doctor_name, doctor_specialization, doctor_location, 
        doctor_address, doctor_phone, confirmation_number, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, 'confirmed'
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

    const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];
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

// GET DOCTOR'S PATIENTS (from completed appointments)
export const getDoctorPatients = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Get unique patients who have had appointments with this doctor
    const patients = await pool.query(
      `SELECT DISTINCT ON (patient_id)
        patient_id,
        patient_first_name,
        patient_last_name,
        patient_email,
        patient_phone,
        patient_date_of_birth,
        MAX(appointment_date) as last_visit,
        COUNT(*) OVER (PARTITION BY patient_id) as total_sessions
      FROM appointments 
      WHERE doctor_id = $1 AND status = 'completed'
      GROUP BY patient_id, patient_first_name, patient_last_name, 
               patient_email, patient_phone, patient_date_of_birth
      ORDER BY patient_id, MAX(appointment_date) DESC`,
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

// GET PATIENT SESSION HISTORY WITH NOTES
export const getPatientSessionHistory = async (req, res) => {
  try {
    const { patientId, doctorId } = req.params;

    const sessions = await pool.query(
      `SELECT 
        id,
        appointment_date,
        appointment_time,
        appointment_type,
        session_fee,
        duration_minutes,
        reason_for_visit,
        session_notes,
        status,
        created_at
      FROM appointments 
      WHERE patient_id = $1 AND doctor_id = $2 AND status = 'completed'
      ORDER BY appointment_date DESC, appointment_time DESC`,
      [patientId, doctorId]
    );

    res.json({
      success: true,
      sessions: sessions.rows
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

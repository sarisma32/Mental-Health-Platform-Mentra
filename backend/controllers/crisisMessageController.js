import pool from '../db/index.js';
import { createNotification } from './notificationController.js';

// Doctor sends a crisis message to a patient
export const sendCrisisMessage = async (req, res) => {
  try {
    const { doctorId, patientId, message, messageType = 'custom' } = req.body;
    if (!doctorId || !patientId || !message?.trim()) {
      return res.status(400).json({ success: false, message: 'doctorId, patientId and message are required' });
    }
    if (message.length > 300) {
      return res.status(400).json({ success: false, message: 'Message must be 300 characters or less' });
    }

    const status = messageType === 'resolved' ? 'resolved' : 'active';

    const result = await pool.query(
      `INSERT INTO crisis_messages (doctor_id, patient_id, message, message_type, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [doctorId, patientId, message.trim(), messageType, status]
    );

    // Get doctor name for notification
    const doctorRes = await pool.query('SELECT full_name FROM doctors WHERE id = $1', [doctorId]);
    const doctorName = doctorRes.rows[0]?.full_name || 'Your doctor';

    // Notify the patient
    await createNotification({
      recipientType: 'patient',
      recipientId: patientId,
      type: 'crisis_response',
      title: messageType === 'resolved' ? `Dr. ${doctorName} has resolved your alert` : `Message from Dr. ${doctorName}`,
      message: message.trim(),
    });

    res.json({ success: true, crisisMessage: result.rows[0] });
  } catch (err) {
    console.error('Send crisis message error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

// Get all crisis messages for a patient
export const getPatientCrisisMessages = async (req, res) => {
  try {
    const { patientId } = req.params;
    const result = await pool.query(
      `SELECT cm.*, d.full_name as doctor_name, d.specialization as doctor_specialization
       FROM crisis_messages cm
       JOIN doctors d ON d.id = cm.doctor_id
       WHERE cm.patient_id = $1
       ORDER BY cm.created_at DESC`,
      [patientId]
    );
    res.json({ success: true, messages: result.rows });
  } catch (err) {
    console.error('Get crisis messages error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

// Get crisis messages sent by a doctor for a specific patient
export const getDoctorCrisisMessages = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;
    const result = await pool.query(
      `SELECT cm.*, p.full_name as patient_name
       FROM crisis_messages cm
       JOIN patients p ON p.id = cm.patient_id
       WHERE cm.doctor_id = $1 AND cm.patient_id = $2
       ORDER BY cm.created_at DESC`,
      [doctorId, patientId]
    );
    res.json({ success: true, messages: result.rows });
  } catch (err) {
    console.error('Get doctor crisis messages error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

// Mark patient's crisis messages as read
export const markCrisisMessagesRead = async (req, res) => {
  try {
    const { patientId } = req.params;
    await pool.query(
      'UPDATE crisis_messages SET is_read = TRUE WHERE patient_id = $1',
      [patientId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
};

// Get patient's emergency contact from their most recent appointment
export const getPatientEmergencyContact = async (req, res) => {
  try {
    const { patientId } = req.params;
    const result = await pool.query(
      `SELECT emergency_contact_name, emergency_contact_phone
       FROM appointments
       WHERE patient_id = $1
         AND emergency_contact_name IS NOT NULL
         AND emergency_contact_name != ''
       ORDER BY created_at DESC
       LIMIT 1`,
      [patientId]
    );
    if (result.rows.length === 0) {
      return res.json({ success: true, emergencyContact: null });
    }
    res.json({
      success: true,
      emergencyContact: {
        name: result.rows[0].emergency_contact_name,
        phone: result.rows[0].emergency_contact_phone,
      },
    });
  } catch (err) {
    console.error('Get emergency contact error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch emergency contact' });
  }
};

// Get all crisis alerts for admin monitoring (privacy-safe — no patient names or conversation)
export const getAdminCrisisAlerts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         n.id,
         n.metadata->>'patientId' as patient_id,
         n.metadata->>'riskLevel' as risk_level,
         n.metadata->>'hasDoctorAssigned' as has_doctor_assigned,
         n.created_at,
         n.is_read,
         -- Check if doctor has responded (sent any crisis message to this patient)
         CASE WHEN cm.id IS NOT NULL THEN true ELSE false END as doctor_responded,
         cm.created_at as doctor_responded_at,
         -- Doctor name from the notification title (safe — doctor info is not private)
         n.message
       FROM notifications n
       LEFT JOIN LATERAL (
         SELECT cm2.id, cm2.created_at
         FROM crisis_messages cm2
         WHERE cm2.patient_id = (n.metadata->>'patientId')::int
         ORDER BY cm2.created_at ASC
         LIMIT 1
       ) cm ON true
       WHERE n.recipient_type = 'admin'
         AND n.type = 'crisis_alert'
       ORDER BY n.created_at DESC`,
      []
    );
    res.json({ success: true, alerts: result.rows });
  } catch (err) {
    console.error('Get admin crisis alerts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch crisis alerts' });
  }
};

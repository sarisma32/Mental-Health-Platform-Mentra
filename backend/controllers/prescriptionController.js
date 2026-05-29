import pool from '../db/index.js';
import { createNotification } from './notificationController.js';

// ── Doctor: Create/Update prescription ───────────────────────────────────────
export const savePrescription = async (req, res) => {
  const client = await pool.connect();
  try {
    
    const doctorId = req.user.id;
    const { appointmentId, medications, therapyAdvice, lifestyleAdvice, diagnosis, followUpDate } = req.body;

    if (!appointmentId || !medications?.length)
      return res.status(400).json({ success: false, message: 'Appointment ID and at least one medication are required.' });

    // Verify appointment belongs to this doctor and is completed
    const apt = await client.query(
      `SELECT * FROM appointments WHERE id = $1 AND doctor_id = $2`,
      [appointmentId, doctorId]
    );
    if (!apt.rows.length)
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    if (apt.rows[0].status !== 'completed')
      return res.status(400).json({ success: false, message: 'Prescription can only be added for completed sessions.' });

    const patientId = apt.rows[0].patient_id;

    // Check BEFORE transaction starts
    const existingCheck = await client.query(
      'SELECT id FROM prescriptions WHERE appointment_id = $1', [appointmentId]
    );
    const isUpdate = existingCheck.rows.length > 0;

    await client.query('BEGIN');

    // Upsert prescription
    const prescResult = await client.query(
      `INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, diagnosis, therapy_advice, lifestyle_advice, follow_up_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (appointment_id) DO UPDATE
         SET diagnosis = $4, therapy_advice = $5, lifestyle_advice = $6, follow_up_date = $7, updated_at = NOW()
       RETURNING id`,
      [appointmentId, doctorId, patientId, diagnosis || null, therapyAdvice || null, lifestyleAdvice || null, followUpDate || null]
    );
    const prescriptionId = prescResult.rows[0].id;

    // Replace medications
    await client.query('DELETE FROM prescription_medications WHERE prescription_id = $1', [prescriptionId]);
    for (const med of medications) {
      await client.query(
        `INSERT INTO prescription_medications (prescription_id, medicine_name, dosage, frequency, duration, instructions)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [prescriptionId, med.medicine_name, med.dosage, med.frequency, med.duration, med.instructions || null]
      );
    }

    await client.query('COMMIT');

    // Notify patient
    const doc = await pool.query('SELECT full_name FROM doctors WHERE id = $1', [doctorId]);
    createNotification({
      recipientType: 'patient', recipientId: patientId,
      type: 'prescription_added',
      title: isUpdate ? 'Prescription Updated' : 'New Prescription Available',
      message: `Dr. ${doc.rows[0]?.full_name} has ${isUpdate ? 'updated' : 'added'} a prescription for your session on ${new Date(apt.rows[0].appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`,
    });

    res.json({ success: true, message: 'Prescription saved successfully.', prescriptionId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Save prescription error:', err);
    res.status(500).json({ success: false, message: 'Failed to save prescription.' });
  } finally {
    client.release();
  }
};

// ── Doctor: Get prescription for an appointment ───────────────────────────────
export const getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const presc = await pool.query(
      `SELECT p.*, d.full_name as doctor_name FROM prescriptions p
       JOIN doctors d ON d.id = p.doctor_id
       WHERE p.appointment_id = $1`,
      [appointmentId]
    );
    if (!presc.rows.length)
      return res.json({ success: true, prescription: null });

    const meds = await pool.query(
      'SELECT * FROM prescription_medications WHERE prescription_id = $1 ORDER BY id',
      [presc.rows[0].id]
    );
    res.json({ success: true, prescription: { ...presc.rows[0], medications: meds.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch prescription.' });
  }
};

// ── Patient: Get all prescriptions ───────────────────────────────────────────
export const getPatientPrescriptions = async (req, res) => {
  try {
    const patientId = req.user.id;
    const prescs = await pool.query(
      `SELECT p.*, d.full_name as doctor_name, d.specialization, d.profile_photo as doctor_photo,
              a.appointment_date, a.appointment_time
       FROM prescriptions p
       JOIN doctors d ON d.id = p.doctor_id
       JOIN appointments a ON a.id = p.appointment_id
       WHERE p.patient_id = $1
       ORDER BY p.created_at DESC`,
      [patientId]
    );

    const result = await Promise.all(prescs.rows.map(async (presc) => {
      const meds = await pool.query(
        'SELECT * FROM prescription_medications WHERE prescription_id = $1 ORDER BY id',
        [presc.id]
      );
      return { ...presc, medications: meds.rows };
    }));

    res.json({ success: true, prescriptions: result });
  } catch (err) {
    console.error('Get patient prescriptions error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch prescriptions.' });
  }
};

// ── Doctor: Get all prescriptions they've written ────────────────────────────
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const prescs = await pool.query(
      `SELECT p.*, pat.full_name as patient_name, pat.profile_photo as patient_photo,
              a.appointment_date
       FROM prescriptions p
       JOIN patients pat ON pat.id = p.patient_id
       JOIN appointments a ON a.id = p.appointment_id
       WHERE p.doctor_id = $1
       ORDER BY p.created_at DESC`,
      [doctorId]
    );

    const result = await Promise.all(prescs.rows.map(async (presc) => {
      const meds = await pool.query(
        'SELECT * FROM prescription_medications WHERE prescription_id = $1 ORDER BY id',
        [presc.id]
      );
      return { ...presc, medications: meds.rows };
    }));

    res.json({ success: true, prescriptions: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch prescriptions.' });
  }
};

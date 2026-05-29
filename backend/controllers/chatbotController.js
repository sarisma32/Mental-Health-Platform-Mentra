import { analyzeMessage } from '../utils/groqService.js';
import pool from '../db/index.js';
import { createNotification } from './notificationController.js';

const checkApiKey = (res) => {
  if (!process.env.GROQ_API_KEY) {
    res.status(503).json({ success: false, message: 'AI service is not configured.' });
    return false;
  }
  return true;
};

// ── Specialization extractor for DB query ─────────────────────────────────────

const SPECIALIZATION_MAP = {
  'depression': 'Clinical Psychology',
  'anxiety': 'Clinical Psychology',
  'trauma': 'Trauma Therapy',
  'ptsd': 'Trauma Therapy',
  'stress': 'Counseling Psychology',
  'relationship': 'Marriage & Family Therapy',
  'marriage': 'Marriage & Family Therapy',
  'family': 'Marriage & Family Therapy',
  'addiction': 'Addiction Counseling',
  'alcohol': 'Addiction Counseling',
  'drug': 'Addiction Counseling',
  'child': 'Child Psychology',
  'ocd': 'Cognitive Behavioral Therapy',
  'phobia': 'Cognitive Behavioral Therapy',
  'panic': 'Cognitive Behavioral Therapy',
  'bipolar': 'Psychiatry',
  'schizophrenia': 'Psychiatry',
  'adhd': 'Psychiatry',
  'grief': 'Counseling Psychology',
  'sleep': 'Clinical Psychology',
  'mood': 'Clinical Psychology',
};

const extractSpecialization = (message) => {
  const lower = message.toLowerCase();
  for (const [kw, spec] of Object.entries(SPECIALIZATION_MAP)) {
    if (lower.includes(kw)) return spec;
  }
  return null;
};

const extractDate = (message) => {
  const lower = message.toLowerCase();
  const today = new Date();
  if (lower.includes('today')) return today.toISOString().split('T')[0];
  if (lower.includes('tomorrow')) {
    const d = new Date(today); d.setDate(today.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  for (let i = 0; i < days.length; i++) {
    if (lower.includes(days[i])) {
      const d = new Date(today);
      const diff = (i - today.getDay() + 7) % 7 || 7;
      d.setDate(today.getDate() + diff);
      return d.toISOString().split('T')[0];
    }
  }
  return null;
};

const getAvailableDoctors = async (specialization, date) => {
  let query = `
    SELECT DISTINCT d.id, d.full_name, d.specialization, d.hospital_name,
      d.experience, d.location, d.initial_session_fee, d.followup_session_fee,
      array_agg(DISTINCT ds.schedule_date::text) as available_dates
    FROM doctors d
    JOIN doctor_schedules ds ON ds.doctor_id = d.id
    WHERE d.approval_status = 'approved'
      AND ds.is_available = TRUE
      AND ds.schedule_date >= CURRENT_DATE
  `;
  const params = [];
  if (specialization) {
    params.push(`%${specialization}%`);
    query += ` AND d.specialization ILIKE $${params.length}`;
  }
  if (date) {
    params.push(date);
    query += ` AND ds.schedule_date = $${params.length}`;
  }
  query += ` GROUP BY d.id, d.full_name, d.specialization, d.hospital_name, d.experience, d.location, d.initial_session_fee, d.followup_session_fee ORDER BY d.full_name LIMIT 5`;
  const result = await pool.query(query, params);
  return result.rows;
};

// ── Unified chat endpoint ─────────────────────────────────────────────────────

export const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });
    if (!checkApiKey(res)) return;

    // Let the AI analyze everything
    const ai = await analyzeMessage(message, history);
    const { intent, emotion, risk_level, response, action } = ai;

    // For doctor_availability or doctor_recommendation → also fetch real DB doctors
    let doctors = [];
    if (intent === 'doctor_availability' || intent === 'doctor_recommendation') {
      const specialization = extractSpecialization(message);
      const date = extractDate(message);
      doctors = await getAvailableDoctors(specialization, date);
    }

    return res.json({
      success: true,
      intent,
      emotion,
      risk_level,
      reply: response,
      action,
      doctors,
    });

  } catch (err) {
    console.error('Chatbot error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to get AI response. Please try again.' });
  }
};

// Legacy endpoints (kept for backward compatibility)
export const recommendDoctor = async (req, res) => {
  req.body.message = req.body.message || '';
  return chat(req, res);
};

export const copingStrategies = async (req, res) => {
  req.body.message = req.body.message || '';
  return chat(req, res);
};

// ── Crisis escalation — patient-initiated, sends notification to their doctor ──

export const escalateCrisis = async (req, res) => {
  try {
    const { patientId, recentMessages, riskLevel, emotionTrend } = req.body;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required.' });
    }

    // Get patient info
    const patientResult = await pool.query(
      'SELECT id, full_name, phone_number FROM patients WHERE id = $1',
      [patientId]
    );
    if (!patientResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }
    const patient = patientResult.rows[0];

    // Find the patient's most recent doctor (from appointments) + emergency contact
    const doctorResult = await pool.query(
      `SELECT a.doctor_id, d.full_name as doctor_name,
              a.emergency_contact_name, a.emergency_contact_phone
       FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       WHERE a.patient_id = $1
         AND d.approval_status = 'approved'
         AND d.status = 'active'
         AND a.emergency_contact_name IS NOT NULL
       ORDER BY a.created_at DESC
       LIMIT 1`,
      [patientId]
    );

    // Generate a clinical AI summary for the doctor
    let aiSummary = 'Patient reached out via chatbot expressing emotional distress.';
    if (recentMessages?.length > 0 && process.env.GROQ_API_KEY) {
      try {
        const summaryPrompt = `You are a clinical assistant summarizing a mental health chatbot conversation for a doctor. Write a professional clinical summary in 2-3 sentences using third person perspective. Focus on the patient's emotional state, key concerns, and risk indicators. Format it as: "The patient is experiencing [condition/feelings]. I have suggested [interventions/steps]. Please follow up with this patient soon." Be clinical and concise. Do NOT include any personally identifying information.\n\nConversation:\n${recentMessages.map(m => `${m.from === 'user' ? 'Patient' : 'Bot'}: ${m.text}`).join('\n')}`;
        const summaryResult = await analyzeMessage(summaryPrompt, []);
        if (summaryResult?.response) aiSummary = summaryResult.response;
      } catch {
        // fallback to default summary
      }
    }

    const notificationTitle = `🚨 High-Risk Alert: ${patient.full_name} needs support`;
    const notificationMessage = `Your patient ${patient.full_name} has requested support through the Mentra chatbot.\n\nRisk Level: ${riskLevel || 'High'}\nEmotional Trend: ${emotionTrend || 'Distressed'}\n\nSummary: ${aiSummary}\n\nThe patient has chosen to reach out to you. Please follow up as soon as possible.`;

    if (doctorResult.rows.length > 0) {
      const doctor = doctorResult.rows[0];
      const emergencyContact = {
        name: doctor.emergency_contact_name || null,
        phone: doctor.emergency_contact_phone || null,
      };
      await createNotification({
        recipientType: 'doctor',
        recipientId: doctor.doctor_id,
        type: 'crisis_alert',
        title: notificationTitle,
        message: notificationMessage,
        metadata: { patientId: patient.id, patientName: patient.full_name, emergencyContact },
      });
    } else {
      // Try to get emergency contact even without active doctor
      const ecResult = await pool.query(
        `SELECT emergency_contact_name, emergency_contact_phone
         FROM appointments WHERE patient_id = $1
         AND emergency_contact_name IS NOT NULL
         ORDER BY created_at DESC LIMIT 1`,
        [patientId]
      );
      const emergencyContact = ecResult.rows.length > 0 ? {
        name: ecResult.rows[0].emergency_contact_name,
        phone: ecResult.rows[0].emergency_contact_phone,
      } : null;
      await createNotification({
        recipientType: 'admin',
        recipientId: null,
        type: 'crisis_alert',
        title: `🚨 Crisis Alert — Patient #${patient.id} (No Doctor Assigned)`,
        message: `Patient ID: #${patient.id} | Assigned Doctor: None | Doctor Responded: N/A`,
        metadata: { patientId: patient.id, riskLevel: riskLevel || 'high', hasDoctorAssigned: false },
      });
    }

    await createNotification({
      recipientType: 'admin',
      recipientId: null,
      type: 'crisis_alert',
      title: `🚨 Crisis Alert — Patient #${patient.id}`,
      message: `Patient ID: #${patient.id} | Assigned Doctor: ${doctorResult.rows.length > 0 ? `Dr. ${doctorResult.rows[0].doctor_name}` : 'None'} | Doctor Responded: Pending`,
      metadata: { patientId: patient.id, riskLevel: riskLevel || 'high', hasDoctorAssigned: doctorResult.rows.length > 0 },
    });

    res.json({
      success: true,
      message: 'Your doctor has been notified. You are not alone.',
      hasDoctorAssigned: doctorResult.rows.length > 0,
      doctorName: doctorResult.rows[0]?.doctor_name || null,
    });

  } catch (err) {
    console.error('Crisis escalation error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send notification. Please call the helpline directly.' });
  }
};

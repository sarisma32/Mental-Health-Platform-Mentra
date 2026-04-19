import { analyzeMessage } from '../utils/geminiService.js';
import pool from '../db/index.js';

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

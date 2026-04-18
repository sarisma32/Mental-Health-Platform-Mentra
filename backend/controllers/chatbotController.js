import { getDoctorRecommendation, getCopingStrategies, getDoctorAvailabilityResponse, getCrisisResponse } from '../utils/geminiService.js';
import pool from '../db/index.js';

const checkApiKey = (res) => {
  if (!process.env.GROQ_API_KEY) {
    res.status(503).json({ success: false, message: 'AI service is not configured.' });
    return false;
  }
  return true;
};

// ── Crisis detection — checked FIRST before any other intent ─────────────────

const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'take my life',
  'want to die', 'better off dead', 'no reason to live', 'don\'t want to live',
  'dont want to live', 'wish i was dead', 'wish i were dead',
  'self harm', 'self-harm', 'cutting myself', 'hurt myself', 'hurting myself',
  'overdose', 'hang myself', 'jump off', 'slit my wrist',
  'can\'t go on', 'cant go on', 'can\'t take it anymore', 'cant take it anymore',
  'no point living', 'nothing to live for', 'give up on life',
  'end it all', 'end everything', 'disappear forever',
];

const isCrisis = (message) => {
  const lower = message.toLowerCase();
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw));
};

const AVAILABILITY_KEYWORDS = [
  'available', 'availability', 'schedule', 'when', 'date', 'time slot',
  'book', 'appointment', 'free', 'open', 'slot', 'see a doctor', 'visit',
  'consult', 'meet', 'session', 'today', 'tomorrow', 'this week', 'next week',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
];

const COPING_KEYWORDS = [
  'cope', 'coping', 'strategy', 'strategies', 'help me', 'what can i do',
  'how to deal', 'how to handle', 'manage', 'relief', 'relieve', 'calm',
  'exercise', 'technique', 'practice', 'home remedy', 'self help', 'tips',
  'advice', 'suggestion', 'what should i do', 'i feel', 'i am feeling',
  'i have been', 'struggling with', 'dealing with', 'suffering from',
];

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
  'kids': 'Child Psychology',
  'ocd': 'Cognitive Behavioral Therapy',
  'phobia': 'Cognitive Behavioral Therapy',
  'panic': 'Cognitive Behavioral Therapy',
  'bipolar': 'Psychiatry',
  'schizophrenia': 'Psychiatry',
  'adhd': 'Psychiatry',
  'medication': 'Psychiatry',
  'grief': 'Counseling Psychology',
  'sleep': 'Clinical Psychology',
  'mood': 'Clinical Psychology',
};

const detectIntent = (message) => {
  const lower = message.toLowerCase();
  const hasAvailability = AVAILABILITY_KEYWORDS.some(kw => lower.includes(kw));
  const hasCoping = COPING_KEYWORDS.some(kw => lower.includes(kw));

  // If asking about availability/booking with a specialization or condition
  if (hasAvailability) return 'availability';
  // If asking for coping help
  if (hasCoping) return 'coping';
  // Default: symptom-based doctor recommendation
  return 'recommendation';
};

const extractSpecialization = (message) => {
  const lower = message.toLowerCase();
  for (const [keyword, spec] of Object.entries(SPECIALIZATION_MAP)) {
    if (lower.includes(keyword)) return spec;
  }
  return null;
};

const extractDate = (message) => {
  const lower = message.toLowerCase();
  const today = new Date();

  if (lower.includes('today')) return today.toISOString().split('T')[0];
  if (lower.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  for (let i = 0; i < days.length; i++) {
    if (lower.includes(days[i])) {
      const target = new Date(today);
      const diff = (i - today.getDay() + 7) % 7 || 7;
      target.setDate(today.getDate() + diff);
      return target.toISOString().split('T')[0];
    }
  }

  // Try to find a date pattern like "April 20" or "20 April"
  const dateMatch = message.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (dateMatch) {
    const year = dateMatch[3] ? parseInt(dateMatch[3]) : today.getFullYear();
    const month = String(dateMatch[1]).padStart(2, '0');
    const day = String(dateMatch[2]).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
};

// ── Query DB for available doctors ────────────────────────────────────────────

const getAvailableDoctors = async (specialization, date) => {
  let query = `
    SELECT DISTINCT d.id, d.full_name, d.specialization, d.hospital_name, d.experience,
      d.location, d.initial_session_fee, d.followup_session_fee,
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

  query += ` GROUP BY d.id, d.full_name, d.specialization, d.hospital_name, d.experience, d.location, d.initial_session_fee, d.followup_session_fee`;
  query += ` ORDER BY d.full_name LIMIT 5`;

  const result = await pool.query(query, params);
  return result.rows;
};

// ── Controllers ───────────────────────────────────────────────────────────────

// Unified chat endpoint
export const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });
    if (!checkApiKey(res)) return;

    // ── Crisis check — always first ───────────────────────────────────────
    if (isCrisis(message)) {
      const reply = await getCrisisResponse(message, history);
      return res.json({ success: true, reply, intent: 'crisis' });
    }

    const intent = detectIntent(message);

    if (intent === 'availability') {
      const specialization = extractSpecialization(message);
      const date = extractDate(message);
      const doctors = await getAvailableDoctors(specialization, date);
      const reply = await getDoctorAvailabilityResponse(message, doctors, history);
      return res.json({ success: true, reply, intent: 'availability', doctors });
    }

    if (intent === 'coping') {
      const reply = await getCopingStrategies(message, history);
      return res.json({ success: true, reply, intent: 'coping' });
    }

    // Default: symptom recommendation
    const reply = await getDoctorRecommendation(message, history);
    res.json({ success: true, reply, intent: 'recommendation' });

  } catch (err) {
    console.error('Chatbot error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to get AI response. Please try again.' });
  }
};

// Keep old endpoints for backward compatibility
export const recommendDoctor = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });
    if (!checkApiKey(res)) return;
    const reply = await getDoctorRecommendation(message, history);
    res.json({ success: true, reply });
  } catch (err) {
    console.error('Chatbot controller error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to get AI response. Please try again.' });
  }
};

export const copingStrategies = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });
    if (!checkApiKey(res)) return;
    const reply = await getCopingStrategies(message, history);
    res.json({ success: true, reply });
  } catch (err) {
    console.error('Coping strategies error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to get AI response. Please try again.' });
  }
};

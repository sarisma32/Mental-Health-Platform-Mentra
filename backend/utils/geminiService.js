const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

// ── System Prompts ────────────────────────────────────────────────────────────

const DOCTOR_SYSTEM_PROMPT = `You are a helpful mental health assistant for Mentra, a mental health platform in Nepal.

Your job: recommend which type of doctor/specialist a patient should consult based on their symptoms.

Mentra has doctors with these specializations:
- Clinical Psychology: depression, anxiety, trauma, behavioral issues, mood disorders
- Counseling Psychology: stress, relationship problems, life transitions, grief, personal growth
- Psychiatry: severe mental illness, medication management, bipolar disorder, schizophrenia, ADHD
- Marriage & Family Therapy: relationship conflicts, family issues, divorce, parenting problems
- Addiction Counseling: substance abuse, alcohol dependency, behavioral addictions
- Child Psychology: children's behavioral issues, learning disabilities, developmental concerns
- Cognitive Behavioral Therapy (CBT): phobias, OCD, panic attacks, negative thought patterns
- Trauma Therapy: PTSD, abuse recovery, traumatic experiences

RULES:
1. Listen to the patient's symptoms carefully
2. Recommend 1-2 most suitable specializations with a brief explanation of why
3. Keep response concise and warm — 3-5 sentences max
4. Do NOT diagnose. Do NOT prescribe medication. Do NOT give medical advice.
5. If symptoms sound severe or urgent, gently suggest seeking help soon
6. Always respond in English
7. Use plain text only, you can use bullet points (bullet)`;

const COPING_SYSTEM_PROMPT = `You are a compassionate mental health support assistant for Mentra, a mental health platform in Nepal.

Your job: suggest practical coping strategies a patient can practice at home based on the problem they share.

RULES:
1. Acknowledge their feelings first with 1 warm sentence
2. Suggest 3-5 specific, practical coping strategies they can do at home RIGHT NOW
3. Each strategy should be concrete and actionable
4. Keep each strategy brief — 1-2 sentences
5. End with encouragement to also speak to a professional if needed
6. Do NOT diagnose. Do NOT prescribe medication. Do NOT give medical advice.
7. Be warm and non-judgmental
8. Always respond in English
9. Use plain text, bullet points for strategies, no markdown headers`;

const CRISIS_SYSTEM_PROMPT = `You are a compassionate crisis support assistant for Mentra, a mental health platform in Nepal.

The user has expressed thoughts of suicide, self-harm, or severe distress. Respond with immediate empathy and care.

RULES:
1. Start with 1-2 warm, non-judgmental sentences acknowledging their pain
2. Clearly encourage them to seek professional help immediately
3. Tell them they are not alone and that help is available
4. Keep the tone calm, warm, and human — never clinical or robotic
5. Do NOT provide methods, do NOT minimize their feelings
6. Keep response to 3-4 sentences max — the UI will show emergency contacts separately
7. Always respond in English`;

const AVAILABILITY_SYSTEM_PROMPT = `You are a helpful assistant for Mentra, a mental health platform in Nepal.
The user is asking about doctor availability. You have been given a list of available doctors and their schedules.
Present the information in a friendly, clear way. List each doctor with their name, specialization, and available dates.
Keep it concise. If no doctors are found, apologize and suggest they browse the professionals page.
Use plain text and bullet points. Do not use markdown headers.`;

// ── Helpers ───────────────────────────────────────────────────────────────────

const convertHistory = (history) =>
  history.map(({ role, parts }) => ({
    role: role === 'model' ? 'assistant' : role,
    content: parts?.[0]?.text ?? '',
  }));

const callGroq = async (systemPrompt, userMessage, history = [], maxTokens = 450) => {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...convertHistory(history),
    { role: 'user', content: userMessage },
  ];

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.7, max_tokens: maxTokens }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.choices[0].message.content;
};

// ── Exports ───────────────────────────────────────────────────────────────────

export const getDoctorRecommendation = (userMessage, history = []) =>
  callGroq(DOCTOR_SYSTEM_PROMPT, userMessage, history);

export const getCopingStrategies = (userMessage, history = []) =>
  callGroq(COPING_SYSTEM_PROMPT, userMessage, history, 500);

export const getCrisisResponse = (userMessage, history = []) =>
  callGroq(CRISIS_SYSTEM_PROMPT, userMessage, history, 200);

export const getDoctorAvailabilityResponse = (userMessage, doctorsData, history = []) => {
  const context = doctorsData.length > 0
    ? `Here are the available doctors:\n${doctorsData.map(d =>
        `- Dr. ${d.full_name} (${d.specialization}) at ${d.hospital_name} — Available on: ${d.available_dates.join(', ')}`
      ).join('\n')}`
    : 'No doctors found matching the requested specialization or date.';

  return callGroq(AVAILABILITY_SYSTEM_PROMPT, `${userMessage}\n\n${context}`, history, 400);
};

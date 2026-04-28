import dotenv from 'dotenv';
dotenv.config();

const BASE = `http://localhost:${process.env.PORT || 5002}`;

const test = async (label, body) => {
  console.log(`\n--- ${label} ---`);
  try {
    const res = await fetch(`${BASE}/api/chatbot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    console.log('Intent:', data.intent);
    console.log('Reply:', data.reply?.slice(0, 200));
    if (data.doctors) console.log('Doctors found:', data.doctors.length, data.doctors.map(d => d.full_name));
    if (!data.success) console.log('ERROR:', data.message);
  } catch (e) {
    console.error('FETCH ERROR:', e.message);
  }
};

await test('Coping - sleep problem', { message: 'i have sleep problems, what can i do at home?' });
await test('Availability - this week', { message: 'which doctors are available this week?' });
await test('Availability - anxiety doctor', { message: 'i have anxiety, are there any doctors available tomorrow?' });
await test('Recommendation - depression', { message: 'i feel depressed and hopeless' });

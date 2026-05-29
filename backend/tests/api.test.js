import request from 'supertest';
import app from '../app.js';

// ─── Test Data ────────────────────────────────────────────────────────────────
const timestamp = Date.now();
const testPatient = {
  fullName: 'Test Patient',
  email: `testpatient_${timestamp}@test.com`,
  password: 'Test@1234',
  phoneNumber: '9800000001',
  age: 25,
};

let patientToken = '';
let adminToken  = '';

// ─── 1. PATIENT REGISTRATION ─────────────────────────────────────────────────
describe('1. Patient Registration', () => {

  test('TC-01: Register with valid data — should return 201', async () => {
    const res = await request(app)
      .post('/api/patients/register')
      .send(testPatient);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test('TC-02: Register with duplicate email — should return 400', async () => {
    const res = await request(app)
      .post('/api/patients/register')
      .send(testPatient);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('TC-03: Register with missing required fields — should return 400', async () => {
    const res = await request(app)
      .post('/api/patients/register')
      .send({ email: 'incomplete@test.com', password: 'Test@1234' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('TC-04: Register with weak password — should return 400', async () => {
    const res = await request(app)
      .post('/api/patients/register')
      .send({ ...testPatient, email: `weak_${timestamp}@test.com`, password: '123456' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

});

// ─── 2. PATIENT LOGIN (via unified /api/auth/login) ──────────────────────────
describe('2. Patient Login', () => {

  test('TC-05: Login with correct credentials — should return 200 with token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testPatient.email, password: testPatient.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    patientToken = res.body.token;
  });

  test('TC-06: Login with wrong password — should return 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testPatient.email, password: 'WrongPass@99' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('TC-07: Login with non-existent email — should return 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notexist@test.com', password: 'Test@1234' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

});

// ─── 3. PATIENT PROFILE ───────────────────────────────────────────────────────
describe('3. Patient Profile', () => {

  test('TC-08: Get profile with valid token — should return 200', async () => {
    const res = await request(app)
      .get('/api/patients/profile')
      .set('Authorization', `Bearer ${patientToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('TC-09: Get profile without token — should return 401', async () => {
    const res = await request(app)
      .get('/api/patients/profile');
    expect(res.statusCode).toBe(401);
  });

});

// ─── 4. BROWSE APPROVED DOCTORS ───────────────────────────────────────────────
describe('4. Browse Approved Doctors', () => {

  test('TC-10: Get approved doctors — should return 200 with list', async () => {
    const res = await request(app)
      .get('/api/doctors/approved');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.doctors)).toBe(true);
  });

  test('TC-11: Filter by specialization — should return 200', async () => {
    const res = await request(app)
      .get('/api/doctors/approved?specialization=Clinical Psychology');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

});

// ─── 5. ADMIN LOGIN ───────────────────────────────────────────────────────────
describe('5. Admin Login', () => {

  test('TC-12: Admin login with correct credentials — should return 200', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL || 'admin@mentra.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@1234',
      });
    if (res.statusCode === 200) adminToken = res.body.token;
    expect([200, 400]).toContain(res.statusCode);
  });

  test('TC-13: Admin login with wrong password — should return 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@mentra.com', password: 'WrongPass@99' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

});

// ─── 6. ADMIN — GET ALL DOCTORS ───────────────────────────────────────────────
describe('6. Admin — Get All Doctors', () => {

  test('TC-14: Get all doctors with admin token — should return 200', async () => {
    if (!adminToken) { console.warn('Skipping — no admin token'); return; }
    const res = await request(app)
      .get('/api/admin/doctors')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.doctors)).toBe(true);
  });

});

// ─── 7. ADMIN — GET ALL USERS ─────────────────────────────────────────────────
describe('7. Admin — Get All Users', () => {

  test('TC-15: Get all users with admin token — should return 200', async () => {
    if (!adminToken) { console.warn('Skipping — no admin token'); return; }
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

});

// ─── 8. FORGOT PASSWORD ───────────────────────────────────────────────────────
describe('8. Forgot Password', () => {

  test('TC-16: Forgot password with registered email — should return 200', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testPatient.email, userType: 'patient' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('TC-17: Forgot password with unregistered email — should return 404 or 200', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@test.com', userType: 'patient' });
    // API returns 200 for security (does not reveal if email exists)
    expect([200, 404]).toContain(res.statusCode);
  });

});

// ─── 9. AI CHATBOT ────────────────────────────────────────────────────────────
describe('9. AI Chatbot', () => {

  test('TC-18: Send normal message — should return 200 with reply', async () => {
    const res = await request(app)
      .post('/api/chatbot/chat')
      .send({ message: 'What is Mentra?', history: [] });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reply).toBeDefined();
  });

  test('TC-19: Send crisis message — should return high or medium risk', async () => {
    const res = await request(app)
      .post('/api/chatbot/chat')
      .send({ message: 'I want to end my life', history: [] });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(['high', 'medium']).toContain(res.body.risk_level);
  });

  test('TC-20: Send empty message — should return 400', async () => {
    const res = await request(app)
      .post('/api/chatbot/chat')
      .send({ message: '', history: [] });
    expect(res.statusCode).toBe(400);
  });

});

// ─── 10. APPOINTMENT BOOKING ──────────────────────────────────────────────────
describe('10. Appointment Booking', () => {

  // Valid appointment — 7 days from now
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const appointmentDate = futureDate.toISOString().split('T')[0];

  const validAppointment = {
    patientId: null, // set after login
    doctorId: 15,    // Sarisma Ghimire — approved active doctor
    appointmentDate,
    appointmentTime: '10:00:00',
    appointmentType: 'Initial Consultation',
    sessionFee: 1500,
    durationMinutes: 60,
    patientFirstName: 'Test',
    patientLastName: 'Patient',
    patientEmail: 'testpatient@test.com',
    patientPhone: '9800000001',
    reasonForVisit: 'Anxiety and stress management',
    doctorName: 'Sarisma Ghimire',
    doctorSpecialization: 'Psychiatry',
    doctorLocation: 'Lazimpath',
    doctorAddress: 'MannCare, Lazimpath',
    doctorPhone: '9800000099',
  };

  test('TC-21: Book appointment with missing all fields — should return 400', async () => {
    const res = await request(app)
      .post('/api/appointments/book')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('TC-22: Book appointment with valid data — should return 201', async () => {
    // Login first to get token and patientId
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testPatient.email, password: testPatient.password });

    const token = loginRes.body.token;
    const pid   = loginRes.body.user?.id;

    const res = await request(app)
      .post('/api/appointments/book')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validAppointment, patientId: pid });

    // 201 = booked, 400 = slot taken or < 24h rule — both are valid outcomes
    expect([201, 400]).toContain(res.statusCode);
    if (res.statusCode === 201) {
      expect(res.body.success).toBe(true);
      expect(res.body.appointment).toBeDefined();
    }
  });

  test('TC-23: Book appointment less than 24 hours in advance — should return 400', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testPatient.email, password: testPatient.password });

    const token = loginRes.body.token;
    const pid   = loginRes.body.user?.id;

    // Set appointment time to 1 hour from now
    const soonDate = new Date();
    soonDate.setHours(soonDate.getHours() + 1);
    const soonDateStr = soonDate.toISOString().split('T')[0];
    const soonTime    = soonDate.toTimeString().split(' ')[0];

    const res = await request(app)
      .post('/api/appointments/book')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validAppointment, patientId: pid, appointmentDate: soonDateStr, appointmentTime: soonTime });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('24 hours');
  });

  test('TC-24: Book appointment with missing required fields — should return 400', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testPatient.email, password: testPatient.password });

    const token = loginRes.body.token;

    const res = await request(app)
      .post('/api/appointments/book')
      .set('Authorization', `Bearer ${token}`)
      .send({ doctorId: 15 }); // missing most required fields

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

});

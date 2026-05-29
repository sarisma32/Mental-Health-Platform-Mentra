/**
 * Chatbot Knowledge Base
 * Contains all questions, keywords, and responses for the Mentra chatbot.
 */

export const BOT_NAME = 'Mentra Assistant';

export const WELCOME_MESSAGE = `Hi!  I'm the **Mentra Assistant**. I can help you with:

• What is Mentra?
• How to sign up
• How to book an appointment
• How to find a doctor
• How to view your appointments

What would you like to know?`;

export const QUICK_REPLIES = [
  { label: ' What is Mentra?', value: 'what is mentra' },
  { label: ' How to sign up', value: 'how to sign up' },
  { label: ' How to book appointment', value: 'how to book appointment' },
  { label: ' How to find a doctor', value: 'how to find a doctor' },
  { label: ' View my appointments', value: 'view my appointments' },
];

/**
 * Each entry has:
 * - keywords: array of words/phrases to match against user input
 * - response: the chatbot reply (supports **bold** and bullet points with •)
 */
export const RESPONSES = [
  // ── What is Mentra ──────────────────────────────────────────────────────────
  {
    keywords: ['what is mentra', 'about mentra', 'mentra system', 'what does mentra do', 'tell me about', 'overview', 'purpose', 'platform'],
    response: `**Mentra** is a mental health platform that connects patients with licensed mental health professionals. 

Here's what you can do on Mentra:

• **Find Therapists** — Browse verified mental health professionals by specialization and location
• **Book Appointments** — Schedule sessions with doctors online
• **View Session Notes** — Access notes from your completed sessions
• **Leave Reviews** — Share your experience with doctors
• **AI Chatbot Support** — Get instant guidance (that's me! )

Mentra's goal is to make mental health care accessible and easy to navigate.

Is there anything specific you'd like to know more about?`
  },

  // ── Sign Up ─────────────────────────────────────────────────────────────────
  {
    keywords: ['sign up', 'signup', 'register', 'create account', 'how to join', 'new account', 'registration'],
    response: `Here's how to **sign up** on Mentra: 

**Step 1 — Go to Sign Up**
Click the button below or the "Sign up" button in the top navigation bar.

**Step 2 — Choose your role**
Select **"Patient"** (to book appointments) or **"Professional"** (if you're a doctor).

**Step 3 — Verify your email**
Enter your email address and click **"Verify"**. A 6-digit code will be sent to your email. Enter the code to confirm.

**Step 4 — Fill in your details**
• Full name (first and last name required)
• Phone number
• Age (must be 13 or older)
• Password (must have uppercase, lowercase, number, and special character)

**Step 5 — Agree to terms and submit**
Check the terms & privacy policy box and click **"Create Account"**.

You'll be logged in automatically after registration! 

[→ Sign Up as Patient](/register-user)
[→ Register as Professional](/register-professional)`,
  },

  // ── Book Appointment ────────────────────────────────────────────────────────
  {
    keywords: ['book appointment', 'booking', 'schedule appointment', 'how to book', 'make appointment', 'appointment booking', 'book a session', 'schedule session'],
    response: ({ isLoggedIn }) => `Here's how to **book an appointment** with a doctor: 

**Step 1 — Log in**
${isLoggedIn ? "You're already logged in. " : "Make sure you're logged in as a patient."}

**Step 2 — Find a Doctor**
Browse all available doctors by specialization or location.

**Step 3 — View Doctor Profile**
Click on a doctor's card to see their full profile — bio, credentials, session fees, and videos.

**Step 4 — Click "Book Appointment"**
On the doctor's profile page, click the **"Book Appointment"** button.

**Step 5 — Select Date & Time**
• Choose your preferred date (at least 24 hours in advance)
• Select an available time slot
• Choose session type: **Initial** or **Follow-up**

**Step 6 — Fill in Session Details**
Provide your date of birth, emergency contact, reason for visit, and any relevant medical information.

**Step 7 — Review & Confirm**
Review all details and confirm your booking. You'll receive a confirmation email! 

[→ Browse Doctors](/professionals)${isLoggedIn ? '' : '\n[→ Login to Book](/login)'}`,
  },

  // ── Find a Doctor ───────────────────────────────────────────────────────────
  {
    keywords: ['find doctor', 'search doctor', 'browse doctor', 'find therapist', 'search therapist', 'professionals', 'how to find'],
    response: `Here's how to **find a doctor** on Mentra: 

**Step 1 — Go to Professionals**
Click the link below or "Professionals" in the navigation bar.

**Step 2 — Search & Filter**
• Type a doctor's **name** in the search bar
• Search by **specialization** (e.g. Clinical Psychology, Psychiatry)
• Search by **location**

**Step 3 — View Doctor Cards**
Each card shows the doctor's name, specialization, hospital, experience, and session fee.

**Step 4 — Click to View Full Profile**
Click any doctor card to see their complete profile including bio, credentials, educational videos, and patient reviews.

**Step 5 — Book with them**
Click **"Book Appointment"** directly from their profile.

[→ Browse All Doctors](/professionals)`,
  },

  // ── View Appointments ───────────────────────────────────────────────────────
  {
    keywords: ['view appointment', 'my appointment', 'see appointment', 'appointment history', 'upcoming appointment', 'past appointment', 'dashboard'],
    response: `Here's how to **view your appointments**: 

**Step 1 — Go to your Dashboard**
After logging in, click your profile icon or go to your dashboard.

**Step 2 — Click "Appointments"**
In the left sidebar, click **"Appointments"**.

**Step 3 — Use the tabs**
• **Upcoming** — confirmed appointments coming up
• **Past** — completed or cancelled appointments
• **All** — every appointment you've ever booked

**Step 4 — View Details**
Each appointment shows date, time, doctor, fee, confirmation number, and session notes (for completed sessions).

**Step 5 — Cancel if needed**
You can cancel up to **5 hours before** the scheduled time.

[→ Go to Dashboard](/dashboard)`,
  },

  // ── Session Notes ───────────────────────────────────────────────────────────
  {
    keywords: ['session notes', 'doctor notes', 'notes', 'after session', 'completed session'],
    response: `**Session notes** are written by your doctor after a completed session. 

Here's how to view them:

**Step 1** — Go to your Dashboard → Appointments
**Step 2** — Click the **"Past"** tab
**Step 3** — Find the completed appointment — you'll see a blue box with the doctor's notes

You'll also receive the session notes in your **email** automatically after the session is completed.

[→ View My Appointments](/dashboard)`,
  },

  // ── Reviews ─────────────────────────────────────────────────────────────────
  {
    keywords: ['review', 'leave review', 'rate doctor', 'feedback', 'rating'],
    response: `Here's how to **leave a review** for a doctor: 

**Step 1** — Go to Dashboard → Appointments → Past tab
**Step 2** — Find a completed appointment
**Step 3** — Click **"Leave a Review"** button
**Step 4** — Rate the doctor:
• Overall star rating (required)
• Professionalism, Communication, Wait Time (optional)
• Written review (optional)
**Step 5** — Click **"Submit Review"**

Your review will appear on the doctor's public profile after **admin approval**.

[→ Go to My Appointments](/dashboard)`,
  },

  // ── Forgot Password ─────────────────────────────────────────────────────────
  {
    keywords: ['forgot password', 'reset password', 'change password', 'lost password', "can't login", 'cannot login'],
    response: `Here's how to **reset your password**: 

**Step 1** — Go to the Login page
**Step 2** — Click **"Forgot password?"** below the password field
**Step 3** — Enter your registered email address
**Step 4** — Check your email for a **6-digit OTP code**
**Step 5** — Enter the OTP on the verification page
**Step 6** — Set your new password (8+ chars, uppercase, lowercase, number, special char)

[→ Go to Login](/login)
[→ Forgot Password](/forgot-password)`,
  },

  // ── Doctor Registration ─────────────────────────────────────────────────────
  {
    keywords: ['doctor register', 'professional register', 'join as doctor', 'register as doctor', 'doctor signup', 'become a doctor'],
    response: `Here's how to **register as a doctor/professional** on Mentra: 

**Step 1** — Click "Sign up" → Select **"Professional"**
**Step 2** — Verify your email with OTP
**Step 3** — Fill in your details:
• Full name, experience, phone number
• License/registration number
• Hospital/clinic name and location
• Specialization and password
**Step 4** — Upload your **license/certificate document** (PDF, PNG, or JPG)
**Step 5** — Submit your registration

Your profile will be **reviewed by admin within 24–72 hours**. You'll receive an email once approved.

[→ Register as Professional](/register-professional)`,
  },

  // ── Fees ────────────────────────────────────────────────────────────────────
  {
    keywords: ['fee', 'price', 'cost', 'how much', 'session fee', 'payment', 'charge'],
    response: `**Session fees** vary by doctor. 

• **Initial Session** — First-time consultation (60 minutes)
• **Follow-up Session** — Regular session (50 minutes)

Each doctor sets their own fees. You can see the fees on the doctor's card or full profile page. The system automatically selects the **follow-up fee** if you've previously booked with the same doctor.

[→ Browse Doctors & Fees](/professionals)`,
  },

  // ── Contact / Support ───────────────────────────────────────────────────────
  {
    keywords: ['contact', 'support', 'help', 'email support', 'customer service'],
    response: `For support, you can:

•  Email us at **support@mentra.com**
•  Use this chatbot for instant answers
•  Call us at **(555) 123-4567** (available 24/7)

Is there anything specific I can help you with right now?`,
  },

  // ── Greeting ────────────────────────────────────────────────────────────────
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'],
    response: `Hello!  Welcome to Mentra!

I'm here to help you navigate the platform. You can ask me about:

• What Mentra is
• How to sign up
• How to book an appointment
• How to find a doctor
• How to view your appointments

What would you like to know?`
  },

  // ── Thank you ───────────────────────────────────────────────────────────────
  {
    keywords: ['thank', 'thanks', 'thank you', 'helpful', 'great', 'awesome'],
    response: `You're welcome!  Happy to help!

If you have any more questions, feel free to ask. Is there anything else I can help you with?`
  },

  // ── Goodbye ─────────────────────────────────────────────────────────────────
  {
    keywords: ['bye', 'goodbye', 'see you', 'exit', 'close', 'done'],
    response: `Goodbye!  Take care and have a great day!

Remember, I'm always here if you need help navigating Mentra. `
  },
];

/**
 * Find the best matching response for a user message
 * @param {string} userMessage
 * @param {boolean} isLoggedIn - whether the user is currently logged in
 */
export const getBotResponse = (userMessage, isLoggedIn = false) => {
  const msg = userMessage.toLowerCase().trim();

  for (const item of RESPONSES) {
    for (const keyword of item.keywords) {
      if (msg.includes(keyword)) {
        // If the response is a function, call it with context
        if (typeof item.response === 'function') {
          return item.response({ isLoggedIn });
        }
        return item.response;
      }
    }
  }

  // Default fallback
  return `I'm not sure I understand that. 

Here are some things I can help you with:
• **What is Mentra?** — type "what is mentra"
• **Sign up** — type "how to sign up"
• **Book appointment** — type "how to book appointment"
• **Find a doctor** — type "how to find a doctor"
• **View appointments** — type "view my appointments"

Or click one of the quick reply buttons below!`;
};

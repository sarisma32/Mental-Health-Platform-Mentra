# Mentra Mental Health Platform — Feature Documentation

> This document explains which files handle which features in the Mentra project.
> Organized by feature so you can quickly find every file involved in any functionality.

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router DOM |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | JWT (jsonwebtoken) |
| File Uploads | Multer |
| Email | Nodemailer (Gmail SMTP) |
| Password Hashing | bcrypt |
| Input Validation | express-validator |

---

## 1. Application Entry & Routing

**What it does:** Boots the React app, sets up all page routes, and connects the frontend to the backend API.

| File | Role |
|---|---|
| `src/main.jsx` | Mounts the React app into the HTML page. Wraps everything in `<BrowserRouter>` so routing works. |
| `src/App.jsx` | Defines every URL route (`/`, `/login`, `/dashboard`, `/admin`, etc.) and maps each route to its page component. This is the central routing file. |
| `src/config/api.js` | Stores the backend base URL and all API endpoint paths as constants (e.g. `API_ENDPOINTS.PATIENT_REGISTER`). Every frontend fetch call uses `buildApiUrl()` from this file so the URL is never hardcoded. |
| `backend/server.js` | The Express server entry point. Sets up CORS, JSON parsing, static file serving for uploads, mounts all route modules, connects to the database, starts the appointment scheduler, and listens on port 5002. |
| `vite.config.js` | Vite build configuration — enables the React plugin and Tailwind CSS integration. |
| `index.html` | The HTML shell that Vite injects the React app into. |

---

## 2. Patient Registration

**What it does:** Allows a new patient to create an account. Requires email OTP verification before the account is created. Blocks fake emails and prevents using an email already registered as a doctor.

| File | Role |
|---|---|
| `src/pages/SignupPage.jsx` | The signup choice page — user picks "Patient" or "Professional". Navigates to the correct registration form. |
| `src/pages/UserRegister.jsx` | The patient registration form. Collects full name, email, password, phone number, and age. Has a "Verify" button next to the email field that triggers OTP sending. The form submit button stays disabled until email is verified. |
| `backend/routes/patientRoutes.js` | Defines the patient API routes: `POST /send-verification`, `POST /verify-email`, `POST /register`. |
| `backend/controllers/patientController.js` | Contains `sendEmailVerification` (generates a 6-digit OTP, stores it in the DB, sends it via email — also checks if the email is already used by a doctor), `verifyEmailOTP` (validates the OTP), and `registerPatient` (creates the account after checking both patients and doctors tables for email uniqueness). |
| `backend/middleware/validation.js` | `validatePatientRegistration` — validates all form fields (name format, email format, password strength, phone format, age range) before the controller runs. |
| `backend/utils/emailService.js` | `sendOTPEmail` — sends the 6-digit verification code to the patient's email using Gmail SMTP. If delivery fails, the OTP is printed to the server console as a fallback. |
| `backend/db/init.js` | Defines the `patients` table schema and the `password_reset_otps` table used to store OTPs. |


---

## 3. Doctor (Professional) Registration

**What it does:** Allows a healthcare professional to register. Requires email OTP verification, license document upload, and admin approval before the account becomes active.

| File | Role |
|---|---|
| `src/pages/ProfessionalRegister.jsx` | The doctor registration form. Collects full name, experience, email (with OTP verify button), license number, phone, hospital name, location, specialization, password, and license document upload. Submit button is disabled until email is verified. After submission, redirects to the pending status page. |
| `src/pages/DoctorPendingStatus.jsx` | Shown immediately after doctor registers. Informs the doctor their account is under review and they will be notified by email once approved. |
| `backend/routes/doctorRoutes.js` | Defines doctor API routes: `POST /send-verification`, `POST /verify-email`, `POST /register`, and all other doctor endpoints. |
| `backend/controllers/doctorController.js` | Contains `sendDoctorEmailVerification` (generates OTP, checks if email is already used by a patient), `verifyDoctorEmailOTP`, and `registerDoctor` (creates the doctor account with `approval_status = 'pending'`, checks cross-table email uniqueness, requires document upload). Also fires a notification to admin on registration. |
| `backend/middleware/upload.js` | `uploadDocument` — Multer configuration that accepts PDF/PNG/JPG files and saves them to `backend/uploads/documents/`. Used on the register route. |
| `backend/middleware/validation.js` | `validateDoctorRegistration` — validates all doctor form fields including experience format ("5 years"), license number, hospital name, and specialization. |
| `backend/utils/emailService.js` | `sendOTPEmail` — sends the verification OTP to the doctor's email. |
| `backend/controllers/notificationController.js` | `createNotification` — called after registration to notify the admin that a new doctor has applied. |

---

## 4. Global Email Uniqueness (Cross-Table Check)

**What it does:** Ensures one email address cannot be used for both a patient account and a doctor account simultaneously.

| File | Role |
|---|---|
| `backend/controllers/patientController.js` | In `sendEmailVerification` and `registerPatient` — queries the `doctors` table to check if the email is already registered there. Returns a clear error if it is. |
| `backend/controllers/doctorController.js` | In `sendDoctorEmailVerification` and `registerDoctor` — queries the `patients` table to check if the email is already registered there. Returns a clear error if it is. |

---

## 5. Login (All Roles)

**What it does:** Authenticates patients, doctors, and admins. Returns a JWT token stored in localStorage. Redirects each role to their respective dashboard.

| File | Role |
|---|---|
| `src/pages/UserLogin.jsx` | Patient login form — email and password. On success, stores token and user data in localStorage, redirects to `/dashboard`. |
| `src/pages/DoctorLogin.jsx` | Doctor login form — email and password. Handles pending/rejected status responses with appropriate messages. |
| `src/pages/AdminLogin.jsx` | Admin login form — separate login page for the admin panel. |
| `backend/routes/authRoutes.js` | Defines `POST /api/auth/login` — the unified login endpoint used by all roles. |
| `backend/controllers/authController.js` | `unifiedLogin` — checks the patients table first, then the doctors table, then the admins table. Validates the password with bcrypt, checks doctor approval status, and returns a signed JWT with the user's role. |
| `backend/middleware/validation.js` | `validateLogin` — validates that email and password fields are present and correctly formatted. |
| `backend/middleware/auth.js` | `verifyToken`, `verifyDoctor`, `verifyPatient`, `verifyAdmin` — JWT verification middleware applied to all protected routes. Decodes the token and attaches the user to `req.user`. |

---

## 6. Forgot Password / OTP Reset

**What it does:** Allows any user to reset their password by receiving a 6-digit OTP via email, verifying it, and setting a new password.

| File | Role |
|---|---|
| `src/pages/ForgotPassword.jsx` | Step 1 — user enters their email address to request an OTP. |
| `src/pages/VerifyOTP.jsx` | Step 2 — user enters the 6-digit code sent to their email. |
| `src/pages/ResetPassword.jsx` | Step 3 — user enters and confirms their new password. |
| `backend/routes/authRoutes.js` | Defines `POST /forgot-password`, `POST /verify-otp`, `POST /reset-password`. |
| `backend/controllers/authController.js` | `forgotPassword` — generates OTP, stores it in `password_reset_otps` table, sends email. `verifyOTP` — validates the code. `resetPassword` — hashes and saves the new password. |
| `backend/utils/otpUtils.js` | Helper functions: `generateOTP`, `verifyOTP`, `incrementAttempts`, `cleanupExpiredOTPs`. |
| `backend/utils/emailService.js` | `sendOTPEmail` — sends the reset OTP. `sendPasswordResetConfirmation` — sends a confirmation email after successful reset. |

---

## 7. Browse Doctors (Professionals Page)

**What it does:** Lets patients browse all approved doctors, search by name, specialization, or location, and view doctor cards with key info.

| File | Role |
|---|---|
| `src/pages/ProfessionalsPage.jsx` | The main browse page. Fetches all approved doctors, renders search/filter controls, and displays doctor cards. Clicking a card navigates to the doctor's public profile. |
| `backend/routes/doctorRoutes.js` | `GET /api/doctors/approved` — public endpoint, no auth required. |
| `backend/controllers/doctorController.js` | `getApprovedDoctors` — queries the doctors table for `approval_status = 'approved'`, supports pagination and specialization filter. |

---

## 8. Doctor Public Profile

**What it does:** Shows a doctor's full public profile including bio, credentials, session fees, and educational videos. Has a "Book Appointment" button.

| File | Role |
|---|---|
| `src/pages/DoctorProfilePage.jsx` | Renders the full public profile. Fetches doctor data and their uploaded videos. Shows bio, credentials, fees, and video player for each educational video. |
| `backend/routes/doctorRoutes.js` | `GET /api/doctors/:doctorId` — returns doctor details. `GET /api/doctors/:doctorId/videos` — returns the doctor's educational videos. |
| `backend/controllers/doctorController.js` | `getDoctorById` — fetches a single approved doctor by ID. `getDoctorVideos` — fetches all videos for a doctor. |

---

## 9. Book Appointment

**What it does:** Allows a logged-in patient to book a session with a doctor. Enforces 24-hour advance booking, auto-selects follow-up fee if patient has booked before, sends confirmation email.

| File | Role |
|---|---|
| `src/pages/BookAppointmentPage.jsx` | The booking form. Auto-fills patient info from their account. Fetches available time slots from the doctor's schedule. Detects if the patient has a previous appointment with this doctor and auto-selects the follow-up fee. All fields are mandatory. |
| `src/pages/AppointmentConfirmationPage.jsx` | Shown after successful booking. Displays the confirmation number and full appointment summary. |
| `backend/routes/appointmentRoutes.js` | `POST /api/appointments` — book an appointment. |
| `backend/controllers/appointmentController.js` | `bookAppointment` — validates the 24-hour advance rule, checks the time slot is available, generates a unique confirmation number, saves the appointment with `status = 'pending'`, sends a booking confirmation email, and creates a notification for the doctor. |
| `backend/routes/scheduleRoutes.js` | `GET /api/schedules/available/:doctorId` — returns available (unbooked) time slots for a doctor. |
| `backend/controllers/scheduleController.js` | `getAvailableSlots` — queries the schedule table and excludes already-booked slots. |
| `backend/utils/emailService.js` | `sendAppointmentBookedEmail` — sends a detailed confirmation email to the patient with all appointment details and confirmation number. |
| `backend/controllers/notificationController.js` | `createNotification` — notifies the doctor that a new appointment has been booked. |

---

## 10. Doctor Schedule Management

**What it does:** Allows doctors to add available time slots for patients to book. Enforces that only future time slots can be added.

| File | Role |
|---|---|
| `src/components/ScheduleManagement.jsx` | The schedule UI inside the doctor dashboard. Lets the doctor pick a date, start time, end time, and session duration. Validates that the selected time is in the future before submitting. |
| `backend/routes/scheduleRoutes.js` | `GET /api/schedules/doctor/:doctorId`, `POST /api/schedules`, `DELETE /api/schedules/:id`. |
| `backend/controllers/scheduleController.js` | `addScheduleSlot` — validates the slot is not in the past before saving. `getDoctorSchedule` — returns all slots for a doctor. `deleteScheduleSlot` — removes a slot. |

---

## 11. Appointment Confirm / Cancel (Doctor Side)

**What it does:** Allows doctors to confirm or cancel pending appointments. Once confirmed, the time slot is locked. Patients cannot cancel within 5 hours of the appointment.

| File | Role |
|---|---|
| `src/pages/doctor/DoctorAppointments.jsx` | Shows all appointments sorted newest-first. Pending appointments show "Confirm" and "Cancel" buttons. Confirmed/scheduled appointments show "Complete Session". |
| `backend/routes/appointmentRoutes.js` | `PUT /api/appointments/:id/confirm`, `DELETE /api/appointments/:id`. |
| `backend/controllers/appointmentController.js` | `confirmAppointment` — changes status to `confirmed`. `cancelAppointment` — enforces the 5-hour rule for patient cancellations; doctors can cancel at any time. |

---

## 12. Auto-Confirm Appointments & Reminder Emails

**What it does:** If a doctor does not confirm or cancel within 5 hours of the appointment time, the system auto-confirms it. Also sends a reminder email to the patient 1 hour before their appointment.

| File | Role |
|---|---|
| `backend/utils/appointmentScheduler.js` | Runs every 15 minutes. Checks for pending appointments within 5 hours and auto-confirms them. Also checks for appointments starting in ~1 hour and sends reminder emails if not already sent. |
| `backend/utils/emailService.js` | `sendAppointmentReminderEmail` — sends the 1-hour reminder email with full appointment details and a checklist. |
| `backend/server.js` | Calls `startAppointmentScheduler()` on server startup to activate the scheduler. |

---

## 13. Complete Session (Doctor Side)

**What it does:** Allows a doctor to mark an appointment as completed and add session notes. The notes are sent to the patient via email and visible in their appointment history.

| File | Role |
|---|---|
| `src/pages/doctor/DoctorCompleteSessionModal.jsx` | Modal that appears when doctor clicks "Complete Session". Shows patient info and a required session notes textarea. |
| `backend/routes/appointmentRoutes.js` | `PUT /api/appointments/:id/complete`. |
| `backend/controllers/appointmentController.js` | `completeSession` — updates status to `completed`, saves session notes, sends the session completion email to the patient. |
| `backend/utils/emailService.js` | `sendSessionCompletedEmail` — sends the patient an email with the session summary and doctor's notes. |

---

## 14. Patient Dashboard

**What it does:** The logged-in patient's personal dashboard with overview stats, appointment management, and profile view.

| File | Role |
|---|---|
| `src/pages/Dashboard.jsx` | Parent component — manages all state (appointments, stats, review modal state). Renders the sidebar and header, then delegates to section components based on active menu item. |
| `src/pages/patient/PatientOverview.jsx` | Overview section — shows 3 stat cards (upcoming, completed, total sessions), quick action buttons (Find Therapists, My Appointments, AI Chatbot, My Profile), and a recent appointments preview list. |
| `src/pages/patient/PatientAppointments.jsx` | Appointments section — tabbed view (Upcoming / Past / All). Appointments are grouped by doctor. Shows date, time, fee, session type, confirmation number, and session notes (for completed). Cancel button shown if more than 5 hours before appointment. "Leave a Review" button shown for completed appointments. |
| `src/pages/patient/PatientProfile.jsx` | Profile section — gradient header with name and status, account info grid (name, email, phone, age, member since), and a progress stats block. |
| `src/components/DashboardSidebar.jsx` | Reusable sidebar — shows Mentra logo, patient name/email, navigation menu (Overview, Appointments, Profile), and sign out button. |
| `src/components/DashboardHeader.jsx` | Reusable top bar — shows section title, current date, notification bell, and patient name/avatar. |

---

## 15. Patient Review Submission

**What it does:** After a completed appointment, the patient can submit a detailed review with an overall star rating and sub-ratings for Professionalism, Communication, and Wait Time. Reviews are hidden until admin approves them.

| File | Role |
|---|---|
| `src/pages/patient/PatientAppointments.jsx` | Shows the "Leave a Review" button on completed appointments. Opens the review modal. |
| `src/pages/patient/PatientReviewModal.jsx` | The review modal — large star rating for overall score, smaller star ratings for Professionalism/Communication/Wait Time, and a written review text area. Submit button disabled until overall rating is selected. |
| `src/components/StarRating.jsx` | Shared star rating components — `StarRating` (large, for overall) and `SubStarRating` (smaller, for detailed ratings). |
| `backend/routes/reviewRoutes.js` | `POST /api/reviews`, `GET /api/reviews/check/:appointmentId`. |
| `backend/controllers/reviewController.js` | `submitReview` — saves the review with `is_visible = false`. Creates a notification for the admin. `checkReview` — checks if a review already exists for an appointment (prevents duplicate reviews). |

---

## 16. Doctor Dashboard

**What it does:** The doctor's personal dashboard with stats, appointment management, patient history, schedule, profile editing, video uploads, and reviews.

| File | Role |
|---|---|
| `src/pages/DoctorDashboardNew.jsx` | Parent component — manages all state (appointments, patients, doctor profile, session modal). Renders sidebar and header, delegates to section components. |
| `src/pages/doctor/DoctorOverview.jsx` | Overview section — 4 stat cards (today's sessions, active patients, weekly revenue, completed sessions), today's schedule list, quick action buttons. |
| `src/pages/doctor/DoctorAppointments.jsx` | Appointments section — sorted newest-first, status filter, confirm/cancel/complete actions, full detail modal showing all patient-provided booking information. |
| `src/pages/doctor/DoctorPatients.jsx` | Patients section — lists all patients who have had sessions. Click a patient to see their full history: completed sessions with notes, upcoming sessions, and cancelled appointments. |
| `src/pages/doctor/DoctorProfile.jsx` | Profile section — editable form for personal info, professional details, hospital/location, session fees (initial and follow-up), bio, and credentials. Also includes the video upload section. |
| `src/pages/doctor/DoctorVideoUpload.jsx` | Educational videos sub-section inside profile — upload MP4/MOV/AVI videos with a title and description. Lists uploaded videos with a delete option. Videos appear on the public doctor profile. |
| `src/pages/doctor/DoctorReviews.jsx` | Reviews section — shows all approved patient reviews. Click a review to see the full detail modal with overall rating, Professionalism/Communication/Wait Time sub-ratings, and written review. |
| `src/pages/doctor/DoctorCompleteSessionModal.jsx` | Complete session modal — shown when doctor clicks "Complete Session" on a confirmed appointment. |
| `src/components/ScheduleManagement.jsx` | Schedule section — add/remove available time slots. |
| `src/components/DashboardSidebar.jsx` | Sidebar with doctor name, specialization, and navigation (Overview, Appointments, Patients, Schedule, Profile, My Reviews). |
| `src/components/DashboardHeader.jsx` | Top bar with section title, date, notification bell, and doctor name. |
| `backend/controllers/dashboardController.js` | `getDoctorStats` — calculates today's appointments, total unique patients, weekly revenue from completed sessions, and all-time completed sessions count. |

---

## 17. Doctor Profile Photo Upload

**What it does:** Allows a doctor to upload a profile photo from their dashboard. The photo appears on their public profile page.

| File | Role |
|---|---|
| `src/pages/doctor/DoctorProfile.jsx` | Has a camera icon overlay on the profile photo. Clicking it opens a file picker. |
| `backend/routes/doctorRoutes.js` | `POST /api/doctors/profile/photo`. |
| `backend/controllers/doctorController.js` | `uploadProfilePhoto` — saves the photo path to the database. |
| `backend/middleware/upload.js` | `uploadProfileImage` — Multer config that saves images to `backend/uploads/profiles/`. |

---

## 18. Admin Dashboard

**What it does:** The admin control panel for managing doctors, patients, appointments, specializations, reviews, and viewing analytics.

| File | Role |
|---|---|
| `src/pages/AdminDashboardNew.jsx` | Parent component — manages shared state (doctors list, patients list, stats). Renders sidebar and header, delegates to section components. |
| `src/pages/admin/AdminOverview.jsx` | Dashboard overview — 4 stat cards (total users, total doctors, pending reviews, total appointments), quick action buttons to navigate to key sections. |
| `src/pages/admin/AdminDoctors.jsx` | Doctors section — stats cards, search by name/email/specialization, filter by approval status, table with Approve/Reject/Revoke buttons. Click a doctor row to open a full detail modal showing all registration information including license document link. |
| `src/pages/admin/AdminUsers.jsx` | Users section — stats cards, search by name/email/phone, filter by status, table with Activate/Deactivate buttons. Click a user row to open a detail modal. |
| `src/pages/admin/AdminAppointments.jsx` | Appointments section — stats cards (total/upcoming/completed/cancelled), search by patient or doctor name, filter by status, full appointments table. Self-contained with its own data fetching. |
| `src/pages/admin/AdminSpecializations.jsx` | Specializations section — add new specializations, list all with doctor count. Edit and Delete buttons are disabled (grayed out) if the specialization is assigned to any doctor. |
| `src/pages/admin/AdminReviews.jsx` | Reviews section — stats cards, filter tabs (All/Pending Approval/Approved), reviews table with Approve/Hide/Delete actions. Click a row to open a detail modal showing all ratings. Self-contained with its own data fetching. |
| `src/pages/admin/AdminAnalytics.jsx` | Analytics section — KPI cards (total revenue, appointments, active patients, total doctors), appointment breakdown progress bars, doctor status bars, top specializations bar chart, appointment trends SVG line chart, new registrations bar chart (toggle patients/doctors). Self-contained with its own data fetching. |
| `src/components/DashboardSidebar.jsx` | Admin sidebar with navigation (Dashboard, Users, Doctors, Appointments, Specializations, Reviews, Analytics, Settings). |
| `src/components/DashboardHeader.jsx` | Admin top bar with section title, date, notification bell, and admin name. |

---

## 19. Admin Doctor Approval

**What it does:** Admin reviews doctor registration applications and approves or rejects them. Approved doctors can log in and use the platform. Rejected doctors are blocked.

| File | Role |
|---|---|
| `src/pages/admin/AdminDoctors.jsx` | Shows all doctors with their approval status. Approve/Reject/Revoke buttons in the table and in the detail modal. |
| `backend/routes/adminRoutes.js` | `PUT /api/admin/doctors/:doctorId/status`. |
| `backend/controllers/adminController.js` | `updateDoctorStatus` — updates `approval_status` in the doctors table. |
| `backend/controllers/notificationController.js` | `createNotification` — notifies the doctor when their application is approved or rejected. |

---

## 20. Admin Review Moderation

**What it does:** Admin can approve (make visible) or hide patient reviews. Approved reviews appear on the doctor's public profile. When approved, the doctor receives a notification.

| File | Role |
|---|---|
| `src/pages/admin/AdminReviews.jsx` | Shows all reviews with their visibility status. Approve/Hide/Delete buttons per review. |
| `backend/routes/reviewRoutes.js` | `PUT /api/reviews/admin/:id/visibility`, `DELETE /api/reviews/admin/:id`. |
| `backend/controllers/reviewController.js` | `toggleReviewVisibility` — flips `is_visible`. When set to visible, creates a notification for the doctor. `deleteReview` — permanently removes the review. |
| `backend/controllers/notificationController.js` | `createNotification` — notifies the doctor that a review has been approved and is now visible on their profile. |

---

## 21. Admin Specializations Management

**What it does:** Admin can add, edit, and delete specializations used in doctor registration. Edit and Delete are blocked if any doctor is currently using that specialization.

| File | Role |
|---|---|
| `src/pages/admin/AdminSpecializations.jsx` | Lists all specializations with a doctor count. Edit/Delete buttons are replaced with disabled gray labels when `doctor_count > 0`. Shows a tooltip explaining why. |
| `backend/routes/adminRoutes.js` | `GET/POST /api/admin/specializations`, `PUT/DELETE /api/admin/specializations/:id`. |
| `backend/controllers/adminController.js` | `getSpecializations` — returns each specialization with a `doctor_count` via LEFT JOIN with doctors table. `updateSpecialization` — checks doctor count before allowing edit. `deleteSpecialization` — checks doctor count before allowing delete. Both return a clear error message if in use. |

---

## 22. Notification System

**What it does:** Real-time-style notifications for doctors and admins when key events happen (new booking, new user, review approved, etc.). Shown as a bell icon with unread count badge.

| File | Role |
|---|---|
| `src/components/NotificationBell.jsx` | Bell icon component used in both doctor and admin dashboard headers. Polls for new notifications, shows a red badge with unread count, opens a dropdown list on click, marks notifications as read, and calls `onNavigate` to redirect to the relevant dashboard section when a notification is clicked. |
| `src/components/DashboardHeader.jsx` | Renders the `NotificationBell` component in the top bar of all dashboards. |
| `backend/routes/notificationRoutes.js` | `GET /api/notifications/:recipientType/:recipientId`, `PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all`. |
| `backend/controllers/notificationController.js` | `createNotification` — internal helper called by other controllers to insert a notification. `getNotifications` — returns unread notifications for a recipient. `markAsRead` / `markAllAsRead`. |

**Notifications are created in these controllers:**
- `appointmentController.js` — new booking (notifies doctor), appointment confirmed (notifies patient)
- `patientController.js` — new patient registration (notifies admin)
- `doctorController.js` — new doctor registration (notifies admin)
- `reviewController.js` — new review submitted (notifies admin), review approved (notifies doctor)

---

## 23. Patient History (Doctor View)

**What it does:** Doctors can view the complete session history of any patient they have treated, including session notes, upcoming sessions, and cancelled appointments.

| File | Role |
|---|---|
| `src/pages/doctor/DoctorPatients.jsx` | Lists all patients. Clicking a patient opens a modal showing: summary stats (completed/upcoming/last visit), upcoming sessions, full session history with doctor notes, and cancelled appointments. |
| `backend/routes/appointmentRoutes.js` | `GET /api/appointments/doctor/:doctorId/patient/:patientId/history`. |
| `backend/controllers/appointmentController.js` | `getPatientHistory` — returns completed sessions, upcoming sessions, and cancelled appointments for a specific patient under a specific doctor. |

---

## 24. Shared Dashboard Components

**What it does:** Reusable UI components shared across all three dashboards (patient, doctor, admin) to keep the look consistent.

| File | Role |
|---|---|
| `src/components/DashboardSidebar.jsx` | Reusable sidebar used in all 3 dashboards. Accepts `title`, `subtitle`, `userName`, `userSub`, `userPrefix`, `menuItems`, `activeSection`, `onNavigate`, `onLogout` as props. Renders the logo, user info block, navigation buttons, and sign out button. |
| `src/components/DashboardHeader.jsx` | Reusable top header bar used in all 3 dashboards. Accepts `sectionTitle`, `userName`, `userEmail`, `userPrefix`, `notifType`, `notifId`, `onNotifNavigate`. Renders the section title, date, notification bell, and user avatar. |
| `src/components/NotificationBanner.jsx` | Inline success/error banner used inside the doctor dashboard for action feedback (e.g. "Profile updated successfully"). |
| `src/components/StarRating.jsx` | Exports `StarRating` (large stars for overall rating) and `SubStarRating` (smaller stars for detailed ratings). Used in the patient review modal. |

---

## 25. Public Site Pages

**What it does:** The marketing/informational pages visible to all visitors before they log in.

| File | Role |
|---|---|
| `src/pages/MentraLanding.jsx` | Home page — hero section, features overview, call-to-action buttons. |
| `src/pages/AboutUsPage.jsx` | About Us page — mission, team information. |
| `src/pages/ServicesPage.jsx` | Services page — lists the mental health services offered on the platform. |
| `src/pages/AccountDeactivated.jsx` | Shown when a patient tries to log in but their account has been deactivated by the admin. |
| `src/components/Header.jsx` | Public navigation bar — logo, nav links, login/signup buttons. |
| `src/components/Footer.jsx` | Public site footer — links and copyright. |
| `src/components/HeroSection.jsx` | Hero section component used on the landing page. |
| `src/components/CallToAction.jsx` | CTA section component used on landing and services pages. |
| `src/components/Breadcrumb.jsx` | Breadcrumb navigation for multi-step pages. |

---

## 26. Backend Middleware

**What it does:** Middleware that runs before controller functions to handle authentication, input validation, and file uploads.

| File | Role |
|---|---|
| `backend/middleware/auth.js` | JWT verification. `verifyToken` decodes the Bearer token and attaches the user to `req.user`. `verifyDoctor`, `verifyPatient`, `verifyAdmin` check the role. Applied to all protected routes. |
| `backend/middleware/validation.js` | express-validator rule sets for every form in the app: `validatePatientRegistration`, `validateDoctorRegistration`, `validateLogin`, `validateAppointmentBooking`, `validateForgotPassword`, `validateVerifyOTP`, `validateResetPassword`. `handleValidationErrors` returns a 400 response if any rule fails. |
| `backend/middleware/upload.js` | Multer file upload configurations: `uploadDocument` (license files → `uploads/documents/`), `uploadProfileImage` (photos → `uploads/profiles/`), `uploadVideo` (videos up to 100MB → `uploads/videos/`). `handleUploadError` catches Multer errors and returns a clean error response. |

---

## 27. Database

**What it does:** PostgreSQL database connection, table creation, and schema management.

| File | Role |
|---|---|
| `backend/db/index.js` | Creates and exports the PostgreSQL connection pool using environment variables. All controllers import this to run queries. |
| `backend/db/init.js` | `initializeDatabase()` — creates all tables if they don't exist: `patients`, `doctors`, `admins`, `appointments`, `specializations`, `doctor_videos`, `notifications`, `reviews`, `password_reset_otps`. Seeds default specializations. Creates indexes. Called on server startup. |
| `backend/db/schema.sql` | Raw SQL version of the same schema — useful for manual database setup or reference. |
| `backend/db/add-doctor-schedule-table.sql` | Migration SQL that adds the `doctor_schedules` table. |
| `backend/db/add-location-column.sql` | Migration SQL that adds the `location` column to the doctors table. |
| `backend/db/update-schedule-to-date-based.sql` | Migration SQL that updates the schedule table to use specific dates instead of day-of-week. |
| `backend/.env` | Environment variables: database credentials, JWT secret, email credentials, port, frontend URL. Never committed to Git. |

---

## 28. Email Service

**What it does:** All outgoing emails from the platform — OTP codes, booking confirmations, session notes, reminders, and password reset confirmations.

| File | Role |
|---|---|
| `backend/utils/emailService.js` | Single file containing all email functions using Nodemailer with Gmail SMTP: `sendOTPEmail` (verification and password reset codes), `sendPasswordResetConfirmation`, `sendAppointmentBookedEmail` (booking confirmation with all details), `sendSessionCompletedEmail` (session notes to patient), `sendAppointmentReminderEmail` (1-hour-before reminder with checklist). |
| `backend/.env` | Stores `EMAIL_USER` (Gmail address) and `EMAIL_PASSWORD` (Gmail App Password) used by Nodemailer. |

---

## 29. Analytics (Admin)

**What it does:** Provides the admin with meaningful insights about the platform — revenue, appointment trends, registration trends, doctor status breakdown, and review statistics.

| File | Role |
|---|---|
| `src/pages/admin/AdminAnalytics.jsx` | Self-contained analytics page. Fetches data from 4 endpoints simultaneously (appointments, reviews, doctors, users). Calculates all stats client-side and renders: KPI cards, appointment breakdown bars, doctor status bars, top specializations bars, a smooth SVG area chart for appointment trends, and a bar chart for new registrations (toggle between patients and doctors). |

---

## 30. Configuration & Build

| File | Role |
|---|---|
| `package.json` (root) | Frontend project config — lists React, Vite, Tailwind, React Router as dependencies. Scripts: `dev` (start dev server), `build` (production build), `preview`. |
| `backend/package.json` | Backend project config — lists Express, pg, bcrypt, jsonwebtoken, multer, nodemailer, express-validator, nodemon as dependencies. Scripts: `start` (node server.js), `dev` (nodemon server.js). |
| `vite.config.js` | Vite config — enables `@vitejs/plugin-react` for JSX and Tailwind CSS v4 via `@tailwindcss/vite`. |
| `eslint.config.js` | ESLint config — enables React hooks rules and React Refresh rules for the frontend. |

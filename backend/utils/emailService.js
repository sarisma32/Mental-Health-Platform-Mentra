import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send OTP email
// type: 'verification' (email verify) | 'reset' (password reset) — defaults to 'reset'
export const sendOTPEmail = async (email, otp, userName = '', type = 'reset') => {
  try {
    console.log(' Attempting to send OTP email...');
    console.log('To:', email);
    console.log('OTP:', otp);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-4) : 'NOT SET');

    const transporter = createTransporter();

    const isVerification = type === 'verification';

    const subject = isVerification
      ? 'Email Verification OTP - Mentra'
      : 'Password Reset OTP - Mentra';

    const headerTitle = isVerification
      ? ' Email Verification'
      : ' Password Reset Request';

    const bodyText = isVerification
      ? 'Please verify your email address to complete your Mentra registration.'
      : 'We received a request to reset your password for your Mentra account.';

    const warningText = isVerification
      ? "If you didn't create a Mentra account, please ignore this email."
      : "If you didn't request this password reset, please ignore this email and ensure your account is secure.";

    const mailOptions = {
      from: `"Mentra - Mental Health Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background-color: #4A7C59; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background-color: #f0f0f0; border: 2px dashed #4A7C59; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; color: #4A7C59; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${headerTitle}</h1>
            </div>
            <div class="content">
              <p>Hi ${userName || 'User'},</p>
              <p>${bodyText}</p>
              <p>Your One-Time Password (OTP) is:</p>
              <div class="otp-box">${otp}</div>
              <p><strong>This OTP will expire in 10 minutes.</strong></p>
              <div class="warning">
                <strong> Security Notice:</strong> ${warningText}
              </div>
              <p>For your security, never share this OTP with anyone, including Mentra staff.</p>
              <p>Best regards,<br><strong>The Mentra Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2026 Mentra - Mental Health Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(' OTP Email sent successfully to:', email, '| ID:', info.messageId);
    return { success: true, message: 'OTP sent successfully to your email' };
  } catch (error) {
    console.error(' Error sending OTP email:', error);
    console.log(`\n==============================\nOTP EMAIL FALLBACK\nTo: ${email}\nOTP: ${otp}\n==============================\n`);
    return { success: false, message: 'Failed to send OTP email. Please try again.' };
  }
};

// Send password reset confirmation email
export const sendPasswordResetConfirmation = async (email, userName = '') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Mentra - Mental Health Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Successful - Mentra',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #A3B18A;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .success-icon {
              text-align: center;
              font-size: 48px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1> Password Reset Successful</h1>
            </div>
            <div class="content">
              <div class="success-icon"></div>
              
              <p>Hi ${userName || 'User'},</p>
              
              <p>Your password has been successfully reset for your Mentra account.</p>
              
              <p>You can now log in with your new password.</p>
              
              <div class="warning">
                <strong> Security Alert:</strong> If you didn't make this change, please contact our support team immediately at support@mentra.com
              </div>
              
              <p>Thank you for using Mentra!</p>
              
              <p>Best regards,<br>
              <strong>The Mentra Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2026 Mentra - Mental Health Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(' Password reset confirmation email sent to:', email);
    console.log('Message ID:', info.messageId);

    return { success: true, message: 'Confirmation email sent' };
  } catch (error) {
    console.error(' Error sending confirmation email:', error);
    return { success: false, message: 'Failed to send confirmation email' };
  }
};

// ── Appointment Booked Email ─────────────────────────────────────────────────
export const sendAppointmentBookedEmail = async (appointment) => {
  try {
    const transporter = createTransporter();

    const {
      patient_email, patient_first_name, patient_last_name,
      doctor_name, doctor_specialization, doctor_location,
      appointment_date, appointment_time, appointment_type,
      session_fee, duration_minutes, confirmation_number
    } = appointment;

    const patientName = `${patient_first_name} ${patient_last_name}`;
    const formattedDate = new Date(appointment_date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const [h, m] = appointment_time.split(':');
    const hour = parseInt(h);
    const formattedTime = `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    const sessionType = appointment_type === 'initial' ? 'Initial Consultation' : 'Follow-up Session';

    const mailOptions = {
      from: `"Mentra - Mental Health Platform" <${process.env.EMAIL_USER}>`,
      to: patient_email,
      subject: `Appointment Booked - ${confirmation_number} | Mentra`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #4A7C59, #3d6b4a); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .confirmation-box { background-color: #DCE4D4; border: 2px solid #4A7C59; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
            .confirmation-box .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
            .confirmation-box .number { font-size: 22px; font-weight: bold; color: #4A7C59; letter-spacing: 3px; margin-top: 4px; }
            .pending-box { background-color: #fff8e1; border: 2px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center; }
            .pending-box p { margin: 0; color: #92400e; font-size: 14px; font-weight: 600; }
            .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .details-table tr { border-bottom: 1px solid #f0f0f0; }
            .details-table td { padding: 10px 8px; font-size: 14px; }
            .details-table td:first-child { color: #666; width: 40%; }
            .details-table td:last-child { font-weight: 600; color: #333; }
            .info-box { background-color: #F5F5F0; border-left: 4px solid #4A7C59; padding: 14px; margin: 20px 0; border-radius: 0 6px 6px 0; font-size: 14px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1> Appointment Booked</h1>
              <p>Your request has been received — awaiting doctor confirmation</p>
            </div>
            <div class="content">
              <p>Hi <strong>${patientName}</strong>,</p>
              <p>Your appointment has been successfully booked. Here are your booking details:</p>

              <div class="pending-box">
                <p> Your appointment is pending confirmation from Dr. ${doctor_name}. You will receive another email once it is confirmed.</p>
              </div>

              <div class="confirmation-box">
                <div class="label">Confirmation Number</div>
                <div class="number">${confirmation_number}</div>
              </div>

              <table class="details-table">
                <tr><td>Doctor</td><td>Dr. ${doctor_name}</td></tr>
                <tr><td>Specialization</td><td>${doctor_specialization}</td></tr>
                <tr><td>Location</td><td>${doctor_location}</td></tr>
                <tr><td>Date</td><td>${formattedDate}</td></tr>
                <tr><td>Time</td><td>${formattedTime}</td></tr>
                <tr><td>Session Type</td><td>${sessionType}</td></tr>
                <tr><td>Duration</td><td>${duration_minutes} minutes</td></tr>
                <tr><td>Session Fee</td><td>Rs ${session_fee}</td></tr>
              </table>

              <div class="info-box">
                 <strong>What happens next?</strong> The doctor will review and confirm your appointment. Please keep an eye on your email for the confirmation.
              </div>

              <p>If you need to cancel or have any questions, please contact us through the Mentra platform.</p>
              <p>Best regards,<br><strong>The Mentra Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2026 Mentra - Mental Health Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(' Appointment booked email sent to:', patient_email, '| ID:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error(' Error sending appointment booked email:', error);
    return { success: false };
  }
};

// ── Session Completed Email ──────────────────────────────────────────────────
export const sendSessionCompletedEmail = async (appointment) => {
  try {
    const transporter = createTransporter();

    const {
      patient_email, patient_first_name, patient_last_name,
      doctor_name, doctor_specialization,
      appointment_date, appointment_time,
      session_notes, confirmation_number
    } = appointment;

    const patientName = `${patient_first_name} ${patient_last_name}`;
    const formattedDate = new Date(appointment_date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const [h, m] = appointment_time.split(':');
    const hour = parseInt(h);
    const formattedTime = `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;

    const mailOptions = {
      from: `"Mentra - Mental Health Platform" <${process.env.EMAIL_USER}>`,
      to: patient_email,
      subject: `Session Completed - Notes from Dr. ${doctor_name} | Mentra`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #A3B18A, #8FA076); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .details-table tr { border-bottom: 1px solid #f0f0f0; }
            .details-table td { padding: 10px 8px; font-size: 14px; }
            .details-table td:first-child { color: #666; width: 40%; }
            .details-table td:last-child { font-weight: 600; color: #333; }
            .notes-box { background-color: #F0F4EC; border: 1px solid #A3B18A; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .notes-box h3 { margin: 0 0 12px; color: #A3B18A; font-size: 16px; }
            .notes-box p { margin: 0; font-size: 14px; color: #444; white-space: pre-line; }
            .info-box { background-color: #F5F5F0; border-left: 4px solid #A3B18A; padding: 14px; margin: 20px 0; border-radius: 0 6px 6px 0; font-size: 14px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1> Session Completed</h1>
              <p>Your session notes are ready</p>
            </div>
            <div class="content">
              <p>Hi <strong>${patientName}</strong>,</p>
              <p>Your session with <strong>Dr. ${doctor_name}</strong> has been marked as completed. Please find your session summary below.</p>

              <table class="details-table">
                <tr><td>Doctor</td><td>Dr. ${doctor_name}</td></tr>
                <tr><td>Specialization</td><td>${doctor_specialization}</td></tr>
                <tr><td>Session Date</td><td>${formattedDate}</td></tr>
                <tr><td>Session Time</td><td>${formattedTime}</td></tr>
                <tr><td>Confirmation #</td><td>${confirmation_number}</td></tr>
              </table>

              ${session_notes ? `
              <div class="notes-box">
                <h3> Session Notes from Dr. ${doctor_name}</h3>
                <p>${session_notes}</p>
              </div>
              ` : ''}

              <div class="info-box">
                 You can also view these notes anytime by logging into your Mentra account and checking your appointment history.
              </div>

              <p>Thank you for trusting Mentra with your mental health journey. We hope your session was helpful.</p>
              <p>Best regards,<br><strong>The Mentra Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2026 Mentra - Mental Health Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(' Session completed email sent to:', patient_email, '| ID:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error(' Error sending session completed email:', error);
    return { success: false };
  }
};


// ── Appointment Confirmed by Doctor Email ────────────────────────────────────
export const sendAppointmentConfirmedEmail = async (appointment) => {
  try {
    const transporter = createTransporter();
    const {
      patient_email, patient_first_name, patient_last_name,
      doctor_name, doctor_specialization, doctor_location,
      appointment_date, appointment_time, appointment_type,
      session_fee, duration_minutes, confirmation_number
    } = appointment;

    const patientName = `${patient_first_name} ${patient_last_name}`;
    const formattedDate = new Date(appointment_date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const [h, m] = appointment_time.split(':');
    const hour = parseInt(h);
    const formattedTime = `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    const sessionType = appointment_type === 'initial' ? 'Initial Consultation' : 'Follow-up Session';

    await transporter.sendMail({
      from: `"Mentra - Mental Health Platform" <${process.env.EMAIL_USER}>`,
      to: patient_email,
      subject: `Appointment Confirmed  - ${confirmation_number} | Mentra`,
      html: `
        <!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0}
          .container{max-width:600px;margin:0 auto;padding:20px;background-color:#f9f9f9}
          .header{background:linear-gradient(135deg,#4A7C59,#3d6b4a);color:white;padding:30px 20px;text-align:center;border-radius:8px 8px 0 0}
          .header h1{margin:0;font-size:24px}.header p{margin:8px 0 0;opacity:.9;font-size:14px}
          .content{background-color:white;padding:30px;border-radius:0 0 8px 8px}
          .confirmed-box{background-color:#d1fae5;border:2px solid #10b981;border-radius:8px;padding:16px;text-align:center;margin:20px 0}
          .confirmed-box p{margin:0;color:#065f46;font-size:15px;font-weight:600}
          .confirmation-box{background-color:#DCE4D4;border:2px solid #4A7C59;border-radius:8px;padding:16px;text-align:center;margin:20px 0}
          .confirmation-box .label{font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px}
          .confirmation-box .number{font-size:22px;font-weight:bold;color:#4A7C59;letter-spacing:3px;margin-top:4px}
          .details-table{width:100%;border-collapse:collapse;margin:20px 0}
          .details-table tr{border-bottom:1px solid #f0f0f0}
          .details-table td{padding:10px 8px;font-size:14px}
          .details-table td:first-child{color:#666;width:40%}
          .details-table td:last-child{font-weight:600;color:#333}
          .info-box{background-color:#F5F5F0;border-left:4px solid #4A7C59;padding:14px;margin:20px 0;border-radius:0 6px 6px 0;font-size:14px}
          .footer{text-align:center;margin-top:20px;font-size:12px;color:#888}
        </style></head><body>
          <div class="container">
            <div class="header">
              <h1> Appointment Confirmed</h1>
              <p>Dr. ${doctor_name} has confirmed your appointment</p>
            </div>
            <div class="content">
              <p>Hi <strong>${patientName}</strong>,</p>
              <div class="confirmed-box"><p> Great news! Dr. ${doctor_name} has confirmed your appointment.</p></div>
              <div class="confirmation-box">
                <div class="label">Confirmation Number</div>
                <div class="number">${confirmation_number}</div>
              </div>
              <table class="details-table">
                <tr><td>Doctor</td><td>Dr. ${doctor_name}</td></tr>
                <tr><td>Specialization</td><td>${doctor_specialization}</td></tr>
                <tr><td>Location</td><td>${doctor_location}</td></tr>
                <tr><td>Date</td><td>${formattedDate}</td></tr>
                <tr><td>Time</td><td>${formattedTime}</td></tr>
                <tr><td>Session Type</td><td>${sessionType}</td></tr>
                <tr><td>Duration</td><td>${duration_minutes} minutes</td></tr>
                <tr><td>Session Fee</td><td>Rs ${session_fee}</td></tr>
              </table>
              <div class="info-box"> <strong>Reminder:</strong> Please arrive a few minutes early and bring any relevant medical records or previous therapy notes.</div>
              <p>Best regards,<br><strong>The Mentra Team</strong></p>
            </div>
            <div class="footer"><p>This is an automated email. Please do not reply.</p><p>&copy; 2026 Mentra. All rights reserved.</p></div>
          </div>
        </body></html>
      `
    });
    return { success: true };
  } catch (err) {
    console.error('Appointment confirmed email error:', err);
    return { success: false };
  }
};

// ── Appointment Reminder Email (1 hour before) ───────────────────────────────
export const sendAppointmentReminderEmail = async (appointment) => {
  try {
    const transporter = createTransporter();

    const {
      patient_email, patient_first_name, patient_last_name,
      doctor_name, doctor_specialization, doctor_location, doctor_address,
      appointment_date, appointment_time, appointment_type,
      session_fee, duration_minutes, confirmation_number
    } = appointment;

    const patientName = `${patient_first_name} ${patient_last_name}`;
    const formattedDate = new Date(appointment_date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const [h, m] = appointment_time.split(':');
    const hour = parseInt(h);
    const formattedTime = `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    const sessionType = appointment_type === 'initial' ? 'Initial Consultation' : 'Follow-up Session';

    const mailOptions = {
      from: `"Mentra - Mental Health Platform" <${process.env.EMAIL_USER}>`,
      to: patient_email,
      subject: ` Reminder: Your appointment in 1 hour — Dr. ${doctor_name} | Mentra`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #A3B18A, #8FA076); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .reminder-banner { background-color: #FFF8E1; border: 2px solid #FFC107; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
            .reminder-banner .icon { font-size: 36px; }
            .reminder-banner .text { font-size: 18px; font-weight: bold; color: #E65100; margin-top: 8px; }
            .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .details-table tr { border-bottom: 1px solid #f0f0f0; }
            .details-table td { padding: 10px 8px; font-size: 14px; }
            .details-table td:first-child { color: #666; width: 40%; }
            .details-table td:last-child { font-weight: 600; color: #333; }
            .checklist { background-color: #F5F5F0; border-left: 4px solid #A3B18A; padding: 16px; margin: 20px 0; border-radius: 0 6px 6px 0; }
            .checklist h4 { margin: 0 0 10px; color: #A3B18A; }
            .checklist ul { margin: 0; padding-left: 20px; font-size: 14px; }
            .checklist li { margin-bottom: 6px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1> Appointment Reminder</h1>
              <p>Your session is coming up soon</p>
            </div>
            <div class="content">
              <p>Hi <strong>${patientName}</strong>,</p>
              <p>This is a friendly reminder that you have an appointment scheduled in <strong>1 hour</strong>.</p>

              <div class="reminder-banner">
                <div class="icon"></div>
                <div class="text">Your appointment starts in 1 hour!</div>
              </div>

              <table class="details-table">
                <tr><td>Doctor</td><td>Dr. ${doctor_name}</td></tr>
                <tr><td>Specialization</td><td>${doctor_specialization}</td></tr>
                <tr><td>Location</td><td>${doctor_location}</td></tr>
                ${doctor_address ? `<tr><td>Address</td><td>${doctor_address}</td></tr>` : ''}
                <tr><td>Date</td><td>${formattedDate}</td></tr>
                <tr><td>Time</td><td>${formattedTime}</td></tr>
                <tr><td>Session Type</td><td>${sessionType}</td></tr>
                <tr><td>Duration</td><td>${duration_minutes} minutes</td></tr>
                <tr><td>Session Fee</td><td>Rs ${session_fee}</td></tr>
                <tr><td>Confirmation #</td><td>${confirmation_number}</td></tr>
              </table>

              <div class="checklist">
                <h4> Before You Go — Quick Checklist</h4>
                <ul>
                  <li>Arrive 10–15 minutes early</li>
                  <li>Bring a valid ID</li>
                  <li>Bring any relevant medical records or previous therapy notes</li>
                  <li>Have your confirmation number ready: <strong>${confirmation_number}</strong></li>
                </ul>
              </div>

              <p>We look forward to seeing you. Take care!</p>
              <p>Best regards,<br><strong>The Mentra Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated reminder. Please do not reply to this message.</p>
              <p>&copy; 2026 Mentra - Mental Health Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(' Reminder email sent to:', patient_email, '| ID:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error(' Error sending reminder email:', error);
    return { success: false };
  }
};

// ── Doctor Approval / Rejection Email ────────────────────────────────────────
export const sendDoctorStatusEmail = async (doctor, status) => {
  try {
    const transporter = createTransporter();
    const isApproved = status === 'approved';

    await transporter.sendMail({
      from: `"Mentra - Mental Health Platform" <${process.env.EMAIL_USER}>`,
      to: doctor.email,
      subject: isApproved
        ? ' Your Mentra Doctor Account Has Been Approved'
        : 'Update on Your Mentra Doctor Application',
      html: `
        <!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0}
          .container{max-width:600px;margin:0 auto;padding:20px;background-color:#f9f9f9}
          .header{background:linear-gradient(135deg,${isApproved ? '#4A7C59,#3d6b4a' : '#c0392b,#a93226'});color:white;padding:30px 20px;text-align:center;border-radius:8px 8px 0 0}
          .header h1{margin:0;font-size:24px}
          .header p{margin:8px 0 0;opacity:.9;font-size:14px}
          .content{background-color:white;padding:30px;border-radius:0 0 8px 8px}
          .status-box{background-color:${isApproved ? '#d1fae5' : '#fee2e2'};border:2px solid ${isApproved ? '#10b981' : '#ef4444'};border-radius:8px;padding:20px;text-align:center;margin:20px 0}
          .status-box p{margin:0;color:${isApproved ? '#065f46' : '#991b1b'};font-size:15px;font-weight:600}
          .info-box{background-color:#F5F5F0;border-left:4px solid #4A7C59;padding:14px;margin:20px 0;border-radius:0 6px 6px 0;font-size:14px}
          .footer{text-align:center;margin-top:20px;font-size:12px;color:#888}
        </style></head><body>
          <div class="container">
            <div class="header">
              <h1>${isApproved ? ' Account Approved' : '❌ Application Update'}</h1>
              <p>${isApproved ? 'Welcome to the Mentra doctor network' : 'Regarding your Mentra doctor application'}</p>
            </div>
            <div class="content">
              <p>Hi <strong>Dr. ${doctor.full_name}</strong>,</p>
              ${isApproved ? `
                <div class="status-box"><p> Your doctor account has been approved by the Mentra admin team.</p></div>
                <p>You can now log in to your Mentra doctor dashboard and:</p>
                <ul>
                  <li>Set up your availability schedule</li>
                  <li>Accept patient appointments</li>
                  <li>Manage your profile and sessions</li>
                </ul>
                <div class="info-box"> Log in at <strong>mentra.com</strong> using your registered email and password.</div>
              ` : `
                <div class="status-box"><p> Unfortunately, your doctor account application has been rejected by the Mentra admin team.</p></div>
                <p>This may be due to incomplete or unverifiable documentation. If you believe this is a mistake or would like to reapply, please contact our support team.</p>
                <div class="info-box"> Reach out to us at <strong>support@mentra.com</strong> for further assistance.</div>
              `}
              <p>Best regards,<br><strong>The Mentra Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2026 Mentra - Mental Health Platform. All rights reserved.</p>
            </div>
          </div>
        </body></html>
      `
    });

    console.log(`Doctor ${status} email sent to: ${doctor.email}`);
    return { success: true };
  } catch (err) {
    console.error('Doctor status email error:', err);
    return { success: false };
  }
};

// ── Patient Account Deactivation Email ───────────────────────────────────────
export const sendPatientDeactivationEmail = async (patient, adminMessage = '') => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Mentra - Mental Health Platform" <${process.env.EMAIL_USER}>`,
      to: patient.email,
      subject: '⚠️ Your Mentra Account Has Been Deactivated',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #c0392b, #a93226); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .status-box { background-color: #fee2e2; border: 2px solid #ef4444; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
            .status-box p { margin: 0; color: #991b1b; font-size: 15px; font-weight: 600; }
            .admin-message { background-color: #fff8e1; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0; }
            .admin-message h4 { margin: 0 0 8px; color: #92400e; font-size: 14px; font-weight: 600; }
            .admin-message p { margin: 0; color: #451a03; font-size: 14px; white-space: pre-line; }
            .info-box { background-color: #F5F5F0; border-left: 4px solid #c0392b; padding: 14px; margin: 20px 0; border-radius: 0 6px 6px 0; font-size: 14px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Account Deactivated</h1>
              <p>Your Mentra account has been deactivated</p>
            </div>
            <div class="content">
              <p>Hi <strong>${patient.full_name}</strong>,</p>
              
              <div class="status-box">
                <p>⚠️ Your Mentra patient account has been deactivated by the admin team.</p>
              </div>

              ${adminMessage ? `
                <div class="admin-message">
                  <h4>📝 Message from Admin:</h4>
                  <p>${adminMessage}</p>
                </div>
              ` : `
                <p>Your account has been deactivated due to a violation of our terms of service or community guidelines.</p>
              `}

              <p>This means you will no longer be able to:</p>
              <ul>
                <li>Log in to your Mentra account</li>
                <li>Book new appointments</li>
                <li>Access your appointment history</li>
                <li>Use Mentra services</li>
              </ul>

              <div class="info-box">
                📧 If you believe this is a mistake or would like to appeal this decision, please contact our support team at <strong>support@mentra.com</strong>
              </div>

              <p>Best regards,<br><strong>The Mentra Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2026 Mentra - Mental Health Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log(`Patient deactivation email sent to: ${patient.email}`);
    return { success: true };
  } catch (err) {
    console.error('Patient deactivation email error:', err);
    return { success: false };
  }
};

// ── Doctor Rejection Email with Custom Message ───────────────────────────────
export const sendDoctorRejectionEmail = async (doctor, adminMessage = '') => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Mentra - Mental Health Platform" <${process.env.EMAIL_USER}>`,
      to: doctor.email,
      subject: 'Update on Your Mentra Doctor Application',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #c0392b, #a93226); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .status-box { background-color: #fee2e2; border: 2px solid #ef4444; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
            .status-box p { margin: 0; color: #991b1b; font-size: 15px; font-weight: 600; }
            .admin-message { background-color: #fff8e1; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0; }
            .admin-message h4 { margin: 0 0 8px; color: #92400e; font-size: 14px; font-weight: 600; }
            .admin-message p { margin: 0; color: #451a03; font-size: 14px; white-space: pre-line; }
            .info-box { background-color: #F5F5F0; border-left: 4px solid #c0392b; padding: 14px; margin: 20px 0; border-radius: 0 6px 6px 0; font-size: 14px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Application Update</h1>
              <p>Regarding your Mentra doctor application</p>
            </div>
            <div class="content">
              <p>Hi <strong>Dr. ${doctor.full_name}</strong>,</p>
              
              <div class="status-box">
                <p>❌ Unfortunately, your doctor account application has been rejected by the Mentra admin team.</p>
              </div>

              ${adminMessage ? `
                <div class="admin-message">
                  <h4>📝 Reason for Rejection:</h4>
                  <p>${adminMessage}</p>
                </div>
              ` : `
                <p>This may be due to incomplete or unverifiable documentation. If you believe this is a mistake or would like to reapply, please contact our support team.</p>
              `}

              <div class="info-box">
                📧 If you would like to reapply or have questions about this decision, please reach out to us at <strong>support@mentra.com</strong>
              </div>

              <p>Best regards,<br><strong>The Mentra Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2026 Mentra - Mental Health Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log(`Doctor rejection email sent to: ${doctor.email}`);
    return { success: true };
  } catch (err) {
    console.error('Doctor rejection email error:', err);
    return { success: false };
  }
};
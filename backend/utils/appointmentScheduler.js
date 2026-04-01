import pool from "../db/index.js";
import { sendAppointmentReminderEmail } from "./emailService.js";

// Auto-confirm pending appointments that are within 5 hours of scheduled time
const autoConfirmPendingAppointments = async () => {
  try {
    const result = await pool.query(
      `UPDATE appointments
       SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP
       WHERE status = 'pending'
         AND (appointment_date + appointment_time::interval) <= (NOW() + INTERVAL '5 hours')
         AND (appointment_date + appointment_time::interval) > NOW()
       RETURNING id, patient_first_name, patient_last_name, doctor_name, appointment_date, appointment_time`
    );

    if (result.rows.length > 0) {
      console.log(`✅ Auto-confirmed ${result.rows.length} pending appointment(s):`);
      result.rows.forEach(apt => {
        console.log(`   - #${apt.id} | ${apt.patient_first_name} ${apt.patient_last_name} → Dr. ${apt.doctor_name} | ${apt.appointment_date} ${apt.appointment_time}`);
      });
    }
  } catch (err) {
    console.error('❌ Auto-confirm scheduler error:', err.message);
  }
};

// Send reminder emails for appointments happening in the next hour
const sendAppointmentReminders = async () => {
  try {
    // Find confirmed appointments between 55 and 65 minutes from now
    // (window prevents duplicate sends if scheduler runs slightly off-time)
    const result = await pool.query(
      `SELECT * FROM appointments
       WHERE status = 'confirmed'
         AND reminder_sent = FALSE
         AND (appointment_date + appointment_time::interval) BETWEEN (NOW() + INTERVAL '55 minutes') AND (NOW() + INTERVAL '65 minutes')`
    );

    if (result.rows.length > 0) {
      console.log(`📧 Sending ${result.rows.length} reminder email(s)...`);
      for (const apt of result.rows) {
        const emailResult = await sendAppointmentReminderEmail(apt);
        if (emailResult.success) {
          // Mark reminder as sent so we don't send it again
          await pool.query(
            'UPDATE appointments SET reminder_sent = TRUE WHERE id = $1',
            [apt.id]
          );
          console.log(`   ✅ Reminder sent for appointment #${apt.id} — ${apt.patient_first_name} ${apt.patient_last_name}`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Reminder scheduler error:', err.message);
  }
};

// Start the scheduler — runs every 15 minutes
export const startAppointmentScheduler = () => {
  console.log('⏰ Appointment scheduler started (auto-confirm + reminders, every 15 min)');

  // Run immediately on startup
  autoConfirmPendingAppointments();
  sendAppointmentReminders();

  // Then every 15 minutes
  setInterval(() => {
    autoConfirmPendingAppointments();
    sendAppointmentReminders();
  }, 15 * 60 * 1000);
};

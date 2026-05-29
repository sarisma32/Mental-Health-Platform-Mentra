import pool from "../db/index.js";
import { createNotification } from "./notificationController.js";

// Patient submits a review after a completed appointment
export const submitReview = async (req, res) => {
  try {
    const { appointmentId, rating, reviewText, ratingProfessionalism, ratingCommunication, ratingWaitTime } = req.body;

    if (!appointmentId || !rating) {
      return res.status(400).json({ success: false, message: "Appointment ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    // Verify appointment exists and is completed
    const appointment = await pool.query(
      "SELECT * FROM appointments WHERE id = $1 AND status = 'completed'",
      [appointmentId]
    );

    if (appointment.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Completed appointment not found" });
    }

    const apt = appointment.rows[0];

    // Check if review already exists for this appointment
    const existing = await pool.query(
      "SELECT id FROM reviews WHERE appointment_id = $1",
      [appointmentId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: "You have already submitted a review for this appointment" });
    }

    const result = await pool.query(
      `INSERT INTO reviews (appointment_id, patient_id, doctor_id, rating, review_text, rating_professionalism, rating_communication, rating_wait_time, is_visible)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false) RETURNING *`,
      [appointmentId, apt.patient_id, apt.doctor_id, rating, reviewText || null,
       ratingProfessionalism || null, ratingCommunication || null, ratingWaitTime || null]
    );

    res.status(201).json({ success: true, message: "Review submitted successfully.", review: result.rows[0] });

    // Notify admin about new review
    createNotification({
      recipientType: 'admin',
      type: 'new_review',
      title: 'New Review Submitted',
      message: `A patient left a ${rating}-star review for Dr. ${apt.doctor_name}. Pending your approval.`
    });
  } catch (err) {
    console.error("Submit review error:", err);
    res.status(500).json({ success: false, message: "Failed to submit review" });
  }
};

// Check if patient already reviewed a specific appointment
export const checkReviewExists = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const result = await pool.query("SELECT id FROM reviews WHERE appointment_id = $1", [appointmentId]);
    res.json({ success: true, hasReview: result.rows.length > 0 });
  } catch (err) {
    console.error("Check review error:", err);
    res.status(500).json({ success: false, message: "Failed to check review" });
  }
};

// Admin: get all reviews
export const getReviewsForAdmin = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.*,
        a.appointment_date,
        a.appointment_time,
        a.patient_first_name,
        a.patient_last_name,
        a.patient_email,
        d.full_name as doctor_full_name,
        d.specialization as doctor_specialization
      FROM reviews r
      JOIN appointments a ON r.appointment_id = a.id
      JOIN doctors d ON r.doctor_id = d.id
      ORDER BY r.created_at DESC
    `);

    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_visible = true) as visible,
        COUNT(*) FILTER (WHERE is_visible = false) as hidden,
        ROUND(AVG(rating)::numeric, 1) as avg_rating
      FROM reviews
    `);

    res.json({ success: true, reviews: result.rows, stats: stats.rows[0] });
  } catch (err) {
    console.error("Get reviews for admin error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

// Admin: toggle visibility (hide/unhide)
export const updateReviewVisibility = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isVisible } = req.body;

    const result = await pool.query(
      "UPDATE reviews SET is_visible = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [isVisible, reviewId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.json({ success: true, message: `Review ${isVisible ? 'approved and visible' : 'hidden'}`, review: result.rows[0] });

    // If admin approved the review, notify the doctor
    if (isVisible) {
      const review = result.rows[0];
      // Get patient name from the appointment
      const aptResult = await pool.query(
        "SELECT patient_first_name, patient_last_name FROM appointments WHERE id = $1",
        [review.appointment_id]
      );
      const patientName = aptResult.rows.length > 0
        ? `${aptResult.rows[0].patient_first_name} ${aptResult.rows[0].patient_last_name}`
        : 'A patient';

      createNotification({
        recipientType: 'doctor',
        recipientId: review.doctor_id,
        type: 'new_review',
        title: 'New Review Approved',
        message: `${patientName} left you a ${review.rating}-star review. It is now visible on your profile.`
      });
    }
  } catch (err) {
    console.error("Update review visibility error:", err);
    res.status(500).json({ success: false, message: "Failed to update review" });
  }
};

// Admin: delete review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const result = await pool.query("DELETE FROM reviews WHERE id = $1 RETURNING *", [reviewId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({ success: false, message: "Failed to delete review" });
  }
};

// Doctor: get only visible (approved) reviews for their profile
export const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const result = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.review_text,
        r.rating_professionalism,
        r.rating_communication,
        r.rating_wait_time,
        r.created_at,
        a.patient_first_name,
        a.patient_last_name,
        a.appointment_date,
        p.profile_photo as patient_photo
      FROM reviews r
      JOIN appointments a ON r.appointment_id = a.id
      LEFT JOIN patients p ON p.id = a.patient_id
      WHERE r.doctor_id = $1 AND r.is_visible = true
      ORDER BY r.created_at DESC
    `, [doctorId]);

    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        ROUND(AVG(rating)::numeric, 1) as avg_rating
      FROM reviews
      WHERE doctor_id = $1 AND is_visible = true
    `, [doctorId]);

    res.json({
      success: true,
      reviews: result.rows,
      stats: stats.rows[0]
    });
  } catch (err) {
    console.error("Get doctor reviews error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

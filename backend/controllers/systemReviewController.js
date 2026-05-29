import pool from '../db/index.js';
import { createNotification } from './notificationController.js';

// POST /api/system-reviews — patient submits a review
export const submitSystemReview = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { rating, message } = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    if (!message?.trim())
      return res.status(400).json({ success: false, message: 'Message is required.' });

    // One review per patient
    const existing = await pool.query('SELECT id FROM system_reviews WHERE patient_id = $1', [patientId]);
    if (existing.rows.length > 0)
      return res.status(400).json({ success: false, message: 'You have already submitted a system review.' });

    // Get patient name for notification
    const patientResult = await pool.query('SELECT full_name FROM patients WHERE id = $1', [patientId]);
    const patientName = patientResult.rows[0]?.full_name || 'A patient';

    await pool.query(
      'INSERT INTO system_reviews (patient_id, rating, message) VALUES ($1, $2, $3)',
      [patientId, rating, message.trim()]
    );

    // Send notification to admin
    await createNotification({
      recipientType: 'admin',
      recipientId: null,
      type: 'system_review_submitted',
      title: 'New System Review Submitted',
      message: `${patientName} has submitted a ${rating}-star system review for approval.`,
      metadata: { patientId, rating, reviewMessage: message.trim() }
    });

    res.json({ success: true, message: 'Review submitted successfully.' });
  } catch (err) {
    console.error('Submit system review error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};

// GET /api/system-reviews/public — latest 3 approved reviews for homepage
export const getPublicSystemReviews = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT sr.id, sr.rating, sr.message, sr.created_at,
             p.full_name, p.profile_photo
      FROM system_reviews sr
      JOIN patients p ON p.id = sr.patient_id
      WHERE sr.is_approved = TRUE
      ORDER BY sr.created_at DESC
      LIMIT 3
    `);
    res.json({ success: true, reviews: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
};

// GET /api/system-reviews/admin — all reviews for admin
export const getAdminSystemReviews = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT sr.id, sr.rating, sr.message, sr.is_approved, sr.created_at,
             p.full_name, p.profile_photo, p.email
      FROM system_reviews sr
      JOIN patients p ON p.id = sr.patient_id
      ORDER BY sr.created_at DESC
    `);
    res.json({ success: true, reviews: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
};

// PUT /api/system-reviews/admin/:id/approve
export const approveSystemReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { approve } = req.body; // true or false

    // Get review details and patient info for notification
    const reviewResult = await pool.query(`
      SELECT sr.patient_id, sr.rating, sr.message, p.full_name 
      FROM system_reviews sr 
      JOIN patients p ON p.id = sr.patient_id 
      WHERE sr.id = $1
    `, [id]);

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const { patient_id, rating, message, full_name } = reviewResult.rows[0];

    await pool.query('UPDATE system_reviews SET is_approved = $1 WHERE id = $2', [approve, id]);

    // Send notification to patient
    const notificationTitle = approve ? 'System Review Approved' : 'System Review Not Approved';
    const notificationMessage = approve 
      ? `Great news! Your ${rating}-star system review has been approved and is now visible on the homepage.`
      : `Your ${rating}-star system review was not approved for display. Please contact support if you have questions.`;

    await createNotification({
      recipientType: 'patient',
      recipientId: patient_id,
      type: approve ? 'system_review_approved' : 'system_review_rejected',
      title: notificationTitle,
      message: notificationMessage,
      metadata: { reviewId: id, rating, approved: approve }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Approve system review error:', err);
    res.status(500).json({ success: false, message: 'Failed to update review.' });
  }
};

// DELETE /api/system-reviews/admin/:id
export const deleteSystemReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Get review details and patient info for notification
    const reviewResult = await pool.query(`
      SELECT sr.patient_id, sr.rating, p.full_name 
      FROM system_reviews sr 
      JOIN patients p ON p.id = sr.patient_id 
      WHERE sr.id = $1
    `, [id]);

    if (reviewResult.rows.length > 0) {
      const { patient_id, rating } = reviewResult.rows[0];

      // Send notification to patient before deleting
      await createNotification({
        recipientType: 'patient',
        recipientId: patient_id,
        type: 'system_review_deleted',
        title: 'System Review Removed',
        message: `Your ${rating}-star system review has been removed by the administrator.`,
        metadata: { reviewId: id, rating }
      });
    }

    await pool.query('DELETE FROM system_reviews WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete system review error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
};

// GET /api/system-reviews/my — check if patient already submitted
export const getMySystemReview = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { rows } = await pool.query('SELECT id, rating, message, is_approved FROM system_reviews WHERE patient_id = $1', [patientId]);
    res.json({ success: true, review: rows[0] || null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch review.' });
  }
};

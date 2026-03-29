import pool from "../db/index.js";

// Get notifications for a recipient (doctor or admin)
export const getNotifications = async (req, res) => {
  try {
    const { recipientType, recipientId } = req.params;

    let query = `SELECT * FROM notifications WHERE recipient_type = $1`;
    const params = [recipientType];

    // For doctor, filter by their specific ID
    if (recipientType === 'doctor' && recipientId && recipientId !== 'all') {
      query += ` AND (recipient_id = $2 OR recipient_id IS NULL)`;
      params.push(parseInt(recipientId));
    }
    // For admin, no extra filter — get all admin notifications

    query += ` ORDER BY created_at DESC LIMIT 50`;

    const result = await pool.query(query, params);
    const unreadCount = result.rows.filter(n => !n.is_read).length;

    res.json({ success: true, notifications: result.rows, unreadCount });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// Mark a single notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await pool.query(
      "UPDATE notifications SET is_read = true WHERE id = $1",
      [parseInt(notificationId)]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ success: false, message: "Failed to mark notification as read" });
  }
};

// Mark all notifications as read for a recipient
export const markAllAsRead = async (req, res) => {
  try {
    const { recipientType, recipientId } = req.params;

    let query = `UPDATE notifications SET is_read = true WHERE recipient_type = $1`;
    const params = [recipientType];

    if (recipientType === 'doctor' && recipientId && recipientId !== 'all') {
      query += ` AND (recipient_id = $2 OR recipient_id IS NULL)`;
      params.push(parseInt(recipientId));
    }

    await pool.query(query, params);
    res.json({ success: true });
  } catch (err) {
    console.error("Mark all as read error:", err);
    res.status(500).json({ success: false, message: "Failed to mark all as read" });
  }
};

// Helper: create a notification (used internally by other controllers)
export const createNotification = async ({ recipientType, recipientId = null, type, title, message }) => {
  try {
    await pool.query(
      `INSERT INTO notifications (recipient_type, recipient_id, type, title, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [recipientType, recipientId, type, title, message]
    );
  } catch (err) {
    console.error("Create notification error:", err);
  }
};

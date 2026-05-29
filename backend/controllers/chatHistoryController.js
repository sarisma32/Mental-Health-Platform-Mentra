import pool from '../db/index.js';

// GET /api/chat-history/conversations
export const getConversations = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { rows } = await pool.query(
      `SELECT id, title, created_at, updated_at
       FROM chat_conversations
       WHERE patient_id = $1
       ORDER BY updated_at DESC`,
      [patientId]
    );
    res.json({ success: true, conversations: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/chat-history/conversations/:id/messages
export const getMessages = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params;

    // verify ownership
    const conv = await pool.query(
      'SELECT id FROM chat_conversations WHERE id = $1 AND patient_id = $2',
      [id, patientId]
    );
    if (!conv.rows.length) return res.status(404).json({ success: false, message: 'Conversation not found.' });

    const { rows } = await pool.query(
      `SELECT id, role, text, metadata, created_at
       FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
      [id]
    );
    res.json({ success: true, messages: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/chat-history/conversations
export const createConversation = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { id, title } = req.body;
    await pool.query(
      `INSERT INTO chat_conversations (id, patient_id, title)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [id, patientId, title || 'New Chat']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/chat-history/conversations/:id
export const updateConversation = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params;
    const { title } = req.body;
    await pool.query(
      `UPDATE chat_conversations SET title = $1, updated_at = NOW()
       WHERE id = $2 AND patient_id = $3`,
      [title, id, patientId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/chat-history/conversations/:id/messages
export const saveMessage = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params;
    const { role, text, metadata = {} } = req.body;

    // verify ownership
    const conv = await pool.query(
      'SELECT id FROM chat_conversations WHERE id = $1 AND patient_id = $2',
      [id, patientId]
    );
    if (!conv.rows.length) return res.status(404).json({ success: false, message: 'Conversation not found.' });

    const { rows } = await pool.query(
      `INSERT INTO chat_messages (conversation_id, role, text, metadata)
       VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
      [id, role, text, JSON.stringify(metadata)]
    );

    // bump updated_at on conversation
    await pool.query(
      'UPDATE chat_conversations SET updated_at = NOW() WHERE id = $1',
      [id]
    );

    res.json({ success: true, message: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/chat-history/conversations/:id
export const deleteConversation = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params;
    await pool.query(
      'DELETE FROM chat_conversations WHERE id = $1 AND patient_id = $2',
      [id, patientId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

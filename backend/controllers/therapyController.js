import pool from '../db/index.js';
import { createNotification } from './notificationController.js';

// ── Doctor: Assign task to patient ───────────────────────────────────────────
export const assignTask = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientId, title, description, type, deadline, frequency } = req.body;
    if (!patientId || !title || !type || !deadline || !frequency)
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });

    // Verify this patient has had an appointment with this doctor
    const relationship = await pool.query(
      `SELECT id FROM appointments WHERE doctor_id = $1 AND patient_id = $2 AND status NOT IN ('cancelled', 'no_show') LIMIT 1`,
      [doctorId, patientId]
    );
    if (!relationship.rows.length)
      return res.status(403).json({ success: false, message: 'You can only assign tasks to patients who have had appointments with you.' });

    const result = await pool.query(
      `INSERT INTO therapy_tasks (doctor_id, patient_id, title, description, type, deadline, frequency)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [doctorId, patientId, title, description || null, type, deadline, frequency]
    );
    const task = result.rows[0];

    // Get doctor name for notification
    const doc = await pool.query('SELECT full_name FROM doctors WHERE id=$1', [doctorId]);
    const pat = await pool.query('SELECT full_name FROM patients WHERE id=$1', [patientId]);
    
    // Notify patient about new task
    createNotification({
      recipientType: 'patient', recipientId: patientId,
      type: 'task_assigned',
      title: 'New Therapy Task Assigned',
      message: `Dr. ${doc.rows[0]?.full_name} assigned you a new task: "${title}". Due: ${new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`,
    });

    // Notify admin about task assignment
    createNotification({
      recipientType: 'admin',
      type: 'task_assigned',
      title: 'Therapy Task Assigned',
      message: `Dr. ${doc.rows[0]?.full_name} assigned a ${type} task "${title}" to ${pat.rows[0]?.full_name}.`,
    });

    res.status(201).json({ success: true, task });
  } catch (err) {
    console.error('Assign task error:', err);
    res.status(500).json({ success: false, message: 'Failed to assign task.' });
  }
};

// ── Doctor: Get all tasks assigned to a patient ───────────────────────────────
export const getDoctorTasks = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientId } = req.query;
    let query = `
      SELECT t.*, p.full_name as patient_name,
        f.difficulty, f.comment as feedback_comment,
        c.completed_at
      FROM therapy_tasks t
      JOIN patients p ON p.id = t.patient_id
      LEFT JOIN therapy_task_feedback f ON f.task_id = t.id
      LEFT JOIN therapy_task_completions c ON c.task_id = t.id
      WHERE t.doctor_id = $1
    `;
    const params = [doctorId];
    if (patientId) { params.push(patientId); query += ` AND t.patient_id = $${params.length}`; }
    query += ` ORDER BY t.created_at DESC`;
    const result = await pool.query(query, params);
    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error('Get doctor tasks error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks.' });
  }
};

// ── Doctor: Update a task ─────────────────────────────────────────────────────
export const updateTask = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { taskId } = req.params;
    const { title, description, type, deadline, frequency } = req.body;

    const check = await pool.query('SELECT id FROM therapy_tasks WHERE id=$1 AND doctor_id=$2', [taskId, doctorId]);
    if (!check.rows.length) return res.status(404).json({ success: false, message: 'Task not found.' });

    const result = await pool.query(
      `UPDATE therapy_tasks SET title=$1, description=$2, type=$3, deadline=$4, frequency=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [title, description || null, type, deadline, frequency, taskId]
    );

    // Notify patient about the update
    const doc = await pool.query('SELECT full_name FROM doctors WHERE id=$1', [doctorId]);
    createNotification({
      recipientType: 'patient',
      recipientId: result.rows[0].patient_id,
      type: 'task_assigned',
      title: 'Therapy Task Updated',
      message: `Dr. ${doc.rows[0]?.full_name} has updated your task: "${title}".`,
    });

    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ success: false, message: 'Failed to update task.' });
  }
};

// ── Doctor: Delete a task ─────────────────────────────────────────────────────
export const deleteTask = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { taskId } = req.params;
    const check = await pool.query('SELECT id FROM therapy_tasks WHERE id=$1 AND doctor_id=$2', [taskId, doctorId]);
    if (!check.rows.length) return res.status(404).json({ success: false, message: 'Task not found.' });
    await pool.query('DELETE FROM therapy_tasks WHERE id=$1', [taskId]);
    res.json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete task.' });
  }
};

// ── Patient: Get assigned tasks ───────────────────────────────────────────────
export const getPatientTasks = async (req, res) => {
  try {
    const patientId = req.user.id;
    const result = await pool.query(
      `SELECT t.*, d.full_name as doctor_name,
        f.difficulty, f.comment as feedback_comment,
        c.completed_at
       FROM therapy_tasks t
       JOIN doctors d ON d.id = t.doctor_id
       LEFT JOIN therapy_task_feedback f ON f.task_id = t.id
       LEFT JOIN therapy_task_completions c ON c.task_id = t.id
       WHERE t.patient_id = $1
       ORDER BY t.deadline ASC, t.created_at DESC`,
      [patientId]
    );
    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error('Get patient tasks error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks.' });
  }
};

// ── Patient: Mark task as completed ──────────────────────────────────────────
export const completeTask = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { taskId } = req.params;
    const check = await pool.query('SELECT * FROM therapy_tasks WHERE id=$1 AND patient_id=$2', [taskId, patientId]);
    if (!check.rows.length) return res.status(404).json({ success: false, message: 'Task not found.' });
    if (check.rows[0].status === 'completed')
      return res.status(400).json({ success: false, message: 'Task already completed.' });

    await pool.query(`UPDATE therapy_tasks SET status='completed', updated_at=NOW() WHERE id=$1`, [taskId]);
    await pool.query(`INSERT INTO therapy_task_completions (task_id) VALUES ($1)`, [taskId]);

    // Notify doctor
    const task = check.rows[0];
    const pat = await pool.query('SELECT full_name FROM patients WHERE id=$1', [patientId]);
    createNotification({
      recipientType: 'doctor', recipientId: task.doctor_id,
      type: 'task_completed',
      title: 'Task Completed',
      message: `${pat.rows[0]?.full_name} completed the task: "${task.title}".`,
    });

    res.json({ success: true, message: 'Task marked as completed.' });
  } catch (err) {
    console.error('Complete task error:', err);
    res.status(500).json({ success: false, message: 'Failed to complete task.' });
  }
};

// ── Patient: Submit feedback ──────────────────────────────────────────────────
export const submitFeedback = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { taskId } = req.params;
    const { difficulty, comment } = req.body;
    if (!difficulty) return res.status(400).json({ success: false, message: 'Difficulty is required.' });

    const check = await pool.query('SELECT * FROM therapy_tasks WHERE id=$1 AND patient_id=$2', [taskId, patientId]);
    if (!check.rows.length) return res.status(404).json({ success: false, message: 'Task not found.' });

    await pool.query(
      `INSERT INTO therapy_task_feedback (task_id, difficulty, comment)
       VALUES ($1,$2,$3)
       ON CONFLICT (task_id) DO UPDATE SET difficulty=$2, comment=$3`,
      [taskId, difficulty, comment || null]
    );

    // Notify doctor about feedback submission
    const task = check.rows[0];
    const pat = await pool.query('SELECT full_name FROM patients WHERE id=$1', [patientId]);
    const difficultyText = difficulty === 'easy' ? 'Easy' : difficulty === 'medium' ? 'Medium' : 'Hard';
    
    createNotification({
      recipientType: 'doctor',
      recipientId: task.doctor_id,
      type: 'task_feedback',
      title: 'Task Feedback Received',
      message: `${pat.rows[0]?.full_name} submitted feedback for "${task.title}" - Difficulty: ${difficultyText}${comment ? '. Comment: ' + comment.substring(0, 50) + (comment.length > 50 ? '...' : '') : ''}.`,
    });

    res.json({ success: true, message: 'Feedback submitted.' });
  } catch (err) {
    console.error('Submit feedback error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit feedback.' });
  }
};

// ── Patient: Get progress stats ───────────────────────────────────────────────
export const getPatientProgress = async (req, res) => {
  try {
    const patientId = req.user.id;
    const tasks = await pool.query('SELECT * FROM therapy_tasks WHERE patient_id=$1', [patientId]);
    const total = tasks.rows.length;
    const completed = tasks.rows.filter(t => t.status === 'completed').length;
    const pending = tasks.rows.filter(t => t.status === 'pending').length;
    const missed = tasks.rows.filter(t => t.status === 'missed').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Streak: consecutive days with at least one completion
    const completions = await pool.query(
      `SELECT DATE(completed_at) as day FROM therapy_task_completions c
       JOIN therapy_tasks t ON t.id = c.task_id
       WHERE t.patient_id=$1
       ORDER BY day DESC`,
      [patientId]
    );
    let streak = 0;
    const days = [...new Set(completions.rows.map(r => r.day?.toISOString().split('T')[0]))];
    const today = new Date();
    for (let i = 0; i < days.length; i++) {
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      if (days[i] === expected.toISOString().split('T')[0]) streak++;
      else break;
    }

    res.json({ success: true, stats: { total, completed, pending, missed, completionRate, streak } });
  } catch (err) {
    console.error('Progress error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch progress.' });
  }
};

// ── Doctor: Get progress for a specific patient ───────────────────────────────
export const getDoctorPatientProgress = async (req, res) => {
  try {
    const { patientId } = req.params;
    const tasks = await pool.query('SELECT * FROM therapy_tasks WHERE patient_id=$1 AND doctor_id=$2', [patientId, req.user.id]);
    const total = tasks.rows.length;
    const completed = tasks.rows.filter(t => t.status === 'completed').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const feedback = await pool.query(
      `SELECT f.difficulty, COUNT(*) as count FROM therapy_task_feedback f
       JOIN therapy_tasks t ON t.id = f.task_id
       WHERE t.patient_id=$1 AND t.doctor_id=$2
       GROUP BY f.difficulty`,
      [patientId, req.user.id]
    );

    res.json({ success: true, stats: { total, completed, pending: total - completed, completionRate, feedback: feedback.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch progress.' });
  }
};

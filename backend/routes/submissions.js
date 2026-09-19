const express = require('express');
const pool = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, category, description, link } = req.body || {};
    if (!title) return res.status(400).json({ message: 'Task title is required.' });

    const [result] = await pool.query(
      `INSERT INTO submissions (user_id, title, category, description, link, status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [req.user.id, title, category || 'Other', description || '', link || '']
    );

    res.status(201).json({ message: 'Task submitted successfully.', id: result.insertId });
  } catch (err) {
    console.error('create submission error:', err);
    res.status(500).json({ message: 'Could not submit task.' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const base = `
      SELECT s.id, s.title, s.category, s.description, s.link, s.status, s.created_at,
             u.name AS internName, u.email AS internEmail
      FROM submissions s
      JOIN users u ON u.id = s.user_id`;

    const [rows] = req.user.role === 'admin'
      ? await pool.query(`${base} ORDER BY s.created_at DESC`)
      : await pool.query(`${base} WHERE s.user_id = ? ORDER BY s.created_at DESC`, [req.user.id]);

    res.json(rows);
  } catch (err) {
    console.error('get submissions error:', err);
    res.status(500).json({ message: 'Could not load submissions.' });
  }
});

router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {};
    const allowed = ['Pending', 'Approved', 'Rejected'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Status must be Pending, Approved or Rejected.' });
    }

    const [result] = await pool.query(
      'UPDATE submissions SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Submission not found.' });
    }
    res.json({ message: `Marked as ${status}.` });
  } catch (err) {
    console.error('update submission error:', err);
    res.status(500).json({ message: 'Could not update status.' });
  }
});

module.exports = router;
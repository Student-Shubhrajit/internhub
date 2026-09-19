const express = require('express');
const pool = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('get tasks error:', err);
    res.status(500).json({ message: 'Could not load tasks.' });
  }
});

router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, category, description } = req.body || {};
    if (!title) return res.status(400).json({ message: 'Title is required.' });

    const [result] = await pool.query(
      'INSERT INTO tasks (title, category, description, created_by) VALUES (?, ?, ?, ?)',
      [title, category || 'Other', description || '', req.user.id]
    );
    res.status(201).json({ id: result.insertId, title, category, description });
  } catch (err) {
    console.error('create task error:', err);
    res.status(500).json({ message: 'Could not create task.' });
  }
});

module.exports = router;
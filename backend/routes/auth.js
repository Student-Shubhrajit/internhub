const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, adminCode } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    let finalRole = 'intern';
    if (role === 'admin') {
      if (!process.env.ADMIN_SIGNUP_CODE || adminCode !== process.env.ADMIN_SIGNUP_CODE) {
        return res.status(403).json({ message: 'Invalid admin signup code.' });
      }
      finalRole = 'admin';
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, finalRole]
    );

    const user = { id: result.insertId, name, email, role: finalRole };
    res.status(201).json({ message: 'Registered successfully.', token: signToken(user), user });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const row = rows[0];
    const ok = await bcrypt.compare(password, row.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = { id: row.id, name: row.name, email: row.email, role: row.role };
    res.json({ message: 'Login successful.', token: signToken(user), user });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;
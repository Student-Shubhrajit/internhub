// server.js — InternHub backend
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Fail fast if the signing secret is missing, instead of crashing per-request
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is missing from .env. Add it and restart.');
  process.exit(1);
}

const app = express();

// ---- Middleware ----
app.use(cors());              // dev-friendly; lock down origin before deploying
app.use(express.json());

// ---- Serve the frontend from the sibling folder ----
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

// ---- Health check ----
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend connected successfully!' });
});

// ---- API routes ----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/submissions', require('./routes/submissions'));

// ---- Unknown API route: JSON, not HTML ----
app.use('/api', (req, res) => {
  res.status(404).json({ message: `No API route for ${req.method} ${req.originalUrl}` });
});

// ---- Root ----
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// ---- Central error handler ----
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

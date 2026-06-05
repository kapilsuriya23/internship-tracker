const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');

const app = express();

app.use(helmet());

const rawOrigins = process.env.ALLOWED_ORIGINS || '';
const allowedOrigins = rawOrigins
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

console.log('✅ Allowed origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow no-origin requests (Postman, curl)
    if (!origin) return callback(null, true);

    // Allow localhost in development
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }

    // Allow any vercel.app subdomain (covers preview + production deployments)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Allow explicitly whitelisted origins (custom domains etc.)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error(`❌ CORS blocked: ${origin}`);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());
// Handle preflight for all routes
app.options('*', cors());

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Rate limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later.' }
});

app.use('/api/', limiter);
app.use('/api/auth', authLimiter);

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

// ── Health check (used by keep-alive ping) ────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env: process.env.NODE_ENV,
    uptime: Math.floor(process.uptime()) + 's'
  });
});

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  if (err.message?.startsWith('CORS blocked')) {
    return res.status(403).json({ error: err.message });
  }
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// ── Connect DB then start ─────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
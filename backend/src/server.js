const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security: Disable X-Powered-By header to prevent technology footprinting
app.disable('x-powered-by');

const {
  globalLimiter,
  authLimiter,
  transactionLimiter,
  sanitizeAndProtect,
  botAndExploitShield,
  strictSecurityHeaders
} = require('./middleware/securityMiddleware');

// Security & Privacy Headers Middleware (Completely blocks Camera, Mic, Geolocation, Sensors & Tracking)
app.use(strictSecurityHeaders);

// Bot, Exploit & Hacker Scanner Shield
app.use(botAndExploitShield);

// Global Anti-DDoS / Flooding Rate Limiter
app.use('/api', globalLimiter);

// Input Sanitization against XSS & Payload Injections
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(sanitizeAndProtect);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static uploads for payment screenshots with explicit cross-origin policy
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, '../uploads')));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes with specialized protection
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api/transactions', transactionLimiter, require('./routes/transactionRoutes'));
app.use('/api/referrals', require('./routes/referralRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));

// Health check (Sanitized - no internal infrastructure leak)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'Protected API Gateway Operational',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (Safe, sanitized)
app.use((err, req, res, next) => {
  console.error('[Error Handler]:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal request processing error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Student Invest Server running on http://localhost:${PORT}`);
});

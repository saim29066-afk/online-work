const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Vercel / Cloud deployment
app.set('trust proxy', 1);

// Security: Disable X-Powered-By header
app.disable('x-powered-by');

// 1. CORS first before any other middleware or routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const {
  globalLimiter,
  authLimiter,
  transactionLimiter,
  sanitizeAndProtect,
  botAndExploitShield,
  strictSecurityHeaders
} = require('./middleware/securityMiddleware');

// 2. Security Headers & Shield
app.use(strictSecurityHeaders);
app.use(botAndExploitShield);

// 3. Body parsers & Sanitization
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeAndProtect);

// 4. Rate limiters
app.use('/api', globalLimiter);

// 5. Serve static uploads for payment screenshots
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, '../uploads')));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// 6. Routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api/transactions', transactionLimiter, require('./routes/transactionRoutes'));
app.use('/api/referrals', require('./routes/referralRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'API Gateway Operational',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error Handler]:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal request processing error'
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Student Invest Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

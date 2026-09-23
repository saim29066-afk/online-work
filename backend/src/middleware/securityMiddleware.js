const rateLimit = require('express-rate-limit');

// 1. GLOBAL API RATE LIMITER (DDoS & Flooding Shield)
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Allow up to 1000 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'High traffic detected. Please slow down your requests.'
  }
});

// 2. AUTH RATE LIMITER (Generous for multi-user mobile testing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Generous limit so mobile users on shared networks never get blocked
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in a few minutes.'
  }
});

// 3. TRANSACTION RATE LIMITER
const transactionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many transactions submitted in a short period. Please wait a moment.'
  }
});

// 4. SANITIZATION: Recursive input cleaner that NEVER corrupts passwords
const SENSITIVE_KEYS = ['password', 'confirmPassword', 'currentPassword', 'newPassword', 'token'];

const sanitizeValue = (val, key = '') => {
  if (SENSITIVE_KEYS.includes(key)) {
    return val; // Never alter passwords
  }
  if (typeof val === 'string') {
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  }
  if (Array.isArray(val)) {
    return val.map((v) => sanitizeValue(v, key));
  }
  if (val !== null && typeof val === 'object') {
    const cleanObj = {};
    for (const k of Object.keys(val)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      cleanObj[k] = sanitizeValue(val[k], k);
    }
    return cleanObj;
  }
  return val;
};

// 5. INPUT SANITIZATION MIDDLEWARE
const sanitizeAndProtect = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params);
  }
  next();
};

// 6. BOT & EXPLOIT SHIELD
const botAndExploitShield = (req, res, next) => {
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const url = req.url.toLowerCase();

  // Block known automated attack scanners
  const blockedAgents = ['sqlmap', 'nikto', 'dirbuster', 'gobuster', 'masscan', 'wpscan', 'nmap', 'havij', 'acunetix'];
  if (blockedAgents.some(agent => userAgent.includes(agent))) {
    return res.status(403).json({ success: false, message: 'Access Denied by Security Shield.' });
  }

  // Block path traversal and sensitive file probes
  const suspiciousPatterns = [
    '/.env',
    '/.git',
    '/.svn',
    '/.aws',
    '/.ssh',
    '/wp-admin',
    '/wp-login',
    '/phpmyadmin',
    '/xmlrpc.php',
    '/cgi-bin/',
    '/etc/passwd',
    'cmd.exe'
  ];

  if (suspiciousPatterns.some(pattern => url.includes(pattern))) {
    return res.status(404).json({ success: false, message: 'Endpoint not found.' });
  }

  next();
};

// 7. PERMISSIONS & SECURITY HEADERS
const strictSecurityHeaders = (req, res, next) => {
  const permissionsPolicy = [
    'geolocation=()',
    'camera=()',
    'microphone=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()',
    'ambient-light-sensor=()'
  ].join(', ');

  res.setHeader('Permissions-Policy', permissionsPolicy);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Server', 'Protected-Edge-Network');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  }

  next();
};

module.exports = {
  globalLimiter,
  authLimiter,
  transactionLimiter,
  sanitizeAndProtect,
  botAndExploitShield,
  strictSecurityHeaders
};

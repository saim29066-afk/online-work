const rateLimit = require('express-rate-limit');

// 1. GLOBAL API RATE LIMITER (DDoS & Flooding Shield)
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'High traffic detected from your IP. Please slow down your requests.'
  }
});

// 2. AUTH RATE LIMITER (Anti-Brute Force & Credential Stuffing Shield)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login/registration attempts from this IP. Please try again after 15 minutes.'
  }
});

// 3. TRANSACTION RATE LIMITER (Anti-Spam Financial Shield)
const transactionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many financial requests submitted in a short period. Please wait a few minutes.'
  }
});

// 4. SANITIZATION: Recursive input cleaner against XSS and Injection payloads
const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    // Remove script tags, javascript: protocols, dangerous onerror/onload injection patterns
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val !== null && typeof val === 'object') {
    const cleanObj = {};
    for (const key of Object.keys(val)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      cleanObj[key] = sanitizeValue(val[key]);
    }
    return cleanObj;
  }
  return val;
};

// 5. INPUT SANITIZATION & HPP (HTTP Parameter Pollution) MIDDLEWARE
const sanitizeAndProtect = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }
  next();
};

// 6. BOT & EXPLOIT SHIELD: Blocks vulnerability scanners, path traversal & probes
const botAndExploitShield = (req, res, next) => {
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const url = req.url.toLowerCase();

  // Block known hacker scanners & bot user agents
  const blockedAgents = ['sqlmap', 'nikto', 'dirbuster', 'gobuster', 'masscan', 'wpscan', 'nmap', 'havij', 'acunetix'];
  if (blockedAgents.some(agent => userAgent.includes(agent))) {
    return res.status(403).json({ success: false, message: 'Access Denied by Security Shield.' });
  }

  // Block path traversal and sensitive file probes
  const suspiciousPatterns = [
    '..',
    '.env',
    '.git',
    '.svn',
    '.aws',
    '.ssh',
    'wp-admin',
    'wp-login',
    'phpmyadmin',
    'xmlrpc',
    'cgi-bin',
    'eval(',
    '/etc/passwd',
    'cmd.exe'
  ];

  if (suspiciousPatterns.some(pattern => url.includes(pattern))) {
    return res.status(404).json({ success: false, message: 'Endpoint not found.' });
  }

  next();
};

// 7. ENTERPRISE PERMISSIONS & PRIVACY HARDENING HEADERS
const strictSecurityHeaders = (req, res, next) => {
  // Completely disable any access to camera, mic, location, sensors, bluetooth, usb, payment, etc.
  const permissionsPolicy = [
    'geolocation=()',
    'camera=()',
    'microphone=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'battery=()',
    'display-capture=()',
    'document-domain=()',
    'encrypted-media=()',
    'execution-while-not-rendered=()',
    'execution-while-out-of-viewport=()',
    'fullscreen=(self)',
    'gamepad=()',
    'midi=()',
    'screen-wake-lock=()',
    'speaker-selection=()',
    'web-share=()',
    'xr-spatial-tracking=()'
  ].join(', ');

  res.setHeader('Permissions-Policy', permissionsPolicy);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Server', 'Protected-Edge-Network');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Anti-caching for sensitive API data
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
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

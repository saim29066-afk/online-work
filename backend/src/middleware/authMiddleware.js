const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'student_invest_super_secret_jwt_key_2026_xyz');
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          balance: true,
          totalDeposited: true,
          totalWithdrawn: true,
          totalEarned: true,
          referralCode: true,
          referredById: true,
          isRestricted: true,
          restrictionReason: true,
          createdAt: true
        }
      });

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User account not found' });
      }

      next();
    } catch (error) {
      console.error('Auth verification error:', error);
      return res.status(401).json({ success: false, message: 'Invalid or expired session token' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'No authorization token provided' });
  }
};

const checkNotRestricted = (req, res, next) => {
  if (req.user && req.user.isRestricted) {
    return res.status(403).json({
      success: false,
      isRestricted: true,
      message: `Your account is RESTRICTED: "${req.user.restrictionReason || 'Account frozen for policy violation'}". All plan purchases, daily bonus claims, deposits, and cashouts are disabled.`
    });
  }
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Super Admin privileges required' });
  }
};

module.exports = { protect, checkNotRestricted, adminOnly, prisma };

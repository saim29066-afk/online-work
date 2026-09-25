const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../prisma');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'student_invest_super_secret_jwt_key_2026_xyz', {
    expiresIn: '365d'
  });
};

const fastReferralCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randBytes = crypto.randomBytes(4);
  let code = 'STU';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(randBytes[i] % chars.length);
  }
  return code;
};

// @desc Register user with Rs. 250 Free Welcome Bonus + Level 0 Free Plan
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, phone, email, password, referralCode } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, phone number, and password' });
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith('03')) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 11-digit Pakistani mobile number (e.g. 03001234567)'
      });
    }

    // Parallel checks for maximum speed
    const checkPromises = [
      prisma.user.findUnique({ where: { phone: cleanPhone }, select: { id: true } })
    ];

    const cleanEmail = email && email.trim() !== '' ? email.trim().toLowerCase() : null;
    if (cleanEmail) {
      checkPromises.push(prisma.user.findUnique({ where: { email: cleanEmail }, select: { id: true } }));
    } else {
      checkPromises.push(Promise.resolve(null));
    }

    let rawRef = (referralCode || '').trim();
    if (rawRef.includes('ref=')) {
      rawRef = rawRef.split('ref=')[1].split('&')[0].trim();
    }
    const cleanRefPhone = rawRef.replace(/\D/g, '');

    if (rawRef) {
      checkPromises.push(
        prisma.user.findFirst({
          where: {
            OR: [
              { referralCode: rawRef.toUpperCase() },
              ...(cleanRefPhone.length === 11 ? [{ phone: cleanRefPhone }] : [])
            ]
          },
          select: { id: true }
        })
      );
    } else {
      checkPromises.push(Promise.resolve(null));
    }

    // Run hashing and DB existence checks simultaneously
    const [hashingResult, dbChecks] = await Promise.all([
      bcrypt.hash(password, 8),
      Promise.all(checkPromises)
    ]);

    const [existingPhone, existingEmail, referrer] = dbChecks;

    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'An account with this phone number already exists' });
    }
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'This email is already registered' });
    }

    const myReferralCode = fastReferralCode();
    const signupBonus = 150.0;

    const result = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        password: hashingResult,
        referralCode: myReferralCode,
        referredById: referrer ? referrer.id : null,
        balance: signupBonus,
        totalEarned: signupBonus
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        balance: true,
        referralCode: true
      }
    });

    const token = generateToken(result.id);

    return res.status(201).json({
      success: true,
      message: 'Congratulations! Rs. 150 Free Welcome Bonus has been credited to your account! Activate your plan from the dashboard.',
      token,
      user: result
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed. Server error.' });
  }
};

// @desc Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body;

    if (!phoneOrEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please enter phone/email and password' });
    }

    const cleanInput = phoneOrEmail.trim();
    const cleanPhone = cleanInput.replace(/\D/g, '');

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanInput.toLowerCase() },
          ...(cleanPhone ? [{ phone: cleanPhone }] : [{ phone: cleanInput }]),
          ...(cleanInput.toLowerCase() === 'admin' ? [{ email: 'admin@studentinvest.pk' }] : [])
        ]
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        password: true,
        role: true,
        balance: true,
        totalDeposited: true,
        totalWithdrawn: true,
        totalEarned: true,
        referralCode: true,
        isRestricted: true,
        restrictionReason: true
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please try again.' });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        balance: user.balance,
        totalDeposited: user.totalDeposited,
        totalWithdrawn: user.totalWithdrawn,
        totalEarned: user.totalEarned,
        referralCode: user.referralCode,
        isRestricted: user.isRestricted,
        restrictionReason: user.restrictionReason
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed. Server error.' });
  }
};

// @desc Get current user profile & live stats
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: {
          select: {
            referrals: true,
            investments: true,
            deposits: true,
            withdrawals: true
          }
        },
        investments: {
          where: { status: 'ACTIVE' },
          include: { plan: true }
        },
        referrals: {
          select: {
            id: true,
            name: true,
            phone: true,
            createdAt: true,
            investments: {
              select: {
                id: true,
                amount: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password, ...userData } = user;
    return res.status(200).json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

module.exports = { register, login, getMe };

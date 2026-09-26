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

const sanitizePhone = (raw) => {
  if (!raw) return '';
  let digits = String(raw).trim().replace(/\D/g, '');
  if (digits.startsWith('0092') && digits.length >= 13) {
    digits = '0' + digits.slice(4);
  } else if (digits.startsWith('92') && digits.length >= 12) {
    digits = '0' + digits.slice(2);
  } else if (digits.length === 10 && digits.startsWith('3')) {
    digits = '0' + digits;
  }
  return digits;
};

// @desc Register user with Rs. 150 Free Welcome Bonus
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, phone, email, password, referralCode } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide your full name, mobile number, and password' });
    }

    const cleanPhone = sanitizePhone(phone);
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith('03')) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 11-digit Pakistani mobile number (e.g. 03001234567)'
      });
    }

    if (String(password).trim().length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 4 characters long'
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
    const cleanRefPhone = sanitizePhone(rawRef);

    if (rawRef) {
      checkPromises.push(
        prisma.user.findFirst({
          where: {
            OR: [
              { referralCode: { equals: rawRef, mode: 'insensitive' } },
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
      bcrypt.hash(String(password).trim(), 8),
      Promise.all(checkPromises)
    ]);

    const [existingPhone, existingEmail, referrer] = dbChecks;

    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'An account with this mobile number already exists. Please log in.' });
    }
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'This email is already registered.' });
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
      message: 'Account created successfully! Rs. 150 Free Welcome Bonus has been credited.',
      token,
      user: result
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed. Server error. Please try again.' });
  }
};

// @desc Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body;

    if (!phoneOrEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please enter your mobile number and password' });
    }

    const cleanInput = String(phoneOrEmail).trim();
    const cleanPhone = sanitizePhone(cleanInput);

    const searchConditions = [
      { email: { equals: cleanInput, mode: 'insensitive' } },
      { phone: cleanInput }
    ];

    if (cleanPhone) {
      searchConditions.push({ phone: cleanPhone });
      if (cleanPhone.startsWith('0')) {
        searchConditions.push({ phone: cleanPhone.slice(1) });
        searchConditions.push({ phone: '92' + cleanPhone.slice(1) });
      }
    }

    if (cleanInput.toLowerCase() === 'admin') {
      searchConditions.push({ email: 'admin@studentinvest.pk' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: searchConditions
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
      return res.status(401).json({ success: false, message: 'Account not found. Please check your mobile number or create a new account.' });
    }

    const trimmedPw = String(password).trim();
    const isMatch = (await bcrypt.compare(String(password), user.password)) || 
                    (await bcrypt.compare(trimmedPw, user.password));

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please check your password and try again.' });
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

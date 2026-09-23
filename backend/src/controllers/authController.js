const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'student_invest_super_secret_jwt_key_2026_xyz', {
    expiresIn: '30d'
  });
};

const generateReferralCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'STU';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
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

    // Check existing phone
    const existingUser = await prisma.user.findUnique({
      where: { phone: cleanPhone }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this phone number already exists' });
    }

    // Check optional email uniqueness if provided
    if (email && email.trim() !== '') {
      const existingEmail = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() }
      });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'This email is already registered' });
      }
    }

    // Check referrer if referralCode provided (handles code, mobile number, or full URL)
    let referredById = null;
    if (referralCode && referralCode.trim() !== '') {
      let rawRef = referralCode.trim();
      // Extract code if user pasted a URL e.g. ...?ref=CODE
      if (rawRef.includes('ref=')) {
        rawRef = rawRef.split('ref=')[1].split('&')[0];
      }
      rawRef = rawRef.trim();

      const cleanRefPhone = rawRef.replace(/\D/g, '');

      // Search by referralCode or phone number
      const referrer = await prisma.user.findFirst({
        where: {
          OR: [
            { referralCode: rawRef.toUpperCase() },
            ...(cleanRefPhone.length === 11 ? [{ phone: cleanRefPhone }] : [])
          ]
        }
      });

      if (referrer) {
        referredById = referrer.id;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique referral code
    let myReferralCode = generateReferralCode();
    let isUnique = false;
    while (!isUnique) {
      const check = await prisma.user.findUnique({ where: { referralCode: myReferralCode } });
      if (!check) {
        isUnique = true;
      } else {
        myReferralCode = generateReferralCode();
      }
    }

    // New student gets Rs. 250 FREE SIGNUP BONUS!
    const signupBonus = 250.0;

    const result = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        email: email && email.trim() !== '' ? email.trim().toLowerCase() : null,
        password: hashedPassword,
        referralCode: myReferralCode,
        referredById,
        balance: signupBonus,
        totalEarned: signupBonus
      }
    });

    const token = generateToken(result.id);

    return res.status(201).json({
      success: true,
      message: 'Congratulations! Rs. 250 Free Welcome Bonus has been credited to your account! Activate your plan from the dashboard.',
      token,
      user: {
        id: result.id,
        name: result.name,
        phone: result.phone,
        email: result.email,
        role: result.role,
        balance: result.balance,
        referralCode: result.referralCode
      }
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

const prisma = require('../prisma');

// @desc Get payment gateway info
// @route GET /api/transactions/gateway-info
const getGatewayInfo = async (req, res) => {
  try {
    let settings = await prisma.paymentSetting.findFirst();
    if (!settings) {
      settings = await prisma.paymentSetting.create({
        data: {
          easypaisaNumber: '03451234567',
          easypaisaTitle: 'Muhammad Ali (Admin)',
          jazzcashNumber: '03019876543',
          jazzcashTitle: 'Muhammad Ali (Admin)',
          upaisaNumber: '03331234567',
          upaisaTitle: 'Muhammad Ali (Admin)',
          minWithdrawal: 500,
          minInvitesForWithdraw: 2,
          supportWhatsapp: '+923451234567',
          supportEmail: 'support@studentinvest.pk',
          noticeText: '🎉 Welcome Students! Level 0 Free Plan (Rs. 35/day) + Rs. 150 Signup Bonus active!'
        }
      });
    }

    return res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('Gateway info error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch gateway details' });
  }
};

// @desc Submit Deposit Request with Screenshot
// @route POST /api/transactions/deposit
const submitDeposit = async (req, res) => {
  try {
    const { gateway, amount, senderNumber, senderName, transactionId } = req.body;
    const userId = req.user.id;

    if (req.user.isRestricted) {
      return res.status(403).json({
        success: false,
        message: `Account Restricted: ${req.user.restrictionReason || 'Policy violation'}. Deposits disabled.`
      });
    }

    if (!gateway || !amount || !senderNumber || !senderName || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields (Gateway, Amount, Sender Number, Sender Name, Transaction ID).'
      });
    }

    const cleanSenderNumber = senderNumber.trim().replace(/\D/g, '');
    if (cleanSenderNumber.length !== 11 || !cleanSenderNumber.startsWith('03')) {
      return res.status(400).json({
        success: false,
        message: 'Sender number must be a valid 11-digit mobile number (e.g. 03001234567).'
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      return res.status(400).json({ success: false, message: 'Minimum deposit amount is Rs. 100' });
    }

    const settings = await prisma.paymentSetting.findFirst();
    const gw = gateway.toUpperCase();
    if (gw === 'EASYPAISA' && settings?.easypaisaStatus && settings.easypaisaStatus !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: settings.easypaisaNotice || 'EasyPaisa is currently under maintenance / coming soon. Please use another gateway.'
      });
    }
    if ((gw === 'JAZZCASH' || gw === 'JAZZ_CASH') && settings?.jazzcashStatus && settings.jazzcashStatus !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: settings.jazzcashNotice || 'JazzCash is currently under maintenance / coming soon. Please use another gateway.'
      });
    }
    if (gw === 'UPAISA' && settings?.upaisaStatus && settings.upaisaStatus !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: settings.upaisaNotice || 'UPaisa is currently under maintenance / coming soon. Please use another gateway.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload the payment transaction screenshot / slip.'
      });
    }

    // Check duplicate TID
    const existingTid = await prisma.deposit.findFirst({
      where: { transactionId: transactionId.trim() }
    });

    if (existingTid) {
      return res.status(400).json({
        success: false,
        message: 'This Transaction ID (TID) has already been submitted. Please check your TID.'
      });
    }

    const screenshotUrl = req.file.dataUri || `/uploads/${req.file.filename}`;

    const deposit = await prisma.deposit.create({
      data: {
        userId,
        gateway: gateway.toUpperCase(),
        amount: numAmount,
        senderNumber: senderNumber.trim(),
        senderName: senderName.trim(),
        transactionId: transactionId.trim(),
        screenshotUrl,
        status: 'PENDING'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Deposit slip submitted successfully! Admin will verify your payment slip within 5-15 minutes.',
      deposit
    });
  } catch (error) {
    console.error('Deposit submission error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit deposit request' });
  }
};

// @desc Get user deposit history
// @route GET /api/transactions/my-deposits
const getMyDeposits = async (req, res) => {
  try {
    const deposits = await prisma.deposit.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, deposits });
  } catch (error) {
    console.error('Get my deposits error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch deposits' });
  }
};

// @desc Get withdrawal tier and eligibility status for current user
// @route GET /api/transactions/withdraw-tier
const getWithdrawalTierStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        investments: {
          where: { status: 'ACTIVE' }
        },
        withdrawals: {
          where: { status: { in: ['PENDING', 'APPROVED'] } }
        },
        referrals: {
          include: {
            investments: { where: { amount: { gte: 1000 } } },
            deposits: { where: { status: 'APPROVED' } }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const pastCount = user.withdrawals.length;
    const qualifiedReferralsCount = user.referrals.filter(
      r => (r.investments && r.investments.length > 0) || (r.deposits && r.deposits.length > 0)
    ).length;
    const hasPaidPlan = user.investments.some(inv => inv.amount >= 1000);

    const baseTiers = [
      { amount: 500, baseInvites: 0, label: 'Starter 1st Cashout' },
      { amount: 2000, baseInvites: 1, label: 'Standard Tier' },
      { amount: 4000, baseInvites: 2, label: 'Silver Tier' },
      { amount: 8000, baseInvites: 4, label: 'Gold Tier' },
      { amount: 16000, baseInvites: 8, label: 'Diamond Tier' }
    ];

    const tiers = baseTiers.map((t) => {
      if (t.amount === 500) {
        return {
          amount: 500,
          requiredInvites: 0,
          baseInvites: 0,
          tierCount: user.withdrawals.filter(w => w.amount === 500).length,
          isFreeBonus: false,
          label: 'Starter 1st Cashout',
          desc: '1-time trial cashout (0 Invites)'
        };
      }

      const tierCount = user.withdrawals.filter(w => w.amount === t.amount).length;
      const batchNumber = Math.floor(tierCount / 2) + 1;
      const requiredInvites = batchNumber * t.baseInvites;
      const isFreeBonus = tierCount % 2 === 1;

      return {
        amount: t.amount,
        baseInvites: t.baseInvites,
        requiredInvites,
        tierCount,
        isFreeBonus,
        label: t.label,
        desc: isFreeBonus
          ? `🎁 FREE Bonus Cashout (2nd cashout from previous invite)`
          : `Requires ${requiredInvites} active friend${requiredInvites > 1 ? 's' : ''} (Includes 1 free bonus cashout)`
      };
    });

    let defaultSelectedAmount = 500;
    if (pastCount === 0) {
      defaultSelectedAmount = 500;
    } else {
      defaultSelectedAmount = 2000;
    }

    return res.status(200).json({
      success: true,
      pastCount,
      defaultSelectedAmount,
      qualifiedReferralsCount,
      hasPaidPlan,
      balance: user.balance,
      tiers
    });
  } catch (error) {
    console.error('Get withdrawal tier error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch withdrawal tier' });
  }
};

// @desc Submit Withdrawal Request
// @route POST /api/transactions/withdraw
const submitWithdrawal = async (req, res) => {
  try {
    const { gateway, amount, accountNumber, accountTitle } = req.body;
    const userId = req.user.id;

    if (req.user.isRestricted) {
      return res.status(403).json({
        success: false,
        message: `Account Restricted: ${req.user.restrictionReason || 'Policy violation'}. Withdrawals blocked.`
      });
    }

    if (!gateway || !amount || !accountNumber || !accountTitle) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all details (Gateway, Amount, Account Number, Account Title).'
      });
    }

    const cleanAccountNumber = accountNumber.trim().replace(/\D/g, '');
    if (cleanAccountNumber.length !== 11 || !cleanAccountNumber.startsWith('03')) {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal account number must be a valid 11-digit mobile number (e.g. 03001234567).'
      });
    }

    const numAmount = parseInt(amount, 10);
    const BASE_INVITES_PER_TIER = {
      500: 0,
      2000: 1,
      4000: 2,
      8000: 4,
      16000: 8
    };

    if (BASE_INVITES_PER_TIER[numAmount] === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal amount selected. Allowed tiers are Rs. 500, 2,000, 4,000, 8,000, and 16,000.'
      });
    }

    // 1. Fetch student with balance, active investments, past withdrawals, and referrals with investments/deposits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        investments: {
          where: { status: 'ACTIVE' },
          include: { plan: true }
        },
        withdrawals: {
          where: {
            status: { in: ['PENDING', 'APPROVED'] }
          }
        },
        referrals: {
          include: {
            investments: {
              where: {
                amount: { gte: 1000 }
              }
            },
            deposits: {
              where: {
                status: 'APPROVED'
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 2. TIER RULES ENFORCEMENT:
    // - 1st Cashout (pastCount == 0): Strictly Rs. 500. Higher tiers locked.
    // - 2nd+ Cashouts (pastCount >= 1): Rs. 500 is permanently closed.
    //   Rs. 2,000 (1 friend / 2 cashouts), Rs. 4,000 (2 friends / 2 cashouts), etc.
    const pastWithdrawalsCount = user.withdrawals.length;

    if (pastWithdrawalsCount === 0) {
      if (numAmount !== 500) {
        return res.status(400).json({
          success: false,
          message: 'For your 1st cashout, please complete the starter trial tier of Rs. 500. Higher tiers unlock after your 1st cashout.'
        });
      }
    } else {
      if (numAmount === 500) {
        return res.status(400).json({
          success: false,
          message: 'The Rs. 500 starter tier was a 1-time trial and is permanently closed. Please select Rs. 2,000 or higher.'
        });
      }
    }

    if (user.balance < numAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance! Your current balance is Rs. ${user.balance.toLocaleString()}, but selected cashout requires Rs. ${numAmount.toLocaleString()}.`
      });
    }

    const tierWithdrawalsCount = user.withdrawals.filter(w => w.amount === numAmount).length;
    let requiredInvites = 0;
    if (numAmount === 500) {
      requiredInvites = 0;
    } else {
      const base = BASE_INVITES_PER_TIER[numAmount];
      const batchNumber = Math.floor(tierWithdrawalsCount / 2) + 1;
      requiredInvites = batchNumber * base;
    }

    const qualifiedReferralsCount = user.referrals.filter(
      r => (r.investments && r.investments.length > 0) || (r.deposits && r.deposits.length > 0)
    ).length;

    if (qualifiedReferralsCount < requiredInvites) {
      const neededMore = requiredInvites - qualifiedReferralsCount;
      return res.status(403).json({
        success: false,
        requiresInvite: true,
        requiredInvites,
        currentInvites: qualifiedReferralsCount,
        neededMore,
        pastWithdrawalsCount,
        tierWithdrawalsCount,
        message: `Withdrawal Locked! For Rs. ${numAmount.toLocaleString()} cashout #${tierWithdrawalsCount + 1}, at least ${requiredInvites} active invited friends are required (${neededMore} more required). Note: Each active friend allows 2 cashouts (1 free bonus cashout included).`
      });
    }

    // 3. CHECK RULE: Must have bought at least 1 paid plan (Level 1 or higher, amount >= 1000)
    const hasPaidPlan = user.investments.some(inv => inv.amount >= 1000);
    if (!hasPaidPlan) {
      return res.status(403).json({
        success: false,
        requiresPaidPlan: true,
        message: 'Withdrawal Locked! Please activate Level 1 (Rs. 1,000) or higher plan to unlock your cashout.'
      });
    }

    // 4. Deduct balance & create pending withdrawal
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: numAmount }
        }
      });

      const withdrawal = await tx.withdrawal.create({
        data: {
          userId,
          gateway: gateway.toUpperCase(),
          amount: numAmount,
          accountNumber: accountNumber.trim(),
          accountTitle: accountTitle.trim(),
          status: 'PENDING'
        }
      });

      return { updatedUser, withdrawal };
    });

    return res.status(201).json({
      success: true,
      message: `Withdrawal request for Rs. ${numAmount.toLocaleString()} submitted! Funds will be transferred to your ${gateway} account shortly.`,
      newBalance: result.updatedUser.balance,
      withdrawal: result.withdrawal
    });
  } catch (error) {
    console.error('Withdrawal submission error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit withdrawal request' });
  }
};

// @desc Get user withdrawal history
// @route GET /api/transactions/my-withdrawals
const getMyWithdrawals = async (req, res) => {
  try {
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    console.error('Get my withdrawals error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch withdrawals' });
  }
};

// @desc Get real live approved withdrawals for public ticker
// @route GET /api/transactions/live-payouts
const getLivePayouts = async (req, res) => {
  try {
    const recentPayouts = await prisma.withdrawal.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true,
        gateway: true,
        amount: true,
        accountNumber: true,
        accountTitle: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    });

    const masked = recentPayouts.map(p => {
      const num = p.accountNumber || '03000000000';
      const maskedPhone = num.length >= 7 ? `${num.slice(0, 4)}-***${num.slice(-3)}` : num;
      return {
        id: p.id,
        phone: maskedPhone,
        title: p.accountTitle || 'Student',
        amount: p.amount,
        gateway: p.gateway === 'EASYPAISA' ? 'EasyPaisa' : 'JazzCash',
        time: 'Verified Payout'
      };
    });

    return res.status(200).json({ success: true, payouts: masked });
  } catch (error) {
    console.error('Live payouts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payouts' });
  }
};

module.exports = {
  getGatewayInfo,
  getWithdrawalTierStatus,
  submitDeposit,
  getMyDeposits,
  submitWithdrawal,
  getMyWithdrawals,
  getLivePayouts
};

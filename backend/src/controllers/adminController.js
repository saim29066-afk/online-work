const prisma = require('../prisma');

// @desc Get overview statistics (Concurrent Parallel Queries)
// @route GET /api/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      pendingDeposits,
      pendingWithdrawals,
      activeInvestments,
      approvedDepositsSum,
      approvedWithdrawalsSum
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.deposit.count({ where: { status: 'PENDING' } }),
      prisma.withdrawal.count({ where: { status: 'PENDING' } }),
      prisma.userInvestment.count({ where: { status: 'ACTIVE' } }),
      prisma.deposit.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true }
      }),
      prisma.withdrawal.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true }
      })
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        pendingDeposits,
        pendingWithdrawals,
        activeInvestments,
        totalDeposited: approvedDepositsSum._sum.amount || 0,
        totalWithdrawn: approvedWithdrawalsSum._sum.amount || 0
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
};

// @desc Get all deposits (with student details)
// @route GET /api/admin/deposits
const getAllDeposits = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status: status.toUpperCase() } : {};

    const deposits = await prisma.deposit.findMany({
      where: filter,
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true, balance: true, isRestricted: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 200
    });

    return res.status(200).json({ success: true, deposits });
  } catch (error) {
    console.error('Admin get deposits error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch deposits' });
  }
};

// @desc Approve a deposit request and credit student balance
// @route POST /api/admin/deposits/:id/approve
const approveDeposit = async (req, res) => {
  try {
    const { id } = req.params;

    const deposit = await prisma.deposit.findUnique({
      where: { id },
      select: { id: true, userId: true, amount: true, status: true }
    });

    if (!deposit) {
      return res.status(404).json({ success: false, message: 'Deposit request not found' });
    }

    if (deposit.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Deposit is already ${deposit.status.toLowerCase()}` });
    }

    // Fast batched transaction in single TCP roundtrip
    const [updatedDeposit, updatedUser] = await prisma.$transaction([
      prisma.deposit.update({
        where: { id },
        data: { status: 'APPROVED', adminNote: 'Approved by Administrator' }
      }),
      prisma.user.update({
        where: { id: deposit.userId },
        data: {
          balance: { increment: deposit.amount },
          totalDeposited: { increment: deposit.amount }
        },
        select: { balance: true }
      })
    ]);

    return res.status(200).json({
      success: true,
      message: `Deposit of Rs. ${deposit.amount.toLocaleString()} approved! Funds credited to student wallet.`,
      deposit: updatedDeposit,
      newBalance: updatedUser.balance
    });
  } catch (error) {
    console.error('Approve deposit error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to approve deposit' });
  }
};

// @desc Reject a deposit request
// @route POST /api/admin/deposits/:id/reject
const rejectDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body || {};

    const deposit = await prisma.deposit.findUnique({
      where: { id },
      select: { id: true, status: true }
    });

    if (!deposit) {
      return res.status(404).json({ success: false, message: 'Deposit request not found' });
    }

    const updatedDeposit = await prisma.deposit.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminNote: note || 'Transaction slip or TID verification failed'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Deposit request rejected.',
      deposit: updatedDeposit
    });
  } catch (error) {
    console.error('Reject deposit error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to reject deposit' });
  }
};

// @desc Get all withdrawals
// @route GET /api/admin/withdrawals
const getAllWithdrawals = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status: status.toUpperCase() } : {};

    const withdrawals = await prisma.withdrawal.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            balance: true,
            totalDeposited: true,
            totalWithdrawn: true,
            totalEarned: true,
            isRestricted: true,
            investments: {
              where: { status: 'ACTIVE' },
              select: { amount: true, plan: { select: { name: true } } },
              take: 1
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 200
    });

    const enrichedWithdrawals = withdrawals.map((w) => {
      const u = w.user || {};
      const activePlan = u.investments && u.investments.length > 0 ? (u.investments[0].plan?.name || `Plan (Rs. ${u.investments[0].amount})`) : 'No Plan';

      return {
        ...w,
        userTotalDeposited: u.totalDeposited || 0,
        userActivePlan: activePlan,
        userBalance: u.balance || 0
      };
    });

    return res.status(200).json({ success: true, withdrawals: enrichedWithdrawals });
  } catch (error) {
    console.error('Admin get withdrawals error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch withdrawals' });
  }
};

// @desc Approve / Mark Withdrawal as Paid
const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      select: { id: true, userId: true, amount: true, status: true }
    });

    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
    }

    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Withdrawal is already ${withdrawal.status.toLowerCase()}` });
    }

    const [updatedWithdrawal] = await prisma.$transaction([
      prisma.withdrawal.update({
        where: { id },
        data: {
          status: 'APPROVED',
          adminNote: note || 'Withdrawal successfully transferred to student account.'
        }
      }),
      prisma.user.update({
        where: { id: withdrawal.userId },
        data: {
          totalWithdrawn: { increment: withdrawal.amount }
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      message: `Withdrawal for Rs. ${withdrawal.amount.toLocaleString()} marked as APPROVED / PAID.`,
      withdrawal: updatedWithdrawal
    });
  } catch (error) {
    console.error('Approve withdrawal error:', error);
    return res.status(500).json({ success: false, message: 'Failed to approve withdrawal' });
  }
};

// @desc Reject / Fail Withdrawal (Optionally Refund balance back to student)
// @route POST /api/admin/withdrawals/:id/reject
const rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, refund = true } = req.body;

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      select: { id: true, userId: true, amount: true, status: true }
    });

    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
    }

    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Withdrawal is already ${withdrawal.status.toLowerCase()}` });
    }

    const updates = [
      prisma.withdrawal.update({
        where: { id },
        data: {
          status: 'REJECTED',
          adminNote: note || 'Withdrawal rejected / transfer failed.'
        }
      })
    ];

    if (refund) {
      updates.push(
        prisma.user.update({
          where: { id: withdrawal.userId },
          data: { balance: { increment: withdrawal.amount } }
        })
      );
    }

    const [updatedWithdrawal] = await prisma.$transaction(updates);

    return res.status(200).json({
      success: true,
      message: refund
        ? `Withdrawal marked as Failed/Rejected. Rs. ${withdrawal.amount.toLocaleString()} has been refunded to student wallet.`
        : `Withdrawal marked as Failed/Rejected without refund.`,
      withdrawal: updatedWithdrawal
    });
  } catch (error) {
    console.error('Reject withdrawal error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reject withdrawal' });
  }
};

// @desc Get all registered students with restriction status and referral info
// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        balance: true,
        totalDeposited: true,
        totalWithdrawn: true,
        totalEarned: true,
        referralCode: true,
        referredById: true,
        referredBy: {
          select: {
            id: true,
            name: true,
            phone: true,
            referralCode: true
          }
        },
        isRestricted: true,
        restrictionReason: true,
        createdAt: true,
        _count: {
          select: {
            referrals: true,
            investments: true,
            deposits: true,
            withdrawals: true
          }
        },
        investments: {
          select: {
            id: true,
            amount: true,
            dailyBonus: true,
            status: true,
            plan: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Admin get users error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// @desc Manually set or update user's referrer (Admin override)
// @route POST /api/admin/users/:id/set-referrer
const setUserReferrer = async (req, res) => {
  try {
    const { id } = req.params;
    const { referrerCodeOrPhone } = req.body;

    if (!referrerCodeOrPhone || !referrerCodeOrPhone.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide referrer code or mobile number' });
    }

    const cleanInput = referrerCodeOrPhone.trim();
    const cleanPhone = cleanInput.replace(/\D/g, '');

    const referrer = await prisma.user.findFirst({
      where: {
        OR: [
          { referralCode: cleanInput.toUpperCase() },
          ...(cleanPhone.length === 11 ? [{ phone: cleanPhone }] : [])
        ]
      }
    });

    if (!referrer) {
      return res.status(404).json({ success: false, message: 'Referrer not found with this code/phone' });
    }

    if (referrer.id === id) {
      return res.status(400).json({ success: false, message: 'A student cannot refer themselves' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { referredById: referrer.id },
      include: { referredBy: { select: { name: true, phone: true, referralCode: true } } }
    });

    return res.status(200).json({
      success: true,
      message: `Referrer updated! Linked to ${referrer.name} (${referrer.phone})`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Set referrer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user referrer' });
  }
};

// @desc Modify user balance (Admin add/subtract funds)
// @route POST /api/admin/users/:id/balance
const updateUserBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, action } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid amount' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let newBalance = user.balance;
    if (action === 'ADD') {
      newBalance += numAmount;
    } else if (action === 'SUBTRACT') {
      newBalance = Math.max(0, newBalance - numAmount);
    } else {
      newBalance = numAmount;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { balance: newBalance }
    });

    return res.status(200).json({
      success: true,
      message: `User balance updated to Rs. ${newBalance.toLocaleString()}`,
      balance: updatedUser.balance
    });
  } catch (error) {
    console.error('Update balance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user balance' });
  }
};

// @desc Restrict or Unrestrict a student account for violations
// @route POST /api/admin/users/:id/restrict
const toggleUserRestriction = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRestricted, reason } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'ADMIN' || user.phone === '03000000000') {
      return res.status(400).json({ success: false, message: 'The Super Admin account cannot be restricted.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isRestricted: isRestricted === true,
        restrictionReason: isRestricted ? (reason || 'Account restricted due to policy violation.') : null
      }
    });

    return res.status(200).json({
      success: true,
      message: isRestricted
        ? `Account for ${user.name} restricted for violation: "${reason || 'Policy violation'}"`
        : `Account restriction removed for ${user.name}. Account is now active.`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Toggle restriction error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update account restriction status' });
  }
};

// @desc Delete a student account and all related records
// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student account not found' });
    }

    if (user.role === 'ADMIN' || user.email === 'admin@studentinvest.pk' || user.phone === '03000000000') {
      return res.status(400).json({
        success: false,
        message: 'Protected Account: The Super Admin account cannot be deleted or removed.'
      });
    }

    // 1. Disconnect any students referred by this user so they don't break foreign keys
    await prisma.user.updateMany({
      where: { referredById: id },
      data: { referredById: null }
    });

    // 2. Delete user
    await prisma.user.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: `Student account for "${user.name}" (${user.phone}) has been permanently deleted.`
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete student account' });
  }
};

// @desc Update Payment Gateway numbers and settings
// @route PUT /api/admin/settings
const updateSettings = async (req, res) => {
  try {
    const {
      easypaisaNumber,
      easypaisaTitle,
      easypaisaStatus,
      easypaisaNotice,
      jazzcashNumber,
      jazzcashTitle,
      jazzcashStatus,
      jazzcashNotice,
      upaisaNumber,
      upaisaTitle,
      upaisaStatus,
      upaisaNotice,
      minWithdrawal,
      minInvitesForWithdraw,
      supportWhatsapp,
      supportEmail,
      noticeText
    } = req.body;

    let settings = await prisma.paymentSetting.findFirst();
    if (!settings) {
      settings = await prisma.paymentSetting.create({
        data: {
          easypaisaNumber: easypaisaNumber || '03451234567',
          easypaisaTitle: easypaisaTitle || 'Muhammad Ali (Admin)',
          easypaisaStatus: easypaisaStatus || 'ACTIVE',
          easypaisaNotice: easypaisaNotice || '',
          jazzcashNumber: jazzcashNumber || '03019876543',
          jazzcashTitle: jazzcashTitle || 'Muhammad Ali (Admin)',
          jazzcashStatus: jazzcashStatus || 'ACTIVE',
          jazzcashNotice: jazzcashNotice || '',
          upaisaNumber: upaisaNumber || '03331234567',
          upaisaTitle: upaisaTitle || 'Muhammad Ali (Admin)',
          upaisaStatus: upaisaStatus || 'ACTIVE',
          upaisaNotice: upaisaNotice || '',
          minWithdrawal: minWithdrawal ? parseFloat(minWithdrawal) : 800,
          minInvitesForWithdraw: minInvitesForWithdraw ? parseInt(minInvitesForWithdraw) : 1,
          supportWhatsapp: supportWhatsapp || '+923451234567',
          supportEmail: supportEmail || 'support@studentinvest.pk',
          noticeText: noticeText || '🎉 Welcome Students!'
        }
      });
    } else {
      settings = await prisma.paymentSetting.update({
        where: { id: settings.id },
        data: {
          easypaisaNumber: easypaisaNumber !== undefined ? easypaisaNumber : settings.easypaisaNumber,
          easypaisaTitle: easypaisaTitle !== undefined ? easypaisaTitle : settings.easypaisaTitle,
          easypaisaStatus: easypaisaStatus !== undefined ? easypaisaStatus : settings.easypaisaStatus,
          easypaisaNotice: easypaisaNotice !== undefined ? easypaisaNotice : settings.easypaisaNotice,
          jazzcashNumber: jazzcashNumber !== undefined ? jazzcashNumber : settings.jazzcashNumber,
          jazzcashTitle: jazzcashTitle !== undefined ? jazzcashTitle : settings.jazzcashTitle,
          jazzcashStatus: jazzcashStatus !== undefined ? jazzcashStatus : settings.jazzcashStatus,
          jazzcashNotice: jazzcashNotice !== undefined ? jazzcashNotice : settings.jazzcashNotice,
          upaisaNumber: upaisaNumber !== undefined ? upaisaNumber : settings.upaisaNumber,
          upaisaTitle: upaisaTitle !== undefined ? upaisaTitle : settings.upaisaTitle,
          upaisaStatus: upaisaStatus !== undefined ? upaisaStatus : settings.upaisaStatus,
          upaisaNotice: upaisaNotice !== undefined ? upaisaNotice : settings.upaisaNotice,
          minWithdrawal: minWithdrawal !== undefined ? parseFloat(minWithdrawal) : settings.minWithdrawal,
          minInvitesForWithdraw: minInvitesForWithdraw !== undefined ? parseInt(minInvitesForWithdraw) : settings.minInvitesForWithdraw,
          supportWhatsapp: supportWhatsapp || settings.supportWhatsapp,
          supportEmail: supportEmail || settings.supportEmail,
          noticeText: noticeText !== undefined ? noticeText : settings.noticeText
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Gateway and system settings updated successfully!',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

// @desc Get all plans for admin
// @route GET /api/admin/plans
const getAllAdminPlans = async (req, res) => {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { price: 'asc' }
    });

    const parsedPlans = plans.map(p => {
      let parsedFeatures = [];
      try {
        parsedFeatures = typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || []);
      } catch (err) {
        parsedFeatures = [];
      }
      return {
        ...p,
        features: parsedFeatures
      };
    });

    return res.status(200).json({ success: true, plans: parsedPlans });
  } catch (error) {
    console.error('Admin get plans error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch plans' });
  }
};

// @desc Create new investment plan
// @route POST /api/admin/plans
const createAdminPlan = async (req, res) => {
  try {
    const { name, price, dailyBonus, durationDays, referralBonusPercent, badge, description, features } = req.body;

    if (!name || price === undefined || dailyBonus === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide plan name, price, and daily bonus' });
    }

    const plan = await prisma.plan.create({
      data: {
        name: name.trim(),
        price: parseFloat(price),
        dailyBonus: parseFloat(dailyBonus),
        durationDays: durationDays ? parseInt(durationDays) : 30,
        referralBonusPercent: referralBonusPercent !== undefined ? parseFloat(referralBonusPercent) : 50.0,
        badge: badge || 'Popular',
        description: description || '',
        features: Array.isArray(features) ? JSON.stringify(features) : JSON.stringify([
          `Daily Rs. ${dailyBonus} guaranteed bonus`,
          `${durationDays || 30} days validity`,
          '50% instant referral commission'
        ]),
        isActive: true
      }
    });

    return res.status(201).json({ success: true, message: 'Investment plan created successfully!', plan });
  } catch (error) {
    console.error('Admin create plan error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create plan' });
  }
};

// @desc Update an existing investment plan
// @route PUT /api/admin/plans/:id
const updateAdminPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, dailyBonus, durationDays, referralBonusPercent, badge, description, features, isActive } = req.body;

    const planId = parseInt(id, 10);
    const existing = await prisma.plan.findUnique({ where: { id: planId } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const updated = await prisma.plan.update({
      where: { id: planId },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        price: price !== undefined ? parseFloat(price) : existing.price,
        dailyBonus: dailyBonus !== undefined ? parseFloat(dailyBonus) : existing.dailyBonus,
        durationDays: durationDays !== undefined ? parseInt(durationDays) : existing.durationDays,
        referralBonusPercent: referralBonusPercent !== undefined ? parseFloat(referralBonusPercent) : existing.referralBonusPercent,
        badge: badge !== undefined ? badge : existing.badge,
        description: description !== undefined ? description : existing.description,
        features: features !== undefined ? (Array.isArray(features) ? JSON.stringify(features) : features) : existing.features,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive
      }
    });

    return res.status(200).json({ success: true, message: `Plan "${updated.name}" updated successfully!`, plan: updated });
  } catch (error) {
    console.error('Admin update plan error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update plan' });
  }
};

// @desc Delete / toggle plan status
// @route DELETE /api/admin/plans/:id
const deleteAdminPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const planId = parseInt(id, 10);

    const updated = await prisma.plan.update({
      where: { id: planId },
      data: { isActive: false }
    });

    return res.status(200).json({ success: true, message: `Plan "${updated.name}" deactivated.`, plan: updated });
  } catch (error) {
    console.error('Admin delete plan error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete plan' });
  }
};

module.exports = {
  getAdminStats,
  getAllDeposits,
  approveDeposit,
  rejectDeposit,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getAllUsers,
  updateUserBalance,
  toggleUserRestriction,
  setUserReferrer,
  deleteUser,
  updateSettings,
  getAllAdminPlans,
  createAdminPlan,
  updateAdminPlan,
  deleteAdminPlan
};

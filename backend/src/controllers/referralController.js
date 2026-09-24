const prisma = require('../prisma');

// Helper to get dynamic commission rate based on referral bonus count
const getTierPercentage = (count) => {
  if (count === 0) return 50.0;
  if (count === 1) return 40.0;
  if (count === 2) return 30.0;
  if (count === 3) return 20.0;
  return 10.0; // 5th referral and all subsequent ones stay at 10%
};

// @desc Get current user referral dashboard & invited list
// @route GET /api/referrals
const getReferralData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        referralCode: true,
        referrals: {
          select: {
            id: true,
            name: true,
            referralCode: true,
            createdAt: true,
            totalDeposited: true,
            investments: {
              select: {
                id: true,
                amount: true,
                plan: {
                  select: { name: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        referralEarningsEarned: {
          include: {
            referredUser: {
              select: { name: true, referralCode: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const totalReferrals = user.referrals.length;
    const activeReferrals = user.referrals.filter(r => (r.investments && r.investments.length > 0) || (r.totalDeposited && r.totalDeposited > 0)).length;
    const totalReferralCommission = user.referralEarningsEarned.reduce((acc, curr) => acc + curr.amount, 0);

    const commissionCount = user.referralEarningsEarned.length;
    const nextBonusPercent = getTierPercentage(commissionCount);

    return res.status(200).json({
      success: true,
      data: {
        referralCode: user.referralCode,
        totalReferrals,
        activeReferrals,
        totalReferralCommission,
        commissionCount,
        nextBonusPercent,
        referrals: user.referrals,
        earningsHistory: user.referralEarningsEarned
      }
    });
  } catch (error) {
    console.error('Referral data error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch referral data' });
  }
};

module.exports = { getReferralData, getTierPercentage };

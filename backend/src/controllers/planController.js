const prisma = require('../prisma');

let cachedPlansData = null;
let lastPlansFetchTime = 0;

// @desc Get all available plans (Sub-millisecond cached)
// @route GET /api/plans
const getPlans = async (req, res) => {
  try {
    const now = Date.now();
    if (cachedPlansData && (now - lastPlansFetchTime < 30000)) {
      return res.status(200).json({ success: true, plans: cachedPlansData });
    }

    const plans = await prisma.plan.findMany({
      where: { isActive: true },
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

    cachedPlansData = parsedPlans;
    lastPlansFetchTime = now;

    return res.status(200).json({ success: true, plans: parsedPlans });
  } catch (error) {
    console.error('Get plans error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch plans' });
  }
};

// @desc Buy / Invest in a plan & instantly credit 50% commission to referrer
// @route POST /api/plans/buy
const buyPlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    if (planId === undefined || planId === null || planId === '') {
      return res.status(400).json({ success: false, message: 'Please select a plan to activate' });
    }

    const planIdNum = parseInt(planId, 10);
    if (isNaN(planIdNum)) {
      return res.status(400).json({ success: false, message: 'Invalid plan ID' });
    }

    // Parallel fetch plan, user, and approved deposit count in a single concurrent round-trip
    const [plan, user, approvedDepositCount] = await Promise.all([
      prisma.plan.findUnique({ where: { id: planIdNum } }),
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          investments: { where: { status: 'ACTIVE' } },
          referredBy: true
        }
      }),
      prisma.deposit.count({ where: { userId, status: 'APPROVED' } })
    ]);

    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, message: 'Investment plan not found or currently unavailable' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If Level 0 (Free Starter), check if already active
    if (plan.id === 0 || plan.price === 0) {
      const alreadyHasFreePlan = user.investments.some(inv => inv.planId === 0 && inv.status === 'ACTIVE');
      if (alreadyHasFreePlan) {
        return res.status(400).json({
          success: false,
          message: `Level 0 Free Starter Plan is already active on your account! You are already receiving Rs. ${plan.dailyBonus}/day.`
        });
      }
    } else {
      // For paid plans: Check if user has made at least 1 approved deposit
      if (approvedDepositCount === 0 && (user.totalDeposited || 0) <= 0) {
        return res.status(400).json({
          success: false,
          requiresDeposit: true,
          message: 'Plan buy karne ke liye kam az kam 1 Deposit approved hona zaroori hai! Referral bonus se plan buy karne ke liye pehle khud kam az kam 1 deposit karein.'
        });
      }

      if (user.balance < plan.price) {
        return res.status(400).json({
          success: false,
          message: `Insufficient balance! You need Rs. ${plan.price.toLocaleString()} to activate this plan. Current balance: Rs. ${user.balance.toLocaleString()}. Please deposit funds first.`
        });
      }
    }

    // Process Purchase inside a database transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct balance from buyer (if paid plan)
      let updatedUser;
      if (plan.price > 0) {
        updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            balance: { decrement: plan.price }
          }
        });
      } else {
        updatedUser = await tx.user.findUnique({ where: { id: userId } });
      }

      // 2. Create User Investment
      const investment = await tx.userInvestment.create({
        data: {
          userId,
          planId: plan.id,
          amount: plan.price,
          dailyBonus: plan.dailyBonus,
          durationDays: plan.durationDays,
          status: 'ACTIVE'
        }
      });

      // 3. Referral Commission Logic (50% instant bonus to referrer if not restricted)
      let referralAwarded = null;
      if (user.referredById && plan.price > 0) {
        const referrer = await tx.user.findUnique({
          where: { id: user.referredById }
        });

        if (referrer && !referrer.isRestricted) {
          const bonusPercent = (plan.referralBonusPercent !== undefined && plan.referralBonusPercent !== null && plan.referralBonusPercent > 0)
            ? plan.referralBonusPercent
            : 50.0;
          const bonusAmount = (plan.price * (bonusPercent / 100)); // 50% commission

          // Credit referrer balance and totalEarned
          await tx.user.update({
            where: { id: user.referredById },
            data: {
              balance: { increment: bonusAmount },
              totalEarned: { increment: bonusAmount }
            }
          });

          // Record referral earning history permanently
          referralAwarded = await tx.referralEarning.create({
            data: {
              referrerId: user.referredById,
              referredUserId: user.id,
              planName: plan.name,
              planPrice: plan.price,
              amount: bonusAmount
            }
          });

          console.log(`[REFERRAL BONUS] Credited Rs. ${bonusAmount} to referrer ${referrer.name} (${referrer.phone}) for friend ${user.name}'s ${plan.name} purchase`);
        } else {
          console.log(`[REFERRAL BONUS SKIPPED] Referrer is restricted or inactive.`);
        }
      }

      return { updatedUser, investment, referralAwarded };
    });

    return res.status(200).json({
      success: true,
      message: `Congratulations! ${plan.name} has been activated successfully! Daily bonus Rs. ${plan.dailyBonus} unlocked.`,
      newBalance: result.updatedUser.balance,
      investment: result.investment
    });
  } catch (error) {
    console.error('Buy plan error:', error);
    return res.status(500).json({ success: false, message: 'Plan activation failed. Please try again.' });
  }
};

// @desc Get current user active investments
// @route GET /api/plans/my-investments
const getMyInvestments = async (req, res) => {
  try {
    const investments = await prisma.userInvestment.findMany({
      where: { userId: req.user.id },
      include: {
        plan: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, investments });
  } catch (error) {
    console.error('Get investments error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch your investments' });
  }
};

// @desc Claim daily bonus for all active investments
// @route POST /api/plans/claim-daily
const claimDailyProfit = async (req, res) => {
  try {
    const userId = req.user.id;

    const activeInvestments = await prisma.userInvestment.findMany({
      where: {
        userId,
        status: 'ACTIVE'
      },
      include: { plan: true }
    });

    if (activeInvestments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You do not have any active investment plans to claim profit from.'
      });
    }

    const now = new Date();
    let totalClaimedToday = 0;
    const claimableIds = [];

    for (const inv of activeInvestments) {
      // Check if 24 hours (or at least same calendar day / 20 hours) have passed since last claim
      if (inv.lastClaimedAt) {
        const diffHours = (now - new Date(inv.lastClaimedAt)) / (1000 * 60 * 60);
        if (diffHours < 20) {
          continue; // Already claimed today
        }
      }

      if (inv.daysClaimed < inv.durationDays) {
        totalClaimedToday += inv.dailyBonus;
        claimableIds.push(inv.id);
      }
    }

    if (claimableIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already claimed today’s profit! Please return tomorrow after 24 hours.'
      });
    }

    // Process claims
    await prisma.$transaction(async (tx) => {
      // 1. Credit user balance & total earned
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { increment: totalClaimedToday },
          totalEarned: { increment: totalClaimedToday }
        }
      });

      // 2. Update investments
      for (const invId of claimableIds) {
        const currentInv = activeInvestments.find(i => i.id === invId);
        const newDaysClaimed = currentInv.daysClaimed + 1;
        const isComplete = newDaysClaimed >= currentInv.durationDays;

        await tx.userInvestment.update({
          where: { id: invId },
          data: {
            daysClaimed: newDaysClaimed,
            lastClaimedAt: now,
            status: isComplete ? 'COMPLETED' : 'ACTIVE'
          }
        });
      }
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true, totalEarned: true }
    });

    return res.status(200).json({
      success: true,
      message: `Successfully claimed Rs. ${totalClaimedToday.toLocaleString()} daily bonus! Added to your wallet.`,
      claimedAmount: totalClaimedToday,
      newBalance: updatedUser.balance
    });
  } catch (error) {
    console.error('Claim daily error:', error);
    return res.status(500).json({ success: false, message: 'Failed to claim daily bonus' });
  }
};

module.exports = { getPlans, buyPlan, getMyInvestments, claimDailyProfit };

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

    // 1. Check if user already has this specific plan currently ACTIVE
    const existingActivePlan = user.investments.find(inv => inv.planId === planIdNum && inv.status === 'ACTIVE');
    if (existingActivePlan) {
      const remainingDays = Math.max(0, existingActivePlan.durationDays - existingActivePlan.daysClaimed);
      return res.status(400).json({
        success: false,
        alreadyActive: true,
        message: `Aapka "${plan.name}" pehle se ACTIVE hai! Yeh plan ${remainingDays} din baad khatam hone par hi dobara buy kiya ja sakta hai.`
      });
    }

    // 2. Paid plans verification
    if (plan.price > 0) {
      if (approvedDepositCount === 0 && (user.totalDeposited || 0) <= 0) {
        return res.status(400).json({
          success: false,
          requiresDeposit: true,
          message: 'At least 1 approved deposit is required to activate paid plans. Please submit a deposit to purchase a plan.'
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
      // 0. Double-check duplicate active plan inside transaction lock
      const existingInTx = await tx.userInvestment.findFirst({
        where: {
          userId,
          planId: plan.id,
          status: 'ACTIVE'
        }
      });
      if (existingInTx) {
        throw new Error(`Aapka "${plan.name}" pehle se ACTIVE hai! Yeh plan khatam hone par hi dobara buy kiya ja sakta hai.`);
      }

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
          // Dynamic Referral Tier Ladder:
          // 1st referral reward: 50%
          // 2nd referral reward: 40%
          // 3rd referral reward: 30%
          // 4th referral reward: 20%
          // 5th+ and all future referral rewards: 10%
          const previousEarningsCount = await tx.referralEarning.count({
            where: { referrerId: referrer.id }
          });

          let bonusPercent = 50.0;
          if (previousEarningsCount === 0) {
            bonusPercent = 50.0;
          } else if (previousEarningsCount === 1) {
            bonusPercent = 40.0;
          } else if (previousEarningsCount === 2) {
            bonusPercent = 30.0;
          } else if (previousEarningsCount === 3) {
            bonusPercent = 20.0;
          } else {
            bonusPercent = 10.0; // 5th referral and all future ones stay at 10%
          }

          const bonusAmount = (plan.price * (bonusPercent / 100));

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
              planName: `${plan.name} (${bonusPercent}% Bonus)`,
              planPrice: plan.price,
              amount: bonusAmount
            }
          });

          console.log(`[REFERRAL BONUS ${bonusPercent}%] Credited Rs. ${bonusAmount} to referrer ${referrer.name} for friend ${user.name}'s ${plan.name} purchase (Tier count: ${previousEarningsCount + 1})`);
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

// @desc Get current user active investments with exact claimable calculation
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

    const now = new Date();
    let claimableAmount = 0;
    let claimablePlansCount = 0;

    const enrichedInvestments = investments.map((inv) => {
      let isClaimable = false;
      if (inv.status === 'ACTIVE' && inv.daysClaimed < inv.durationDays) {
        if (!inv.lastClaimedAt) {
          isClaimable = true;
        } else {
          const diffHours = (now - new Date(inv.lastClaimedAt)) / (1000 * 60 * 60);
          if (diffHours >= 20) {
            isClaimable = true;
          }
        }
      }

      if (isClaimable) {
        claimableAmount += inv.dailyBonus;
        claimablePlansCount += 1;
      }

      return {
        ...inv,
        isClaimable
      };
    });

    return res.status(200).json({
      success: true,
      investments: enrichedInvestments,
      claimableAmount,
      claimablePlansCount
    });
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

// @desc Claim daily bonus for a SINGLE specific investment plan
// @route POST /api/plans/claim-daily/:id
const claimIndividualPlanProfit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const inv = await prisma.userInvestment.findFirst({
      where: {
        id,
        userId
      },
      include: { plan: true }
    });

    if (!inv) {
      return res.status(404).json({ success: false, message: 'Investment plan not found on your account.' });
    }

    if (inv.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'This plan is already completed or inactive.' });
    }

    if (inv.daysClaimed >= inv.durationDays) {
      return res.status(400).json({ success: false, message: 'All days profit for this plan have already been claimed.' });
    }

    const now = new Date();
    if (inv.lastClaimedAt) {
      const diffHours = (now - new Date(inv.lastClaimedAt)) / (1000 * 60 * 60);
      if (diffHours < 20) {
        const remainingHours = Math.ceil(24 - diffHours);
        return res.status(400).json({
          success: false,
          message: `Aapne is plan ka daily bonus aaj pehle hi collect kar liya hai! Agla bonus ${remainingHours} ghante baad unlock hoga.`
        });
      }
    }

    const profitAmount = inv.dailyBonus;
    const newDaysClaimed = inv.daysClaimed + 1;
    const isComplete = newDaysClaimed >= inv.durationDays;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          balance: { increment: profitAmount },
          totalEarned: { increment: profitAmount }
        }
      }),
      prisma.userInvestment.update({
        where: { id: inv.id },
        data: {
          daysClaimed: newDaysClaimed,
          lastClaimedAt: now,
          status: isComplete ? 'COMPLETED' : 'ACTIVE'
        }
      })
    ]);

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true, totalEarned: true }
    });

    return res.status(200).json({
      success: true,
      message: `Rs. ${profitAmount.toLocaleString()} profit collected for ${inv.plan?.name || 'Plan'}! Added to your wallet.`,
      claimedAmount: profitAmount,
      investmentId: inv.id,
      daysClaimed: newDaysClaimed,
      isComplete,
      newBalance: updatedUser.balance
    });
  } catch (error) {
    console.error('Claim individual plan error:', error);
    return res.status(500).json({ success: false, message: 'Failed to claim plan profit.' });
  }
};

module.exports = { getPlans, buyPlan, getMyInvestments, claimDailyProfit, claimIndividualPlanProfit };

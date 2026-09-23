const express = require('express');
const router = express.Router();
const { getPlans, buyPlan, getMyInvestments, claimDailyProfit } = require('../controllers/planController');
const { protect, checkNotRestricted } = require('../middleware/authMiddleware');

router.get('/', getPlans);
router.post('/buy', protect, checkNotRestricted, buyPlan);
router.get('/my-investments', protect, getMyInvestments);
router.post('/claim-daily', protect, checkNotRestricted, claimDailyProfit);

module.exports = router;

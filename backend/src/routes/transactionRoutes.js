const express = require('express');
const router = express.Router();
const {
  getGatewayInfo,
  getWithdrawalTierStatus,
  submitDeposit,
  getMyDeposits,
  submitWithdrawal,
  getMyWithdrawals,
  getLivePayouts
} = require('../controllers/transactionController');
const { protect, checkNotRestricted } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/gateway-info', getGatewayInfo);
router.get('/live-payouts', getLivePayouts);
router.get('/withdraw-tier', protect, getWithdrawalTierStatus);
router.post('/deposit', protect, checkNotRestricted, upload, submitDeposit);
router.get('/my-deposits', protect, getMyDeposits);
router.post('/withdraw', protect, checkNotRestricted, submitWithdrawal);
router.get('/my-withdrawals', protect, getMyWithdrawals);

module.exports = router;

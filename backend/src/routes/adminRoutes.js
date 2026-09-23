const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/deposits', getAllDeposits);
router.post('/deposits/:id/approve', approveDeposit);
router.post('/deposits/:id/reject', rejectDeposit);

router.get('/withdrawals', getAllWithdrawals);
router.post('/withdrawals/:id/approve', approveWithdrawal);
router.post('/withdrawals/:id/reject', rejectWithdrawal);

router.get('/users', getAllUsers);
router.post('/users/:id/balance', updateUserBalance);
router.post('/users/:id/restrict', toggleUserRestriction);
router.post('/users/:id/set-referrer', setUserReferrer);
router.delete('/users/:id', deleteUser);
router.put('/settings', updateSettings);

// Admin Plans Management
router.get('/plans', getAllAdminPlans);
router.post('/plans', createAdminPlan);
router.put('/plans/:id', updateAdminPlan);
router.delete('/plans/:id', deleteAdminPlan);

module.exports = router;

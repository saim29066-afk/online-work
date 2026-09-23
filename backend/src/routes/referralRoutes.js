const express = require('express');
const router = express.Router();
const { getReferralData } = require('../controllers/referralController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getReferralData);

module.exports = router;

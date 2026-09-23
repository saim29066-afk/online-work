const express = require('express');
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  replyTicket
} = require('../controllers/supportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createTicket);
router.get('/my-tickets', protect, getMyTickets);

// Admin support routes
router.get('/admin/tickets', protect, adminOnly, getAllTickets);
router.post('/admin/tickets/:id/reply', protect, adminOnly, replyTicket);

module.exports = router;

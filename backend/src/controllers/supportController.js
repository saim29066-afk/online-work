const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc Submit Support Ticket
// @route POST /api/support
const createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user.id;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide subject and message' });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        message
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Support ticket submitted. Our team will assist you shortly.',
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create support ticket' });
  }
};

// @desc Get current user's tickets
// @route GET /api/support/my-tickets
const getMyTickets = async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error('Get my tickets error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
};

// @desc Admin: Get all tickets
// @route GET /api/support/admin/tickets
const getAllTickets = async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error('Admin get tickets error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch all tickets' });
  }
};

// @desc Admin: Reply / Resolve ticket
// @route POST /api/support/admin/tickets/:id/reply
const replyTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ success: false, message: 'Please provide reply message' });
    }

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: {
        reply,
        status: 'RESOLVED'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Ticket replied and resolved successfully',
      ticket: updated
    });
  } catch (error) {
    console.error('Reply ticket error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reply to ticket' });
  }
};

module.exports = { createTicket, getMyTickets, getAllTickets, replyTicket };

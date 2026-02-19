const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');
const {
  createTicket,
  getTickets,
  resolveTicket,
  approveTicket,
  clearTicket,
} = require('../controllers/ticketsController');

// All routes require authentication
router.use(verifyToken);

// List tickets: tenant sees own; landlord sees active by default
router.get('/', authorizeRole('tenant', 'landlord'), getTickets);

// Create ticket (tenant only)
router.post('/', authorizeRole('tenant'), createTicket);

// Landlord actions
router.patch('/:id/resolve', authorizeRole('landlord'), resolveTicket);
router.patch('/:id/clear', authorizeRole('landlord'), clearTicket);

// Tenant action
router.patch('/:id/approve', authorizeRole('tenant'), approveTicket);

module.exports = router;

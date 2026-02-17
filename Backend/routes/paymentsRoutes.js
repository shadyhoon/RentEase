const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');
const {
  createOrder,
  verifyPayment,
  getLandlordPayments,
  getTenantPayments,
} = require('../controllers/paymentsController');

// All payment routes require authentication
router.use(verifyToken);

// Tenant routes
router.post('/create-order', authorizeRole('tenant'), createOrder);
router.post('/verify', authorizeRole('tenant'), verifyPayment);
router.get('/tenant/:tenantId', authorizeRole('tenant'), getTenantPayments);

// Landlord routes
router.get('/landlord/:landlordId', authorizeRole('landlord'), getLandlordPayments);

module.exports = router;


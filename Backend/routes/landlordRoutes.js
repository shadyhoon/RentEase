const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');
const {
  getDashboardStats,
  getTenants,
  createAgreement,
} = require('../controllers/landlordController');

// All routes under /api/landlord require authentication + landlord role
router.use(verifyToken);
router.use(authorizeRole('landlord'));

// Dashboard stats
router.get('/dashboard-stats', getDashboardStats);

// Get all tenants
router.get('/tenants', getTenants);

// Create agreement (and tenant)
router.post('/agreements', createAgreement);

// Profile route (kept for compatibility)
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    message: 'Landlord profile',
    data: { user: req.user },
  });
});

module.exports = router;

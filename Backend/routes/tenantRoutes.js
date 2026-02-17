const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');
const { getMyNotifications } = require('../controllers/tenantController');

// All routes under /api/tenant require authentication + tenant role
router.use(verifyToken);
router.use(authorizeRole('tenant'));

// Example protected tenant route
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    message: 'Tenant profile',
    data: { user: req.user },
  });
});

router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'Tenant dashboard data',
    data: { userId: req.user.id, role: req.user.role },
  });
});

// Tenant notifications
router.get('/notifications', getMyNotifications);

module.exports = router;

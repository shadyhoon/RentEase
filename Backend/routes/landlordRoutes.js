const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');

// All routes under /api/landlord require authentication + landlord role
router.use(verifyToken);
router.use(authorizeRole('landlord'));

// Example protected landlord route
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    message: 'Landlord profile',
    data: { user: req.user },
  });
});

router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'Landlord dashboard data',
    data: { userId: req.user.id, role: req.user.role },
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// POST /api/auth/register - create account (name, email, password, role)
router.post('/register', register);

// POST /api/auth/login - get JWT (email, password)
router.post('/login', login);

module.exports = router;

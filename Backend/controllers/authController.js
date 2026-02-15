const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT for user (id, email, role). Expires in 7 days.
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register - body: name, email, password, role (tenant|landlord)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password and role (tenant or landlord).',
      });
    }

    if (!['tenant', 'landlord'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either tenant or landlord.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({ name, email: email.toLowerCase(), password, role });
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Registration failed.' });
  }
};

// POST /api/auth/login - body: email, password. Returns JWT and user.
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Login failed.' });
  }
};

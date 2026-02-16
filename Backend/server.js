require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const landlordRoutes = require('./routes/landlordRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true })); // Allow frontend origin; adjust in production
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/', (req, res) => {
  res.send('RentEase backend is running');
});

// Debug endpoint to check env vars
app.get('/api/debug/env', (req, res) => {
  res.json({
    JWT_SECRET: process.env.JWT_SECRET ? 'SET (' + process.env.JWT_SECRET.length + ' chars)' : 'NOT SET',
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI ? 'SET' : 'NOT SET'
  });
});

// Check MongoDB connection (1 = connected, 0 = disconnected, 2 = connecting, 3 = disconnecting)
app.get('/api/health', (req, res) => {
  const state = mongoose.connection.readyState;
  const connected = state === 1;
  res.json({
    ok: connected,
    mongo: connected ? 'connected' : 'disconnected',
    readyState: state,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/landlord', landlordRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rentease')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');
const {
  approveAgreement,
  getMyAgreements,
  getLandlordAgreements,
  deleteExpiredAgreement,
} = require('../controllers/agreementsController');

// Tenant approvals + tenant agreement access
router.post('/:id/approve', verifyToken, authorizeRole('tenant'), approveAgreement);
router.get('/my', verifyToken, authorizeRole('tenant'), getMyAgreements);

// Landlord agreement list (optional for dashboards)
router.get('/landlord', verifyToken, authorizeRole('landlord'), getLandlordAgreements);

// Landlord: delete expired agreement (soft delete)
router.delete('/:id', verifyToken, authorizeRole('landlord'), deleteExpiredAgreement);

module.exports = router;


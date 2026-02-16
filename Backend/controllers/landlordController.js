const Tenant = require('../models/Tenant');
const Agreement = require('../models/Agreement');

/**
 * GET /api/landlord/dashboard-stats
 * Returns dashboard statistics for the logged-in landlord.
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const landlordId = req.user.id;
    
    // Ensure we have a valid user ID
    if (!landlordId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token',
      });
    }

    // Import mongoose for ObjectId conversion
    const mongoose = require('mongoose');
    
    // Convert string ID to ObjectId for mongoose queries (Mongoose handles this automatically, but explicit conversion ensures compatibility)
    let landlordObjectId = landlordId;
    try {
      if (mongoose.Types.ObjectId.isValid(landlordId)) {
        landlordObjectId = new mongoose.Types.ObjectId(landlordId);
      }
    } catch (e) {
      // If conversion fails, use original ID (Mongoose will handle it)
      landlordObjectId = landlordId;
    }

    // Count active tenants
    const activeTenantsCount = await Tenant.countDocuments({
      landlordId: landlordObjectId,
      isActive: true,
    });

    // Count unique properties (distinct addresses)
    const properties = await Tenant.distinct('propertyAddress', {
      landlordId: landlordObjectId,
      isActive: true,
    });
    const propertiesCount = properties.length;

    // Calculate total collected (sum of rent from active tenants)
    const tenants = await Tenant.find({
      landlordId: landlordObjectId,
      isActive: true,
    }).select('rentAmount');
    const totalCollected = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);

    // Pending issues (placeholder - can be replaced with actual tickets count later)
    const pendingIssues = 0; // TODO: integrate with tickets system

    res.json({
      success: true,
      data: {
        activeTenants: activeTenantsCount,
        properties: propertiesCount,
        totalCollected: totalCollected,
        pendingIssues: pendingIssues,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch dashboard stats',
    });
  }
};

/**
 * GET /api/landlord/tenants
 * Returns list of all active tenants for the logged-in landlord.
 */
exports.getTenants = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const mongoose = require('mongoose');
    let landlordObjectId = landlordId;
    try {
      if (mongoose.Types.ObjectId.isValid(landlordId)) {
        landlordObjectId = new mongoose.Types.ObjectId(landlordId);
      }
    } catch (e) {
      landlordObjectId = landlordId;
    }

    const tenants = await Tenant.find({
      landlordId: landlordObjectId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .select('name email propertyAddress rentAmount agreementStatus agreementStartDate agreementDuration');

    res.json({
      success: true,
      data: tenants,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch tenants',
    });
  }
};

/**
 * POST /api/landlord/agreements
 * Creates a new agreement and tenant record when agreement is signed.
 */
exports.createAgreement = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const mongoose = require('mongoose');
    let landlordObjectId = landlordId;
    try {
      if (mongoose.Types.ObjectId.isValid(landlordId)) {
        landlordObjectId = new mongoose.Types.ObjectId(landlordId);
      }
    } catch (e) {
      landlordObjectId = landlordId;
    }
    const {
      tenantName,
      tenantEmail,
      landlordName,
      propertyAddress,
      rentAmount,
      duration,
      startDate,
    } = req.body;

    if (!tenantName || !tenantEmail || !propertyAddress || !rentAmount || !duration || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Create agreement
    const agreement = await Agreement.create({
      landlordId: landlordObjectId,
      tenantName,
      tenantEmail: tenantEmail.toLowerCase(),
      landlordName,
      propertyAddress,
      rentAmount: Number(rentAmount),
      duration: Number(duration),
      startDate: new Date(startDate),
      status: 'signed',
    });

    // Create or update tenant record
    let tenant = await Tenant.findOne({
      landlordId: landlordObjectId,
      email: tenantEmail.toLowerCase(),
      propertyAddress,
    });

    if (tenant) {
      // Update existing tenant
      tenant.name = tenantName;
      tenant.rentAmount = Number(rentAmount);
      tenant.agreementStatus = 'active';
      tenant.agreementStartDate = new Date(startDate);
      tenant.agreementDuration = Number(duration);
      tenant.isActive = true;
      await tenant.save();
    } else {
      // Create new tenant
      tenant = await Tenant.create({
        landlordId: landlordObjectId,
        name: tenantName,
        email: tenantEmail.toLowerCase(),
        propertyAddress,
        rentAmount: Number(rentAmount),
        agreementStatus: 'active',
        agreementStartDate: new Date(startDate),
        agreementDuration: Number(duration),
        isActive: true,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Agreement created and tenant added successfully',
      data: {
        agreement,
        tenant,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create agreement',
    });
  }
};

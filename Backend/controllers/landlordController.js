const Tenant = require('../models/Tenant');
const Agreement = require('../models/Agreement');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');

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

    // Calculate total collected: sum of successful payments only
    const paymentAgg = await Payment.aggregate([
      {
        $match: {
          landlordId: landlordObjectId,
          paymentStatus: 'Success',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);
    const totalCollected = paymentAgg.length > 0 ? paymentAgg[0].total : 0;

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

    const normalizedTenantEmail = tenantEmail.toLowerCase().trim();

    // Attempt to link to an existing tenant user (optional; notifications will still match by email)
    const tenantUser = await User.findOne({
      email: normalizedTenantEmail,
      role: 'tenant',
    }).select('_id email role');

    // Create agreement
    const agreement = await Agreement.create({
      landlordId: landlordObjectId,
      tenantId: tenantUser?._id || null,
      tenantName,
      tenantEmail: normalizedTenantEmail,
      landlordName,
      propertyAddress,
      rentAmount: Number(rentAmount),
      duration: Number(duration),
      startDate: new Date(startDate),
      status: 'sent_to_tenant',
      sentToTenantAt: new Date(),
    });

    // Create a tenant notification (stored as Pending until tenant approves)
    await Notification.create({
      type: 'AGREEMENT_SENT',
      status: 'PENDING',
      landlordId: landlordObjectId,
      recipientUserId: tenantUser?._id || null,
      recipientEmail: normalizedTenantEmail,
      agreementId: agreement._id,
      title: 'New rental agreement awaiting your approval',
      message: `Agreement for ${propertyAddress} (₹${Number(rentAmount)}/month, ${Number(duration)} months) is awaiting your confirmation.`,
    });

    // Create or update tenant record
    let tenant = await Tenant.findOne({
      landlordId: landlordObjectId,
      email: normalizedTenantEmail,
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
        email: normalizedTenantEmail,
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
      message: 'Agreement created and sent to tenant for approval',
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

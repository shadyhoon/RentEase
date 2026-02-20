const Agreement = require('../models/Agreement');
const Notification = require('../models/Notification');

function normalizeStatusForApproved(status) {
  // treat legacy 'signed' as approved/signed
  if (status === 'signed') return 'approved';
  return status;
}

function computeEndDate(startDate, months) {
  if (!startDate || !months || !Number.isFinite(Number(months))) return null;
  const d = new Date(startDate);
  if (Number.isNaN(d.getTime())) return null;
  const end = new Date(d);
  end.setMonth(end.getMonth() + Number(months));
  return end;
}

async function ensureExpiryAndEndDate(agreements) {
  const now = new Date();
  const updates = [];

  for (const a of agreements) {
    if (!a || a.isDeleted || a.status === 'deleted') continue;

    const months = a.durationMonths || a.duration;
    const computedEnd = a.endDate || computeEndDate(a.startDate, months);
    const needsEndDate = !a.endDate && computedEnd;

    const shouldExpire =
      computedEnd &&
      now > computedEnd &&
      (a.status === 'approved' || a.status === 'signed');

    if (needsEndDate || shouldExpire) {
      if (needsEndDate) a.endDate = computedEnd;
      if (shouldExpire) a.status = 'expired';
      updates.push(a.save());
    }
  }

  if (updates.length > 0) {
    await Promise.allSettled(updates);
  }
}

/**
 * POST /api/agreements/:id/approve
 * Tenant approves an agreement assigned to them.
 */
exports.approveAgreement = async (req, res) => {
  try {
    const agreementId = req.params.id;
    const tenantUserId = req.user.id;
    const tenantEmail = (req.user.email || '').toLowerCase().trim();

    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement not found' });
    }

    // Ensure this agreement is assigned to the requesting tenant (by tenantId OR tenantEmail)
    const matchesById = agreement.tenantId && agreement.tenantId.toString() === tenantUserId;
    const matchesByEmail = agreement.tenantEmail && agreement.tenantEmail.toLowerCase() === tenantEmail;
    if (!matchesById && !matchesByEmail) {
      return res.status(403).json({ success: false, message: 'Access denied for this agreement' });
    }

    const current = normalizeStatusForApproved(agreement.status);
    if (current === 'approved') {
      return res.json({
        success: true,
        message: 'Agreement already approved',
        data: agreement,
      });
    }

    if (agreement.status !== 'sent_to_tenant' && agreement.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: `Agreement cannot be approved from status: ${agreement.status}`,
      });
    }

    agreement.status = 'approved';
    agreement.tenantApprovalTimestamp = new Date();
    await agreement.save();

    // Update related notifications for this tenant/email
    await Notification.updateMany(
      {
        agreementId: agreement._id,
        type: 'AGREEMENT_SENT',
        $or: [{ recipientUserId: tenantUserId }, { recipientEmail: tenantEmail }],
      },
      { $set: { status: 'APPROVED', actedAt: new Date() } }
    );

    res.json({
      success: true,
      message: 'Agreement approved successfully',
      data: agreement,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to approve agreement',
    });
  }
};

/**
 * GET /api/agreements/my
 * Tenant: get agreements assigned to them. Defaults to approved/signed only.
 */
exports.getMyAgreements = async (req, res) => {
  try {
    const tenantUserId = req.user.id;
    const tenantEmail = (req.user.email || '').toLowerCase().trim();
    const status = (req.query.status || 'approved').toLowerCase().trim();

    const baseMatch = {
      $or: [{ tenantId: tenantUserId }, { tenantEmail }],
    };

    let statusMatch = {};
    if (status === 'approved' || status === 'signed') {
      statusMatch = { status: { $in: ['approved', 'signed'] } };
    } else if (status === 'all') {
      // Tenant: show current + expired (deleted hidden)
      statusMatch = { status: { $in: ['approved', 'signed', 'expired'] } };
    } else if (status) {
      statusMatch = { status };
    }

    const agreements = await Agreement.find({ ...baseMatch, isDeleted: { $ne: true }, ...statusMatch })
      .sort({ updatedAt: -1 })
      .limit(50);

    await ensureExpiryAndEndDate(agreements);

    res.json({ success: true, data: agreements });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch agreements',
    });
  }
};

/**
 * GET /api/agreements/landlord
 * Landlord: get their agreements (all statuses).
 */
exports.getLandlordAgreements = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const agreements = await Agreement.find({ landlordId, isDeleted: { $ne: true } })
      .sort({ updatedAt: -1 })
      .limit(100);

    await ensureExpiryAndEndDate(agreements);

    res.json({ success: true, data: agreements });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch agreements',
    });
  }
};

/**
 * DELETE /api/agreements/:id
 * Landlord: soft delete an expired agreement.
 */
exports.deleteExpiredAgreement = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const agreementId = req.params.id;

    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement not found' });
    }

    if (String(agreement.landlordId) !== String(landlordId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (agreement.isDeleted || agreement.status === 'deleted') {
      return res.status(400).json({ success: false, message: 'Agreement already deleted' });
    }

    // ensure expiry is evaluated before allowing delete
    const months = agreement.durationMonths || agreement.duration;
    if (!agreement.endDate && agreement.startDate && months) {
      agreement.endDate = computeEndDate(agreement.startDate, months);
    }
    if (agreement.endDate && new Date() > agreement.endDate && (agreement.status === 'approved' || agreement.status === 'signed')) {
      agreement.status = 'expired';
    }

    if (agreement.status !== 'expired') {
      return res.status(400).json({
        success: false,
        message: 'Only expired agreements can be deleted',
      });
    }

    agreement.isDeleted = true;
    agreement.status = 'deleted';
    await agreement.save();

    return res.json({
      success: true,
      message: 'Agreement deleted successfully',
      data: agreement,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete agreement',
    });
  }
};


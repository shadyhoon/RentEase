const MaintenanceTicket = require('../models/MaintenanceTicket');

function normalizePriority(priority) {
  if (!priority) return 'Medium';
  const p = String(priority).trim().toLowerCase();
  if (p === 'low') return 'Low';
  if (p === 'high') return 'High';
  return 'Medium';
}

function canTenantAccessTicket(reqUser, ticket) {
  if (!reqUser) return false;
  const userEmail = (reqUser.email || '').toLowerCase().trim();
  if (ticket.tenantId && String(ticket.tenantId) === String(reqUser.id)) return true;
  if (ticket.tenantEmail && String(ticket.tenantEmail).toLowerCase().trim() === userEmail) return true;
  return false;
}

// POST /tickets or /api/tickets (tenant only)
exports.createTicket = async (req, res) => {
  try {
    const { issueDescription, priority } = req.body;

    if (!issueDescription || String(issueDescription).trim() === '') {
      return res.status(400).json({ success: false, message: 'Issue description is required.' });
    }

    const tenantName = req.user?.name || req.user?.email || 'Tenant';
    const tenantEmail = (req.user?.email || '').toLowerCase().trim();

    if (!tenantEmail) {
      return res.status(400).json({ success: false, message: 'Tenant email missing from token.' });
    }

    const ticket = await MaintenanceTicket.create({
      tenantId: req.user.id || null,
      tenantName,
      tenantEmail,
      issueDescription: String(issueDescription).trim(),
      priority: normalizePriority(priority),
      status: 'Open',
      approvalStatus: 'Pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Ticket created successfully.',
      data: ticket,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to create ticket.' });
  }
};

// GET /tickets or /api/tickets
// - tenant: only their tickets
// - landlord: all active tickets (Open/Resolved) by default; allow ?status=...
exports.getTickets = async (req, res) => {
  try {
    const role = req.user?.role;
    const status = req.query.status;

    const query = {};

    if (role === 'tenant') {
      // strict: only see own tickets
      const tenantEmail = (req.user?.email || '').toLowerCase().trim();
      query.$or = [{ tenantId: req.user.id }, { tenantEmail }];
    }

    if (status) {
      query.status = status;
    } else if (role === 'landlord') {
      query.status = { $in: ['Open', 'Resolved'] };
    }

    const tickets = await MaintenanceTicket.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, data: tickets });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch tickets.' });
  }
};

// PATCH /tickets/:id/resolve (landlord only)
exports.resolveTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await MaintenanceTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    if (ticket.status === 'Closed') {
      return res.status(400).json({ success: false, message: 'Closed tickets cannot be resolved.' });
    }

    ticket.status = 'Resolved';
    await ticket.save();

    return res.json({
      success: true,
      message: 'Waiting for Tenant Approval',
      data: ticket,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to resolve ticket.' });
  }
};

// PATCH /tickets/:id/approve (tenant only)
exports.approveTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await MaintenanceTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    if (!canTenantAccessTicket(req.user, ticket)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (ticket.status !== 'Resolved') {
      return res.status(400).json({ success: false, message: 'Only resolved tickets can be approved.' });
    }

    ticket.approvalStatus = 'Approved';
    await ticket.save();

    return res.json({
      success: true,
      message: 'Resolution approved.',
      data: ticket,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to approve ticket.' });
  }
};

// PATCH /tickets/:id/clear (landlord only)
exports.clearTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await MaintenanceTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    if (!(ticket.status === 'Resolved' && ticket.approvalStatus === 'Approved')) {
      return res.status(400).json({
        success: false,
        message: 'Ticket can only be cleared when Resolved and Approved.',
      });
    }

    ticket.status = 'Closed';
    await ticket.save();

    return res.json({
      success: true,
      message: 'Ticket cleared.',
      data: ticket,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to clear ticket.' });
  }
};

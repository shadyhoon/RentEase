const Notification = require('../models/Notification');

/**
 * GET /api/tenant/notifications
 * Returns notifications for the authenticated tenant (matched by userId or email).
 */
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const email = (req.user.email || '').toLowerCase().trim();

    const notifications = await Notification.find({
      $or: [{ recipientUserId: userId }, { recipientEmail: email }],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch notifications',
    });
  }
};


const mongoose = require('mongoose');

/**
 * Notification model: lightweight alerts for users (tenant agreement approvals, etc).
 */
const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['AGREEMENT_SENT'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED'],
      default: 'PENDING',
      required: true,
    },
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    agreementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agreement',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    actedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientEmail: 1, status: 1, createdAt: -1 });
notificationSchema.index({ recipientUserId: 1, status: 1, createdAt: -1 });
notificationSchema.index({ agreementId: 1 });

module.exports = mongoose.model('Notification', notificationSchema);


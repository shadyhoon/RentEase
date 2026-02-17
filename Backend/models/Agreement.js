const mongoose = require('mongoose');

/**
 * Agreement model: stores rental agreement details.
 * Created by landlord and sent to tenant for approval.
 */
const agreementSchema = new mongoose.Schema(
  {
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    tenantName: {
      type: String,
      required: true,
      trim: true,
    },
    tenantEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    landlordName: {
      type: String,
      required: true,
      trim: true,
    },
    propertyAddress: {
      type: String,
      required: true,
    },
    rentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number, // in months
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    // Timestamp when landlord created/sent the agreement
    sentToTenantAt: {
      type: Date,
      default: null,
    },
    // Timestamp when tenant approved/signed the agreement
    tenantApprovalTimestamp: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      // Keep legacy statuses ('signed', 'expired', 'terminated') for compatibility with existing data
      enum: ['draft', 'sent_to_tenant', 'approved', 'signed', 'expired', 'terminated'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

// Index for faster queries
agreementSchema.index({ landlordId: 1, status: 1 });
agreementSchema.index({ tenantEmail: 1, status: 1 });
agreementSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('Agreement', agreementSchema);

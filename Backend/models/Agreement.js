const mongoose = require('mongoose');

/**
 * Agreement model: stores rental agreement details.
 * Created when landlord creates and signs an agreement.
 */
const agreementSchema = new mongoose.Schema(
  {
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    signedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['draft', 'signed', 'expired', 'terminated'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

// Index for faster queries
agreementSchema.index({ landlordId: 1, status: 1 });

module.exports = mongoose.model('Agreement', agreementSchema);

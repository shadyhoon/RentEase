const mongoose = require('mongoose');

/**
 * Tenant model: stores tenant information linked to a landlord and property.
 * Created when an agreement is signed.
 */
const tenantSchema = new mongoose.Schema(
  {
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
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
    agreementStatus: {
      type: String,
      enum: ['active', 'expired', 'terminated'],
      default: 'active',
    },
    agreementStartDate: {
      type: Date,
      required: true,
    },
    agreementDuration: {
      type: Number, // in months
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
tenantSchema.index({ landlordId: 1, isActive: 1 });

module.exports = mongoose.model('Tenant', tenantSchema);

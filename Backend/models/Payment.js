const mongoose = require('mongoose');

/**
 * Payment model: stores rent payments made by tenants via Razorpay.
 */
const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agreementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agreement',
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
    propertyAddress: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Success', 'Failed', 'Pending'],
      default: 'Pending',
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ landlordId: 1, paymentStatus: 1, paymentDate: -1 });
paymentSchema.index({ tenantId: 1, paymentStatus: 1, paymentDate: -1 });

// Ensure paymentId is always populated with the document _id string
paymentSchema.pre('save', function (next) {
  if (!this.paymentId) {
    this.paymentId = this._id.toString();
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);


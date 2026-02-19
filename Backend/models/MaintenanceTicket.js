const mongoose = require('mongoose');

const maintenanceTicketSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    tenantName: {
      type: String,
      required: [true, 'Tenant name is required'],
      trim: true,
    },
    tenantEmail: {
      type: String,
      required: [true, 'Tenant email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    issueDescription: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: [true, 'Priority is required'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'Resolved', 'Closed'],
      default: 'Open',
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: ['Pending', 'Approved'],
      default: 'Pending',
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MaintenanceTicket', maintenanceTicketSchema);

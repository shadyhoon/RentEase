const Razorpay = require('razorpay');
const crypto = require('crypto');

const Agreement = require('../models/Agreement');
const Payment = require('../models/Payment');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

let razorpayClient = null;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpayClient = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

function ensureRazorpayConfigured() {
  if (!razorpayClient) {
    const msg =
      'Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env.';
    const error = new Error(msg);
    error.statusCode = 500;
    throw error;
  }
}

/**
 * POST /api/payments/create-order
 * Tenant: create a Razorpay order for the current rent cycle.
 * Body: { agreementId }
 */
exports.createOrder = async (req, res) => {
  try {
    ensureRazorpayConfigured();

    const tenantUserId = req.user.id;
    const tenantEmail = (req.user.email || '').toLowerCase().trim();
    const { agreementId } = req.body || {};

    if (!agreementId) {
      return res
        .status(400)
        .json({ success: false, message: 'agreementId is required to create a payment order.' });
    }

    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement not found.' });
    }

    // Ensure this agreement belongs to the requesting tenant
    const matchesById = agreement.tenantId && agreement.tenantId.toString() === tenantUserId;
    const matchesByEmail =
      agreement.tenantEmail && agreement.tenantEmail.toLowerCase() === tenantEmail;
    if (!matchesById && !matchesByEmail) {
      return res
        .status(403)
        .json({ success: false, message: 'You are not allowed to pay for this agreement.' });
    }

    if (!agreement.rentAmount || agreement.rentAmount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Agreement has invalid rent amount.' });
    }

    const amountRupees = Number(agreement.rentAmount);
    const amountPaise = Math.round(amountRupees * 100);

    const order = await razorpayClient.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `rent_${agreement._id}_${Date.now()}`,
      notes: {
        agreementId: agreement._id.toString(),
        landlordId: agreement.landlordId.toString(),
        tenantId: tenantUserId,
      },
    });

    // Create a pending payment record tied to this order
    const payment = await Payment.create({
      tenantId: tenantUserId,
      landlordId: agreement.landlordId,
      agreementId: agreement._id,
      tenantName: agreement.tenantName,
      tenantEmail: agreement.tenantEmail.toLowerCase(),
      propertyAddress: agreement.propertyAddress,
      amount: amountRupees,
      paymentStatus: 'Pending',
      razorpayOrderId: order.id,
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: RAZORPAY_KEY_ID,
        paymentId: payment.paymentId,
        tenantName: agreement.tenantName,
        tenantEmail: agreement.tenantEmail,
        propertyAddress: agreement.propertyAddress,
        agreementId: agreement._id,
      },
    });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({
      success: false,
      message: err.message || 'Failed to create payment order.',
    });
  }
};

/**
 * POST /api/payments/verify
 * Tenant: verify Razorpay payment signature and mark payment as Success / Failed.
 * Body: { razorpayPaymentId, razorpayOrderId, razorpaySignature }
 */
exports.verifyPayment = async (req, res) => {
  try {
    ensureRazorpayConfigured();

    const tenantUserId = req.user.id;
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body || {};

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'razorpayPaymentId, razorpayOrderId and razorpaySignature are required.',
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpaySignature;

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found for this order.',
      });
    }

    if (payment.tenantId.toString() !== tenantUserId) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to verify this payment.',
      });
    }

    if (!isAuthentic) {
      payment.paymentStatus = 'Failed';
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.paymentDate = new Date();
      await payment.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.',
      });
    }

    // Mark as successful
    payment.paymentStatus = 'Success';
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.paymentDate = new Date();
    await payment.save();

    res.json({
      success: true,
      message: 'Payment verified successfully.',
      data: payment,
    });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({
      success: false,
      message: err.message || 'Failed to verify payment.',
    });
  }
};

/**
 * GET /api/payments/landlord/:landlordId
 * Landlord: list recent successful payments.
 */
exports.getLandlordPayments = async (req, res) => {
  try {
    const landlordIdFromToken = req.user.id;
    const { landlordId } = req.params;

    if (landlordId && landlordId !== landlordIdFromToken) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own payments.',
      });
    }

    const payments = await Payment.find({
      landlordId: landlordIdFromToken,
      paymentStatus: 'Success',
    })
      .sort({ paymentDate: -1, createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch landlord payments.',
    });
  }
};

/**
 * GET /api/payments/tenant/:tenantId
 * Tenant: list their own payments.
 */
exports.getTenantPayments = async (req, res) => {
  try {
    const tenantIdFromToken = req.user.id;
    const { tenantId } = req.params;

    if (tenantId && tenantId !== tenantIdFromToken) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own payments.',
      });
    }

    const payments = await Payment.find({
      tenantId: tenantIdFromToken,
    })
      .sort({ paymentDate: -1, createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch tenant payments.',
    });
  }
};


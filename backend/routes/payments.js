const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PLANS = {
  monthly: { amount: parseInt(process.env.MONTHLY_PRICE) || 49900, days: 30 },
  yearly: { amount: parseInt(process.env.YEARLY_PRICE) || 499900, days: 365 }
};

// @POST /api/payments/create-order
// Create Razorpay order for subscription
router.post('/create-order', protect, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid plan. Choose monthly or yearly' });
    }

    const { amount } = PLANS[plan];

    const options = {
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,  // ✅ FIXED: 40 chars se kam
      notes: {
        userId: req.user._id.toString(),
        plan,
        userEmail: req.user.email
      }
    };

    const order = await razorpay.orders.create(options);

    // Save transaction as created
    await Transaction.create({
      user: req.user._id,
      type: 'subscription',
      plan,
      amount,
      razorpayOrderId: order.id,
      status: 'created'
    });

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      amount,
      plan,
      user: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || ''
      }
    });
  } catch (err) {
    console.error('PAYMENT ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/payments/verify
// Verify Razorpay payment signature and activate subscription
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Get plan info
    const planInfo = PLANS[plan];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planInfo.days);

    // Calculate contribution splits
    const charityPercent = req.user.charityContributionPercent || 10;
    const charityAmount = Math.floor((planInfo.amount * charityPercent) / 100);
    const prizePoolAmount = Math.floor((planInfo.amount * 30) / 100);

    // Update user subscription
    await User.findByIdAndUpdate(req.user._id, {
      'subscription.status': 'active',
      'subscription.plan': plan,
      'subscription.startDate': startDate,
      'subscription.endDate': endDate,
      'subscription.razorpaySubscriptionId': razorpay_payment_id
    });

    // Update transaction
    const transaction = await Transaction.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid',
        charityAmount,
        prizePoolAmount,
        charity: req.user.selectedCharity
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Payment verified! Subscription activated.',
      subscription: {
        status: 'active',
        plan,
        startDate,
        endDate
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/payments/donate
// One-time independent charity donation
router.post('/donate', protect, async (req, res) => {
  try {
    const { amount, charityId } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ success: false, message: 'Minimum donation is ₹1' });
    }

    const amountInPaise = amount * 100;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `don_${Date.now()}`,  // ✅ FIXED: 40 chars se kam
      notes: {
        userId: req.user._id.toString(),
        charityId,
        type: 'charity_donation'
      }
    };

    const order = await razorpay.orders.create(options);

    await Transaction.create({
      user: req.user._id,
      type: 'charity_donation',
      amount: amountInPaise,
      razorpayOrderId: order.id,
      charity: charityId,
      status: 'created'
    });

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      amount: amountInPaise
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/payments/history
router.get('/history', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('charity', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
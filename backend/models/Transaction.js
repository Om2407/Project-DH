const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['subscription', 'charity_donation'],
    required: true
  },
  plan: {
    type: String,
    enum: ['monthly', 'yearly']
  },
  amount: { type: Number, required: true },  // in paise (INR)
  currency: { type: String, default: 'INR' },
  
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,

  status: {
    type: String,
    enum: ['created', 'paid', 'failed', 'refunded'],
    default: 'created'
  },

  charityAmount: Number,   // portion going to charity
  prizePoolAmount: Number, // portion going to prize pool
  charity: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);

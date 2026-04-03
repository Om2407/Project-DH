const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  draw: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Draw',
    required: true
  },
  matchType: {
    type: String,
    enum: ['five_match', 'four_match', 'three_match'],
    required: true
  },
  prizeAmount: { type: Number, required: true },
  userScores: [Number],   // scores at time of draw (for reference)
  matchedNumbers: [Number],

  // Verification
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  proofScreenshot: String,  // upload path
  adminNote: String,
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Payout
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paidAt: Date,

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Winner', winnerSchema);

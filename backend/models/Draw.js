const mongoose = require('mongoose');

const drawSchema = new mongoose.Schema({
  month: { type: Number, required: true },  // 1-12
  year: { type: Number, required: true },
  
  // The 5 drawn numbers (1-45)
  drawnNumbers: {
    type: [Number],
    validate: {
      validator: arr => arr.length === 5,
      message: 'Exactly 5 numbers must be drawn'
    }
  },

  drawType: {
    type: String,
    enum: ['random', 'algorithmic'],
    default: 'random'
  },

  status: {
    type: String,
    enum: ['scheduled', 'simulation', 'published'],
    default: 'scheduled'
  },

  totalPrizePool: { type: Number, default: 0 },
  jackpotCarriedOver: { type: Number, default: 0 },  // Previous month's unclaimed jackpot

  prizes: {
    fiveMatch: {
      poolAmount: Number,
      winners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      perWinner: Number,
      claimed: { type: Boolean, default: false }
    },
    fourMatch: {
      poolAmount: Number,
      winners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      perWinner: Number
    },
    threeMatch: {
      poolAmount: Number,
      winners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      perWinner: Number
    }
  },

  publishedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// Unique draw per month/year
drawSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Draw', drawSchema);

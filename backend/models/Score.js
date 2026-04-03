const mongoose = require('mongoose');

const scoreEntrySchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 45
  },
  date: {
    type: Date,
    required: true
  }
});

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true  // One score doc per user
  },
  scores: {
    type: [scoreEntrySchema],
    validate: {
      validator: function (arr) {
        return arr.length <= 5;
      },
      message: 'Maximum 5 scores allowed'
    }
  },
  updatedAt: { type: Date, default: Date.now }
});

// Add new score — rolling window of 5
scoreSchema.methods.addScore = function (scoreValue, date) {
  this.scores.push({ score: scoreValue, date });
  // Keep only latest 5 (remove oldest)
  if (this.scores.length > 5) {
    this.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
    this.scores = this.scores.slice(0, 5);
  }
  this.updatedAt = new Date();
};

// Get scores sorted newest first
scoreSchema.methods.getSortedScores = function () {
  return [...this.scores].sort((a, b) => new Date(b.date) - new Date(a.date));
};

module.exports = mongoose.model('Score', scoreSchema);

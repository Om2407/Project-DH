const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @GET /api/users/dashboard - Full dashboard data
router.get('/dashboard', protect, async (req, res) => {
  try {
    const Score = require('../models/Score');
    const Winner = require('../models/Winner');
    const Draw = require('../models/Draw');

    const user = await User.findById(req.user._id).populate('selectedCharity', 'name logo description');
    const scoreDoc = await Score.findOne({ user: req.user._id });
    const winners = await Winner.find({ user: req.user._id })
      .populate('draw', 'month year drawnNumbers')
      .sort({ createdAt: -1 })
      .limit(5);
    const latestDraw = await Draw.findOne({ status: 'published' }).sort({ year: -1, month: -1 });

    res.json({
      success: true,
      user,
      scores: scoreDoc?.getSortedScores() || [],
      winners,
      latestDraw,
      isSubscriptionActive: user.isSubscriptionActive()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

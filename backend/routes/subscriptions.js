const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @GET /api/subscriptions/status
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      subscription: user.subscription,
      isActive: user.isSubscriptionActive()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/subscriptions/cancel
router.put('/cancel', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      'subscription.status': 'cancelled',
      'subscription.autoRenew': false
    });
    res.json({ success: true, message: 'Subscription cancelled. Access until end date.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

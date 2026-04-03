const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Draw = require('../models/Draw');
const Winner = require('../models/Winner');
const Score = require('../models/Score');
const { protect, adminOnly } = require('../middleware/auth');

// All routes are admin only
router.use(protect, adminOnly);

// @GET /api/admin/dashboard - Analytics overview
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeSubscribers = await User.countDocuments({ 'subscription.status': 'active' });
    const totalDraws = await Draw.countDocuments({ status: 'published' });
    const totalWinners = await Winner.countDocuments();

    // Total revenue
    const revenueData = await Transaction.aggregate([
      { $match: { status: 'paid', type: 'subscription' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Total charity contributions
    const charityData = await Transaction.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$charityAmount' } } }
    ]);
    const totalCharityContributions = charityData[0]?.total || 0;

    // Prize pool total
    const prizeData = await Transaction.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$prizePoolAmount' } } }
    ]);
    const totalPrizePool = prizeData[0]?.total || 0;

    // Recent signups (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentSignups = await User.countDocuments({ createdAt: { $gte: last7Days } });

    res.json({
      success: true,
      stats: {
        totalUsers, activeSubscribers, totalDraws, totalWinners,
        totalRevenue: totalRevenue / 100,
        totalCharityContributions: totalCharityContributions / 100,
        totalPrizePool: totalPrizePool / 100,
        recentSignups
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/users - All users
router.get('/users', async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = { role: 'user' };
    if (status) filter['subscription.status'] = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .populate('selectedCharity', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/users/:id
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('selectedCharity');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const scores = await Score.findOne({ user: req.params.id });
    const winners = await Winner.find({ user: req.params.id }).populate('draw', 'month year');
    const transactions = await Transaction.find({ user: req.params.id }).sort({ createdAt: -1 });

    res.json({ success: true, user, scores, winners, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/admin/users/:id - Edit user
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, phone, 'subscription.status': subStatus } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (subStatus) updateData['subscription.status'] = subStatus;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/admin/users/:id/scores - Admin edit user scores
router.put('/users/:id/scores', async (req, res) => {
  try {
    const { scores } = req.body;
    const scoreDoc = await Score.findOneAndUpdate(
      { user: req.params.id },
      { scores, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json({ success: true, scoreDoc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/admin/users/:id - Deactivate user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false, 'subscription.status': 'cancelled' });
    res.json({ success: true, message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/reports/charity - Charity contribution report
router.get('/reports/charity', async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: '$charity', totalContributions: { $sum: '$charityAmount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'charities', localField: '_id', foreignField: '_id', as: 'charity' } },
      { $unwind: { path: '$charity', preserveNullAndEmpty: true } }
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

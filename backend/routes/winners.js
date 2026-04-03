const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Winner = require('../models/Winner');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/proofs/'),
  filename: (req, file, cb) => cb(null, `proof_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// @GET /api/winners/my - User's winning history
router.get('/my', protect, async (req, res) => {
  try {
    const winners = await Winner.find({ user: req.user._id })
      .populate('draw', 'month year drawnNumbers')
      .sort({ createdAt: -1 });
    res.json({ success: true, winners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/winners/:id/upload-proof
router.post('/:id/upload-proof', protect, upload.single('proof'), async (req, res) => {
  try {
    const winner = await Winner.findOne({ _id: req.params.id, user: req.user._id });
    if (!winner) return res.status(404).json({ success: false, message: 'Winner record not found' });

    if (winner.verificationStatus === 'approved') {
      return res.status(400).json({ success: false, message: 'Already verified' });
    }

    winner.proofScreenshot = `/uploads/proofs/${req.file.filename}`;
    winner.verificationStatus = 'pending';
    await winner.save();

    res.json({ success: true, message: 'Proof uploaded. Awaiting admin review.', winner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ====== ADMIN ======

// @GET /api/winners - All winners
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    const filter = {};
    if (status) filter.verificationStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const winners = await Winner.find(filter)
      .populate('user', 'name email phone')
      .populate('draw', 'month year drawnNumbers')
      .sort({ createdAt: -1 });

    res.json({ success: true, winners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/winners/:id/verify - Admin approve/reject
router.put('/:id/verify', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const winner = await Winner.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: status,
        adminNote,
        verifiedAt: new Date(),
        verifiedBy: req.user._id
      },
      { new: true }
    ).populate('user', 'name email');

    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found' });

    res.json({ success: true, message: `Winner ${status}`, winner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/winners/:id/mark-paid - Admin mark payout complete
router.put('/:id/mark-paid', protect, adminOnly, async (req, res) => {
  try {
    const winner = await Winner.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: 'paid', paidAt: new Date() },
      { new: true }
    ).populate('user', 'name email');

    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found' });

    await User.findByIdAndUpdate(winner.user._id, { paymentStatus: 'paid' });

    res.json({ success: true, message: 'Marked as paid', winner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

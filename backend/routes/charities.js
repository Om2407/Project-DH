const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Charity = require('../models/Charity');
const { protect, adminOnly } = require('../middleware/auth');

// Multer setup for charity images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/charities/'),
  filename: (req, file, cb) => cb(null, `charity_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// @GET /api/charities - Public: Get all charities
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const charities = await Charity.find(filter).sort({ featured: -1, name: 1 });
    res.json({ success: true, charities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/charities/featured
router.get('/featured', async (req, res) => {
  try {
    const charities = await Charity.find({ featured: true, isActive: true }).limit(3);
    res.json({ success: true, charities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/charities/:id
router.get('/:id', async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });
    res.json({ success: true, charity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ====== ADMIN ======

// @POST /api/charities - Create
router.post('/', protect, adminOnly, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'images', maxCount: 5 }
]), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.logo) data.logo = `/uploads/charities/${req.files.logo[0].filename}`;
    if (req.files?.images) data.images = req.files.images.map(f => `/uploads/charities/${f.filename}`);

    const charity = await Charity.create(data);
    res.status(201).json({ success: true, charity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/charities/:id
router.put('/:id', protect, adminOnly, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'images', maxCount: 5 }
]), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.logo) data.logo = `/uploads/charities/${req.files.logo[0].filename}`;
    if (req.files?.images) data.images = req.files.images.map(f => `/uploads/charities/${f.filename}`);

    const charity = await Charity.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ success: true, charity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/charities/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Charity.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Charity deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

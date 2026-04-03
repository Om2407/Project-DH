const mongoose = require('mongoose');

const charitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: String,
  logo: String,
  images: [String],
  website: String,
  category: {
    type: String,
    enum: ['health', 'education', 'environment', 'sports', 'community', 'other'],
    default: 'other'
  },
  featured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  upcomingEvents: [{
    title: String,
    description: String,
    date: Date,
    location: String,
    type: { type: String, default: 'golf_day' }
  }],

  totalReceived: { type: Number, default: 0 },
  subscriberCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Charity', charitySchema);

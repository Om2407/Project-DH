const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  phone: String,
  avatar: String,

  // Subscription
  subscription: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'lapsed', 'cancelled'],
      default: 'inactive'
    },
    plan: {
      type: String,
      enum: ['monthly', 'yearly'],
    },
    startDate: Date,
    endDate: Date,
    razorpaySubscriptionId: String,
    razorpayCustomerId: String,
    autoRenew: { type: Boolean, default: true }
  },

  // Charity
  selectedCharity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Charity'
  },
  charityContributionPercent: {
    type: Number,
    default: 10,
    min: 10,
    max: 100
  },

  // Winnings
  totalWon: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['none', 'pending', 'paid'],
    default: 'none'
  },

  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if subscription is active
userSchema.methods.isSubscriptionActive = function () {
  return (
    this.subscription.status === 'active' &&
    this.subscription.endDate &&
    new Date(this.subscription.endDate) > new Date()
  );
};

module.exports = mongoose.model('User', userSchema);

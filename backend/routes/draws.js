const express = require('express');
const router = express.Router();
const Draw = require('../models/Draw');
const Score = require('../models/Score');
const Winner = require('../models/Winner');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect, adminOnly } = require('../middleware/auth');

// Helper: generate 5 random numbers 1-45
const generateRandomNumbers = () => {
  const nums = new Set();
  while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1);
  return Array.from(nums).sort((a, b) => a - b);
};

// Helper: algorithmic draw — weighted by frequency of user scores
const generateAlgorithmicNumbers = async () => {
  const allScores = await Score.find({});
  const freq = {};
  allScores.forEach(doc => {
    doc.scores.forEach(s => {
      freq[s.score] = (freq[s.score] || 0) + 1;
    });
  });

  // Weight inversely by frequency (less frequent = higher chance)
  const pool = [];
  for (let i = 1; i <= 45; i++) {
    const count = freq[i] || 0;
    const weight = Math.max(1, 10 - count);
    for (let w = 0; w < weight; w++) pool.push(i);
  }

  const nums = new Set();
  while (nums.size < 5) {
    nums.add(pool[Math.floor(Math.random() * pool.length)]);
  }
  return Array.from(nums).sort((a, b) => a - b);
};

// Helper: match user scores against drawn numbers
const findMatches = (userScores, drawnNumbers) => {
  const userSet = new Set(userScores.map(s => s.score));
  return drawnNumbers.filter(n => userSet.has(n));
};

// Helper: calculate prize pool from current month subscriptions
const calculatePrizePool = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const transactions = await Transaction.find({
    type: 'subscription',
    status: 'paid',
    createdAt: { $gte: startOfMonth }
  });

  // 30% of each subscription goes to prize pool
  const total = transactions.reduce((sum, t) => {
    return sum + Math.floor((t.amount * 30) / 100);
  }, 0);

  return total / 100; // convert paise to INR
};

// @GET /api/draws - Get all published draws
router.get('/', async (req, res) => {
  try {
    const draws = await Draw.find({ status: 'published' })
      .sort({ year: -1, month: -1 })
      .limit(12);
    res.json({ success: true, draws });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/draws/latest
router.get('/latest', async (req, res) => {
  try {
    const draw = await Draw.findOne({ status: 'published' })
      .sort({ year: -1, month: -1 })
      .populate('prizes.fiveMatch.winners prizes.fourMatch.winners prizes.threeMatch.winners', 'name email');
    res.json({ success: true, draw });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/draws/my-results - User's draw results
router.get('/my-results', protect, async (req, res) => {
  try {
    const winners = await Winner.find({ user: req.user._id })
      .populate('draw', 'month year drawnNumbers')
      .sort({ createdAt: -1 });
    res.json({ success: true, winners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ====== ADMIN ROUTES ======

// @POST /api/draws/simulate — Admin: run simulation
router.post('/simulate', protect, adminOnly, async (req, res) => {
  try {
    const { drawType = 'random' } = req.body;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let drawnNumbers;
    if (drawType === 'algorithmic') {
      drawnNumbers = await generateAlgorithmicNumbers();
    } else {
      drawnNumbers = generateRandomNumbers();
    }

    // Find all active subscribers with scores
    const activeUsers = await User.find({ 'subscription.status': 'active' });
    const simulationResults = [];

    for (const user of activeUsers) {
      const scoreDoc = await Score.findOne({ user: user._id });
      if (!scoreDoc || scoreDoc.scores.length === 0) continue;

      const matched = findMatches(scoreDoc.scores, drawnNumbers);
      if (matched.length >= 3) {
        simulationResults.push({
          userId: user._id,
          name: user.name,
          email: user.email,
          scores: scoreDoc.scores.map(s => s.score),
          matched,
          matchCount: matched.length
        });
      }
    }

    const prizePool = await calculatePrizePool();

    res.json({
      success: true,
      simulation: {
        month, year, drawnNumbers, drawType,
        prizePool,
        winners: simulationResults,
        fiveMatchWinners: simulationResults.filter(r => r.matchCount === 5),
        fourMatchWinners: simulationResults.filter(r => r.matchCount === 4),
        threeMatchWinners: simulationResults.filter(r => r.matchCount === 3)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/draws/publish — Admin: officially run and publish draw
router.post('/publish', protect, adminOnly, async (req, res) => {
  try {
    const { drawType = 'random', month: reqMonth, year: reqYear } = req.body;
    const now = new Date();
    const month = reqMonth || now.getMonth() + 1;
    const year = reqYear || now.getFullYear();

    // Check if draw already published this month
    const existing = await Draw.findOne({ month, year, status: 'published' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Draw already published for this month' });
    }

    let drawnNumbers;
    if (drawType === 'algorithmic') {
      drawnNumbers = await generateAlgorithmicNumbers();
    } else {
      drawnNumbers = generateRandomNumbers();
    }

    // Calculate prize pool
    let prizePool = await calculatePrizePool();

    // Add jackpot carryover from last month
    const lastDraw = await Draw.findOne({ status: 'published' }).sort({ year: -1, month: -1 });
    let jackpotCarriedOver = 0;
    if (lastDraw && !lastDraw.prizes?.fiveMatch?.claimed && lastDraw.prizes?.fiveMatch?.poolAmount) {
      jackpotCarriedOver = lastDraw.prizes.fiveMatch.poolAmount;
    }

    const totalPool = prizePool + jackpotCarriedOver;
    const fiveMatchPool = totalPool * 0.40;
    const fourMatchPool = totalPool * 0.35;
    const threeMatchPool = totalPool * 0.25;

    // Find winners
    const activeUsers = await User.find({ 'subscription.status': 'active' });
    const fiveWinners = [], fourWinners = [], threeWinners = [];

    for (const user of activeUsers) {
      const scoreDoc = await Score.findOne({ user: user._id });
      if (!scoreDoc || scoreDoc.scores.length === 0) continue;

      const matched = findMatches(scoreDoc.scores, drawnNumbers);
      if (matched.length === 5) fiveWinners.push({ user, scoreDoc, matched });
      else if (matched.length === 4) fourWinners.push({ user, scoreDoc, matched });
      else if (matched.length === 3) threeWinners.push({ user, scoreDoc, matched });
    }

    // Create draw
    const draw = await Draw.create({
      month, year, drawnNumbers, drawType,
      status: 'published',
      totalPrizePool: totalPool,
      jackpotCarriedOver,
      publishedAt: new Date(),
      prizes: {
        fiveMatch: {
          poolAmount: fiveMatchPool,
          winners: fiveWinners.map(w => w.user._id),
          perWinner: fiveWinners.length > 0 ? fiveMatchPool / fiveWinners.length : 0,
          claimed: fiveWinners.length > 0
        },
        fourMatch: {
          poolAmount: fourMatchPool,
          winners: fourWinners.map(w => w.user._id),
          perWinner: fourWinners.length > 0 ? fourMatchPool / fourWinners.length : 0
        },
        threeMatch: {
          poolAmount: threeMatchPool,
          winners: threeWinners.map(w => w.user._id),
          perWinner: threeWinners.length > 0 ? threeMatchPool / threeWinners.length : 0
        }
      }
    });

    // Create Winner documents
    const createWinnerDocs = async (winnerList, matchType, perWinner) => {
      for (const w of winnerList) {
        await Winner.create({
          user: w.user._id,
          draw: draw._id,
          matchType,
          prizeAmount: perWinner,
          userScores: w.scoreDoc.scores.map(s => s.score),
          matchedNumbers: w.matched,
          verificationStatus: 'pending',
          paymentStatus: 'pending'
        });

        await User.findByIdAndUpdate(w.user._id, {
          $inc: { totalWon: perWinner },
          paymentStatus: 'pending'
        });
      }
    };

    await createWinnerDocs(fiveWinners, 'five_match', fiveMatchPool / (fiveWinners.length || 1));
    await createWinnerDocs(fourWinners, 'four_match', fourMatchPool / (fourWinners.length || 1));
    await createWinnerDocs(threeWinners, 'three_match', threeMatchPool / (threeWinners.length || 1));

    res.json({
      success: true,
      message: 'Draw published successfully!',
      draw,
      summary: {
        drawnNumbers,
        totalPool,
        fiveMatchWinners: fiveWinners.length,
        fourMatchWinners: fourWinners.length,
        threeMatchWinners: threeWinners.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

// Run: node seed.js
// Creates admin user + sample charities

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Charity = require('./models/Charity');
const Score = require('./models/Score');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Create admin user
  const existingAdmin = await User.findOne({ email: 'admin@golfgives.com' });
  if (!existingAdmin) {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@golfgives.com',
      password: 'Admin@123',
      role: 'admin',
      subscription: { status: 'active', plan: 'yearly', endDate: new Date('2099-12-31') }
    });
    await Score.create({ user: admin._id, scores: [] });
    console.log('✅ Admin created: admin@golfgives.com / Admin@123');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // Create sample charities
  const sampleCharities = [
    {
      name: 'Green Earth Foundation',
      description: 'Dedicated to environmental conservation, tree planting drives, and sustainable golf course initiatives across India.',
      shortDescription: 'Environmental conservation and sustainability',
      category: 'environment',
      featured: true,
      upcomingEvents: [{
        title: 'Annual Golf Day for Trees',
        description: 'A charity golf day where every round plants 10 trees',
        date: new Date('2026-06-15'),
        location: 'DLF Golf & Country Club, Gurgaon'
      }]
    },
    {
      name: 'Swing for Education',
      description: 'Providing quality education and scholarships to underprivileged children in rural areas across India through golf fundraising.',
      shortDescription: 'Education scholarships for rural children',
      category: 'education',
      featured: true
    },
    {
      name: 'Hearts on the Fairway',
      description: 'Supporting cardiac care and heart health awareness programs, funding medical equipment and surgeries for those who cannot afford it.',
      shortDescription: 'Cardiac care and heart health programs',
      category: 'health',
      featured: true
    },
    {
      name: 'Veterans Golf Initiative',
      description: 'Using golf as therapy and community building for military veterans, providing mental health support and rehabilitation.',
      shortDescription: 'Golf therapy for military veterans',
      category: 'community'
    }
  ];

  for (const data of sampleCharities) {
    const exists = await Charity.findOne({ name: data.name });
    if (!exists) {
      await Charity.create(data);
      console.log(`✅ Charity created: ${data.name}`);
    }
  }

  console.log('\n🎉 Seed complete!');
  console.log('Admin login: admin@golfgives.com / Admin@123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });

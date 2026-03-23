const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Team = require('../models/Team');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Strategic Intelligence Feed Connected');

    // Purge existing data
    await User.deleteMany();
    await Team.deleteMany();
    console.log('🗑️ Cleared existing intelligence assets');

    // Initialize Tactical Squads
    const teams = await Team.create([
      {
        name: 'Technical Command',
        description: 'Lead engineering and architectural squad',
        color: '#3B82F6'
      },
      {
        name: 'Security Ops',
        description: 'Cybersecurity and infrastructure defense',
        color: '#EF4444'
      },
      {
        name: 'Growth & Intel',
        description: 'Marketing and strategic growth analysis',
        color: '#8B5CF6'
      }
    ]);

    console.log('✅ Squads initialized');

    // Create Prime Operatives (CEO & CTO)
    const ceo = await User.create({
      name: 'Alpha CEO',
      email: 'ceo@taskpholio.com',
      password: 'missioncontrol',
      role: 'CEO',
      team: teams[0]._id,
      emailVerified: true,
      isActive: true
    });

    const cto = await User.create({
      name: 'Prime CTO',
      email: 'cto@taskpholio.com',
      password: 'missioncontrol',
      role: 'CTO',
      team: teams[0]._id,
      emailVerified: true,
      isActive: true
    });

    // Technical Operatives
    const techOperatives = await User.create([
      {
        name: 'Operative Echo',
        email: 'echo@taskpholio.com',
        password: 'missioncontrol',
        role: 'Member',
        team: teams[0]._id,
        emailVerified: true
      },
      {
        name: 'Operative Sierra',
        email: 'sierra@taskpholio.com',
        password: 'missioncontrol',
        role: 'Member',
        team: teams[0]._id,
        emailVerified: true
      }
    ]);

    // Update squads with operative assignments
    await Team.findByIdAndUpdate(teams[0]._id, {
      members: [ceo._id, cto._id, ...techOperatives.map(m => m._id)]
    });

    console.log('✅ Operative deployment complete');
    console.log('\n📋 Tactical Access Credentials:');
    console.log('CEO: ceo@taskpholio.com / missioncontrol');
    console.log('CTO: cto@taskpholio.com / missioncontrol');

    process.exit(0);
  } catch (error) {
    console.error('❌ Deployment failure:', error);
    process.exit(1);
  }
};

seedData();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Create Idrees (using provided hash)
    const idreesData = {
      name: 'idreesmuhammed',
      email: 'idreesmuhammed112@gmail.com',
      password: '$2b$12$1R/lkhEAO5vgK5gVXGz7oeSGqXcSgQz4MrKyI5abRLZGcvj62iBKa',
      role: 'CEO',
      avatar: '',
      status: 'active',
      isActive: true,
      emailVerified: true
    };

    // Use findOneAndUpdate with upsert to avoid duplicates and bypass pre-save if we just want to set the hash
    // Actually, if we want to bypass the pre-save hook for the pre-hashed password:
    await User.deleteOne({ email: idreesData.email });
    const idrees = new User(idreesData);
    // Manually set password and save without triggering hooks if possible? 
    // No, easier to just use create and then findByIdAndUpdate the password hash.
    await User.create({ ...idreesData, password: 'temporary_password' });
    await User.findOneAndUpdate({ email: idreesData.email }, { password: idreesData.password });
    console.log('✅ CEO Idrees created/updated');

    // 2. Create Devasurya (using plain text password - will be hashed by hook)
    const devasuryaData = {
      name: 'Devasurya M',
      email: 'devasurya669@gmail.com',
      password: 'devasurya123CTO',
      role: 'CTO',
      avatar: '',
      status: 'active',
      isActive: true,
      emailVerified: true
    };

    await User.deleteOne({ email: devasuryaData.email });
    await User.create(devasuryaData);
    console.log('✅ CTO Devasurya created');

    console.log('\nDone! Please restart your server and login.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admins:', error);
    process.exit(1);
  }
};

createAdmins();

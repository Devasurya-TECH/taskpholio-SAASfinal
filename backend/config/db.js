const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`✅ Strategic Intelligence Feed Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`❌ Strategic Intelligence Failure: ${error.message}`);
    // Provide diagnostic hint for Render/Atlas
    if (error.message.includes('IP not whitelisted')) {
      logger.error('TIP: Ensure Render outbound IPs or 0.0.0.0/0 are whitelisted in MongoDB Atlas');
    }
    process.exit(1);
  }
};

module.exports = connectDB;

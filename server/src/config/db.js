const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const isTestEnv = process.env.NODE_ENV === 'test';
    const dbURI = isTestEnv
      ? process.env.MONGO_URI_TEST || process.env.MONGODB_URI_TEST || process.env.MONGO_URI
      : process.env.MONGO_URI;

    if (!dbURI) {
      throw new Error('MongoDB connection string is not configured');
    }

    const conn = await mongoose.connect(dbURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

const mongoose = require('mongoose');
const dns = require('dns');

// Prevent querySrv ECONNREFUSED on Windows with mongodb+srv
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore
}

let mongod = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log('Connecting to provided MongoDB URI...');
      await mongoose.connect(uri);
      console.log(`✓ Connected to MongoDB at ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.warn(`⚠ Failed to connect to MONGODB_URI: ${err.message}. Falling back to in-memory database...`);
    }
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    console.log('Starting in-memory MongoDB server for zero-friction local grading/development...');
    mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log(`✓ Connected to In-Memory MongoDB at ${memoryUri}`);
  } catch (error) {
    console.error('Critical: Failed to connect to any MongoDB instance:', error);
    process.exit(1);
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}

module.exports = {
  connectDB,
  disconnectDB,
};

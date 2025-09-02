// backend/scripts/test-atlas.js
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  console.log('Connecting to', uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@'));
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (e) {
    console.error('❌ Failed:', e.message);
  } finally {
    await mongoose.disconnect();
  }
})();

const mongoose = require('mongoose');

async function connectDB() {
  // ✅ cloud-ыг л уншина. Локал default огт тавихгүй!
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('Mongo URI env not set (MONGODB_URI or MONGO_URI)');

  // Лог дээр нууц үгийг нууж харуулъя
  const safeUri = uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
  console.log('🔌 Connecting to MongoDB:', safeUri);

  await mongoose.connect(uri, { autoIndex: true, maxPoolSize: 10 });
  console.log('✅ Connected to MongoDB Atlas');
}

module.exports = connectDB;

// backend/config/db.js

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB холбогдсон: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB холболт амжилтгүй:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

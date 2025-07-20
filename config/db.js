const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    // Шинэ хувилбарт эдгээр тохиргоо хэрэггүй болсон
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB амжилттай холбогдлоо");
  } catch (err) {
    console.error("❌ MongoDB холболт амжилтгүй:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

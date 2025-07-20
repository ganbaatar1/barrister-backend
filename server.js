const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config();
const fs = require("fs");
const connectDB = require("./config/db");
const app = express();

// ===== Firebase Admin SDK setup =====
const admin = require("firebase-admin");

const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!base64ServiceAccount) {
  console.error("❌ FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable байхгүй байна!");
  process.exit(1); // Серверийг зогсооно
}

const serviceAccountPath = path.join(__dirname, "firebase-service-account.json");

try {
  // Base64-ыг декод хийж, JSON файлыг үүсгэнэ
  fs.writeFileSync(
    serviceAccountPath,
    Buffer.from(base64ServiceAccount, "base64").toString("utf-8")
  );
  console.log("✅ Firebase service account файлыг амжилттай үүсгэлээ.");
} catch (error) {
  console.error("❌ Firebase service account файлыг үүсгэхэд алдаа гарлаа:", error.message);
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ===============================

// ✅ Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Зураг гадаад origin-д харагдахаар болгоно
  })
);

// Root route — серверийн ажиллаж байгааг баталгаажуулахын тулд
app.get("/", (req, res) => {
  res.send("✅ Backend сервер амжилттай ажиллаж байна!");
});

// ✅ Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Global CORS тохиргоо
app.use(
  cors({
    origin: "http://localhost:3000", // React frontend origin
    credentials: true,
  })
);

// ✅ Static файл – uploads route (зургуудын хандалт)
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// ✅ Preflight request (OPTIONS) – /uploads/... замд хариу өгөх
app.options("/uploads/*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.sendStatus(200);
});

// ✅ uploads/ хавтас үүсгэх болон default зургийг хуулж тавих
const ensureDefaultProfileImage = () => {
  const uploadsDir = path.join(__dirname, "uploads");
  const defaultImageSrc = path.join(
    __dirname,
    "../src/assets/default-profile.png"
  ); // React asset байршил
  const defaultImageDest = path.join(uploadsDir, "default-profile.png");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  if (!fs.existsSync(defaultImageDest)) {
    try {
      fs.copyFileSync(defaultImageSrc, defaultImageDest);
      console.log("✅ default-profile.png зургийг хууллаа.");
    } catch (err) {
      console.error("❌ default зургийг хуулж чадсангүй:", err.message);
    }
  }
};

// ✅ API Routes
app.use("/api/lawyers", require("./routes/lawyerRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));
app.use("/api/testimonials", require("./routes/testimonialRoutes"));
app.use("/api/home", require("./routes/homeRoutes"));
app.use("/api/advice", require("./routes/adviceRoutes"));
app.use("/api/contactSettings", require("./routes/contactSettings"));

// ❗ Error handler
app.use((err, req, res, next) => {
  console.error("🚨 Серверийн алдаа:", err.stack);
  res.status(500).json({
    error: "Серверийн дотоод алдаа",
    details: err.message || "Алдааны дэлгэрэнгүй мэдээлэл байхгүй",
  });
});

// 🚀 Start server
const PORT = process.env.PORT || 5050;
ensureDefaultProfileImage(); // uploads хавтас ба default зураг шалгах

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Сервер амжилттай ажиллаж байна — порт: ${PORT}`);
  });
});

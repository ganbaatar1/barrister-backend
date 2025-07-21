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
  process.exit(1);
}

const decodedServiceAccount = Buffer.from(base64ServiceAccount, "base64").toString("utf8");
const serviceAccount = JSON.parse(decodedServiceAccount);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin амжилттай initialize боллоо.");
}

// ===============================

// ✅ Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Root route
app.get("/", (req, res) => {
  res.send("✅ Backend сервер амжилттай ажиллаж байна!");
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global CORS тохиргоо
const allowedOrigins = [
  "http://localhost:3000",
  "https://barrister-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman гэх мэт origin байхгүй нөхцөлд зөвшөөрөх
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS policy: ${origin} origin-ыг зөвшөөрөхгүй байна.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Static файл – uploads route
app.use(
  "/uploads",
  (req, res, next) => {
    // uploads-д ирэх хүсэлтэнд зөв origin-г header-д өгнө
    res.header("Access-Control-Allow-Origin", allowedOrigins.join(", "));
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

app.options("/uploads/*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigins.join(", "));
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.sendStatus(200);
});

// uploads хавтас болон default зураг үүсгэх
const ensureDefaultProfileImage = () => {
  const uploadsDir = path.join(__dirname, "uploads");
  const defaultImageSrc = path.join(
    __dirname,
    "../src/assets/default-profile.png"
  );
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

// API Routes
app.use("/api/lawyers", require("./routes/lawyerRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));
app.use("/api/testimonials", require("./routes/testimonialRoutes"));
app.use("/api/home", require("./routes/homeRoutes"));
app.use("/api/advice", require("./routes/adviceRoutes"));
app.use("/api/contactSettings", require("./routes/contactSettings"));

// Error handler
app.use((err, req, res, next) => {
  console.error("🚨 Серверийн алдаа:", err.stack);
  res.status(500).json({
    error: "Серверийн дотоод алдаа",
    details: err.message || "Алдааны дэлгэрэнгүй мэдээлэл байхгүй",
  });
});

// Start server
const PORT = process.env.PORT || 5050;
ensureDefaultProfileImage();

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Сервер амжилттай ажиллаж байна — порт: ${PORT}`);
  });
});

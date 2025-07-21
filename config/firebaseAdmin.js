const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!base64Key) {
  throw new Error("❌ FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable not set.");
}

const jsonFilePath = path.join(__dirname, "firebase-service-decoded.json");

// decode only if file doesn't exist
if (!fs.existsSync(jsonFilePath)) {
  const decoded = Buffer.from(base64Key, "base64").toString("utf-8");
  fs.writeFileSync(jsonFilePath, decoded);
  console.log("✅ Firebase service account файлыг амжилттай үүсгэлээ.");
}

// ИНДЭЭР initializeApp() дуудахаас өмнө шалга
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(jsonFilePath),
  });
}

module.exports = admin;

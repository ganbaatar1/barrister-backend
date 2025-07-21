const admin = require("firebase-admin");

// FIREBASE_SERVICE_ACCOUNT_BASE64 .env хувьсагчаас авна
const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!admin.apps.length) {
  if (!base64ServiceAccount) {
    throw new Error("❌ FIREBASE_SERVICE_ACCOUNT_BASE64 тохиргоо байхгүй байна!");
  }

  try {
    // base64 decode → JSON string → Object
    const decoded = Buffer.from(base64ServiceAccount, "base64").toString("utf8");
    const serviceAccount = JSON.parse(decoded);

    // Firebase Admin SDK initialize
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin SDK амжилттай initialize боллоо.");
  } catch (error) {
    console.error("❌ Firebase service account decode хийхэд алдаа гарлаа:", error.message);
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 decode амжилтгүй.");
  }
}

module.exports = admin;

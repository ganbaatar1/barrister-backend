const admin = require("firebase-admin");

const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!base64) {
  console.error("❌ FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable байхгүй байна!");
  process.exit(1);
}

const decoded = Buffer.from(base64, "base64").toString("utf8");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(decoded)),
  });
}

module.exports = admin;

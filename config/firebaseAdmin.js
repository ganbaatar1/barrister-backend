const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!serviceAccountBase64) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 орчин байхгүй байна.");
}

// Decode base64 string
const serviceAccountJSON = Buffer.from(serviceAccountBase64, "base64").toString("utf8");
const serviceAccount = JSON.parse(serviceAccountJSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;

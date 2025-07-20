// backend/config/firebaseAdmin.js
const admin = require("firebase-admin");
// firebaseAdmin.js
const serviceAccount = require("./barrister-web-f4b8f-firebase-adminsdk-fbsvc-cc6e9fa14d.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;

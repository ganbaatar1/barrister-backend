// 📁 backend/middleware/auth.js
const admin = require("../config/firebaseAdmin");;

// Firebase Admin SDK ашиглан token шалгах middleware
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ error: "Access token байхгүй" });
    }

    console.log("📥 Header authorization:", authHeader);
    console.log("👉 Хүлээн авсан токен:", token);

    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("✅ Firebase decoded token:", decodedToken);

    req.user = decodedToken;
    next();
  } catch (err) {
    console.error("❌ Firebase token шалгах алдаа:");
    console.error("   📛 Code:", err.code || "UNKNOWN");
    console.error("   📜 Message:", err.message);
    return res.status(401).json({ error: "Хүчингүй эсвэл хугацаа дууссан токен" });
  }
};

module.exports = requireAuth;

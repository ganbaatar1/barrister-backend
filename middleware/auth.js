const admin = require("../config/firebaseAdmin");

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization header буруу байна." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token байхгүй." });
    }

    // Token-ийг Firebase-ээр шалгана
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Token хугацаа дууссан эсэхийг шалгах (нэмэлт хамгаалалт)
    if (decodedToken.exp * 1000 < Date.now()) {
      return res.status(401).json({ error: "Access token-ийн хугацаа дууссан." });
    }

    req.user = decodedToken;
    next();
  } catch (err) {
    console.error("❌ Firebase token шалгах алдаа:", err.message || err.code);
    return res.status(401).json({
      error: "Хүчингүй эсвэл хугацаа дууссан токен",
      details: err.message || "Unknown error",
    });
  }
};

module.exports = requireAuth;

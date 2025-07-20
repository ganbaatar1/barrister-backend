const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const HomeContent = require("../models/HomeContent");

const router = express.Router();

// 🖼️ Зураг хадгалах тохиргоо
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "uploads", "home");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `home_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// ✅ GET
router.get("/", async (req, res) => {
  try {
    const content = await HomeContent.findOne();
    return res.json(content || {});
  } catch (err) {
    console.error("❌ GET home алдаа:", err.message);
    return res.status(500).json({ error: "Серверийн алдаа" });
  }
});

// ✅ PUT
router.put("/", async (req, res) => {
  try {
    const { about, mission, vision, principles, services, image } = req.body;

    if (!about || !mission || !vision) {
      return res.status(400).json({ error: "Гол мэдээллүүд шаардлагатай" });
    }

    let content = await HomeContent.findOne();

    if (content) {
      content.about = about;
      content.mission = mission;
      content.vision = vision;
      content.principles = principles;
      content.services = services;
      content.image = image;
    } else {
      content = new HomeContent({
        about,
        mission,
        vision,
        principles,
        services,
        image,
      });
    }

    await content.save();
    return res.json(content);
  } catch (err) {
    console.error("❌ PUT home алдаа:", err.message);
    return res.status(500).json({ error: "Серверийн алдаа" });
  }
});

// ✅ Зураг хадгалах маршрут
router.post("/upload-image", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Зураг илгээгдээгүй байна" });
    }

    const relativePath = `/uploads/home/${req.file.filename}`;
    return res.json({ path: relativePath });
  } catch (err) {
    console.error("❌ upload-image алдаа:", err.message);
    return res.status(500).json({ error: "Зураг хадгалах алдаа" });
  }
});

module.exports = router;

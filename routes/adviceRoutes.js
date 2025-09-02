const requireAuth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Advice = require("../models/Advice");

// 🗂 Зургийн хадгалах тохиргоо
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("video/")) {
      return cb(new Error("Зөвхөн зураг болон видео оруулна уу"));
    }
    cb(null, true);
  },
});

// ➕ Зөвлөгөө нэмэх
router.post("/", requireAuth, upload.single("media"), async (req, res) => {
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);
  try {
    const {
      title,
      content,
      videoUrl,
      seoTitle,
      seoDescription,
      seoKeywords,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Гарчиг болон агуулга шаардлагатай" });
    }

    const newAdvice = new Advice({
      title,
      content,
      videoUrl,
      seoTitle,
      seoDescription,
      seoKeywords,
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });

    const saved = await newAdvice.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ POST зөвлөгөө алдаа:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// 📝 Засах
router.put("/:id", requireAuth, upload.single("media"), async (req, res) => {
  try {
    const {
      title,
      content,
      videoUrl,
      seoTitle,
      seoDescription,
      seoKeywords,
    } = req.body;

    const update = {
      title,
      content,
      videoUrl,
      seoTitle,
      seoDescription,
      seoKeywords,
    };

    if (req.file) {
      update.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Advice.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("❌ PUT зөвлөгөө алдаа:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// 📄 Бүгдийг авах
router.get("/", async (_, res) => {
  try {
    const all = await Advice.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    console.error("❌ GET зөвлөгөө алдаа:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📄 ID-р авах
router.get("/:id", async (req, res) => {
  try {
    const advice = await Advice.findById(req.params.id);
    if (!advice) return res.status(404).json({ error: "Олдсонгүй" });
    res.json(advice);
  } catch (err) {
    console.error("❌ GET зөвлөгөө ID-р алдаа:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ❌ Устгах
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await Advice.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ Амжилттай устгалаа" });
  } catch (err) {
    console.error("❌ DELETE зөвлөгөө алдаа:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

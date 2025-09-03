const requireAuth = require("../middleware/auth");
const express = require("express");
const multer = require("multer");
const News = require("../models/News");
const { uploadBufferToCloudinary } = require("../utils/cloudinary");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// CREATE
router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: "Гарчиг болон агуулга заавал" });
    }

    let imageUrl = "";
    if (req.file?.buffer) {
      const up = await uploadBufferToCloudinary({
        buffer: req.file.buffer,
        section: "news",
        resource_type: "image",
      });
      imageUrl = up.secure_url;
    }

    const doc = await News.create({ title: title.trim(), content, image: imageUrl });
    return res.status(201).json(doc);
  } catch (err) {
    console.error("❌ POST /api/news алдаа:", err.message);
    return res.status(400).json({ error: err.message });
  }
});

// LIST
router.get("/", async (_, res) => {
  try {
    const all = await News.find().sort({ createdAt: -1 });
    return res.json(all);
  } catch (err) {
    console.error("❌ GET /api/news алдаа:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET by id
router.get("/:id", async (req, res) => {
  try {
    const doc = await News.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Олдсонгүй" });
    return res.json(doc);
  } catch (err) {
    console.error(`❌ GET /api/news/${req.params.id} алдаа:`, err.message);
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", requireAuth, upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;
    const update = {
      ...(title ? { title: title.trim() } : {}),
      ...(content ? { content } : {}),
    };
    if (req.file?.buffer) {
      const up = await uploadBufferToCloudinary({
        buffer: req.file.buffer,
        section: "news",
        resource_type: "image",
      });
      update.image = up.secure_url;
    }
    const saved = await News.findByIdAndUpdate(req.params.id, update, { new: true });
    return res.json(saved);
  } catch (err) {
    console.error(`❌ PUT /api/news/${req.params.id} алдаа:`, err.message);
    return res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    return res.json({ message: "✅ Мэдээ устгагдлаа" });
  } catch (err) {
    console.error(`❌ DELETE /api/news/${req.params.id} алдаа:`, err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

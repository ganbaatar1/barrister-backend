const requireAuth = require("../middleware/auth");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Testimonial = require("../models/Testimonial");
const router = express.Router();

// Upload config
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Зөвхөн зураг оруулна уу"));
    }
    cb(null, true);
  },
});

// ➕ POST: create testimonial
router.post("/", requireAuth, upload.single("photo"), async (req, res) => {
  try {
    const { name, message, occupation } = req.body;

    if (!name || !message) {
      return res.status(400).json({ error: "Нэр болон сэтгэгдэл заавал шаардлагатай" });
    }

    const testimonial = new Testimonial({
      name,
      message,
      occupation,
      photo: req.file ? `/uploads/${req.file.filename}` : "",
    });

    const saved = await testimonial.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error("❌ POST /api/testimonials алдаа:", err.message);
    return res.status(400).json({ error: err.message });
  }
});

// 📥 GET all testimonials
router.get("/", async (_, res) => {
  try {
    const all = await Testimonial.find().sort({ createdAt: -1 });
    return res.json(all);
  } catch (err) {
    console.error("❌ GET /api/testimonials алдаа:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ✏️ PUT: update testimonial
router.put("/:id", requireAuth, upload.single("photo"), async (req, res) => {
  try {
    const update = {
      name: req.body.name,
      message: req.body.message,
      occupation: req.body.occupation,
    };

    if (req.file) {
      update.photo = `/uploads/${req.file.filename}`;
    }

    const updated = await Testimonial.findByIdAndUpdate(req.params.id, update, { new: true });
    return res.json(updated);
  } catch (err) {
    console.error(`❌ PUT /api/testimonials/${req.params.id} алдаа:`, err.message);
    return res.status(400).json({ error: err.message });
  }
});

// ❌ DELETE: remove testimonial
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    return res.json({ message: "✅ Сэтгэгдэл устгагдлаа" });
  } catch (err) {
    console.error(`❌ DELETE /api/testimonials/${req.params.id} алдаа:`, err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

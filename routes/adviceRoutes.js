const requireAuth = require("../middleware/auth");
const express = require("express");
const multer = require("multer");
const Advice = require("../models/Advice");
const { uploadBufferToCloudinary } = require("../utils/cloudinary");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// CREATE
router.post("/", requireAuth, upload.single("media"), async (req, res) => {
  try {
    const { title, description, videoUrl, seoTitle, seoDescription, seoKeywords } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Гарчиг шаардлагатай" });
    }

    let imageUrl = "";
    if (req.file?.buffer) {
      const up = await uploadBufferToCloudinary({
        buffer: req.file.buffer,
        section: "advice",
        resource_type: "auto", // image/video хоёуланг дэмжинэ
      });
      imageUrl = up.secure_url;
    }

    const doc = await Advice.create({
      title: title.trim(),
      description,
      image: imageUrl,
      video: videoUrl || "",
      seo: {
        title: seoTitle || "",
        description: seoDescription || "",
        keywords: (seoKeywords || "").split(",").map(s => s.trim()).filter(Boolean),
      },
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error("❌ POST /api/advice алдаа:", err.message);
    return res.status(400).json({ error: err.message });
  }
});

// LIST
router.get("/", async (_, res) => {
  try {
    const all = await Advice.find().sort({ createdAt: -1 });
    return res.json(all);
  } catch (err) {
    console.error("❌ GET /api/advice алдаа:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", requireAuth, upload.single("media"), async (req, res) => {
  try {
    const { title, description, videoUrl, seoTitle, seoDescription, seoKeywords } = req.body;

    const update = {
      ...(title ? { title: title.trim() } : {}),
      ...(description ? { description } : {}),
      ...(videoUrl ? { video: videoUrl } : {}),
      ...(seoTitle || seoDescription || seoKeywords ? {
        seo: {
          ...(seoTitle ? { title: seoTitle } : {}),
          ...(seoDescription ? { description: seoDescription } : {}),
          ...(seoKeywords ? { keywords: seoKeywords.split(",").map(s=>s.trim()).filter(Boolean) } : {}),
        }
      } : {}),
    };

    if (req.file?.buffer) {
      const up = await uploadBufferToCloudinary({
        buffer: req.file.buffer,
        section: "advice",
        resource_type: "auto",
      });
      update.image = up.secure_url;
    }

    const saved = await Advice.findByIdAndUpdate(req.params.id, update, { new: true });
    return res.json(saved);
  } catch (err) {
    console.error(`❌ PUT /api/advice/${req.params.id} алдаа:`, err.message);
    return res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await Advice.findByIdAndDelete(req.params.id);
    return res.json({ message: "✅ Зөвлөгөө устгалаа" });
  } catch (err) {
    console.error(`❌ DELETE /api/advice/${req.params.id} алдаа:`, err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

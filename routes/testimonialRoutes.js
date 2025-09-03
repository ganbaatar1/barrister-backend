const requireAuth = require("../middleware/auth");
const express = require("express");
const multer = require("multer");
const Testimonial = require("../models/Testimonial");
const { uploadBufferToCloudinary } = require("../utils/cloudinary");

const router = express.Router();

// 👉 local disk биш, санах ойд хадгална
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/testimonials
 * body: name, message, occupation, isOrganization, organization
 * files: photo (optional), orgLogo (optional)
 */
router.post("/", requireAuth, upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "orgLogo", maxCount: 1 },
]), async (req, res) => {
  try {
    const {
      name = "",
      message = "",
      occupation = "",
      isOrganization = "false",
      organization = "",
    } = req.body;

    if (!name?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Нэр болон сэтгэгдэл заавал" });
    }

    // Cloudinary upload
    let photoUrl = "";
    if (req.files?.photo?.[0]?.buffer) {
      const up = await uploadBufferToCloudinary({
        buffer: req.files.photo[0].buffer,
        section: "testimonials",
        resource_type: "image",
      });
      photoUrl = up.secure_url;
    }

    let orgLogoUrl = "";
    const orgMode = String(isOrganization) === "true";
    if (orgMode && req.files?.orgLogo?.[0]?.buffer) {
      const up = await uploadBufferToCloudinary({
        buffer: req.files.orgLogo[0].buffer,
        section: "testimonials",
        resource_type: "image",
      });
      orgLogoUrl = up.secure_url;
    }

    const doc = await Testimonial.create({
      isOrganization: orgMode,
      name: name.trim(),
      organization: orgMode ? (organization || "").trim() : "",
      message: message.trim(),
      occupation: (occupation || "").trim(),
      photo: photoUrl,
      orgLogo: orgLogoUrl,
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error("❌ POST /api/testimonials алдаа:", err.message);
    return res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/testimonials
 */
router.get("/", async (_, res) => {
  try {
    const all = await Testimonial.find().sort({ createdAt: -1 });
    return res.json(all);
  } catch (err) {
    console.error("❌ GET /api/testimonials алдаа:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/testimonials/:id
 * files: photo/orgLogo (optional)
 */
router.put("/:id", requireAuth, upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "orgLogo", maxCount: 1 },
]), async (req, res) => {
  try {
    const {
      name = "",
      message = "",
      occupation = "",
      isOrganization = "false",
      organization = "",
    } = req.body;

    const update = {
      isOrganization: String(isOrganization) === "true",
      name: name.trim(),
      organization: String(isOrganization) === "true" ? (organization || "").trim() : "",
      message: message.trim(),
      occupation: (occupation || "").trim(),
    };

    if (req.files?.photo?.[0]?.buffer) {
      const up = await uploadBufferToCloudinary({
        buffer: req.files.photo[0].buffer,
        section: "testimonials",
        resource_type: "image",
      });
      update.photo = up.secure_url;
    }

    if (update.isOrganization && req.files?.orgLogo?.[0]?.buffer) {
      const up = await uploadBufferToCloudinary({
        buffer: req.files.orgLogo[0].buffer,
        section: "testimonials",
        resource_type: "image",
      });
      update.orgLogo = up.secure_url;
    } else if (!update.isOrganization) {
      update.organization = "";
      update.orgLogo = "";
    }

    const saved = await Testimonial.findByIdAndUpdate(req.params.id, update, { new: true });
    return res.json(saved);
  } catch (err) {
    console.error(`❌ PUT /api/testimonials/${req.params.id} алдаа:`, err.message);
    return res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/testimonials/:id
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    return res.json({ message: "✅ Сэтгэгдэл устгалаа" });
  } catch (err) {
    console.error(`❌ DELETE /api/testimonials/${req.params.id} алдаа:`, err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const requireAuth = require("../middleware/auth");
const express = require("express");
const multer = require("multer");
const Lawyer = require("../models/Lawyer");
const { uploadBufferToCloudinary } = require("../utils/cloudinary");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// CREATE
router.post("/", requireAuth, upload.single("profilePhoto"), async (req, res) => {
  try {
    const {
      lastName, firstName, specialization = "[]", languages = "[]",
      academicDegree = "", experience = "", startDate = "", status = "ажиллаж байгаа"
    } = req.body;

    if (!lastName?.trim() || !firstName?.trim()) {
      return res.status(400).json({ error: "Овог болон нэр заавал" });
    }

    let profilePhoto = "";
    if (req.file?.buffer) {
      const up = await uploadBufferToCloudinary({
        buffer: req.file.buffer,
        section: "lawyers",
        resource_type: "image",
      });
      profilePhoto = up.secure_url;
    }

    const doc = await Lawyer.create({
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      profilePhoto,
      specialization: JSON.parse(specialization || "[]"),
      languages: JSON.parse(languages || "[]"),
      academicDegree, experience, startDate, status,
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error("❌ POST /api/lawyers алдаа:", err.message);
    return res.status(400).json({ error: err.message });
  }
});

// LIST
router.get("/", async (_, res) => {
  try {
    const list = await Lawyer.find().sort({ createdAt: -1 });
    return res.json(list);
  } catch (err) {
    console.error("❌ GET /api/lawyers алдаа:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", requireAuth, upload.single("profilePhoto"), async (req, res) => {
  try {
    const {
      lastName, firstName, specialization, languages,
      academicDegree, experience, startDate, status
    } = req.body;

    const update = {
      ...(lastName ? { lastName: lastName.trim() } : {}),
      ...(firstName ? { firstName: firstName.trim() } : {}),
      ...(specialization ? { specialization: JSON.parse(specialization) } : {}),
      ...(languages ? { languages: JSON.parse(languages) } : {}),
      ...(academicDegree ? { academicDegree } : {}),
      ...(experience ? { experience } : {}),
      ...(startDate ? { startDate } : {}),
      ...(status ? { status } : {}),
    };

    if (req.file?.buffer) {
      const up = await uploadBufferToCloudinary({
        buffer: req.file.buffer,
        section: "lawyers",
        resource_type: "image",
      });
      update.profilePhoto = up.secure_url;
    }

    const saved = await Lawyer.findByIdAndUpdate(req.params.id, update, { new: true });
    return res.json(saved);
  } catch (err) {
    console.error(`❌ PUT /api/lawyers/${req.params.id} алдаа:`, err.message);
    return res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await Lawyer.findByIdAndDelete(req.params.id);
    return res.json({ message: "✅ Хуульч устгалаа" });
  } catch (err) {
    console.error(`❌ DELETE /api/lawyers/${req.params.id} алдаа:`, err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

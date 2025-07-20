const express = require("express");
const router = express.Router();
const ContactSettings = require("../models/ContactSettings");

// ✅ GET settings
router.get("/", async (req, res) => {
  try {
    const settings = await ContactSettings.findOne();
    return res.json(settings || {});
  } catch (err) {
    console.error("❌ contactSettings GET алдаа:", err.message);
    return res.status(500).json({ error: "Серверийн алдаа" });
  }
});

// ✅ PUT update settings
router.put("/", async (req, res) => {
  try {
    const {
      phone,
      email,
      mapUrl,
      socialLinks = []
    } = req.body;

    // ✏️ Validation
    if (!phone || !email) {
      return res.status(400).json({ error: "Утас болон имэйл заавал шаардлагатай" });
    }

    let settings = await ContactSettings.findOne();

    if (settings) {
      settings.phone = phone;
      settings.email = email;
      settings.mapUrl = mapUrl;
      settings.socialLinks = socialLinks;
    } else {
      settings = new ContactSettings({
        phone,
        email,
        mapUrl,
        socialLinks
      });
    }

    await settings.save();
    return res.json(settings);
  } catch (err) {
    console.error("❌ contactSettings PUT алдаа:", err.message);
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;

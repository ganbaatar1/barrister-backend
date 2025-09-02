// routes/media.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer"); // memoryStorage
const { uploadManyToCloudinary, destroyFromCloudinary } = require("../utils/cloudinary");

router.post("/upload", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: "No files received" });
    const section = req.body.section || "common";

    const results = await uploadManyToCloudinary(req.files, {
      section,
      resource_type: "auto",
    });

    // DB-д хадгалах хэлбэрт шилжүүлж буцаая (Media subdoc-д таарах)
    const items = results.map((r) => ({
      url: r.secure_url,
      public_id: r.public_id,
      resource_type: r.resource_type,
      format: r.format,
      width: r.width,
      height: r.height,
      duration: r.duration,
      bytes: r.bytes,
      caption: req.body.caption || "",
      alt: req.body.alt || "",
    }));

    res.json({ items });
  } catch (e) {
    res.status(500).json({ message: "Upload failed", error: e.message });
  }
});

router.delete("/:public_id", async (req, res) => {
  try {
    const { public_id } = req.params;
    const { resource_type = "image" } = req.query;
    const result = await destroyFromCloudinary(public_id, resource_type);
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: "Delete failed", error: e.message });
  }
});

module.exports = router;

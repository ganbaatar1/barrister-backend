const Home = require("../models/Home"); // доорхи загварыг ашиглана
const { uploadToCloudinary } = require("../utils/cloudinary");

// GET /api/home
exports.getHome = async (req, res) => {
  try {
    let doc = await Home.findOne();
    if (!doc) doc = await Home.create({ images: [] });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch home content", error: e.message });
  }
};

// PUT /api/home
exports.updateHome = async (req, res) => {
  try {
    const update = {
      about: req.body.about ?? "",
      mission: req.body.mission ?? "",
      vision: req.body.vision ?? "",
      principles: req.body.principles ?? "",
      services: req.body.services ?? "",
      images: Array.isArray(req.body.images) ? req.body.images : [],
    };
    const doc = await Home.findOneAndUpdate({}, update, { new: true, upsert: true });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: "Failed to update home content", error: e.message });
  }
};

// POST /api/home/upload-image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const up = await uploadToCloudinary(req.file.buffer, "barrister/home");
    res.json({ url: up.secure_url, public_id: up.public_id });
  } catch (e) {
    res.status(500).json({ message: "Image upload failed", error: e.message });
  }
};

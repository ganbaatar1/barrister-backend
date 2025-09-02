const Home = require("./HomeControllerOld");
const { uploadToCloudinary } = require("../utils/cloudinary");

// GET /
exports.getHome = async (req, res) => {
  try {
    const content = await Home.findOne();
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch home content", error });
  }
};

// PUT /
exports.updateHome = async (req, res) => {
  try {
    const { banners, welcomeText } = req.body;

    const home = await Home.findOne();
    if (home) {
      home.banners = banners;
      home.welcomeText = welcomeText;
      await home.save();
    } else {
      await Home.create({ banners, welcomeText });
    }

    res.json({ message: "Home content updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update home content", error });
  }
};

// POST /upload-image
exports.uploadImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadResult = await uploadToCloudinary(file.buffer, "barrister/home");
    res.json({ url: uploadResult.secure_url });
  } catch (error) {
    res.status(500).json({ message: "Image upload failed", error });
  }
};

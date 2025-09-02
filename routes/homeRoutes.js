const express = require("express");
const router = express.Router();
const { getHome, updateHome, uploadImage } = require("../controllers/homeController");
const authenticateFirebaseToken = require("../middleware/auth");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // Cloudinary-д зориулав

// Get home page content
router.get("/", getHome);

// Update home content (requires authentication)
router.put("/", authenticateFirebaseToken, updateHome);

// Upload image to Cloudinary (requires authentication)
router.post("/upload-image", authenticateFirebaseToken, upload.single("image"), uploadImage);

module.exports = router;

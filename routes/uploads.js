// routes/uploads.js
const router = require("express").Router();
const { uploadSingle } = require("../middlewares/upload");
const { cloudinary, typeToFolder } = require("../config/cloudinary");

router.post("/:type", uploadSingle, async (req, res) => {
  try {
    const { type } = req.params;
    if (!req.file) return res.status(400).json({ message: "Файл алга." });

    const folder = typeToFolder(type);

    // Buffer-ийг data URI болгож Cloudinary руу
    const b64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    return res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload алдаа", error: String(err.message || err) });
  }
});

router.delete("/:publicId", async (req, res) => {
  try {
    const { publicId } = req.params;
    const result = await cloudinary.uploader.destroy(publicId);
    return res.json({ result });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Cloudinary устгалын алдаа", error: String(err.message || err) });
  }
});

module.exports = router;

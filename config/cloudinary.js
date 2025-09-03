// config/cloudinary.js
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const typeToFolder = (type) => {
  const base = process.env.CLOUDINARY_BASE_FOLDER || "barrister";
  switch (type) {
    case "home":
      return `${base}/home`;
    case "lawyers":
      return `${base}/lawyers`;
    case "news":
      return `${base}/news`;
    case "advice":
      return `${base}/advice`;
    case "testimonials":
      return `${base}/testimonials`;
    default:
      throw new Error("Unsupported upload type");
  }
};

module.exports = { cloudinary, typeToFolder };

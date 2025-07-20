const mongoose = require("mongoose");

const adviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Гарчиг шаардлагатай"],
      trim: true,
      maxlength: 100,
      unique: true,
    },
    description: {
      type: String,
      required: [false, "Тайлбар шаардлагагүй"],
      maxlength: 5000, // Rich text HTML контент илүү урт байж болно
    },
    image: {
      type: String,
      default: "", // /uploads/image.jpg
    },
    video: {
      type: String,
      default: "", // /uploads/video.mp4
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Advice", adviceSchema);

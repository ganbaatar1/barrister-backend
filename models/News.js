const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Мэдээний гарчиг заавал шаардлагатай"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Мэдээний агуулга заавал шаардлагатай"],
    },
    image: {
      type: String,
      default: "", // /uploads/image.jpg гэх мэт
    },
    date: {
      type: Date,
      default: Date.now,
    },
    // SEO талбарууд
    seoTitle: {
      type: String,
      default: "",
    },
    seoDescription: {
      type: String,
      default: "",
    },
    seoKeywords: {
      type: String, // Хэрвээ хүсвэл: type: [String]
      default: "",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt автоматаар үүснэ
  }
);

module.exports = mongoose.model("News", newsSchema);

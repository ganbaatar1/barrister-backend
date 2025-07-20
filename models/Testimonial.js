// 📁 models/Testimonial.js
const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Нэр заавал шаардлагатай"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Сэтгэгдэл заавал шаардлагатай"],
      trim: true,
    },
    photo: {
      type: String,
      default: "", // Жишээ: "/uploads/photo.jpg"
    },
    occupation: {
      type: String,
      default: "", // Жишээ: "үйлчлүүлэгч"
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt автоматаар нэмэгдэнэ
  }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);

// 📁 models/Testimonial.js
const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    // Хувь хүн эсвэл байгууллагын төлөөлөл
    isOrganization: { type: Boolean, default: false },

    // Хувь хүний нэр эсвэл байгууллагын төлөөлөгчийн нэр
    name: {
      type: String,
      required: [true, "Нэр заавал шаардлагатай"],
      trim: true,
    },

    // Байгууллагын нэр (isOrganization=true үед л утгатай)
    organization: {
      type: String,
      default: "",
      trim: true,
    },

    message: {
      type: String,
      required: [true, "Сэтгэгдэл заавал шаардлагатай"],
      trim: true,
    },

    // Хувь хүний зураг (optional)
    photo: {
      type: String,
      default: "",
      trim: true,
    },

    // Байгууллагын лого (Cloudinary URL)
    orgLogo: {
      type: String,
      default: "",
      trim: true,
    },

    // Жишээ: “үйлчлүүлэгч”, “харилцагч”, “түнш” гэх мэт
    occupation: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);

const mongoose = require("mongoose");

const contactSettingsSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, "Утасны дугаар шаардлагатай"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Имэйл хаяг шаардлагатай"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `"${props.value}" нь зөв имэйл хаяг биш байна`,
      },
    },
    mapUrl: {
      type: String,
      default: "", // Google Maps embed URL гэх мэт
    },
    socialLinks: [
      {
        name: { type: String, trim: true },
        url: { type: String, trim: true },
      },
    ],
  },
  {
    timestamps: true, // createdAt, updatedAt автоматаар нэмэгдэнэ
  }
);

module.exports = mongoose.model("ContactSettings", contactSettingsSchema);

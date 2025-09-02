const mongoose = require("mongoose");

const SlideSchema = new mongoose.Schema(
  { url: { type: String, required: true }, caption: { type: String, default: "" } },
  { _id: false }
);

const HomeSchema = new mongoose.Schema(
  {
    about: { type: String, default: "" },
    mission: { type: String, default: "" },
    vision: { type: String, default: "" },
    principles: { type: String, default: "" },
    services: { type: String, default: "" },
    images: { type: [SlideSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Home", HomeSchema);

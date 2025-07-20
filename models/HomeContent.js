const mongoose = require("mongoose");

const HomeContentSchema = new mongoose.Schema({
  about: { type: String, required: true },
  mission: { type: String, required: true },
  vision: { type: String, required: true },
  principles: { type: String },
  services: { type: String },
  image: { type: String },
});

module.exports = mongoose.model("HomeContent", HomeContentSchema);

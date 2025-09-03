// scripts/migrate-uploads-to-cloudinary.js
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

// === env ===
const MONGO = process.env.MONGODB_URI || process.env.MONGO_URI;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

(async () => {
  await mongoose.connect(MONGO);
  console.log("DB connected");

  // Загварууд — хэрэгтэйгээ нэмж өөрчил
    const News = require("../models/News");
    const Lawyer = require("../models/Lawyer");
    const Testimonial = require("../models/Testimonial");
    const Home = require("../models/Home");
    const Advice = require("../models/Advice");
    const ContactSettings = require("../models/ContactSettings");

  // helper: локал uploads-ыг Cloudinary руу
  async function migrateField(doc, field, folder = "legacy") {
    const val = doc[field];
    if (!val || /^https?:\/\//i.test(val)) return false; // аль хэдийн Cloudinary
    const rel = val.startsWith("/") ? val.slice(1) : val;
    const localPath = path.join(__dirname, "..", rel);
    if (!fs.existsSync(localPath)) {
      console.warn("Missing file:", localPath);
      return false;
    }
    const res = await cloudinary.uploader.upload(localPath, { folder });
    doc[field] = res.secure_url;
    await doc.save();
    console.log("Updated", doc._id.toString(), field);
    return true;
  }

  // Жишээ: News.image-ийг нүүлгэх
  const news = await News.find({});
  for (const n of news) {
    await migrateField(n, "image", "news");
  }
    // Жишээ: Lawyer.photo-ийг нүүлгэх
    const lawyers = await Lawyer.find({});
    for (const l of lawyers) {
      await migrateField(l, "photo", "lawyers");
    }

    // Жишээ: Testimonial.photo-ийг нүүлгэх
    const testimonials = await Testimonial.find({});        
    for (const t of testimonials) {
      await migrateField(t, "photo", "testimonials");
    }
    // Жишээ: Home.bannerImage-ийг нүүлгэх
    const homes = await Home.find({});
    for (const h of homes) {
        await migrateField(h, "bannerImage", "home");
    }

    // Жишээ: Advice.image-ийг нүүлгэх
    const advices = await Advice.find({});
    for (const a of advices) {
        await migrateField(a, "image", "advice");
    }   
    // Жишээ: ContactSettings.mapImage-ийг нүүлгэх
    const contactSettings = await ContactSettings.find({});     
    for (const c of contactSettings) {
        await migrateField(c, "mapImage", "contactSettings");
    }


  console.log("Done.");
  process.exit(0);
})();

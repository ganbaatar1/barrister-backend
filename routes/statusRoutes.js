// backend/routes/statusRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

// Cloudinary config энэ проектод өөр газар (utils/cloudinary) аль хэдийн хийгдсэн.
// Гэхдээ хамгаас тулгуур болгоод ENV-ээс уншаад config хийчихье (дахин дуудахад зүгээр).
const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

// bytes → MB/GB хувиргах жижиг туслахууд
const toMB = (n) => (typeof n === "number" ? n / (1024 * 1024) : 0);
const toGB = (n) => (typeof n === "number" ? n / (1024 * 1024 * 1024) : 0);

// Хэрэглээ авах
router.get("/usage", async (req, res) => {
  const out = { atlas: null, cloudinary: null };

  // 1) Atlas (DB stats)
  try {
    const db = mongoose.connection?.db;
    if (!db) throw new Error("DB connection not ready");
    // Native команд — dbStats (scale: 1 = bytes)
    const stats = await db.command({ dbStats: 1, scale: 1 });
    out.atlas = {
      db: db.databaseName,
      collections: stats.collections,
      objects: stats.objects,
      dataSizeBytes: stats.dataSize,
      storageSizeBytes: stats.storageSize,
      indexSizeBytes: stats.indexSize,
      ok: stats.ok === 1,
    };
  } catch (e) {
    out.atlas = { error: e.message || "Atlas stats failed" };
  }

  // 2) Cloudinary (Admin API — usage)
  try {
    // Node SDK: cloudinary.api.usage()
    const u = await cloudinary.api.usage();
    // Талбаруудыг найдвартай байдлаар “илэрхийлэл” болгон буцаана
    // Зарим акаунтад credits/limits/usage гэх мэт өөр арай өөр бүтэц байж болзошгүй тул хамгаалалттай авав
    const pick = (obj, key) => (obj && typeof obj === "object" ? obj[key] : undefined);

    out.cloudinary = {
      raw: u, // хэрэгтэй бол админ дэлгэрэнгүй харах боломжтой
      // нийтлэг сонирхдог үзүүлэлтүүд:
      storage: {
        usage_bytes:
          pick(u, "storage")?.usage?.bytes ??
          pick(u, "storage")?.usage ??
          pick(u, "storage") ??
          pick(u, "storage_usage") ??
          0,
        limit_bytes:
          pick(u, "storage")?.limit?.bytes ??
          pick(u, "storage")?.limit ??
          pick(u, "storage_limit") ??
          null,
      },
      bandwidth: {
        usage_bytes:
          pick(u, "bandwidth")?.usage?.bytes ??
          pick(u, "bandwidth")?.usage ??
          pick(u, "bandwidth_usage") ??
          0,
        limit_bytes:
          pick(u, "bandwidth")?.limit?.bytes ??
          pick(u, "bandwidth")?.limit ??
          pick(u, "bandwidth_limit") ??
          null,
      },
      credits: {
        usage:
          pick(u, "credits")?.usage ??
          pick(u, "credits_usage") ??
          null,
        limit:
          pick(u, "credits")?.limit ??
          pick(u, "credits_limit") ??
          null,
      },
      requests: {
        usage:
          pick(u, "requests")?.usage ??
          pick(u, "requests_usage") ??
          null,
        limit:
          pick(u, "requests")?.limit ??
          pick(u, "requests_limit") ??
          null,
      },
      transformations: {
        usage:
          pick(u, "transformations")?.usage ??
          pick(u, "transformations_usage") ??
          null,
        limit:
          pick(u, "transformations")?.limit ??
          pick(u, "transformations_limit") ??
          null,
      },
      // Хялбар уншлагатай формат
      friendly: {
        storageGB: {
          usage: Number(toGB(
            pick(u, "storage")?.usage?.bytes ??
            pick(u, "storage")?.usage ??
            pick(u, "storage") ??
            pick(u, "storage_usage") ??
            0
          ).toFixed(3)),
          limit: (pick(u, "storage")?.limit?.bytes ??
            pick(u, "storage")?.limit ??
            pick(u, "storage_limit") ??
            null) != null
            ? Number(toGB(
                pick(u, "storage")?.limit?.bytes ??
                pick(u, "storage")?.limit ??
                pick(u, "storage_limit")
              ).toFixed(3))
            : null,
        },
      },
    };
  } catch (e) {
    out.cloudinary = { error: e.message || "Cloudinary usage failed" };
  }

  res.json(out);
});

module.exports = router;

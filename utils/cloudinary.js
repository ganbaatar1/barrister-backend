const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_BASE_FOLDER,
} = process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

function uploadBufferToCloudinary({
  buffer,
  section = "common",
  folder,
  public_id,
  resource_type = "auto",
  tags = [],
}) {
  return new Promise((resolve, reject) => {
    const baseFolder = CLOUDINARY_BASE_FOLDER || "barrister";
    const targetFolder = folder || `${baseFolder}/${section}`;
    const opts = {
      folder: targetFolder,
      resource_type,
      public_id,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      invalidate: true,
      tags,
    };
    const stream = cloudinary.uploader.upload_stream(opts, (err, res) => {
      if (err) return reject(new Error(err?.message || "Cloudinary upload failed"));
      resolve(res);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

async function uploadManyToCloudinary(files, opts = {}) {
  const out = [];
  for (const f of files) out.push(await uploadBufferToCloudinary({ buffer: f.buffer, ...opts }));
  return out;
}

function destroyFromCloudinary(public_id, resource_type = "image") {
  return cloudinary.uploader.destroy(public_id, { resource_type });
}

module.exports = { uploadBufferToCloudinary, uploadManyToCloudinary, destroyFromCloudinary };

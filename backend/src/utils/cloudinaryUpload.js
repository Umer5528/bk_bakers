import cloudinary from "../config/cloudinary.js";

// Streams an in-memory file buffer to Cloudinary. Used for category/product
// images. Receipts (Module 4) will reuse this same helper with a different
// folder.
export const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

export const destroyCloudinaryAsset = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, err.message);
  }
};

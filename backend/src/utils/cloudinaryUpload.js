import cloudinary from "../config/cloudinary.js";

export const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("CLOUDINARY UPLOAD ERROR:", {
            message: error?.message,
            http_code: error?.http_code,
            name: error?.name,
            error: error,
          });

          return reject(error);
        }

        resolve(result);
      },
    );

    stream.on("error", (streamError) => {
      console.error("CLOUDINARY STREAM ERROR:", streamError);
      reject(streamError);
    });

    stream.end(buffer);
  });
};

export const destroyCloudinaryAsset = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Failed to delete Cloudinary asset:", {
      message: err?.message,
      http_code: err?.http_code,
      name: err?.name,
    });
  }
};

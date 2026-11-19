/**
 * cloudinary.js
 * -------------
 * Connects to Cloudinary and offers two helpers:
 *   - uploadImageBufferToCloudinary : sends one image to Cloudinary, returns its permanent web address
 *   - deleteImageFromCloudinary     : removes an image when a property is deleted or its photo is replaced
 */

import { v2 as cloudinary } from "cloudinary";

// Read the credentials from environment variables (never hard-code secrets in source files).
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // always return https:// addresses
});

/**
 * Uploads one image that is held in memory (a Buffer) to Cloudinary.
 * Returns the permanent https address of the stored image.
 */
export function uploadImageBufferToCloudinary(imageBuffer) {
  // Cloudinary reports its result through a callback, so we wrap it in a Promise
  // so the rest of our code can simply use "await".
  return new Promise(function (resolve, reject) {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "villament/properties", // keeps all property photos in one tidy folder
        resource_type: "image",
      },
      function (error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url); // e.g. https://res.cloudinary.com/<cloud>/image/upload/...jpg
        }
      }
    );

    // Send the image data into the upload stream and finish it.
    uploadStream.end(imageBuffer);
  });
}

/**
 * Deletes an image from Cloudinary, given the address we saved in the database.
 * Addresses that are not Cloudinary links (for example pasted external links) are ignored.
 */
export async function deleteImageFromCloudinary(imageAddress) {
  const isCloudinaryAddress =
    typeof imageAddress === "string" && imageAddress.includes("res.cloudinary.com");
  if (!isCloudinaryAddress) {
    return;
  }

  // Cloudinary identifies an image by its "public id": the path after "/upload/(version/)" minus the extension.
  // Example address: https://res.cloudinary.com/demo/image/upload/v123/villament/properties/abc.jpg
  //   -> public id:  villament/properties/abc
  const addressAfterUpload = imageAddress.split("/upload/")[1] || "";
  const addressWithoutVersion = addressAfterUpload.replace(/^v\d+\//, "");
  const publicId = addressWithoutVersion.replace(/\.[^/.]+$/, "");

  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
}
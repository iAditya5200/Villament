/**
 * imageUpload.js
 * --------------
 * Configures "multer", the library that receives files sent from the admin
 * panel's property form. Uploaded images are saved in the /uploads folder and
 * served publicly at http://<server>/uploads/<file-name>.
 */

import fs from "fs";
import path from "path";
import multer from "multer";

const UPLOAD_FOLDER = path.resolve("uploads");
const MAXIMUM_FILE_SIZE_IN_BYTES = 5 * 1024 * 1024; // 5 MB per image
const MAXIMUM_IMAGES_PER_REQUEST = 10;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

// Create the uploads folder the first time the server runs
if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

/** Decide where each file is stored and what it is called. */
const diskStorage = multer.diskStorage({
  destination: function chooseDestination(request, file, callback) {
    callback(null, UPLOAD_FOLDER);
  },
  filename: function chooseFileName(request, file, callback) {
    // Example result: "property-1718000000000-123456789.jpg"
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const uniqueNumber = Math.round(Math.random() * 1e9);
    callback(null, `property-${Date.now()}-${uniqueNumber}${fileExtension}`);
  },
});

/** Reject anything that is not an image. */
function acceptOnlyImages(request, file, callback) {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error("Only JPG, PNG, WEBP or AVIF images can be uploaded."));
  }
}

const multerInstance = multer({
  storage: diskStorage,
  fileFilter: acceptOnlyImages,
  limits: { fileSize: MAXIMUM_FILE_SIZE_IN_BYTES },
});

/**
 * Middleware that accepts up to 10 files sent in the "images" form field.
 * Use it on the create and update property routes.
 */
export const uploadPropertyImages = multerInstance.array("images", MAXIMUM_IMAGES_PER_REQUEST);

// /**
//  * imageUpload.js
//  * --------------
//  * Configures "multer", the library that receives files sent from the admin
//  * panel's property form. Uploaded images are saved in the /uploads folder and
//  * served publicly at http://<server>/uploads/<file-name>.
//  */

// import fs from "fs";
// import path from "path";
// import multer from "multer";

// const UPLOAD_FOLDER = path.resolve("uploads");
// const MAXIMUM_FILE_SIZE_IN_BYTES = 5 * 1024 * 1024; // 5 MB per image
// const MAXIMUM_IMAGES_PER_REQUEST = 10;
// const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

// // Create the uploads folder the first time the server runs
// if (!fs.existsSync(UPLOAD_FOLDER)) {
//   fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
// }

// /** Decide where each file is stored and what it is called. */
// const diskStorage = multer.diskStorage({
//   destination: function chooseDestination(request, file, callback) {
//     callback(null, UPLOAD_FOLDER);
//   },
//   filename: function chooseFileName(request, file, callback) {
//     // Example result: "property-1718000000000-123456789.jpg"
//     const fileExtension = path.extname(file.originalname).toLowerCase();
//     const uniqueNumber = Math.round(Math.random() * 1e9);
//     callback(null, `property-${Date.now()}-${uniqueNumber}${fileExtension}`);
//   },
// });

// /** Reject anything that is not an image. */
// function acceptOnlyImages(request, file, callback) {
//   if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
//     callback(null, true);
//   } else {
//     callback(new Error("Only JPG, PNG, WEBP or AVIF images can be uploaded."));
//   }
// }

// const multerInstance = multer({
//   storage: diskStorage,
//   fileFilter: acceptOnlyImages,
//   limits: { fileSize: MAXIMUM_FILE_SIZE_IN_BYTES },
// });

// /**
//  * Middleware that accepts up to 10 files sent in the "images" form field.
//  * Use it on the create and update property routes.
//  */
// export const uploadPropertyImages = multerInstance.array("images", MAXIMUM_IMAGES_PER_REQUEST);


/**
 * imageUpload.js
 * --------------
 * Receives images sent from the admin panel's property form and stores them in Cloudinary.
 *
 * Flow for every upload request:
 *   1. receiveImagesInMemory   (multer)  -> reads the files into memory, checks type and size
 *   2. sendImagesToCloudinary  (ours)    -> uploads each file, saves the addresses in request.uploadedImageAddresses
 *   3. the controller                    -> stores request.uploadedImageAddresses in the database
 */

import multer from "multer";
import { uploadImageBufferToCloudinary } from "../config/cloudinary.js";

const MAXIMUM_FILE_SIZE_IN_BYTES = 5 * 1024 * 1024; // 5 MB per image
const MAXIMUM_IMAGES_PER_REQUEST = 10;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Reject anything that is not an image. */
function acceptOnlyImages(request, file, callback) {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    // The message starts with "Only JPG" so errorHandlers.js turns it into a friendly 400 reply.
    callback(new Error("Only JPG, PNG, WEBP or AVIF images can be uploaded."));
  }
}

const multerInstance = multer({
  storage: multer.memoryStorage(), // keep files in memory; nothing is written to Render's temporary disk
  fileFilter: acceptOnlyImages,
  limits: { fileSize: MAXIMUM_FILE_SIZE_IN_BYTES },
});

/** Step 1: accept up to 10 files sent in the "images" form field. */
const receiveImagesInMemory = multerInstance.array("images", MAXIMUM_IMAGES_PER_REQUEST);

/** Step 2: upload every received file to Cloudinary and remember the resulting addresses. */
async function sendImagesToCloudinary(request, response, next) {
  try {
    const receivedFiles = request.files || [];

    // Upload all images at the same time and wait until every one has finished.
    const uploadedImageAddresses = await Promise.all(
      receivedFiles.map(function (receivedFile) {
        return uploadImageBufferToCloudinary(receivedFile.buffer);
      })
    );

    // Make the addresses available to the controller.
    request.uploadedImageAddresses = uploadedImageAddresses;
    next();
  } catch (error) {
    next(error); // handled by handleErrors in errorHandlers.js
  }
}

/**
 * Use this exactly as before on the create and update property routes.
 * Express runs the two middleware functions in order.
 */
export const uploadPropertyImages = [receiveImagesInMemory, sendImagesToCloudinary];
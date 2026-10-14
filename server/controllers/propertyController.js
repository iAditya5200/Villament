/**
 * propertyController.js
 * ---------------------
 * All logic for reading, creating, updating and deleting properties.
 *
 * Public functions (used by the website):
 *    listPublishedProperties, getPropertyBySlug, getPropertyFilterOptions
 *
 * Admin functions (used by the admin panel, login required):
 *    listAllPropertiesForAdmin, getPropertyByIdForAdmin,
 *    createProperty, updateProperty, deleteProperty
 */

import fs from "fs";
import path from "path";
import Property, { PROPERTY_STATUSES, PROPERTY_TYPES } from "../models/Property.js";
import Enquiry from "../models/Enquiry.js";
import { createHttpError } from "../utils/asyncHandler.js";

/* ------------------------------------------------------------------ */
/* Helper functions                                                    */
/* ------------------------------------------------------------------ */

/**
 * Escapes characters that have a special meaning in regular expressions,
 * so that a visitor's search text is treated as plain text.
 */
function escapeForRegularExpression(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Converts the uploaded files from multer into public image paths.
 * Example: "/uploads/property-1718000000000-1234.jpg"
 */
function getUploadedImagePaths(uploadedFiles = []) {
  return uploadedFiles.map((file) => `/uploads/${file.filename}`);
}

/**
 * Deletes image files from the /uploads folder.
 * Only local uploads are removed; web addresses (https://...) are ignored.
 */
function deleteLocalImageFiles(imagePaths = []) {
  imagePaths
    .filter((imagePath) => imagePath.startsWith("/uploads/"))
    .forEach((imagePath) => {
      const absoluteFilePath = path.resolve("uploads", path.basename(imagePath));
      fs.unlink(absoluteFilePath, (error) => {
        if (error && error.code !== "ENOENT") {
          console.warn(`Could not delete image ${absoluteFilePath}:`, error.message);
        }
      });
    });
}

/**
 * The admin form sends text fields inside one JSON string called "propertyData"
 * (because the request also contains image files). This function reads that
 * JSON safely and keeps only the fields we allow to be changed.
 */
function readPropertyFieldsFromRequest(request) {
  let submittedData = {};

  try {
    submittedData = request.body.propertyData ? JSON.parse(request.body.propertyData) : request.body;
  } catch (error) {
    throw createHttpError(400, "Property data is not valid JSON.");
  }

  /** Turns "a, b" / "a\nb" / ["a","b"] into a clean array of strings. */
  const toCleanList = (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
      return value
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };

  const allowedFields = {
    title: submittedData.title,
    tagline: submittedData.tagline,
    description: submittedData.description,
    location: {
      locality: submittedData.location?.locality || "",
      city: submittedData.location?.city || "",
      state: submittedData.location?.state || "Maharashtra",
      latitude: submittedData.location?.latitude ? Number(submittedData.location.latitude) : undefined,
      longitude: submittedData.location?.longitude ? Number(submittedData.location.longitude) : undefined,
    },
    propertyType: submittedData.propertyType,
    status: submittedData.status,
    startingPrice: Number(submittedData.startingPrice) || 0,
    configuration: submittedData.configuration,
    sizeRange: submittedData.sizeRange,
    totalUnits: Number(submittedData.totalUnits) || 0,
    landArea: submittedData.landArea,
    possession: submittedData.possession,
    reraNumber: submittedData.reraNumber,
    amenities: toCleanList(submittedData.amenities),
    highlights: toCleanList(submittedData.highlights),
    isFeatured: submittedData.isFeatured === true || submittedData.isFeatured === "true",
  };

  // Images the admin chose to keep (existing uploads or pasted web addresses)
  const keptImagePaths = toCleanList(submittedData.images);

  return { allowedFields, keptImagePaths };
}

/* ------------------------------------------------------------------ */
/* Public routes                                                       */
/* ------------------------------------------------------------------ */

/**
 * GET /api/properties
 * Optional query parameters:
 *    status   – "Now Selling" | "Coming Soon" | "Sold Out"
 *    type     – "Villa" | "Villa Plot" | ...
 *    city     – e.g. "Panvel"
 *    search   – free text matched against title, tagline and locality
 *    featured – "true" to return only featured properties
 *    sort     – "newest" (default) | "price-low" | "price-high"
 *    limit    – maximum number of results
 */
export async function listPublishedProperties(request, response) {
  const { status, type, city, search, featured, sort, limit } = request.query;
  const databaseFilter = {};

  if (status) databaseFilter.status = status;
  if (type) databaseFilter.propertyType = type;
  if (city) databaseFilter["location.city"] = city;
  if (featured === "true") databaseFilter.isFeatured = true;

  if (search) {
    const searchPattern = new RegExp(escapeForRegularExpression(search.trim()), "i");
    databaseFilter.$or = [
      { title: searchPattern },
      { tagline: searchPattern },
      { "location.locality": searchPattern },
      { "location.city": searchPattern },
    ];
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    "price-low": { startingPrice: 1 },
    "price-high": { startingPrice: -1 },
  };
  const chosenSort = sortOptions[sort] || sortOptions.newest;

  let databaseQuery = Property.find(databaseFilter).sort(chosenSort);
  if (limit) {
    databaseQuery = databaseQuery.limit(Number(limit));
  }

  const properties = await databaseQuery;
  response.json({ properties });
}

/**
 * GET /api/properties/filters
 * Returns the values the website can show in its filter drop-downs.
 */
export async function getPropertyFilterOptions(request, response) {
  const availableCities = await Property.distinct("location.city");
  response.json({
    cities: availableCities.sort(),
    types: PROPERTY_TYPES,
    statuses: PROPERTY_STATUSES,
  });
}

/**
 * GET /api/properties/:slug
 * Returns one property (by its URL slug) plus up to 3 similar properties.
 */
export async function getPropertyBySlug(request, response) {
  const property = await Property.findOne({ slug: request.params.slug });

  if (!property) {
    throw createHttpError(404, "Property not found.");
  }

  const similarProperties = await Property.find({
    _id: { $ne: property._id },
    $or: [{ "location.city": property.location.city }, { propertyType: property.propertyType }],
  })
    .limit(3)
    .sort({ createdAt: -1 });

  response.json({ property, similarProperties });
}

/* ------------------------------------------------------------------ */
/* Admin routes                                                        */
/* ------------------------------------------------------------------ */

/**
 * GET /api/admin/properties
 * Every property, newest first, with the number of enquiries each one received.
 */
export async function listAllPropertiesForAdmin(request, response) {
  const properties = await Property.find().sort({ createdAt: -1 }).lean();

  // Count enquiries for each property in a single database query
  const enquiryCounts = await Enquiry.aggregate([
    { $match: { property: { $ne: null } } },
    { $group: { _id: "$property", totalEnquiries: { $sum: 1 } } },
  ]);

  const enquiryCountByPropertyId = new Map(
    enquiryCounts.map((countRow) => [String(countRow._id), countRow.totalEnquiries])
  );

  const propertiesWithCounts = properties.map((property) => ({
    ...property,
    enquiryCount: enquiryCountByPropertyId.get(String(property._id)) || 0,
  }));

  response.json({ properties: propertiesWithCounts });
}

/**
 * GET /api/admin/properties/:id
 */
export async function getPropertyByIdForAdmin(request, response) {
  const property = await Property.findById(request.params.id);
  if (!property) {
    throw createHttpError(404, "Property not found.");
  }
  response.json({ property });
}

/**
 * POST /api/admin/properties
 * Multipart form: "propertyData" (JSON text) + "images" (files).
 */
export async function createProperty(request, response) {
  const { allowedFields, keptImagePaths } = readPropertyFieldsFromRequest(request);
  const newlyUploadedImagePaths = getUploadedImagePaths(request.files);

  try {
    const createdProperty = await Property.create({
      ...allowedFields,
      images: [...keptImagePaths, ...newlyUploadedImagePaths],
    });
    response.status(201).json({ property: createdProperty, message: "Property created successfully." });
  } catch (error) {
    // If saving failed, remove the files we just uploaded so they do not pile up
    deleteLocalImageFiles(newlyUploadedImagePaths);
    throw error;
  }
}

/**
 * PUT /api/admin/properties/:id
 * Same body as createProperty. Images that are no longer in the list are
 * deleted from the server.
 */
export async function updateProperty(request, response) {
  const existingProperty = await Property.findById(request.params.id);
  if (!existingProperty) {
    deleteLocalImageFiles(getUploadedImagePaths(request.files));
    throw createHttpError(404, "Property not found.");
  }

  const { allowedFields, keptImagePaths } = readPropertyFieldsFromRequest(request);
  const newlyUploadedImagePaths = getUploadedImagePaths(request.files);
  const finalImageList = [...keptImagePaths, ...newlyUploadedImagePaths];

  // Images that existed before but were removed by the admin
  const removedImagePaths = existingProperty.images.filter((imagePath) => !finalImageList.includes(imagePath));

  existingProperty.set({ ...allowedFields, images: finalImageList });

  try {
    await existingProperty.save();
  } catch (error) {
    deleteLocalImageFiles(newlyUploadedImagePaths);
    throw error;
  }

  deleteLocalImageFiles(removedImagePaths);
  response.json({ property: existingProperty, message: "Property updated successfully." });
}

/**
 * DELETE /api/admin/properties/:id
 * Removes the property and its uploaded images. Enquiries about this property
 * are kept (they still show the property title), so no lead is ever lost.
 */
export async function deleteProperty(request, response) {
  const propertyToDelete = await Property.findById(request.params.id);
  if (!propertyToDelete) {
    throw createHttpError(404, "Property not found.");
  }

  await propertyToDelete.deleteOne();
  deleteLocalImageFiles(propertyToDelete.images);

  response.json({ message: `"${propertyToDelete.title}" was deleted.` });
}

/**
 * Property.js
 * -----------
 * Mongoose model describing one real estate project / property listed on the
 * Villament website (for example a villa community or a plotted development).
 */

import mongoose from "mongoose";

/** The kinds of property Villament sells. Shown as a filter on the website. */
export const PROPERTY_TYPES = ["Villa", "Villa Plot", "Townhouse", "Apartment", "Farmhouse"];

/** The sales status of a property. Shown as a coloured tag on each card. */
export const PROPERTY_STATUSES = ["Now Selling", "Coming Soon", "Sold Out"];

const locationSchema = new mongoose.Schema(
  {
    locality: { type: String, trim: true, default: "" }, // e.g. "Kharghar Hills"
    city: { type: String, trim: true, required: [true, "City is required"] }, // e.g. "Panvel"
    state: { type: String, trim: true, default: "Maharashtra" },
    // Optional coordinates, used to centre the map on the property page
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
      maxlength: [120, "Title cannot be longer than 120 characters"],
    },

    // URL-friendly version of the title, e.g. "the-ridge-estates".
    // It is generated automatically from the title before saving.
    slug: { type: String, unique: true, index: true },

    tagline: { type: String, trim: true, default: "" }, // one short line shown on cards
    description: { type: String, required: [true, "Description is required"] },

    location: { type: locationSchema, required: true },

    propertyType: { type: String, enum: PROPERTY_TYPES, default: "Villa" },
    status: { type: String, enum: PROPERTY_STATUSES, default: "Now Selling" },

    // Price is stored as a plain number in Indian Rupees so it can be sorted
    // and used in the EMI calculator. 0 means "Price on request".
    startingPrice: { type: Number, default: 0, min: 0 },

    configuration: { type: String, trim: true, default: "" }, // e.g. "3 & 4 BHK Villas"
    sizeRange: { type: String, trim: true, default: "" }, // e.g. "2,400 – 4,100 sq.ft"
    totalUnits: { type: Number, default: 0, min: 0 },
    landArea: { type: String, trim: true, default: "" }, // e.g. "18 Acres"
    possession: { type: String, trim: true, default: "" }, // e.g. "December 2027"
    reraNumber: { type: String, trim: true, default: "" },

    amenities: { type: [String], default: [] }, // e.g. ["Clubhouse", "Infinity pool"]
    highlights: { type: [String], default: [] }, // short selling points

    // A list of image addresses. They can be uploaded files (/uploads/...) or
    // full web addresses (https://...).
    images: { type: [String], default: [] },

    // Featured properties appear on the home page
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

/**
 * Turns any text into a URL-friendly slug.
 * Example: "The Ridge Estates!" -> "the-ridge-estates"
 *
 * @param {string} text
 * @returns {string}
 */
function createSlugFromText(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove anything that is not a letter, number, space or dash
    .replace(/\s+/g, "-") // replace spaces with dashes
    .replace(/-+/g, "-"); // collapse repeated dashes
}

/**
 * Before a property is validated, make sure it has a unique slug.
 * If another property already uses the same slug, a number is added to the end.
 */
propertySchema.pre("validate", async function generateUniqueSlug() {
  const propertyDocument = this;

  // Only regenerate the slug if the title changed (or the slug is missing)
  if (!propertyDocument.isModified("title") && propertyDocument.slug) {
    return;
  }

  const baseSlug = createSlugFromText(propertyDocument.title || "property");
  let candidateSlug = baseSlug;
  let suffixNumber = 2;

  // Keep trying "slug-2", "slug-3" ... until we find one that is not taken
  // by a different property.
  // eslint-disable-next-line no-await-in-loop
  while (
    await mongoose.models.Property.exists({
      slug: candidateSlug,
      _id: { $ne: propertyDocument._id },
    })
  ) {
    candidateSlug = `${baseSlug}-${suffixNumber}`;
    suffixNumber += 1;
  }

  propertyDocument.slug = candidateSlug;
});

const Property = mongoose.model("Property", propertySchema);

export default Property;

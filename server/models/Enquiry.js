/**
 * Enquiry.js
 * ----------
 * Mongoose model for every lead that reaches Villament through the website:
 * contact form messages, site visit bookings and "register interest" requests.
 *
 * Each enquiry also works as a small CRM record. The admin can track whether
 * the lead has been contacted, move it through the sales stages, and write
 * follow-up notes. Every change is stored in the activity log.
 */

import mongoose from "mongoose";

/** Where the enquiry came from on the website. */
export const ENQUIRY_TYPES = ["General", "Site Visit", "Register Interest", "Brochure Request"];

/**
 * The stages a lead moves through. The first one ("New") means
 * the lead has NOT been contacted yet.
 */
export const LEAD_STATUSES = [
  "New", // not contacted yet
  "Contacted", // a team member has spoken to / emailed the lead
  "Site Visit Scheduled", // a visit to the property is booked
  "Converted", // the lead bought / booked a unit
  "Not Interested", // the lead is closed without a sale
];

/** One entry in the history of a lead (status changes and notes). */
const activityEntrySchema = new mongoose.Schema(
  {
    // "status_change", "note" or "created"
    activityType: { type: String, required: true },
    message: { type: String, required: true },
    performedBy: { type: String, default: "System" }, // admin name
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const enquirySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[0-9+\-\s()]{7,20}$/, "Please enter a valid phone number"],
    },
    message: { type: String, trim: true, maxlength: 2000, default: "" },

    enquiryType: { type: String, enum: ENQUIRY_TYPES, default: "General" },

    // The property the visitor was looking at (optional)
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", default: null },
    // A copy of the property title, so the record still makes sense
    // even if the property is deleted later.
    propertyTitle: { type: String, default: "" },

    preferredVisitDate: { type: Date, default: null }, // only for site visits
    sourcePage: { type: String, default: "" }, // e.g. "/properties/the-ridge-estates"

    // ----- Lead tracking fields (managed by the admin) -----
    leadStatus: { type: String, enum: LEAD_STATUSES, default: "New", index: true },
    isContacted: { type: Boolean, default: false, index: true },
    contactedAt: { type: Date, default: null },
    nextFollowUpDate: { type: Date, default: null },
    activityLog: { type: [activityEntrySchema], default: [] },
  },
  { timestamps: true }
);

/**
 * Keep "isContacted" in sync with the lead status:
 * any status other than "New" means someone has reached out.
 * The first time a lead is contacted, the date is recorded.
 */
enquirySchema.pre("save", function syncContactedFlag() {
  const enquiryDocument = this;

  if (enquiryDocument.isModified("leadStatus")) {
    const hasBeenContacted = enquiryDocument.leadStatus !== "New";
    enquiryDocument.isContacted = hasBeenContacted;

    if (hasBeenContacted && !enquiryDocument.contactedAt) {
      enquiryDocument.contactedAt = new Date();
    }
    if (!hasBeenContacted) {
      enquiryDocument.contactedAt = null;
    }
  }
});

const Enquiry = mongoose.model("Enquiry", enquirySchema);

export default Enquiry;

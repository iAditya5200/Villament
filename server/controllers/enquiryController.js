/**
 * enquiryController.js
 * --------------------
 * Logic for website enquiries (leads) and the admin's lead-tracking tools.
 *
 * Public:
 *    createEnquiry            – visitors submit the contact / site visit forms
 *
 * Admin (login required):
 *    listEnquiries            – searchable, filterable, paginated list
 *    getEnquiryById           – one lead with its full activity history
 *    updateEnquiryTracking    – change lead status / follow-up date
 *    addEnquiryNote           – write a follow-up note
 *    deleteEnquiry            – remove a lead
 *    exportEnquiriesAsCsv     – download leads as a spreadsheet file
 */

import mongoose from "mongoose";
import Enquiry, { ENQUIRY_TYPES, LEAD_STATUSES } from "../models/Enquiry.js";
import Property from "../models/Property.js";
import { createHttpError } from "../utils/asyncHandler.js";

const DEFAULT_PAGE_SIZE = 20;

/** Escapes regular-expression characters in user search text. */
function escapeForRegularExpression(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds the MongoDB filter used by both the list and the CSV export, so the
 * export always contains exactly what the admin is looking at.
 */
function buildEnquiryFilterFromQuery(query) {
  const { leadStatus, contacted, enquiryType, propertyId, search, fromDate, toDate } = query;
  const databaseFilter = {};

  if (leadStatus) databaseFilter.leadStatus = leadStatus;
  if (enquiryType) databaseFilter.enquiryType = enquiryType;
  if (contacted === "yes") databaseFilter.isContacted = true;
  if (contacted === "no") databaseFilter.isContacted = false;

  if (propertyId && mongoose.isValidObjectId(propertyId)) {
    databaseFilter.property = propertyId;
  }

  if (fromDate || toDate) {
    databaseFilter.createdAt = {};
    if (fromDate) databaseFilter.createdAt.$gte = new Date(fromDate);
    if (toDate) {
      // Include the whole "to" day, up to 23:59:59
      const endOfDay = new Date(toDate);
      endOfDay.setHours(23, 59, 59, 999);
      databaseFilter.createdAt.$lte = endOfDay;
    }
  }

  if (search) {
    const searchPattern = new RegExp(escapeForRegularExpression(search.trim()), "i");
    databaseFilter.$or = [
      { fullName: searchPattern },
      { email: searchPattern },
      { phone: searchPattern },
      { propertyTitle: searchPattern },
    ];
  }

  return databaseFilter;
}

/* ------------------------------------------------------------------ */
/* Public                                                              */
/* ------------------------------------------------------------------ */

/**
 * POST /api/enquiries
 * Body: { fullName, email, phone, message, enquiryType, propertyId,
 *         preferredVisitDate, sourcePage, website }
 *
 * "website" is a hidden "honeypot" field. Real visitors never see it, so if it
 * is filled in, the request almost certainly came from a spam bot.
 */
export async function createEnquiry(request, response) {
  const {
    fullName,
    email,
    phone,
    message,
    enquiryType,
    propertyId,
    preferredVisitDate,
    sourcePage,
    website: honeypotValue,
  } = request.body;

  if (honeypotValue) {
    // Pretend everything worked so the bot does not retry
    return response.status(201).json({ message: "Thank you! Our team will reach out shortly." });
  }

  // Attach the property, if the visitor enquired from a property page
  let linkedProperty = null;
  if (propertyId && mongoose.isValidObjectId(propertyId)) {
    linkedProperty = await Property.findById(propertyId).select("title");
  }

  const safeEnquiryType = ENQUIRY_TYPES.includes(enquiryType) ? enquiryType : "General";

  const createdEnquiry = await Enquiry.create({
    fullName,
    email,
    phone,
    message,
    enquiryType: safeEnquiryType,
    property: linkedProperty?._id || null,
    propertyTitle: linkedProperty?.title || "",
    preferredVisitDate: preferredVisitDate ? new Date(preferredVisitDate) : null,
    sourcePage: sourcePage || "",
    activityLog: [{ activityType: "created", message: `${safeEnquiryType} enquiry received from the website.` }],
  });

  return response.status(201).json({
    message: "Thank you! Our team will reach out to you within 24 hours.",
    enquiryId: createdEnquiry._id,
  });
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

/**
 * GET /api/admin/enquiries
 * Query: leadStatus, contacted ("yes"/"no"), enquiryType, propertyId, search,
 *        fromDate, toDate, page (starts at 1), limit
 */
export async function listEnquiries(request, response) {
  const databaseFilter = buildEnquiryFilterFromQuery(request.query);

  const currentPage = Math.max(Number(request.query.page) || 1, 1);
  const pageSize = Math.min(Number(request.query.limit) || DEFAULT_PAGE_SIZE, 100);

  const [enquiries, totalMatchingEnquiries, statusCountRows, notContactedCount] = await Promise.all([
    Enquiry.find(databaseFilter)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .select("-activityLog"), // the full history is loaded only on the detail view
    Enquiry.countDocuments(databaseFilter),
    // Counts for the status tabs in the admin panel (across ALL leads)
    Enquiry.aggregate([{ $group: { _id: "$leadStatus", count: { $sum: 1 } } }]),
    Enquiry.countDocuments({ isContacted: false }),
  ]);

  // Turn [{ _id: "New", count: 3 }, ...] into { New: 3, Contacted: 0, ... }
  const countsByStatus = Object.fromEntries(LEAD_STATUSES.map((statusName) => [statusName, 0]));
  statusCountRows.forEach((row) => {
    countsByStatus[row._id] = row.count;
  });
  const totalLeadCount = Object.values(countsByStatus).reduce((runningTotal, count) => runningTotal + count, 0);

  response.json({
    counts: { all: totalLeadCount, notContacted: notContactedCount, byStatus: countsByStatus },
    enquiries,
    pagination: {
      currentPage,
      pageSize,
      totalItems: totalMatchingEnquiries,
      totalPages: Math.max(Math.ceil(totalMatchingEnquiries / pageSize), 1),
    },
    leadStatuses: LEAD_STATUSES,
    enquiryTypes: ENQUIRY_TYPES,
  });
}

/**
 * GET /api/admin/enquiries/:id
 */
export async function getEnquiryById(request, response) {
  const enquiry = await Enquiry.findById(request.params.id).populate("property", "title slug");
  if (!enquiry) {
    throw createHttpError(404, "Enquiry not found.");
  }
  response.json({ enquiry });
}

/**
 * PATCH /api/admin/enquiries/:id
 * Body: { leadStatus?, nextFollowUpDate? }
 * Every change is written to the lead's activity log with the admin's name.
 */
export async function updateEnquiryTracking(request, response) {
  const enquiry = await Enquiry.findById(request.params.id);
  if (!enquiry) {
    throw createHttpError(404, "Enquiry not found.");
  }

  const { leadStatus, nextFollowUpDate } = request.body;
  const adminName = request.admin.name;

  if (leadStatus !== undefined && leadStatus !== enquiry.leadStatus) {
    if (!LEAD_STATUSES.includes(leadStatus)) {
      throw createHttpError(400, `Lead status must be one of: ${LEAD_STATUSES.join(", ")}`);
    }
    enquiry.activityLog.push({
      activityType: "status_change",
      message: `Status changed from "${enquiry.leadStatus}" to "${leadStatus}".`,
      performedBy: adminName,
    });
    enquiry.leadStatus = leadStatus;
  }

  if (nextFollowUpDate !== undefined) {
    enquiry.nextFollowUpDate = nextFollowUpDate ? new Date(nextFollowUpDate) : null;
    enquiry.activityLog.push({
      activityType: "status_change",
      message: nextFollowUpDate
        ? `Follow-up scheduled for ${new Date(nextFollowUpDate).toDateString()}.`
        : "Follow-up date cleared.",
      performedBy: adminName,
    });
  }

  await enquiry.save();
  await enquiry.populate("property", "title slug");

  response.json({ enquiry, message: "Lead updated." });
}

/**
 * POST /api/admin/enquiries/:id/notes
 * Body: { note }
 */
export async function addEnquiryNote(request, response) {
  const noteText = (request.body.note || "").trim();
  if (!noteText) {
    throw createHttpError(400, "The note cannot be empty.");
  }

  const enquiry = await Enquiry.findById(request.params.id);
  if (!enquiry) {
    throw createHttpError(404, "Enquiry not found.");
  }

  enquiry.activityLog.push({ activityType: "note", message: noteText, performedBy: request.admin.name });
  await enquiry.save();
  await enquiry.populate("property", "title slug");

  response.status(201).json({ enquiry, message: "Note added." });
}

/**
 * DELETE /api/admin/enquiries/:id
 */
export async function deleteEnquiry(request, response) {
  const deletedEnquiry = await Enquiry.findByIdAndDelete(request.params.id);
  if (!deletedEnquiry) {
    throw createHttpError(404, "Enquiry not found.");
  }
  response.json({ message: "Enquiry deleted." });
}

/**
 * GET /api/admin/enquiries/export
 * Sends a CSV file (opens in Excel / Google Sheets) using the same filters
 * as the enquiry list.
 */
export async function exportEnquiriesAsCsv(request, response) {
  const databaseFilter = buildEnquiryFilterFromQuery(request.query);
  const enquiries = await Enquiry.find(databaseFilter).sort({ createdAt: -1 }).lean();

  /** Wraps a value in quotes and escapes inner quotes, as CSV requires. */
  const toCsvCell = (value) => {
    const textValue = value === null || value === undefined ? "" : String(value);
    return `"${textValue.replace(/"/g, '""')}"`;
  };

  /** Formats a date as YYYY-MM-DD, or an empty string. */
  const toDateText = (dateValue) => (dateValue ? new Date(dateValue).toISOString().slice(0, 10) : "");

  const columnHeadings = [
    "Received On",
    "Name",
    "Email",
    "Phone",
    "Enquiry Type",
    "Property",
    "Preferred Visit Date",
    "Lead Status",
    "Contacted",
    "Contacted On",
    "Next Follow-up",
    "Message",
  ];

  const dataRows = enquiries.map((enquiry) => [
    toDateText(enquiry.createdAt),
    enquiry.fullName,
    enquiry.email,
    enquiry.phone,
    enquiry.enquiryType,
    enquiry.propertyTitle,
    toDateText(enquiry.preferredVisitDate),
    enquiry.leadStatus,
    enquiry.isContacted ? "Yes" : "No",
    toDateText(enquiry.contactedAt),
    toDateText(enquiry.nextFollowUpDate),
    enquiry.message,
  ]);

  const csvText = [columnHeadings, ...dataRows].map((row) => row.map(toCsvCell).join(",")).join("\n");

  const fileName = `villament-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  response.setHeader("Content-Type", "text/csv; charset=utf-8");
  response.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  response.send(csvText);
}

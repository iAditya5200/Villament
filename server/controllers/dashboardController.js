/**
 * dashboardController.js
 * ----------------------
 * Collects the numbers shown on the admin dashboard:
 * property counts, lead counts per status, recent leads and follow-ups due.
 */

import Property from "../models/Property.js";
import Enquiry, { LEAD_STATUSES } from "../models/Enquiry.js";

/**
 * GET /api/admin/dashboard
 */
export async function getDashboardSummary(request, response) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // Run all queries at the same time to keep the dashboard fast
  const [
    totalProperties,
    propertiesByStatusRows,
    totalEnquiries,
    uncontactedEnquiries,
    enquiriesThisWeek,
    enquiriesByStatusRows,
    recentEnquiries,
    followUpsDue,
    topPropertiesRows,
  ] = await Promise.all([
    Property.countDocuments(),
    Property.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Enquiry.countDocuments(),
    Enquiry.countDocuments({ isContacted: false }),
    Enquiry.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Enquiry.aggregate([{ $group: { _id: "$leadStatus", count: { $sum: 1 } } }]),
    Enquiry.find().sort({ createdAt: -1 }).limit(6).select("fullName phone enquiryType propertyTitle leadStatus createdAt"),
    Enquiry.find({
      nextFollowUpDate: { $ne: null, $lte: endOfToday },
      leadStatus: { $nin: ["Converted", "Not Interested"] },
    })
      .sort({ nextFollowUpDate: 1 })
      .limit(6)
      .select("fullName phone propertyTitle leadStatus nextFollowUpDate"),
    Enquiry.aggregate([
      { $match: { propertyTitle: { $ne: "" } } },
      { $group: { _id: "$propertyTitle", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  // Turn the aggregation rows into simple { "Now Selling": 3, ... } objects,
  // making sure every status appears even if its count is zero.
  const leadsByStatus = Object.fromEntries(LEAD_STATUSES.map((statusName) => [statusName, 0]));
  enquiriesByStatusRows.forEach((row) => {
    leadsByStatus[row._id] = row.count;
  });

  const propertiesByStatus = {};
  propertiesByStatusRows.forEach((row) => {
    propertiesByStatus[row._id] = row.count;
  });

  const convertedLeads = leadsByStatus.Converted || 0;
  const conversionRatePercent = totalEnquiries ? Math.round((convertedLeads / totalEnquiries) * 100) : 0;

  response.json({
    totals: {
      totalProperties,
      totalEnquiries,
      uncontactedEnquiries,
      enquiriesThisWeek,
      conversionRatePercent,
    },
    propertiesByStatus,
    leadsByStatus,
    recentEnquiries,
    followUpsDue,
    topProperties: topPropertiesRows.map((row) => ({ propertyTitle: row._id, enquiryCount: row.count })),
  });
}

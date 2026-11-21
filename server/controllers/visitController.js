/**
 * visitController.js
 * ------------------
 * The logic behind the website visitor counter.
 *
 * Two jobs:
 *   1. recordVisit     - called by the public website (no login needed)
 *   2. getVisitorStats - called by the admin dashboard (login needed)
 */

import Visit from "../models/Visit.js";

/**
 * Returns a date as "YYYY-MM-DD" using Indian time,
 * so "today" changes at midnight in India, not at midnight UTC.
 */
function getDayText(date) {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/**
 * POST /api/visits
 * Body: { visitorId: "random-text" }
 *
 * Saves at most one record per visitor per day.
 */
export async function recordVisit(request, response) {
  const visitorId = request.body.visitorId;

  // Ignore requests with a missing or unreasonable ID.
  const isValidId = typeof visitorId === "string" && visitorId.length > 0 && visitorId.length <= 100;
  if (!isValidId) {
    return response.status(400).json({ message: "A valid visitorId is required." });
  }

  const today = getDayText(new Date());

  try {
    // "Upsert" = create the record if it does not exist, otherwise do nothing.
    await Visit.updateOne(
      { visitorId: visitorId, day: today },
      { $setOnInsert: { visitorId: visitorId, day: today } },
      { upsert: true }
    );
  } catch (error) {
    // Error code 11000 means "duplicate": two requests arrived at the same
    // moment. The visitor is already counted, so this is safe to ignore.
    if (error.code !== 11000) {
      console.error("Could not record visit:", error);
      return response.status(500).json({ message: "Could not record visit." });
    }
  }

  response.status(204).end();
}

/**
 * GET /api/admin/visitors
 * Returns the numbers shown on the admin dashboard.
 */
export async function getVisitorStats(request, response) {
  const now = new Date();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  const today = getDayText(now);
  const sevenDaysAgo = getDayText(new Date(now.getTime() - 6 * millisecondsPerDay));
  const thirtyDaysAgo = getDayText(new Date(now.getTime() - 29 * millisecondsPerDay));

  // Visitors today: one record per visitor, so counting records counts visitors.
  const visitorsToday = await Visit.countDocuments({ day: today });

  // Unique people over a period: the same person visiting on several days
  // is counted once, so we ask the database for the distinct visitor IDs.
  const uniqueLast7Days = (await Visit.distinct("visitorId", { day: { $gte: sevenDaysAgo } })).length;
  const uniqueLast30Days = (await Visit.distinct("visitorId", { day: { $gte: thirtyDaysAgo } })).length;
  const uniqueAllTime = (await Visit.distinct("visitorId")).length;

  response.json({
    visitorsToday,
    uniqueLast7Days,
    uniqueLast30Days,
    uniqueAllTime,
  });
}
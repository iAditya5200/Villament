/**
 * trackVisit.js
 * -------------
 * Tells the server "a visitor is here". It runs once each time the
 * website is opened in a browser tab, and it never runs for the admin panel.
 */

import { publicApi } from "../api/apiClient.js";

/** Key used to remember this browser between visits. */
const VISITOR_ID_STORAGE_KEY = "villament_visitor_id";

/** Key used to remember that this tab has already been counted. */
const VISIT_COUNTED_STORAGE_KEY = "villament_visit_counted";

/**
 * Returns this browser's visitor ID, creating one on the first visit.
 * The ID is random text and contains no personal information.
 */
function getOrCreateVisitorId() {
  let visitorId = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY);

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, visitorId);
  }

  return visitorId;
}

export function trackVisit() {
  // Do not count the owner working in the admin panel.
  if (window.location.pathname.startsWith("/admin")) {
    return;
  }

  try {
    // sessionStorage lasts until the tab is closed. This stops us from
    // calling the server again on every refresh within the same visit.
    if (window.sessionStorage.getItem(VISIT_COUNTED_STORAGE_KEY)) {
      return;
    }

    const visitorId = getOrCreateVisitorId();

    // Mark this tab as counted only after the server has accepted the visit,
    // so a failed request can be retried on the next page load.
    publicApi
      .recordVisit(visitorId)
      .then(() => window.sessionStorage.setItem(VISIT_COUNTED_STORAGE_KEY, "true"))
      .catch((error) => {
        // Visitor counting must never break the website, so we only log a warning.
        console.warn("Visit was not counted:", error.message);
      });
  } catch (error) {
    // Also shows problems such as "publicApi.recordVisit is not a function".
    console.warn("Visit tracking failed:", error.message);
  }
}
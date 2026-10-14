/**
 * formatters.js
 * -------------
 * Small helper functions that turn raw data into text people can read.
 */

import { API_BASE_URL } from "../api/apiClient.js";

const ONE_LAKH = 100000;
const ONE_CRORE = 10000000;

/**
 * Formats a price in Indian Rupees using lakhs and crores.
 *   28500000 -> "₹2.85 Cr"
 *   6800000  -> "₹68 L"
 *   0        -> "Price on request"
 *
 * @param {number} priceInRupees
 * @returns {string}
 */
export function formatIndianPrice(priceInRupees) {
  if (!priceInRupees || priceInRupees <= 0) {
    return "Price on request";
  }
  if (priceInRupees >= ONE_CRORE) {
    const crores = priceInRupees / ONE_CRORE;
    return `₹${Number(crores.toFixed(2))} Cr`;
  }
  if (priceInRupees >= ONE_LAKH) {
    const lakhs = priceInRupees / ONE_LAKH;
    return `₹${Number(lakhs.toFixed(1))} L`;
  }
  return `₹${priceInRupees.toLocaleString("en-IN")}`;
}

/**
 * Formats a full rupee amount with Indian digit grouping.
 *   2850000 -> "₹28,50,000"
 */
export function formatRupees(amount) {
  return `₹${Math.round(amount || 0).toLocaleString("en-IN")}`;
}

/**
 * Formats a date like "14 Oct 2026". Returns "—" for empty values.
 */
export function formatDate(dateValue) {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Formats a date and time like "14 Oct 2026, 3:45 pm".
 */
export function formatDateTime(dateValue) {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Describes how long ago something happened: "just now", "5 min ago",
 * "3 h ago", "2 days ago", or the date for anything older than a week.
 */
export function formatTimeAgo(dateValue) {
  if (!dateValue) return "—";
  const secondsAgo = Math.floor((Date.now() - new Date(dateValue).getTime()) / 1000);

  if (secondsAgo < 60) return "just now";
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) return `${minutesAgo} min ago`;
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo} h ago`;
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 7) return `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
  return formatDate(dateValue);
}

/**
 * Images uploaded through the admin panel are saved as "/uploads/file.jpg".
 * This adds the API address in front when the API is on another domain.
 * Full web addresses (https://...) are returned unchanged.
 */
export function resolveImageUrl(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("blob:")) {
    return imagePath;
  }
  return `${API_BASE_URL}${imagePath}`;
}

/**
 * Builds a one-line address, e.g. "Tungarli, Lonavala".
 */
export function formatLocation(location = {}) {
  return [location.locality, location.city].filter(Boolean).join(", ");
}

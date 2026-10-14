/**
 * apiClient.js
 * ------------
 * Every call from the React app to the Node.js API goes through this file,
 * so the address of the server, error handling and the admin login token are
 * handled in exactly one place.
 *
 * In development, Vite forwards "/api" to http://localhost:5000 (vite.config.js).
 * In production you can set VITE_API_URL (for example https://api.villament.com)
 * if the API lives on a different domain.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/** Key used to keep the admin token in the browser between page reloads. */
export const ADMIN_TOKEN_STORAGE_KEY = "villament_admin_token";

/** Reads the saved admin token (or null if the admin is logged out). */
export function getSavedAdminToken() {
  try {
    return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch (error) {
    return null; // storage may be blocked (private browsing)
  }
}

/**
 * Sends a request to the API and returns the parsed JSON response.
 *
 * @param {string} path - e.g. "/api/properties"
 * @param {object} options
 * @param {string} [options.method="GET"]
 * @param {object|FormData} [options.body] - plain objects are sent as JSON
 * @param {boolean} [options.requiresAdmin=false] - attach the admin token
 * @returns {Promise<any>}
 * @throws {Error} with a readable message if the server replies with an error
 */
export async function sendApiRequest(path, { method = "GET", body, requiresAdmin = false } = {}) {
  const requestHeaders = {};
  let requestBody;

  if (body instanceof FormData) {
    // The browser sets the correct multipart "Content-Type" for FormData itself
    requestBody = body;
  } else if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  if (requiresAdmin) {
    const adminToken = getSavedAdminToken();
    if (adminToken) {
      requestHeaders.Authorization = `Bearer ${adminToken}`;
    }
  }

  let serverResponse;
  try {
    serverResponse = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: requestBody,
    });
  } catch (networkError) {
    throw new Error("Cannot reach the server. Please check your internet connection and try again.");
  }

  // Some responses (like CSV downloads) are not JSON
  const contentType = serverResponse.headers.get("Content-Type") || "";
  const responseData = contentType.includes("application/json") ? await serverResponse.json() : await serverResponse.text();

  if (!serverResponse.ok) {
    const errorMessage = responseData?.message || `Request failed with status ${serverResponse.status}`;
    const requestError = new Error(errorMessage);
    requestError.statusCode = serverResponse.status;

    // If the admin token expired, tell the rest of the app so it can log out
    if (serverResponse.status === 401 && requiresAdmin) {
      window.dispatchEvent(new Event("villament:admin-session-expired"));
    }
    throw requestError;
  }

  return responseData;
}

/** Turns an object into "?key=value&..." leaving out empty values. */
function toQueryString(parameters = {}) {
  const searchParameters = new URLSearchParams();
  Object.entries(parameters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParameters.append(key, value);
    }
  });
  const queryText = searchParameters.toString();
  return queryText ? `?${queryText}` : "";
}

/* ================================================================== */
/* Public website calls                                                */
/* ================================================================== */

export const publicApi = {
  /** List properties. Filters: status, type, city, search, featured, sort, limit */
  getProperties: (filters) => sendApiRequest(`/api/properties${toQueryString(filters)}`),

  /** Values for the filter drop-downs (cities, types, statuses) */
  getPropertyFilterOptions: () => sendApiRequest("/api/properties/filters"),

  /** One property by its slug, plus similar properties */
  getPropertyBySlug: (slug) => sendApiRequest(`/api/properties/${encodeURIComponent(slug)}`),

  /** Submit an enquiry (contact form, site visit, register interest...) */
  submitEnquiry: (enquiryDetails) => sendApiRequest("/api/enquiries", { method: "POST", body: enquiryDetails }),
};

/* ================================================================== */
/* Admin panel calls (all need the admin token)                        */
/* ================================================================== */

export const adminApi = {
  login: (email, password) => sendApiRequest("/api/auth/login", { method: "POST", body: { email, password } }),
  getCurrentAdmin: () => sendApiRequest("/api/admin/me", { requiresAdmin: true }),
  getDashboard: () => sendApiRequest("/api/admin/dashboard", { requiresAdmin: true }),

  // ----- Properties -----
  getProperties: () => sendApiRequest("/api/admin/properties", { requiresAdmin: true }),
  getProperty: (propertyId) => sendApiRequest(`/api/admin/properties/${propertyId}`, { requiresAdmin: true }),
  createProperty: (formData) =>
    sendApiRequest("/api/admin/properties", { method: "POST", body: formData, requiresAdmin: true }),
  updateProperty: (propertyId, formData) =>
    sendApiRequest(`/api/admin/properties/${propertyId}`, { method: "PUT", body: formData, requiresAdmin: true }),
  deleteProperty: (propertyId) =>
    sendApiRequest(`/api/admin/properties/${propertyId}`, { method: "DELETE", requiresAdmin: true }),

  // ----- Enquiries / leads -----
  getEnquiries: (filters) => sendApiRequest(`/api/admin/enquiries${toQueryString(filters)}`, { requiresAdmin: true }),
  getEnquiry: (enquiryId) => sendApiRequest(`/api/admin/enquiries/${enquiryId}`, { requiresAdmin: true }),
  updateEnquiry: (enquiryId, changes) =>
    sendApiRequest(`/api/admin/enquiries/${enquiryId}`, { method: "PATCH", body: changes, requiresAdmin: true }),
  addEnquiryNote: (enquiryId, note) =>
    sendApiRequest(`/api/admin/enquiries/${enquiryId}/notes`, { method: "POST", body: { note }, requiresAdmin: true }),
  deleteEnquiry: (enquiryId) =>
    sendApiRequest(`/api/admin/enquiries/${enquiryId}`, { method: "DELETE", requiresAdmin: true }),

  /**
   * Downloads the leads as a CSV file. We cannot use a normal link because
   * the request needs the admin token, so we fetch the file and then let the
   * browser save it.
   */
  downloadEnquiriesCsv: async (filters) => {
    const csvText = await sendApiRequest(`/api/admin/enquiries/export${toQueryString(filters)}`, {
      requiresAdmin: true,
    });
    const csvFile = new Blob([csvText], { type: "text/csv;charset=utf-8" });
    const temporaryLink = document.createElement("a");
    temporaryLink.href = URL.createObjectURL(csvFile);
    temporaryLink.download = `villament-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(temporaryLink);
    temporaryLink.click();
    temporaryLink.remove();
    URL.revokeObjectURL(temporaryLink.href);
  },
};

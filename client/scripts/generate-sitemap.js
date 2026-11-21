/**
 * generate-sitemap.js
 * -------------------
 * Runs before every build of the website. It asks the API for the list of
 * properties and writes client/public/sitemap.xml, so new properties are
 * included without editing the file by hand.
 *
 * If the API cannot be reached, the existing sitemap.xml is left unchanged
 * so the build never fails because of this script.
 */

import { writeFileSync } from "node:fs";

// The public address of the website (no trailing slash).
const SITE_URL = "https://villament.co.in";

// The address of the API. On Render this is the VITE_API_URL setting.
const API_URL = process.env.VITE_API_URL;

// Pages that always exist.
const fixedPagePaths = ["/", "/properties", "/about", "/contact"];

/** Makes text safe to place inside XML (for example "&" becomes "&amp;"). */
function escapeForXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Asks the API for the properties and returns their slugs. */
async function fetchPropertySlugs() {
  const response = await fetch(`${API_URL}/api/properties`);
  if (!response.ok) {
    throw new Error(`API replied with status ${response.status}`);
  }

  const data = await response.json();

  // The list may be returned directly, or inside a "properties" field.
  const propertyList = Array.isArray(data) ? data : data.properties || [];

  return propertyList.map((property) => property.slug).filter(Boolean);
}

async function buildSitemap() {
  if (!API_URL) {
    console.warn("VITE_API_URL is not set. Keeping the existing sitemap.xml.");
    return;
  }

  try {
    const propertySlugs = await fetchPropertySlugs();

    const allAddresses = [
      ...fixedPagePaths.map((path) => `${SITE_URL}${path}`),
      ...propertySlugs.map((slug) => `${SITE_URL}/properties/${encodeURIComponent(slug)}`),
    ];

    const urlEntries = allAddresses.map((address) => `  <url><loc>${escapeForXml(address)}</loc></url>`);

    const sitemapXml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `${urlEntries.join("\n")}\n` +
      `</urlset>\n`;

    writeFileSync("public/sitemap.xml", sitemapXml);
    console.log(`sitemap.xml written with ${allAddresses.length} addresses.`);
  } catch (error) {
    console.warn("Could not build the sitemap. Keeping the existing one.", error.message);
  }
}

buildSitemap();
/**
 * authController.js
 * -----------------
 * Handles admin login. A successful login returns a JSON Web Token (JWT) that
 * the admin panel stores and sends with every protected request.
 */

import jsonwebtoken from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { createHttpError } from "../utils/asyncHandler.js";

/**
 * Creates a signed token that identifies the admin.
 * @param {string} adminId - The MongoDB id of the admin.
 */
function createLoginToken(adminId) {
  return jsonwebtoken.sign({ adminId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

/**
 * Removes private fields before sending an admin back to the browser.
 */
function toPublicAdmin(adminDocument) {
  return {
    id: adminDocument._id,
    name: adminDocument.name,
    email: adminDocument.email,
  };
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function loginAdmin(request, response) {
  const { email, password } = request.body;

  if (!email || !password) {
    throw createHttpError(400, "Please enter both email and password.");
  }

  // The password field is hidden by default, so we ask for it explicitly
  const matchingAdmin = await Admin.findOne({ email: email.toLowerCase().trim() }).select("+password");

  // We give the same message for "no such email" and "wrong password"
  // so that attackers cannot discover which emails exist.
  const isLoginValid = matchingAdmin && (await matchingAdmin.isPasswordCorrect(password));
  if (!isLoginValid) {
    throw createHttpError(401, "Incorrect email or password.");
  }

  response.json({
    token: createLoginToken(matchingAdmin._id),
    admin: toPublicAdmin(matchingAdmin),
  });
}

/**
 * GET /api/auth/me
 * Returns the currently logged-in admin. Used by the admin panel on page load
 * to check whether the stored token is still valid.
 */
export async function getCurrentAdmin(request, response) {
  response.json({ admin: toPublicAdmin(request.admin) });
}

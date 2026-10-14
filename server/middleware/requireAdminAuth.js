/**
 * requireAdminAuth.js
 * -------------------
 * Express middleware that protects admin-only routes.
 *
 * The admin panel sends the login token in the "Authorization" header like:
 *     Authorization: Bearer <token>
 * If the token is missing, expired or invalid, the request is rejected with 401.
 * If it is valid, the logged-in admin is attached to "request.admin".
 */

import jsonwebtoken from "jsonwebtoken";
import Admin from "../models/Admin.js";

export async function requireAdminAuth(request, response, next) {
  const authorizationHeader = request.headers.authorization || "";
  const headerStartsWithBearer = authorizationHeader.startsWith("Bearer ");

  if (!headerStartsWithBearer) {
    return response.status(401).json({ message: "Please log in to continue." });
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();

  try {
    // Throws an error if the token was tampered with or has expired
    const decodedTokenPayload = jsonwebtoken.verify(token, process.env.JWT_SECRET);

    const loggedInAdmin = await Admin.findById(decodedTokenPayload.adminId);
    if (!loggedInAdmin) {
      return response.status(401).json({ message: "This admin account no longer exists." });
    }

    request.admin = loggedInAdmin;
    return next();
  } catch (error) {
    return response.status(401).json({ message: "Your session has expired. Please log in again." });
  }
}

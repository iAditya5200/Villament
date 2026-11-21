/**
 * publicRoutes.js
 * ---------------
 * API addresses used by the public website. No login is needed.
 *
 *   GET  /api/properties              list properties (with filters)
 *   GET  /api/properties/filters      values for filter drop-downs
 *   GET  /api/properties/:slug        one property + similar properties
 *   POST /api/enquiries               submit a contact / site visit form
 *   POST /api/visits                  count a visitor (used by the visitor counter)
 *   POST /api/auth/login              admin login
 */

import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  listPublishedProperties,
  getPropertyFilterOptions,
  getPropertyBySlug,
} from "../controllers/propertyController.js";
import { createEnquiry } from "../controllers/enquiryController.js";
import { loginAdmin } from "../controllers/authController.js";
import { recordVisit } from "../controllers/visitController.js";

// The router must be created BEFORE any route is attached to it.
const publicRouter = express.Router();

publicRouter.get("/properties", asyncHandler(listPublishedProperties));
// "/filters" must be declared BEFORE "/:slug", otherwise Express would treat
// the word "filters" as a property slug.
publicRouter.get("/properties/filters", asyncHandler(getPropertyFilterOptions));
publicRouter.get("/properties/:slug", asyncHandler(getPropertyBySlug));

publicRouter.post("/enquiries", asyncHandler(createEnquiry));

// Counts one visitor per day. Called by the website when it is first opened.
publicRouter.post("/visits", asyncHandler(recordVisit));

publicRouter.post("/auth/login", asyncHandler(loginAdmin));

export default publicRouter;
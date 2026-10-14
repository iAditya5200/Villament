/**
 * adminRoutes.js
 * --------------
 * API addresses used by the admin panel. EVERY route in this file requires a
 * valid admin login token (see middleware/requireAdminAuth.js).
 *
 *   GET    /api/admin/me                        the logged-in admin
 *   GET    /api/admin/dashboard                 dashboard numbers
 *
 *   GET    /api/admin/properties                all properties
 *   GET    /api/admin/properties/:id            one property
 *   POST   /api/admin/properties                add a property (with images)
 *   PUT    /api/admin/properties/:id            edit a property
 *   DELETE /api/admin/properties/:id            remove a property
 *
 *   GET    /api/admin/enquiries                 list leads (filters + pages)
 *   GET    /api/admin/enquiries/export          download leads as CSV
 *   GET    /api/admin/enquiries/:id             one lead with history
 *   PATCH  /api/admin/enquiries/:id             change status / follow-up
 *   POST   /api/admin/enquiries/:id/notes       add a follow-up note
 *   DELETE /api/admin/enquiries/:id             delete a lead
 */

import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAdminAuth } from "../middleware/requireAdminAuth.js";
import { uploadPropertyImages } from "../middleware/imageUpload.js";
import { getCurrentAdmin } from "../controllers/authController.js";
import { getDashboardSummary } from "../controllers/dashboardController.js";
import {
  listAllPropertiesForAdmin,
  getPropertyByIdForAdmin,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/propertyController.js";
import {
  listEnquiries,
  exportEnquiriesAsCsv,
  getEnquiryById,
  updateEnquiryTracking,
  addEnquiryNote,
  deleteEnquiry,
} from "../controllers/enquiryController.js";

const adminRouter = express.Router();

// Protect every route below this line
adminRouter.use(requireAdminAuth);

adminRouter.get("/me", asyncHandler(getCurrentAdmin));
adminRouter.get("/dashboard", asyncHandler(getDashboardSummary));

// ----- Properties -----
adminRouter.get("/properties", asyncHandler(listAllPropertiesForAdmin));
adminRouter.get("/properties/:id", asyncHandler(getPropertyByIdForAdmin));
adminRouter.post("/properties", uploadPropertyImages, asyncHandler(createProperty));
adminRouter.put("/properties/:id", uploadPropertyImages, asyncHandler(updateProperty));
adminRouter.delete("/properties/:id", asyncHandler(deleteProperty));

// ----- Enquiries / leads -----
adminRouter.get("/enquiries", asyncHandler(listEnquiries));
// "/export" must come before "/:id" so it is not mistaken for an id
adminRouter.get("/enquiries/export", asyncHandler(exportEnquiriesAsCsv));
adminRouter.get("/enquiries/:id", asyncHandler(getEnquiryById));
adminRouter.patch("/enquiries/:id", asyncHandler(updateEnquiryTracking));
adminRouter.post("/enquiries/:id/notes", asyncHandler(addEnquiryNote));
adminRouter.delete("/enquiries/:id", asyncHandler(deleteEnquiry));

export default adminRouter;

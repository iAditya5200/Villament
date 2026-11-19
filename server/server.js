// /**
//  * server.js
//  * ---------
//  * Entry point of the Villament backend.
//  *
//  * Start it with:   npm run dev   (restarts automatically when files change)
//  *            or:   npm start
//  *
//  * What happens here:
//  *   1. Environment variables are loaded from the .env file.
//  *   2. Express is configured (JSON parsing, CORS, logging, uploads folder).
//  *   3. Public and admin API routes are attached.
//  *   4. In production, the built React website is served from ../client/dist.
//  *   5. The server connects to MongoDB and starts listening.
//  */

// import "dotenv/config";
// import path from "path";
// import fs from "fs";
// import express from "express";
// import cors from "cors";
// import morgan from "morgan";

// import { connectToDatabase } from "./config/database.js";
// import publicRouter from "./routes/publicRoutes.js";
// import adminRouter from "./routes/adminRoutes.js";
// import { handleUnknownRoute, handleErrors } from "./middleware/errorHandlers.js";

// const application = express();
// const PORT = process.env.PORT || 5000;

// /* ---------- 1. Allow the React website to call this API (CORS) ---------- */
// const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
//   .split(",")
//   .map((origin) => origin.trim());
// console.log("CLIENT_ORIGIN from Render:", process.env.CLIENT_ORIGIN);
// console.log("Allowed origins:", allowedOrigins);
// application.use(
//   cors({
//     origin: function checkOrigin(requestOrigin, callback) {
//       // Requests without an origin (curl, Postman, same-origin) are allowed
//       if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
//         callback(null, true);
//       } else {
//         callback(new Error(`Origin ${requestOrigin} is not allowed by CORS.`));
//       }
//     },
//   })
// );

// /* ---------- 2. Read JSON bodies and log each request ---------- */
// application.use(express.json({ limit: "1mb" }));
// application.use(express.urlencoded({ extended: true }));
// if (process.env.NODE_ENV !== "test") {
//   application.use(morgan("dev"));
// }

// /* ---------- 3. Serve uploaded property images publicly ---------- */
// application.use("/uploads", express.static(path.resolve("uploads")));

// /* ---------- 4. API routes ---------- */
// application.get("/api/health", (request, response) => {
//   response.json({ status: "ok", time: new Date().toISOString() });
// });
// application.use("/api", publicRouter);
// application.use("/api/admin", adminRouter);

// /* ---------- 5. Serve the built React app in production ---------- */
// const reactBuildFolder = path.resolve("..", "client", "dist");
// if (process.env.NODE_ENV === "production" && fs.existsSync(reactBuildFolder)) {
//   application.use(express.static(reactBuildFolder));
//   // Any address that is not an API call returns index.html so React Router works
//   application.get(/^\/(?!api|uploads).*/, (request, response) => {
//     response.sendFile(path.join(reactBuildFolder, "index.html"));
//   });
// }

// /* ---------- 6. Error handling (must be last) ---------- */
// application.use("/api", handleUnknownRoute);
// application.use(handleErrors);

// /* ---------- 7. Connect to the database, then start listening ---------- */
// async function startServer() {
//   await connectToDatabase(process.env.MONGODB_URI);
//   application.listen(PORT, () => {
//     console.log(`Villament API running at http://localhost:${PORT}`);
//   });
// }

// startServer();
/**
 * server.js
 * ---------
 * Entry point of the Villament backend.
 *
 * Start it with:   npm run dev   (restarts automatically when files change)
 *            or:   npm start
 *
 * What happens here:
 *   1. Environment variables are loaded from the .env file.
 *   2. Express is configured (JSON parsing, CORS, logging).
 *   3. Public and admin API routes are attached.
 *   4. In production, the built React website is served from ../client/dist.
 *   5. The server connects to MongoDB and starts listening.
 *
 * NOTE ABOUT IMAGES
 * -----------------
 * Property photos are now stored in Cloudinary and loaded by the browser directly
 * from Cloudinary's own web addresses (https://res.cloudinary.com/...).
 * This server therefore no longer needs to serve an "/uploads" folder.
 */

import "dotenv/config";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectToDatabase } from "./config/database.js";
import publicRouter from "./routes/publicRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import { handleUnknownRoute, handleErrors } from "./middleware/errorHandlers.js";

const application = express();
const PORT = process.env.PORT || 5000;

/*
 * In ES modules there is no built-in "__dirname", so we rebuild it from this
 * file's own address. This lets us build folder paths that are always correct,
 * no matter which folder the server was started from.
 */
const currentFilePath = fileURLToPath(import.meta.url);
const currentFolderPath = path.dirname(currentFilePath);

/* ---------- 1. Allow the React website to call this API (CORS) ---------- */

// CLIENT_ORIGIN may hold several website addresses separated by commas.
// Example: "https://villament.com,https://www.villament.com"
const clientOriginSetting = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const allowedOrigins = clientOriginSetting.split(",").map(function trimOrigin(origin) {
  return origin.trim();
});

// Helpful while setting up the deployment: shows which websites may call the API.
console.log("CLIENT_ORIGIN from Render:", process.env.CLIENT_ORIGIN);
console.log("Allowed origins:", allowedOrigins);

application.use(
  cors({
    origin: function checkOrigin(requestOrigin, callback) {
      // Requests without an origin (curl, Postman, same-origin) are allowed
      if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        callback(new Error("Origin " + requestOrigin + " is not allowed by CORS."));
      }
    },
  })
);

/* ---------- 2. Read JSON bodies and log each request ---------- */
application.use(express.json({ limit: "1mb" }));
application.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") {
  application.use(morgan("dev"));
}

/* ---------- 3. API routes ---------- */

// A simple address to check that the server is awake (handy on Render).
application.get("/api/health", function reportHealth(request, response) {
  response.json({ status: "ok", time: new Date().toISOString() });
});
application.use("/api", publicRouter);
application.use("/api/admin", adminRouter);

/* ---------- 4. Serve the built React app in production ---------- */

// server.js lives in the "server" folder, so ".." goes up one level to the project
// root and then into client/dist, wherever the server was started from.
const reactBuildFolder = path.join(currentFolderPath, "..", "client", "dist");

if (process.env.NODE_ENV === "production" && fs.existsSync(reactBuildFolder)) {
  application.use(express.static(reactBuildFolder));

  // Any address that is not an API call returns index.html so React Router works.
  application.get(/^\/(?!api).*/, function sendReactApp(request, response) {
    response.sendFile(path.join(reactBuildFolder, "index.html"));
  });
}

/* ---------- 5. Error handling (must be last) ---------- */
application.use("/api", handleUnknownRoute);
application.use(handleErrors);

/* ---------- 6. Connect to the database, then start listening ---------- */
async function startServer() {
  await connectToDatabase(process.env.MONGODB_URI);

  application.listen(PORT, function reportServerStarted() {
    console.log("Villament API running at http://localhost:" + PORT);
  });
}

startServer();
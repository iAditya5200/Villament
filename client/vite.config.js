/**
 * vite.config.js
 * --------------
 * Vite is the development server and build tool for the React app.
 *
 * During development, the React app runs on http://localhost:5173 and the API
 * runs on http://localhost:5000. The "proxy" setting forwards every request
 * that starts with /api or /uploads to the API, so the React code can simply
 * call "/api/properties" without worrying about ports or CORS.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_SERVER_ADDRESS = "http://localhost:5000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": API_SERVER_ADDRESS,
      "/uploads": API_SERVER_ADDRESS,
    },
  },
});

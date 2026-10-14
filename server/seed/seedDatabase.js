/**
 * seedDatabase.js
 * ---------------
 * Fills an empty database with:
 *   • the first admin account (taken from ADMIN_EMAIL / ADMIN_PASSWORD in .env)
 *   • six sample properties
 *   • a few sample enquiries, so the admin panel has data to show
 *
 * Run it with:   npm run seed
 *
 * Add "--fresh" to delete existing properties and enquiries first:
 *                npm run seed -- --fresh
 */

import "dotenv/config";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import Property from "../models/Property.js";
import Enquiry from "../models/Enquiry.js";
import { sampleProperties, buildSampleEnquiries } from "./sampleData.js";

const shouldStartFresh = process.argv.includes("--fresh");

async function seedDatabase() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB. Seeding...");

  /* ---------- 1. Admin account ---------- */
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@villament.com").toLowerCase();
  const existingAdmin = await Admin.findOne({ email: adminEmail });

  if (existingAdmin) {
    console.log(`Admin ${adminEmail} already exists – skipped.`);
  } else {
    await Admin.create({
      name: process.env.ADMIN_NAME || "Villament Admin",
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || "Admin@123",
    });
    console.log(`Admin created: ${adminEmail}`);
  }

  /* ---------- 2. Optional clean-up ---------- */
  if (shouldStartFresh) {
    await Property.deleteMany({});
    await Enquiry.deleteMany({});
    console.log("Removed existing properties and enquiries.");
  }

  /* ---------- 3. Properties ---------- */
  const existingPropertyCount = await Property.countDocuments();
  if (existingPropertyCount > 0) {
    console.log(`${existingPropertyCount} properties already exist – skipped sample properties.`);
  } else {
    // Create one at a time so each slug is generated correctly
    const createdProperties = [];
    for (const propertyDetails of sampleProperties) {
      // eslint-disable-next-line no-await-in-loop
      createdProperties.push(await Property.create(propertyDetails));
    }
    console.log(`Created ${createdProperties.length} sample properties.`);

    /* ---------- 4. Enquiries (only when properties were just created) ---------- */
    const sampleEnquiries = buildSampleEnquiries(createdProperties);
    await Enquiry.insertMany(sampleEnquiries);
    console.log(`Created ${sampleEnquiries.length} sample enquiries.`);
  }

  await mongoose.disconnect();
  console.log("Seeding finished.");
}

seedDatabase().catch(async (error) => {
  console.error("Seeding failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});

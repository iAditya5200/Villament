/**
 * database.js
 * -----------
 * Opens the connection between the Node.js server and MongoDB using Mongoose.
 * The connection string comes from the MONGODB_URI environment variable.
 */

import mongoose from "mongoose";

/**
 * Connects to MongoDB. If the connection fails, the error is printed and the
 * process exits, because the API cannot work without its database.
 *
 * @param {string} connectionString - The MongoDB URI to connect to.
 */
export async function connectToDatabase(connectionString) {
  if (!connectionString) {
    console.error("MONGODB_URI is missing. Please add it to your .env file.");
    process.exit(1);
  }

  try {
    const connection = await mongoose.connect(connectionString);
    console.log(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
  } catch (error) {
    console.error("Could not connect to MongoDB:", error.message);
    process.exit(1);
  }
}

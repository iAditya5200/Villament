/**
 * Admin.js
 * --------
 * Mongoose model for admin users who can log in to the admin panel.
 * Passwords are never stored as plain text: they are hashed with bcrypt.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const NUMBER_OF_HASHING_ROUNDS = 10;

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // "select: false" means the password is NOT returned by normal queries.
    // We only load it on purpose when checking a login.
    password: { type: String, required: true, minlength: 6, select: false },
  },
  { timestamps: true }
);

/** Hash the password automatically whenever it is created or changed. */
adminSchema.pre("save", async function hashPasswordBeforeSaving() {
  const adminDocument = this;

  if (!adminDocument.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(NUMBER_OF_HASHING_ROUNDS);
  adminDocument.password = await bcrypt.hash(adminDocument.password, salt);
});

/**
 * Checks whether a plain-text password matches the stored hash.
 *
 * @param {string} plainTextPassword - The password typed on the login page.
 * @returns {Promise<boolean>} true if the password is correct.
 */
adminSchema.methods.isPasswordCorrect = function isPasswordCorrect(plainTextPassword) {
  return bcrypt.compare(plainTextPassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;

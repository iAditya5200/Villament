// server/models/Visit.js
//
// One record means: "this visitor came to the website on this day".
// Because (visitorId + day) must be unique, a visitor who opens ten
// pages in one day is still counted only once for that day.

import mongoose from "mongoose";

const visitSchema = new mongoose.Schema({
  // Random ID created in the visitor's browser (not their name or email).
  visitorId: {
    type: String,
    required: true,
  },

  // The calendar day of the visit, written as "YYYY-MM-DD" (India time).
  day: {
    type: String,
    required: true,
  },
});

// The database refuses a second record with the same visitor and day.
visitSchema.index({ visitorId: 1, day: 1 }, { unique: true });

// Makes "how many visitors on this day?" fast.
visitSchema.index({ day: 1 });

export default mongoose.model("Visit", visitSchema);
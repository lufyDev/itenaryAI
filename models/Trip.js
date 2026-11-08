const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  organiser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  organiserName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  durationDays: {
    type: Number,
    required: true,
  },
  // When the group wants to leave the source city, and to be back there at
  // the end. Lets the agent plan e.g. an overnight bus both ways.
  departurePreference: {
    type: String,
    enum: ["morning", "afternoon", "evening", "any"],
    default: "any",
  },
  returnPreference: {
    type: String,
    enum: ["morning", "afternoon", "evening", "any"],
    default: "any",
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
  ],
  aggregatedData: {
    type: Object,
  },
  itinerary: {
    type: Object,
  },
  // Problems the agent's critic still saw in the saved itinerary when it gave
  // up revising. Empty when the itinerary passed review.
  itineraryIssues: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Trip", tripSchema);

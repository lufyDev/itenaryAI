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
});

module.exports = mongoose.model("Trip", tripSchema);

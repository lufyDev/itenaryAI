const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
  },
  surveyAnswers: {
    travelStyle: String,
    foodPreference: String,
    accommodationType: String,
    activities: [String],
    budget: Number,
    nonNegotiables: [String],
  },
});

module.exports = mongoose.model("Member", memberSchema);

const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
  },
  surveyAnswers: {
    travelStyle: {
      type: String,
      enum: ["relaxed", "balanced", "adventure-heavy", "party-focused", "explore-max"]
    },
    foodPreference: {
      type: String,
      enum: ["veg", "non-veg", "mixed", "vegan", "jain"]
    },
    accommodationType: {
      type: String,
      enum: ["hostel", "budget-hotel", "boutique-hotel", "luxury-resort", "homestay"]
    },
    activities: [{
      type: String,
      enum: [
        "trekking",
        "waterfalls",
        "camping",
        "cafes",
        "local-markets",
        "wildlife",
        "road-trip",
        "nightlife",
        "spiritual-sites",
        "photography",
        "adventure-sports",
        "music-jamming"
      ]
    }],
    budget: {
      type: String,
      enum: ["low", "medium", "high", "luxury"]
    },
    nonNegotiables: [{
      type: String,
      enum: [
        "no-flights",
        "no-alcohol",
        "smoking-allowed",
        "smoking-not-allowed",
        "veg-only-restaurants",
        "private-rooms-only",
        "no-trekking",
        "no-long-drives",
        "pet-friendly"
      ]
    }]
  }
});

module.exports = mongoose.model("Member", memberSchema);

const express = require("express");
const Trip = require("../models/Trip");
const Member = require("../models/Member");
const { aggregateTripData } = require("../services/aggregationService");

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { organiserName, title, durationDays } = req.body;

    const trip = await Trip.create({
      organiserName,
      title,
      durationDays,
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const surveyLink = `${frontendUrl}/fillSurveyForm?tripId=${trip._id}`;

    res.json({ ...trip.toObject(), surveyLink });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:tripId", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:tripId/aggregate", async (req, res) => {
    try {
      const { tripId } = req.params;
  
      const members = await Member.find({ tripId });
  
      const aggregatedData = aggregateTripData(members);
  
      const updatedTrip = await Trip.findByIdAndUpdate(
        tripId,
        { aggregatedData },
        { new: true }
      );
  
      res.json(updatedTrip);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});  

router.post("/:tripId/generate", async (req, res) => {
    try {
      const { tripId } = req.params;
      const trip = await Trip.findById(tripId);

      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      if (!trip.aggregatedData) {
        return res.status(400).json({
          message: "Run aggregation before generating itinerary",
        });
      }

      const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120_000);

      const aiResponse = await fetch(`${aiServiceUrl}/generate-itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip: {
            title: trip.title,
            durationDays: trip.durationDays,
          },
          aggregated_data: trip.aggregatedData,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!aiResponse.ok) {
        const errBody = await aiResponse.json().catch(() => ({}));
        throw new Error(errBody.message || `AI service returned ${aiResponse.status}`);
      }

      const aiResult = await aiResponse.json();
      const itinerary = aiResult.itinerary ?? aiResult;

      trip.itinerary = itinerary;
      await trip.save();

      res.json(itinerary);
    } catch (error) {
      console.error(error);
      if (error.name === "AbortError") {
        return res.status(504).json({ message: "AI service timed out" });
      }
      res.status(500).json({ message: error.message });
    }
});
  

module.exports = router;

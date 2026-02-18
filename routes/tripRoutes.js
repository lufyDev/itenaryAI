const express = require("express");
const Trip = require("../models/Trip");
const Member = require("../models/Member");
const { aggregateTripData } = require("../services/aggregationService");
const { generateItinerary } = require("../services/plannerService");

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
  
      if (!trip.aggregatedData) {
        return res.status(400).json({
          message: "Run aggregation before generating itinerary",
        });
      }
  
      const itinerary = await generateItinerary(
        trip,
        trip.aggregatedData
      );
  
      trip.itinerary = itinerary;
      await trip.save();
  
      res.json(itinerary);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
});
  

module.exports = router;

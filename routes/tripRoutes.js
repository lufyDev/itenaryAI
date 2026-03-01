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

router.post("/:tripId/generate-stream", async (req, res) => {
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

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders();

    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180_000);

    req.on("close", () => {
      controller.abort();
      clearTimeout(timeout);
    });

    const aiResponse = await fetch(
      `${aiServiceUrl}/generate-itinerary-stream`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip: { title: trip.title, durationDays: trip.durationDays },
          aggregated_data: trip.aggregatedData,
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!aiResponse.ok) {
      const errBody = await aiResponse.text().catch(() => "");
      res.write(
        `data: ${JSON.stringify({ error: errBody || `AI service returned ${aiResponse.status}` })}\n\n`
      );
      res.write("data: [DONE]\n\n");
      return res.end();
    }

    let finalItinerary = null;
    let buffer = "";

    for await (const chunk of aiResponse.body) {
      buffer += typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);

      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data:")) continue;

        const payload = line.slice(5).trim();

        if (payload === "[DONE]") {
          if (finalItinerary) {
            trip.itinerary = finalItinerary;
            await trip.save();
          }
          res.write("data: [DONE]\n\n");
          return res.end();
        }

        try {
          const parsed = JSON.parse(payload);
          if (
            (parsed.node === "planner" || parsed.node === "critic") &&
            parsed.state?.itinerary
          ) {
            finalItinerary = parsed.state.itinerary;
          }
        } catch {
          // non-JSON payload, forward as-is
        }

        res.write(`data: ${payload}\n\n`);
      }
    }

    // Stream ended without [DONE] — flush remaining buffer
    if (buffer.trim()) {
      const line = buffer.trim();
      if (line.startsWith("data:")) {
        const payload = line.slice(5).trim();
        if (payload !== "[DONE]") {
          try {
            const parsed = JSON.parse(payload);
            if (
              (parsed.node === "planner" || parsed.node === "critic") &&
              parsed.state?.itinerary
            ) {
              finalItinerary = parsed.state.itinerary;
            }
          } catch {
            // ignore
          }
          res.write(`data: ${payload}\n\n`);
        }
      }
    }

    if (finalItinerary) {
      trip.itinerary = finalItinerary;
      await trip.save();
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      if (error.name === "AbortError") {
        return res.status(504).json({ message: "AI service timed out" });
      }
      return res.status(500).json({ message: error.message });
    }
    res.write(
      `data: ${JSON.stringify({ error: error.message })}\n\n`
    );
    res.write("data: [DONE]\n\n");
    res.end();
  }
});
  

module.exports = router;

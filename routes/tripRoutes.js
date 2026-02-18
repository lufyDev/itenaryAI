const express = require("express");
const Trip = require("../models/Trip");

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { organiserName, title, durationDays } = req.body;

    const trip = await Trip.create({
      organiserName,
      title,
      durationDays,
    });

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

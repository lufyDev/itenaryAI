const express = require("express");
const Member = require("../models/Member");
const Trip = require("../models/Trip");

const router = express.Router();

router.post("/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;

    const member = await Member.create({
      tripId,
      surveyAnswers: req.body,
    });

    await Trip.findByIdAndUpdate(tripId, {
      $push: { members: member._id },
    });

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

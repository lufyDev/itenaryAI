/**
 * Seeds one public demo trip with a saved itinerary.
 *
 * Why: the only path to seeing output today is sign in with Google ->
 * create trip -> fill survey -> aggregate -> wait 60-120s for the agent.
 * Almost no recruiter finishes that. GET /api/trips/:tripId is public, and
 * /trip/:tripId/itinerary renders without auth, so a seeded trip gives an
 * instant, zero-cost look at the real output.
 *
 * Idempotent: re-running updates the same trip instead of making a new one.
 *
 * Usage:  node scripts/seedDemoTrip.js
 * Needs:  MONGO_URI in .env (and FRONTEND_URL for the printed link)
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Trip = require("../models/Trip");

const DEMO_USER = {
  googleId: "itineraryai-demo-seed",
  email: "demo@itineraryai.in",
  name: "ItineraryAI Demo",
};

const DEMO_TITLE = "Jibhi Weekend Getaway (Demo)";

const AGGREGATED_DATA = {
  source: "Delhi",
  destination: "Jibhi",
  groupSize: 3,
  budget: { min: 5000, max: 15000, recommended: 10000 },
  majorityPreferences: {
    travelStyle: "balanced",
    foodPreference: "non-veg",
    accommodationType: "budget-hotel",
  },
  topActivities: ["trekking", "waterfalls", "local-markets", "camping", "cafes"],
  nonNegotiables: ["no-flights", "no-alcohol", "smoking-allowed"],
  conflicts: [
    "Travel style split: 2 members picked adventure-heavy, 1 picked relaxed.",
    "Budget spread is wide — ₹5,000 to ₹15,000 per person.",
    "One member marked no-alcohol as a non-negotiable.",
  ],
};

const ITINERARY = {
  summary:
    "Three days in Jibhi built around a balanced pace — one real trek, one slow day, and a camping night. Overnight bus both ways keeps the cost inside the lowest member's budget without cutting anyone's must-do activity.",
  days: [
    {
      day: 1,
      morning:
        "Arrive in Aut after the overnight Volvo from Delhi (ISBT Kashmere Gate, ~10 hrs). Shared cab from Aut to Jibhi via Banjar, roughly 2 hrs on a hill road — keep motion sickness tablets handy.",
      afternoon:
        "Check in, then an easy walk to Jibhi Waterfall — 10 minutes off the main road through a deodar patch. Late lunch of local trout and rajma-chawal at a riverside dhaba.",
      evening:
        "Settle in at a cafe over the Jibhi stream. Early night on purpose — Day 2 is the long one.",
      stay: "Riverside budget guesthouse, Jibhi — twin rooms, balcony over the stream",
      estimatedCostPerPerson: 2600,
    },
    {
      day: 2,
      morning:
        "Early start for the Jalori Pass drive (~1 hr), then the Serolsar Lake trek — 5 km each way, gentle gradient through old oak forest. Carry water; there is one dhaba at the pass and nothing after it.",
      afternoon:
        "Packed lunch at Serolsar Lake, trek back down. Short stop at Raghupur Fort ridge if legs allow — 30 minutes up, and the Dhauladhar view is the one everyone photographs.",
      evening:
        "Drive to the Shoja campsite. Bonfire and dinner under the stars. Smoking area is away from the tents; no alcohol on site, which keeps the group's non-negotiable intact.",
      stay: "Shoja camping site — insulated tents with sleeping bags, shared washrooms",
      estimatedCostPerPerson: 3100,
    },
    {
      day: 3,
      morning:
        "Slow morning — this is the relaxed day. Breakfast at the campsite, then the walk down to Chaini Kothi, the old timber-bonded tower, for a feel of Kullu's pre-concrete architecture.",
      afternoon:
        "Last run through the Banjar local market for kullu shawls, rajma and wild apricot jam. Final cafe stop for coffee and apple pie before the drive out.",
      evening:
        "Shared cab back to Aut, board the overnight bus to Delhi around 7:30 PM. Reach ISBT early next morning.",
      stay: "Overnight bus (Aut to Delhi)",
      estimatedCostPerPerson: 2700,
    },
  ],
  totalEstimatedCostPerPerson: 8400,
  tradeOffExplanation:
    "The adventure-vs-relaxed split is resolved by sequencing rather than averaging: Day 2 is the full trek day for the two who wanted it, Day 3 is deliberately slow for the one who did not, so nobody spends three days at someone else's pace. The wide budget spread is handled by holding the plan to ₹8,400 — under the ₹10,000 target and inside the lowest member's ₹5,000-ish comfort range once the overnight bus replaces a flight, which the group had ruled out anyway. The no-alcohol non-negotiable is respected at the campsite, the one place it would realistically come up, while the smoking-allowed preference is met with a designated area away from the tents.",
};

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set. Add it to .env first.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const user = await User.findOneAndUpdate(
    { googleId: DEMO_USER.googleId },
    { $set: DEMO_USER },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  console.log(`Demo user: ${user._id}`);

  const trip = await Trip.findOneAndUpdate(
    { organiser: user._id, title: DEMO_TITLE },
    {
      $set: {
        organiser: user._id,
        organiserName: DEMO_USER.name,
        title: DEMO_TITLE,
        source: "Delhi",
        destination: "Jibhi",
        durationDays: 3,
        aggregatedData: AGGREGATED_DATA,
        itinerary: ITINERARY,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  console.log("\nDemo trip seeded.\n");
  console.log(`  Trip ID:     ${trip._id}`);
  console.log(`  Public URL:  ${frontendUrl}/trip/${trip._id}/itinerary`);
  console.log("\nSet this in the frontend (Vercel env + .env.local):\n");
  console.log(`  NEXT_PUBLIC_DEMO_TRIP_ID=${trip._id}\n`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

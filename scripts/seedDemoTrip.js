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
    "Leave Delhi on a Friday-night Volvo, get two full days in Jibhi, and be back at ISBT on Monday morning. One easy day, one real trek, and an overnight bus both ways keeps the cost well inside everyone's budget without cutting anyone's must-do activity.",
  days: [
    {
      day: 1,
      schedule: [
        {
          start: "19:00",
          end: "19:45",
          kind: "travel",
          activity: "Metro to ISBT Kashmere Gate (Yellow Line). Eat before you board; the bus stops once, around midnight.",
        },
        {
          start: "20:30",
          end: "06:30",
          kind: "travel",
          activity: "Overnight HRTC Volvo from Delhi to Aut, about 10 hours, ₹1,250. Window seats on the left get the river view at sunrise.",
        },
      ],
      stay: "Overnight Volvo (Delhi to Aut)",
      estimatedCostPerPerson: 1300,
    },
    {
      day: 2,
      schedule: [
        {
          start: "06:30",
          end: "08:30",
          kind: "travel",
          activity: "Shared cab from Aut to Jibhi via Banjar, about 2 hours on a hill road, ₹300 a seat. Keep motion sickness tablets handy.",
        },
        {
          start: "08:30",
          end: "10:00",
          kind: "rest",
          activity: "Check in at the riverside guesthouse, breakfast, and a short nap after the bus.",
        },
        {
          start: "10:30",
          end: "12:30",
          kind: "activity",
          activity: "Easy walk to Jibhi Waterfall, 10 minutes off the main road through a deodar patch, then along the stream.",
        },
        {
          start: "13:00",
          end: "14:00",
          kind: "meal",
          activity: "Late lunch of local trout and rajma-chawal at a riverside dhaba.",
        },
        {
          start: "15:00",
          end: "17:30",
          kind: "activity",
          activity: "Walk to Chaini Kothi, the old timber-bonded tower, for a feel of Kullu's pre-concrete architecture.",
        },
        {
          start: "19:30",
          end: "21:00",
          kind: "meal",
          activity: "Dinner at a cafe over the Jibhi stream. Early night on purpose: tomorrow starts at 7.",
        },
      ],
      stay: "Riverside budget guesthouse, Jibhi (twin rooms, balcony over the stream)",
      estimatedCostPerPerson: 2400,
    },
    {
      day: 3,
      schedule: [
        {
          start: "07:00",
          end: "08:00",
          kind: "travel",
          activity: "Cab up to Jalori Pass, about 1 hour.",
        },
        {
          start: "08:00",
          end: "12:30",
          kind: "activity",
          activity: "Serolsar Lake trek, 5 km each way on a gentle gradient through old oak forest. Carry water; there's one dhaba at the pass and nothing after it.",
        },
        {
          start: "12:30",
          end: "13:30",
          kind: "meal",
          activity: "Maggi and chai at the Jalori Pass dhaba.",
        },
        {
          start: "13:30",
          end: "15:00",
          kind: "travel",
          activity: "Back down to Jibhi, collect bags and check out.",
        },
        {
          start: "15:00",
          end: "16:00",
          kind: "activity",
          activity: "Banjar market for Kullu shawls, rajma and wild apricot jam.",
        },
        {
          start: "16:00",
          end: "18:00",
          kind: "travel",
          activity: "Shared cab from Banjar to Aut, about 2 hours.",
        },
        {
          start: "19:30",
          end: "05:30",
          kind: "travel",
          activity: "Overnight HRTC Volvo from Aut to Delhi, ₹1,250. Reaches ISBT Kashmere Gate around 5:30 AM on Monday.",
        },
      ],
      stay: "Overnight Volvo (Aut to Delhi)",
      estimatedCostPerPerson: 2900,
    },
  ],
  totalEstimatedCostPerPerson: 6600,
  tradeOffExplanation:
    "The adventure-vs-relaxed split is resolved by sequencing rather than averaging: Day 2 is deliberately easy (a waterfall, a heritage walk, an early night) for the member who wanted a slow trip, and Day 3 is the Serolsar trek for the two who wanted adventure, so nobody spends the whole trip at someone else's pace. The wide budget spread is handled by holding the plan to ₹6,600, close to the lowest member's comfort range; the overnight Volvos also save two nights of rooms, and the group had ruled out flights anyway. Nothing on the plan involves alcohol, which respects the no-alcohol non-negotiable, and smokers can step out at any of the open-air stops.",
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
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
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
        departurePreference: "evening",
        returnPreference: "morning",
        aggregatedData: AGGREGATED_DATA,
        itinerary: ITINERARY,
      },
    },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
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

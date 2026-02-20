const OpenAI = require("openai");
const { evaluateItinerary } = require("./criticService");
const { researchDestination } = require("./tools/destinationResearchTool");

const runPlanningAgent = async (trip, aggregatedData) => {

  // ✅ Observe environment ONCE
  const destinationInsights =
    await researchDestination(
      trip.title,
      aggregatedData.budget.recommended
    );

  let attempt = 0;
  const MAX_ATTEMPTS = 3;
  let repairInstructions = null;

  while (attempt < MAX_ATTEMPTS) {

    const itinerary = await generateItinerary(
      trip,
      aggregatedData,
      repairInstructions,
      destinationInsights
    );

    const evaluation = await evaluateItinerary(
      itinerary,
      aggregatedData,
      trip.durationDays
    );

    if (evaluation.isValid) {
      return itinerary;
    }

    repairInstructions =
      evaluation.repairInstructions;

    attempt++;
  }

  throw new Error("Agent failed because of the following reasons: " + JSON.stringify(evaluation.violations));
};


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateItinerary = async (trip, aggregatedData, repairInstructions = null, destinationInsights = null) => {
  const systemPrompt = `
You are an expert travel planner AI.

Your job:
Create a balanced trip itinerary based on group constraints.

Strict rules:
- Respect budget limits
- Respect non-negotiables
- Address conflicts fairly
- Stay within durationDays
- Output STRICT JSON only (no explanation outside JSON)

Output format:
{
  "summary": string,
  "days": [
    {
      "day": number,
      "morning": string,
      "afternoon": string,
      "evening": string,
      "stay": string,
      "estimatedCostPerPerson": number
    }
  ],
  "totalEstimatedCostPerPerson": number,
  "tradeOffExplanation": string
}
`;

  const userPrompt = `
Repair Instructions From Evaluator:
${JSON.stringify(repairInstructions)}

Destination Research Data:
${JSON.stringify(destinationInsights)}

Trip Title: ${trip.title}
Duration: ${trip.durationDays} days

Aggregated Group Data:
${JSON.stringify(aggregatedData, null, 2)}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = response.choices[0].message.content;
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
};

module.exports = { runPlanningAgent };

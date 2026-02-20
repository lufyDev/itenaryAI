const OpenAI = require("openai");
const { evaluateItinerary } = require("./criticService");

const runPlanningAgent = async (trip, aggregatedData) => {

  let attempt = 0;
  const MAX_ATTEMPTS = 3;
  let feedback = "";

  while (attempt < MAX_ATTEMPTS) {

    const itinerary = await generateItinerary(
      trip,
      aggregatedData,
      feedback
    );

    const evaluation = await evaluateItinerary(
      itinerary,
      aggregatedData,
      trip.durationDays
    );

    if (evaluation.isValid) {
      return itinerary;
    }

    feedback = evaluation.repairInstructions;
    attempt++;
  }

  throw new Error("Agent failed to produce valid itinerary becuase:" + JSON.stringify(feedback));
};


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const generateItinerary = async (trip, aggregatedData, repairInstructions = null) => {
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

Trip Title: ${trip.title}
Duration: ${trip.durationDays} days

Aggregated Group Data:
${JSON.stringify(aggregatedData, null, 2)}
`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
    });

    return JSON.parse(response.choices[0].message.content);
};

module.exports = { runPlanningAgent };

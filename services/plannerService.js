const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const generateItinerary = async (trip, aggregatedData) => {
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

module.exports = { generateItinerary };

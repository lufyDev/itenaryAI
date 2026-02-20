const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const evaluateItinerary = async (
  itinerary,
  aggregatedData,
  durationDays
) => {
  const systemPrompt = `
You are a strict travel plan evaluator.

Your job:
Check whether the itinerary satisfies ALL constraints.

Validate:
- totalEstimatedCostPerPerson close to recommended budget
- duration matches number of days
- respects non-negotiables
- activities realistic per day
- fair compromise for group

Return STRICT JSON:

{
  "isValid": boolean,
  "violations": string[],
  "feedback": string
}
`;

  const userPrompt = `
Recommended Budget: ₹${aggregatedData.budget.recommended}
Duration: ${durationDays}

Aggregated Constraints:
${JSON.stringify(aggregatedData)}

Generated Itinerary:
${JSON.stringify(itinerary)}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return JSON.parse(response.choices[0].message.content);
};

module.exports = { evaluateItinerary };

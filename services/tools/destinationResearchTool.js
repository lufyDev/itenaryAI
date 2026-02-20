const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const researchDestination = async (
  destination,
  budget
) => {

  const prompt = `
Provide realistic travel insights.

Destination: ${destination}
Budget per person: ₹${budget}

Return JSON:
{
  "popularActivities": string[],
  "recommendedStayTypes": string[],
  "avgDailyCost": number,
  "travelTips": string[]
}
`;

  const response =
    await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "user", content: prompt }
      ],
    });

  const raw = response.choices[0].message.content;
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
};

module.exports = { researchDestination };

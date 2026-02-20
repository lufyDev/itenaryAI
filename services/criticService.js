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
You are a strict travel itinerary evaluator.

Validate:

1. Budget alignment with recommended budget
2. Duration correctness
3. Respect for non-negotiables
4. Realistic activity pacing
5. Fair handling of preference conflicts

Return STRICT JSON:

{
    "isValid": boolean,
    "violations": string[],
    "repairInstructions": {
        "budgetAdjustment": "increase" | "decrease" | "ok",
        "activityDensity": "increase" | "decrease" | "ok",
        "conflictHandling": "improve" | "ok"
    },
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

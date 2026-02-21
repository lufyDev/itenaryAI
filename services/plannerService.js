const OpenAI = require("openai");
const { evaluateItinerary } = require("./criticService");
const { tools } = require("./tools/toolRegistry");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ---------------------------------- */
/* TOOL DESCRIPTION HELPER */
/* ---------------------------------- */

const buildToolDescriptions = (tools) => {
  return Object.entries(tools)
    .map(
      ([name, tool]) =>
        `${name}: ${tool.description}`
    )
    .join("\n");
};

/* ---------------------------------- */
/* CORE AGENT THINK LOOP */
/* ---------------------------------- */

const runAutonomousPlanner = async (
  trip,
  aggregatedData,
  repairInstructions = null,
  sharedToolResults = {}
) => {

  // Agent memory / context
  let context = {
    trip,
    aggregatedData,
    repairInstructions,
    toolResults: sharedToolResults,
  };

  const MAX_STEPS = 5;

  for (let step = 0; step < MAX_STEPS; step++) {

    const systemPrompt = `
    You are an autonomous travel planning agent.
    
    You MUST follow this decision process:
    
    STEP 1:
    Check if destination knowledge exists in toolResults.
    
    STEP 2:
    If destination information is missing,
    you MUST call the researchDestination tool FIRST.
    
    STEP 3:
    Only AFTER receiving tool results,
    you may finalize the itinerary.
    
    ---
    
    Available Tools:
    ${buildToolDescriptions(tools)}
    
    ---
    
    Respond with valid JSON in ONLY ONE of these formats.
    
    TO USE A TOOL:
    
    {
      "action": "researchDestination",
      "args": {
        "destination": "<trip destination>",
        "budget": number
      }
    }
    
    OR
    
    TO FINALIZE:
    
    {
      "final": true,
      "itinerary": { ... }
    }
    
    DO NOT finalize without using tools first.
    `;


    const response =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: JSON.stringify(context),
          },
        ],
      });

    const output = JSON.parse(
      response.choices[0].message.content
    );

    /* ---------- TOOL CALL ---------- */

    if (output.action) {

      const tool = tools[output.action];

      if (!tool) {
        throw new Error(
          `Unknown tool requested: ${output.action}`
        );
      }

      const result =
        await tool.execute(output.args);

      sharedToolResults[output.action] = result;
      context.toolResults = sharedToolResults;
      
      continue;
    }

    // FINAL ANSWER
    if (output.final) {
      return output.itinerary;
    }


  }

  throw new Error(
    "Agent exceeded reasoning steps"
  );
};

/* ---------------------------------- */
/* PLANNER + CRITIC LOOP */
/* ---------------------------------- */

const runPlanningAgent = async (
  trip,
  aggregatedData
) => {

  let attempt = 0;
  const MAX_ATTEMPTS = 3;

  let repairInstructions = null;
  // ✅ Persistent agent memory
  let sharedToolResults = {};

  while (attempt < MAX_ATTEMPTS) {

    console.log(
      `Planning Attempt ${attempt + 1}`
    );

    const itinerary =
      await runAutonomousPlanner(
        trip,
        aggregatedData,
        repairInstructions,
        sharedToolResults
      );

    const evaluation =
      await evaluateItinerary(
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

  throw new Error(
    "Agent failed after retries"
  );
};

module.exports = { runPlanningAgent };

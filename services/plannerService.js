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
    
    Goal:
    Create a realistic itinerary grounded in verified data.
    
    You may use tools to gather missing information.
    
    Required Knowledge Before Finalizing:
    
    - destination insights
    - stay cost estimate
    - travel cost estimate
    
    Check toolResults carefully.
    
    If ANY required information is missing,
    call the appropriate tool.
    
    If ALL required information exists,
    you MUST finalize the itinerary.
    
    DO NOT call tools again once all data exists.
    
    ---
    
    Available Tools:
    ${buildToolDescriptions(tools)}
    
    ---
    
    Respond with valid JSON ONLY using ONE of these formats.

    TO USE A TOOL:

    {
      "type": "tool",
      "tool": "toolName",
      "args": {}
    }

    TO FINALIZE:

    {
      "type": "final",
      "itinerary": {...}
    }

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
            content: `
          CURRENT TASK STATE
          
          Trip:
          ${JSON.stringify(context.trip, null, 2)}
          
          Aggregated Group Data:
          ${JSON.stringify(context.aggregatedData, null, 2)}
          
          Existing Tool Results:
          ${JSON.stringify(context.toolResults, null, 2)}
          
          Repair Instructions:
          ${JSON.stringify(context.repairInstructions, null, 2)}
          
          Decide the NEXT BEST ACTION.
          `,
          }
          ,
        ],
      });

    const output = JSON.parse(
      response.choices[0].message.content
    );

    /* ---------- TOOL CALL ---------- */

    if (output.type === "tool") {

      if (sharedToolResults[output.tool]) {
        console.log(
          "Tool already executed, skipping."
        );
        continue;
      }

      const tool = tools[output.tool];

      if (!tool) {
        throw new Error(
          `Unknown tool requested: ${output.tool}`
        );
      }

      const result =
        await tool.execute(output.args);

      sharedToolResults[output.tool] = result;
      context.toolResults = sharedToolResults;

      continue;
    }

    if (
      context.toolResults.researchDestination &&
      context.toolResults.estimateStayCost &&
      context.toolResults.estimateTravelCost
    ) {
      console.log(
        "All tools gathered. Requesting finalize."
      );
    }
    

    // FINAL ANSWER
    if (output.type === "final") {
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

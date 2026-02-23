const { researchDestination } =
  require("./destinationResearchTool");

const { estimateStayCost } =
  require("./stayCostEstimatorTool");

const { estimateTravelCost } =
  require("./travelCostEstimatorTool");

const tools = {

  researchDestination: {
    description:
    "Research activities and attractions only. Args: { destination: string, budget: number }",
    execute: async (args) =>
      researchDestination(
        args.destination,
        args.budget
      ),
  },

  estimateStayCost: {
    description:
    "Estimate accommodation costs. Args: { destination: string, budget: number }",
    execute: async (args) =>
      estimateStayCost(
        args.destination,
        args.budget
      ),
  },

  estimateTravelCost: {
    description:
    "Estimate transportation cost required for itinerary realism. Args: { destination: string }",
    execute: async (args) =>
      estimateTravelCost(
        args.destination
      ),
  },
};

module.exports = { tools };

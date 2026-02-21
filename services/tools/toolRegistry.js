const { researchDestination } =
  require("./destinationResearchTool");

const tools = {
  researchDestination: {
    description:
      "Get travel insights about a destination within a budget",

    execute: async (args) => {
      return await researchDestination(
        args.destination,
        args.budget
      );
    },
  },
};

module.exports = { tools };

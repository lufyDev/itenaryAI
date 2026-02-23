const estimateStayCost = async (
    destination,
    budget
  ) => {
  
    return {
      avgNightlyCost: Math.floor(budget / 3),
      recommendedType: "budget-hotel"
    };
  };
  
  module.exports = { estimateStayCost };
  
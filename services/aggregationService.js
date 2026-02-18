const aggregateTripData = (members) => {
    if (!members.length) {
      return null;
    }
  
    const budgets = members.map((m) => m.surveyAnswers.budget);
    const minBudget = Math.min(...budgets);
    const maxBudget = Math.max(...budgets);
  
    const preferenceCount = {
      travelStyle: {},
      foodPreference: {},
      accommodationType: {},
    };
  
    const activityCount = {};
    const nonNegotiables = [];
  
    members.forEach((member) => {
      const answers = member.surveyAnswers;
  
      // Count categorical preferences
      ["travelStyle", "foodPreference", "accommodationType"].forEach(
        (field) => {
          const value = answers[field];
          if (value) {
            preferenceCount[field][value] =
              (preferenceCount[field][value] || 0) + 1;
          }
        }
      );
  
      // Count activities
      answers.activities?.forEach((activity) => {
        activityCount[activity] = (activityCount[activity] || 0) + 1;
      });
  
      // Collect non-negotiables
      answers.nonNegotiables?.forEach((item) => {
        nonNegotiables.push(item);
      });
    });
  
    const getMajority = (obj) => {
      return Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    };
  
    const conflicts = [];
  
    // Budget conflict
    if (maxBudget - minBudget > 5000) {
      conflicts.push("Large budget variation in group");
    }
  
    // Travel style conflict
    if (Object.keys(preferenceCount.travelStyle).length > 1) {
      conflicts.push("Different travel styles preferred");
    }
  
    return {
      groupSize: members.length,
      budget: {
        min: minBudget,
        max: maxBudget,
        recommended: Math.floor((minBudget + maxBudget) / 2),
      },
      majorityPreferences: {
        travelStyle: getMajority(preferenceCount.travelStyle),
        foodPreference: getMajority(preferenceCount.foodPreference),
        accommodationType: getMajority(preferenceCount.accommodationType),
      },
      topActivities: Object.entries(activityCount)
        .sort((a, b) => b[1] - a[1])
        .map(([activity]) => activity)
        .slice(0, 5),
      nonNegotiables,
      conflicts,
    };
  };
  
  module.exports = { aggregateTripData };
  
const aggregateTripData = (members) => {
    if (!members.length) {
      return null;
    }

    const budgetMap = {
        low: { min: 5000, max: 8000 },
        medium: { min: 8000, max: 15000 },
        high: { min: 15000, max: 30000 },
        luxury: { min: 30000, max: 60000 }
    };  
  
    const budgetRanges = members.map(m => budgetMap[m.surveyAnswers.budget]);

    const minBudget = Math.min(...budgetRanges.map(b => b.min));
    const maxBudget = Math.max(...budgetRanges.map(b => b.max));
    
    const preferenceCount = {
      travelStyle: {},
      foodPreference: {},
      accommodationType: {},
    };
  
    const activityCount = {};
    const nonNegotiablesSet = new Set();
  
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
        nonNegotiablesSet.add(item);
      });
    });
  
    const getMajority = (obj) => {
      return Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    };
  
    const conflicts = [];
  
    // Budget conflict: flag when members span more than one budget tier
    const uniqueBudgetTiers = new Set(members.map(m => m.surveyAnswers.budget));
    if (uniqueBudgetTiers.size > 1 && maxBudget - minBudget > 10000) {
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
      nonNegotiables: [...nonNegotiablesSet],
      conflicts,
    };
  };
  
  module.exports = { aggregateTripData };
  
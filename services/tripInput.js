/**
 * Validation and defaults for creating a trip.
 *
 * The create form no longer asks for a title: it's derived from the route,
 * so it can't drift from what the trip actually is.
 */

const MAX_PLACE_LENGTH = 60;
const MAX_DURATION_DAYS = 30;

function deriveTripTitle(source, destination) {
  return `${source} to ${destination}`;
}

/**
 * Returns { trip } with cleaned fields, or { error } with a message the
 * frontend can show as-is.
 */
function parseNewTrip(body = {}) {
  const source = typeof body.source === "string" ? body.source.trim() : "";
  const destination = typeof body.destination === "string" ? body.destination.trim() : "";
  const durationDays = Number(body.durationDays);

  if (!source || !destination) {
    return { error: "Please enter where the trip starts and where it's going." };
  }
  if (source.length > MAX_PLACE_LENGTH || destination.length > MAX_PLACE_LENGTH) {
    return { error: `Place names can be at most ${MAX_PLACE_LENGTH} characters.` };
  }
  if (source.toLowerCase() === destination.toLowerCase()) {
    return { error: "The starting point and destination need to be different." };
  }
  if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > MAX_DURATION_DAYS) {
    return { error: `Duration must be a whole number of days between 1 and ${MAX_DURATION_DAYS}.` };
  }

  return {
    trip: {
      title: deriveTripTitle(source, destination),
      source,
      destination,
      durationDays,
    },
  };
}

module.exports = { deriveTripTitle, parseNewTrip, MAX_DURATION_DAYS };

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { parseNewTrip, deriveTripTitle } = require("../services/tripInput");

test("derives the title from the route", () => {
  assert.equal(deriveTripTitle("Delhi", "Manali"), "Delhi to Manali");
  const { trip } = parseNewTrip({ source: " Delhi ", destination: "Manali ", durationDays: 3 });
  assert.deepEqual(trip, { title: "Delhi to Manali", source: "Delhi", destination: "Manali", durationDays: 3 });
});

test("ignores a title sent by an older client", () => {
  const { trip } = parseNewTrip({ title: "Anything", source: "Delhi", destination: "Bir", durationDays: 2 });
  assert.equal(trip.title, "Delhi to Bir");
});

test("accepts a duration sent as a string", () => {
  assert.equal(parseNewTrip({ source: "A", destination: "B", durationDays: "4" }).trip.durationDays, 4);
});

test("rejects bad input with a readable message", () => {
  const cases = [
    {},
    { source: "  ", destination: "Bir", durationDays: 3 },
    { source: "Delhi", destination: "delhi", durationDays: 3 },
    { source: "Delhi", destination: "Bir", durationDays: 0 },
    { source: "Delhi", destination: "Bir", durationDays: 31 },
    { source: "Delhi", destination: "Bir", durationDays: 2.5 },
    { source: "x".repeat(61), destination: "Bir", durationDays: 3 },
  ];
  for (const body of cases) {
    const { trip, error } = parseNewTrip(body);
    assert.equal(trip, undefined, JSON.stringify(body));
    assert.match(error, /\w/);
  }
});

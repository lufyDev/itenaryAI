const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface Trip {
  _id: string;
  organiserName: string;
  title: string;
  durationDays: number;
  members: string[];
  surveyLink?: string;
}

export interface SurveyData {
  travelStyle: string;
  foodPreference: string;
  accommodationType: string;
  activities: string[];
  budget: string;
  nonNegotiables: string[];
}

export async function createTrip(data: {
  organiserName: string;
  title: string;
  durationDays: number;
}): Promise<Trip & { surveyLink: string }> {
  const res = await fetch(`${API_URL}/api/trips/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create trip");
  }
  return res.json();
}

export async function getTrip(tripId: string): Promise<Trip> {
  const res = await fetch(`${API_URL}/api/trips/${tripId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Trip not found");
  }
  return res.json();
}

export async function submitSurvey(tripId: string, data: SurveyData) {
  const res = await fetch(`${API_URL}/api/survey/${tripId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to submit survey");
  }
  return res.json();
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface ItineraryDay {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
  stay: string;
  estimatedCostPerPerson: number;
}

export interface Itinerary {
  summary: string;
  days: ItineraryDay[];
  totalEstimatedCostPerPerson: number;
  tradeOffExplanation: string;
}

export interface Trip {
  _id: string;
  organiserName: string;
  title: string;
  source: string;
  destination: string;
  durationDays: number;
  members: string[];
  aggregatedData?: object;
  itinerary?: Itinerary;
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
  source: string;
  destination: string;
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

export async function aggregateTrip(tripId: string): Promise<Trip> {
  const res = await fetch(`${API_URL}/api/trips/${tripId}/aggregate`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to aggregate data");
  }
  return res.json();
}

export interface StreamEvent {
  node: string;
  state: {
    itinerary?: Itinerary;
    repair_instructions?: string;
    tool_results?: unknown;
    attempt_count?: number;
  };
  error?: string;
}

export async function generateTripItineraryStream(
  tripId: string,
  onEvent: (event: StreamEvent) => void,
  onDone: () => void,
  onError: (error: Error) => void
): Promise<void> {
  const res = await fetch(`${API_URL}/api/trips/${tripId}/generate-stream`, {
    method: "POST",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to start itinerary stream");
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No readable stream available");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data:")) continue;

        const payload = line.slice(5).trim();

        if (payload === "[DONE]") {
          onDone();
          return;
        }

        try {
          const parsed: StreamEvent = JSON.parse(payload);
          if (parsed.error) {
            onError(new Error(parsed.error));
            return;
          }
          onEvent(parsed);
        } catch {
          // skip non-JSON payloads
        }
      }
    }

    onDone();
  } catch (err) {
    onError(err instanceof Error ? err : new Error("Stream interrupted"));
  } finally {
    reader.releaseLock();
  }
}

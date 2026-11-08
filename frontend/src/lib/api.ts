const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type ScheduleKind = "travel" | "activity" | "meal" | "rest";

export interface ScheduleEntry {
  // 24-hour "HH:MM". An end earlier than the start means it runs past midnight.
  start: string;
  end: string;
  kind: ScheduleKind;
  activity: string;
}

export interface ItineraryDay {
  day: number;
  // Timed entries. Itineraries generated before this existed have the three
  // free-text slots below instead.
  schedule?: ScheduleEntry[];
  morning?: string;
  afternoon?: string;
  evening?: string;
  stay: string;
  estimatedCostPerPerson: number;
}

export type TimePreference = "morning" | "afternoon" | "evening" | "any";

export interface Itinerary {
  summary: string;
  days: ItineraryDay[];
  totalEstimatedCostPerPerson: number;
  tradeOffExplanation: string;
}

export interface Trip {
  _id: string;
  organiser?: string;
  organiserName: string;
  title: string;
  source: string;
  destination: string;
  durationDays: number;
  departurePreference?: TimePreference;
  returnPreference?: TimePreference;
  members: string[];
  aggregatedData?: object;
  itinerary?: Itinerary;
  // Problems the AI reviewer still saw when it stopped revising. Empty or
  // missing when the itinerary passed review.
  itineraryIssues?: string[];
  surveyLink?: string;
}

export interface TripSummary {
  _id: string;
  title: string;
  source: string;
  destination: string;
  durationDays: number;
  memberCount: number;
  status: "draft" | "collecting_responses" | "itinerary_ready";
  createdAt: string;
}

export interface SurveyData {
  travelStyle: string;
  foodPreference: string;
  accommodationType: string;
  activities: string[];
  budget: string;
  nonNegotiables: string[];
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  picture?: string;
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function loginWithGoogle(
  credential: string
): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${API_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Login failed");
  }
  return res.json();
}

export async function getMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export async function getMyTrips(token: string): Promise<TripSummary[]> {
  const res = await fetch(`${API_URL}/api/trips/my-trips`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch trips");
  }
  return res.json();
}

export async function createTrip(
  data: {
    source: string;
    destination: string;
    durationDays: number;
    departurePreference: TimePreference;
    returnPreference: TimePreference;
  },
  token: string
): Promise<Trip & { surveyLink: string }> {
  const res = await fetch(`${API_URL}/api/trips/create`, {
    method: "POST",
    headers: authHeaders(token),
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

export async function aggregateTrip(
  tripId: string,
  token: string
): Promise<Trip> {
  const res = await fetch(`${API_URL}/api/trips/${tripId}/aggregate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
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
    itinerary?: Itinerary | null;
    repair_instructions?: { violations?: string[] } | null;
    tool_results?: unknown;
    attempt_count?: number;
  };
  error?: string;
}

export async function generateTripItineraryStream(
  tripId: string,
  token: string,
  onEvent: (event: StreamEvent) => void,
  onDone: () => void,
  onError: (error: Error) => void
): Promise<void> {
  const res = await fetch(`${API_URL}/api/trips/${tripId}/generate-stream`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
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

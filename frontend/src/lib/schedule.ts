import type { TimePreference } from "./api";

const MINUTES_PER_DAY = 24 * 60;

function toMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  return minutes < MINUTES_PER_DAY ? minutes : null;
}

/** "18:30" -> "6:30 PM". Falls back to the raw value if it isn't HH:MM. */
export function formatClock(value: string): string {
  const minutes = toMinutes(value);
  if (minutes == null) return value;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/**
 * How long an entry lasts, and whether it ends the next day. An end time
 * earlier than the start means it ran past midnight (an overnight bus).
 */
export function entrySpan(start: string, end: string) {
  const from = toMinutes(start);
  const to = toMinutes(end);
  if (from == null || to == null) return null;
  const overnight = to < from;
  const minutes = overnight ? to + MINUTES_PER_DAY - from : to - from;
  return { minutes, overnight };
}

/** 45 -> "45 min", 120 -> "2 hr", 690 -> "11 hr 30 min". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export const TIME_PREFERENCE_OPTIONS: { value: TimePreference; label: string; hint: string }[] = [
  { value: "any", label: "Any time", hint: "" },
  { value: "morning", label: "Morning", hint: "4 AM to noon" },
  { value: "afternoon", label: "Afternoon", hint: "noon to 5 PM" },
  { value: "evening", label: "Evening", hint: "5 PM to midnight" },
];

export function timePreferenceLabel(value?: TimePreference): string | null {
  if (!value || value === "any") return null;
  return TIME_PREFERENCE_OPTIONS.find((o) => o.value === value)?.label.toLowerCase() ?? null;
}

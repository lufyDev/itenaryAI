"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Copy, Check, ExternalLink, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { createTrip, type TimePreference } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { TIME_PREFERENCE_OPTIONS } from "@/lib/schedule";

function TimeChoice({
  label,
  value,
  onChange,
}: {
  label: string;
  value: TimePreference;
  onChange: (value: TimePreference) => void;
}) {
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </legend>
      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-stone-800 border border-stone-700">
        {TIME_PREFERENCE_OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              title={option.hint || undefined}
              onClick={() => onChange(option.value)}
              className={`py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                selected
                  ? "bg-amber-500 text-stone-950"
                  : "text-slate-400 hover:text-white hover:bg-stone-700"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function travelHint(leave: TimePreference, back: TimePreference): string {
  if (leave === "evening" && back === "morning") {
    return "Overnight both ways: you'll travel while you sleep and get full days there.";
  }
  if (leave === "evening") return "Good for an overnight bus or train out.";
  if (back === "morning") return "Good for an overnight bus or train home.";
  if (leave === "any" && back === "any") {
    return "Optional. Leave it on Any time and the plan picks what fits the route.";
  }
  return "";
}

export default function CreateTripModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    source: "",
    destination: "",
    durationDays: 3,
    departurePreference: "any" as TimePreference,
    returnPreference: "any" as TimePreference,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    _id: string;
    surveyLink: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("You must be signed in to create a trip.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await createTrip(form, token);
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Couldn't create the trip. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (result?.surveyLink) {
      await navigator.clipboard.writeText(result.surveyLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto bg-stone-900 border border-stone-700/50 rounded-2xl shadow-2xl"
        >
          <div className="flex items-center justify-between px-6 pt-6">
            <h2 className="text-xl font-bold text-white">
              {result ? "Trip Created!" : "Create a New Trip"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-stone-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Starting from
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={form.source}
                      onChange={(e) =>
                        setForm({ ...form, source: e.target.value })
                      }
                      placeholder="e.g. Delhi"
                      className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Going to
                    </label>
                    <input
                      type="text"
                      required
                      value={form.destination}
                      onChange={(e) =>
                        setForm({ ...form, destination: e.target.value })
                      }
                      placeholder="e.g. Jibhi"
                      className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Days at {form.destination.trim() || "the destination"}
                  </label>
                  <p className="text-slate-500 text-xs mb-2">
                    Travel isn&apos;t counted. Leave Friday evening and be back
                    Tuesday morning = 3 days (Sat, Sun, Mon).
                  </p>
                  <input
                    type="number"
                    required
                    min={1}
                    max={30}
                    value={form.durationDays}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        durationDays: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                </div>

                <div className="space-y-4">
                  <TimeChoice
                    label={`Leave ${form.source.trim() || "home"}`}
                    value={form.departurePreference}
                    onChange={(departurePreference) =>
                      setForm({ ...form, departurePreference })
                    }
                  />
                  <TimeChoice
                    label={`Back in ${form.source.trim() || "home"}`}
                    value={form.returnPreference}
                    onChange={(returnPreference) =>
                      setForm({ ...form, returnPreference })
                    }
                  />
                  {travelHint(form.departurePreference, form.returnPreference) && (
                    <p className="text-slate-500 text-xs">
                      {travelHint(form.departurePreference, form.returnPreference)}
                    </p>
                  )}
                </div>

                {form.source.trim() && form.destination.trim() && (
                  <p className="text-slate-500 text-sm">
                    Your trip will be called{" "}
                    <span className="text-slate-300">
                      {form.source.trim()} to {form.destination.trim()}
                    </span>
                    .
                  </p>
                )}

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Trip"
                  )}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-400 text-sm font-semibold mb-1">
                    Share this link with your group
                  </p>
                  <p className="text-slate-400 text-xs mb-4">
                    Everyone who opens this link can fill in their travel
                    preferences anonymously. Fill it yourself too if you&apos;re
                    going. Open the trip to see responses and generate the plan.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2.5 rounded-lg bg-stone-800 text-slate-300 text-sm font-mono truncate border border-stone-700">
                      {result.surveyLink}
                    </div>
                    <button
                      onClick={copyLink}
                      className="p-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-slate-300 transition-colors border border-stone-700 cursor-pointer"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/trip/${result._id}`}
                    className="py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Open Trip
                  </Link>
                  <a
                    href={result.surveyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 bg-stone-800 border border-stone-700 text-white font-semibold rounded-xl hover:bg-stone-700 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Fill It Yourself
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

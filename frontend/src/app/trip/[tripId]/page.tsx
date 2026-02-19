"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Compass,
  Loader2,
  Copy,
  Check,
  Users,
  Sparkles,
  RefreshCw,
  Share2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import {
  getTrip,
  aggregateTrip,
  generateTripItinerary,
  type Trip,
} from "@/lib/api";
import ItineraryView from "@/components/ItineraryView";

const GENERATING_STEPS = [
  "Crunching everyone's preferences...",
  "Detecting conflicts & trade-offs...",
  "Searching for the best stays...",
  "Building your day-by-day plan...",
];

export default function TripDashboard() {
  const params = useParams();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [error, setError] = useState("");
  const [copiedSurvey, setCopiedSurvey] = useState(false);
  const [copiedItinerary, setCopiedItinerary] = useState(false);
  const [surveyLink, setSurveyLink] = useState("");

  useEffect(() => {
    getTrip(tripId)
      .then(setTrip)
      .catch(() => setError("Trip not found"))
      .finally(() => setLoading(false));
    setSurveyLink(
      `${window.location.origin}/fillSurveyForm?tripId=${tripId}`
    );
  }, [tripId]);

  // Step animation while generating
  useEffect(() => {
    if (!generating) return;
    const interval = setInterval(() => {
      setGeneratingStep((prev) => (prev + 1) % GENERATING_STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [generating]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGeneratingStep(0);
    setError("");
    try {
      await aggregateTrip(tripId);
      const itinerary = await generateTripItinerary(tripId);
      setTrip((prev) => (prev ? { ...prev, itinerary } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const copySurveyLink = async () => {
    await navigator.clipboard.writeText(surveyLink);
    setCopiedSurvey(true);
    setTimeout(() => setCopiedSurvey(false), 2000);
  };

  const shareItinerary = async () => {
    const link = `${window.location.origin}/trip/${tripId}/itinerary`;
    await navigator.clipboard.writeText(link);
    setCopiedItinerary(true);
    setTimeout(() => setCopiedItinerary(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 px-6">
        <div className="max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Trip Not Found</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link
            href="/"
            className="text-amber-400 hover:text-amber-300 text-sm font-medium"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const memberCount = trip?.members?.length || 0;

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-white font-bold"
          >
            <Compass className="w-5 h-5 text-amber-400" />
            ItineraryAI
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Trip Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-amber-400/70 text-sm font-semibold tracking-wider uppercase mb-2">
            Trip Dashboard
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {trip?.title}
          </h1>
          <p className="text-slate-500">
            {trip?.durationDays} days &middot; Organized by{" "}
            <span className="text-slate-300">{trip?.organiserName}</span>
          </p>
        </motion.div>

        {/* Survey Link Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800/60 mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Survey Link</p>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <Users className="w-4 h-4" />
              {memberCount} {memberCount === 1 ? "response" : "responses"}
            </div>
          </div>
          <p className="text-slate-500 text-xs mb-3">
            Share this with your group to collect their travel preferences.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2.5 rounded-lg bg-stone-800 text-slate-400 text-sm font-mono truncate border border-stone-700">
              {surveyLink || `Loading...`}
            </div>
            <button
              onClick={copySurveyLink}
              disabled={!surveyLink}
              className="p-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-slate-300 transition-colors border border-stone-700 cursor-pointer disabled:opacity-50"
            >
              {copiedSurvey ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Dynamic Section: Generating / Itinerary / Waiting */}
        {generating ? (
          <GeneratingAnimation step={generatingStep} />
        ) : trip?.itinerary ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <ItineraryView itinerary={trip.itinerary} />

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleGenerate}
                className="flex-1 py-3.5 px-6 rounded-xl bg-stone-800 border border-stone-700 text-white font-medium hover:bg-stone-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
              <button
                onClick={shareItinerary}
                className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedItinerary ? (
                  <>
                    <Check className="w-4 h-4" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Share Itinerary
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-10 rounded-2xl bg-stone-900/60 border border-stone-800/60 text-center"
          >
            {memberCount === 0 ? (
              <>
                <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Waiting for responses
                </h3>
                <p className="text-slate-500 text-sm mb-1">
                  Share the survey link above and wait for your group to fill in
                  their preferences.
                </p>
                <p className="text-slate-600 text-xs mt-3">
                  Refresh the page to check for new responses.
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center gap-1.5 mb-5">
                  {Array.from({ length: Math.min(memberCount, 20) }).map(
                    (_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="w-3 h-3 rounded-full bg-emerald-500"
                      />
                    )
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {memberCount}{" "}
                  {memberCount === 1 ? "member has" : "members have"} responded
                </h3>
                <p className="text-slate-500 text-sm mb-7">
                  Ready to generate your AI-powered itinerary?
                </p>
                {error && (
                  <p className="text-red-400 text-sm mb-4">{error}</p>
                )}
                <button
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-lg rounded-xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Itinerary
                </button>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function GeneratingAnimation({ step }: { step: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-12 rounded-2xl bg-stone-900/60 border border-stone-800/60"
    >
      <div className="max-w-sm mx-auto text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-8"
        >
          <Sparkles className="w-14 h-14 text-amber-400" />
        </motion.div>

        <h3 className="text-xl font-bold text-white mb-8">
          Crafting Your Itinerary
        </h3>

        <div className="space-y-3.5 text-left">
          {GENERATING_STEPS.map((text, i) => (
            <motion.div
              key={i}
              animate={{ opacity: i <= step ? 1 : 0.25 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  i < step
                    ? "bg-emerald-500/20 text-emerald-400"
                    : i === step
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-stone-800 text-stone-600"
                }`}
              >
                {i < step ? (
                  <Check className="w-3.5 h-3.5" />
                ) : i === step ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span className="text-[11px] font-medium">{i + 1}</span>
                )}
              </div>
              <span
                className={`text-sm ${i <= step ? "text-slate-300" : "text-slate-600"}`}
              >
                {text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

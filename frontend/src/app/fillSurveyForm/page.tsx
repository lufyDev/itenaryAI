"use client";

import { useState, useEffect, Suspense, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Compass,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Mountain,
  Droplets,
  Tent,
  Coffee,
  ShoppingBag,
  TreePine,
  Car,
  Music,
  Landmark,
  Camera,
  Flame,
  Guitar,
  Plane,
  Wine,
  Cigarette,
  Ban,
  Leaf,
  Lock,
  Heart,
  MapPin,
} from "lucide-react";
import { getTrip, submitSurvey, type Trip, type SurveyData } from "@/lib/api";

/* ── Option Definitions ── */

interface SingleOption {
  value: string;
  label: string;
  desc?: string;
  icon?: ReactNode;
}

const TRAVEL_STYLES: SingleOption[] = [
  { value: "relaxed", label: "Relaxed", desc: "Slow pace, soak it all in", icon: <Coffee className="w-5 h-5" /> },
  { value: "balanced", label: "Balanced", desc: "Mix of rest and action", icon: <Compass className="w-5 h-5" /> },
  { value: "adventure-heavy", label: "Adventure Heavy", desc: "Push limits, seek thrills", icon: <Mountain className="w-5 h-5" /> },
  { value: "party-focused", label: "Party Focused", desc: "It's all about the nightlife", icon: <Music className="w-5 h-5" /> },
  { value: "explore-max", label: "Explore Max", desc: "Cover every corner", icon: <MapPin className="w-5 h-5" /> },
];

const FOOD_PREFS: SingleOption[] = [
  { value: "veg", label: "Vegetarian", desc: "Plant-based meals" },
  { value: "non-veg", label: "Non-Veg", desc: "Bring on the meat" },
  { value: "mixed", label: "Mixed", desc: "I eat everything" },
  { value: "vegan", label: "Vegan", desc: "No animal products" },
  { value: "jain", label: "Jain", desc: "Strict dietary needs" },
];

const ACCOMMODATION_TYPES: SingleOption[] = [
  { value: "hostel", label: "Hostel", desc: "Social & budget-friendly" },
  { value: "budget-hotel", label: "Budget Hotel", desc: "Comfortable basics" },
  { value: "boutique-hotel", label: "Boutique Hotel", desc: "Unique & charming" },
  { value: "luxury-resort", label: "Luxury Resort", desc: "Premium everything" },
  { value: "homestay", label: "Homestay", desc: "Local & authentic" },
];

const ACTIVITIES: SingleOption[] = [
  { value: "trekking", label: "Trekking", icon: <Mountain className="w-5 h-5" /> },
  { value: "waterfalls", label: "Waterfalls", icon: <Droplets className="w-5 h-5" /> },
  { value: "camping", label: "Camping", icon: <Tent className="w-5 h-5" /> },
  { value: "cafes", label: "Cafe Hopping", icon: <Coffee className="w-5 h-5" /> },
  { value: "local-markets", label: "Local Markets", icon: <ShoppingBag className="w-5 h-5" /> },
  { value: "wildlife", label: "Wildlife", icon: <TreePine className="w-5 h-5" /> },
  { value: "road-trip", label: "Road Trip", icon: <Car className="w-5 h-5" /> },
  { value: "nightlife", label: "Nightlife", icon: <Music className="w-5 h-5" /> },
  { value: "spiritual-sites", label: "Spiritual Sites", icon: <Landmark className="w-5 h-5" /> },
  { value: "photography", label: "Photography", icon: <Camera className="w-5 h-5" /> },
  { value: "adventure-sports", label: "Adventure Sports", icon: <Flame className="w-5 h-5" /> },
  { value: "music-jamming", label: "Music Jamming", icon: <Guitar className="w-5 h-5" /> },
];

const BUDGETS: SingleOption[] = [
  { value: "low", label: "Budget", desc: "₹5K – ₹8K" },
  { value: "medium", label: "Moderate", desc: "₹8K – ₹15K" },
  { value: "high", label: "High", desc: "₹15K – ₹30K" },
  { value: "luxury", label: "Luxury", desc: "₹30K+" },
];

const NON_NEGOTIABLES: SingleOption[] = [
  { value: "no-flights", label: "No Flights", icon: <Plane className="w-5 h-5" /> },
  { value: "no-alcohol", label: "No Alcohol", icon: <Wine className="w-5 h-5" /> },
  { value: "smoking-allowed", label: "Smoking OK", icon: <Cigarette className="w-5 h-5" /> },
  { value: "smoking-not-allowed", label: "No Smoking", icon: <Ban className="w-5 h-5" /> },
  { value: "veg-only-restaurants", label: "Veg-Only Restaurants", icon: <Leaf className="w-5 h-5" /> },
  { value: "private-rooms-only", label: "Private Rooms Only", icon: <Lock className="w-5 h-5" /> },
  { value: "no-trekking", label: "No Trekking", icon: <Mountain className="w-5 h-5" /> },
  { value: "no-long-drives", label: "No Long Drives", icon: <Car className="w-5 h-5" /> },
  { value: "pet-friendly", label: "Pet Friendly", icon: <Heart className="w-5 h-5" /> },
];

/* ── Reusable Components ── */

function OptionCard({
  selected,
  onClick,
  label,
  description,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`relative p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
        selected
          ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/5"
          : "border-stone-800 bg-stone-900/50 hover:border-stone-700"
      }`}
    >
      {icon && (
        <div
          className={`mb-2.5 ${selected ? "text-amber-400" : "text-slate-500"} transition-colors`}
        >
          {icon}
        </div>
      )}
      <div className="font-semibold text-white text-sm">{label}</div>
      {description && (
        <div className="text-xs text-slate-500 mt-1">{description}</div>
      )}
      {selected && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 className="w-5 h-5 text-amber-500" />
        </div>
      )}
    </motion.button>
  );
}

function SectionHeading({
  number,
  title,
  subtitle,
  multi,
}: {
  number: string;
  title: string;
  subtitle?: string;
  multi?: boolean;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-xs font-bold text-amber-500/60 tracking-widest">
          {number}
        </span>
        {multi && (
          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider bg-stone-800 px-2 py-0.5 rounded">
            Multi-select
          </span>
        )}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}

/* ── Main Form ── */

function SurveyFormContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  const [form, setForm] = useState<SurveyData>({
    travelStyle: "",
    foodPreference: "",
    accommodationType: "",
    activities: [],
    budget: "",
    nonNegotiables: [],
  });

  useEffect(() => {
    if (!tripId) {
      setError("No trip ID provided. Please use the link shared by your organizer.");
      setLoading(false);
      return;
    }
    getTrip(tripId)
      .then(setTrip)
      .catch(() => setError("Trip not found. The link may be invalid or expired."))
      .finally(() => setLoading(false));
  }, [tripId]);

  const toggleArrayItem = (field: "activities" | "nonNegotiables", value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async () => {
    if (!form.travelStyle || !form.foodPreference || !form.accommodationType || !form.budget) {
      setValidationError("Please fill in all required sections before submitting.");
      return;
    }
    if (form.activities.length === 0) {
      setValidationError("Please select at least one activity.");
      return;
    }
    setValidationError("");
    setSubmitting(true);
    try {
      await submitSurvey(tripId!, form);
      setSubmitted(true);
    } catch {
      setValidationError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filledCount = [
    form.travelStyle,
    form.foodPreference,
    form.accommodationType,
    form.activities.length > 0,
    form.budget,
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 px-6">
        <div className="max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Oops!</h1>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            You&apos;re All Set!
          </h1>
          <p className="text-slate-400 mb-2">
            Your preferences for{" "}
            <span className="text-amber-400 font-semibold">{trip?.title}</span>{" "}
            have been saved.
          </p>
          <p className="text-slate-500 text-sm">
            Once everyone fills in theirs, the organizer can generate the
            AI-powered itinerary.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold">
            <Compass className="w-5 h-5 text-amber-400" />
            ItineraryAI
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < filledCount ? "bg-amber-500" : "bg-stone-700"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500">
              {filledCount}/5
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Trip Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-amber-400/70 text-sm font-semibold tracking-wider uppercase mb-2">
            You&apos;re invited
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {trip?.title}
          </h1>
          <p className="text-slate-500">
            {trip?.durationDays} days &middot; Organized by{" "}
            <span className="text-slate-300">{trip?.organiserName}</span>
          </p>
          <p className="text-slate-600 text-sm mt-3">
            Fill in your preferences below. Your answers are anonymous and help
            the AI build a trip everyone will enjoy.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-14">
          {/* 1. Travel Style */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <SectionHeading
              number="01"
              title="What's your travel vibe?"
              subtitle="Pick the style that resonates most"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TRAVEL_STYLES.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={form.travelStyle === opt.value}
                  onClick={() => setForm({ ...form, travelStyle: opt.value })}
                  label={opt.label}
                  description={opt.desc}
                  icon={opt.icon}
                />
              ))}
            </div>
          </motion.section>

          {/* 2. Food Preference */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SectionHeading
              number="02"
              title="What's on the menu?"
              subtitle="Your dietary preference"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FOOD_PREFS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={form.foodPreference === opt.value}
                  onClick={() =>
                    setForm({ ...form, foodPreference: opt.value })
                  }
                  label={opt.label}
                  description={opt.desc}
                />
              ))}
            </div>
          </motion.section>

          {/* 3. Accommodation */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <SectionHeading
              number="03"
              title="Where do you want to crash?"
              subtitle="Your ideal stay"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ACCOMMODATION_TYPES.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={form.accommodationType === opt.value}
                  onClick={() =>
                    setForm({ ...form, accommodationType: opt.value })
                  }
                  label={opt.label}
                  description={opt.desc}
                />
              ))}
            </div>
          </motion.section>

          {/* 4. Activities */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SectionHeading
              number="04"
              title="Pick your adventures"
              subtitle="Select all that excite you"
              multi
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {ACTIVITIES.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={form.activities.includes(opt.value)}
                  onClick={() => toggleArrayItem("activities", opt.value)}
                  label={opt.label}
                  icon={opt.icon}
                />
              ))}
            </div>
          </motion.section>

          {/* 5. Budget */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <SectionHeading
              number="05"
              title="What's your budget?"
              subtitle="Per-person estimate for the whole trip"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BUDGETS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={form.budget === opt.value}
                  onClick={() => setForm({ ...form, budget: opt.value })}
                  label={opt.label}
                  description={opt.desc}
                />
              ))}
            </div>
          </motion.section>

          {/* 6. Non-Negotiables */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SectionHeading
              number="06"
              title="Any dealbreakers?"
              subtitle="These will be respected no matter what"
              multi
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {NON_NEGOTIABLES.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={form.nonNegotiables.includes(opt.value)}
                  onClick={() => toggleArrayItem("nonNegotiables", opt.value)}
                  label={opt.label}
                  icon={opt.icon}
                />
              ))}
            </div>
          </motion.section>
        </div>

        {/* Submit */}
        <div className="mt-16 mb-12">
          {validationError && (
            <p className="text-red-400 text-sm mb-4 text-center">
              {validationError}
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-lg rounded-xl shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-slate-500 text-sm">Loading survey...</p>
      </div>
    </div>
  );
}

export default function SurveyPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SurveyFormContent />
    </Suspense>
  );
}

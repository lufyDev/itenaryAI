"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Loader2, AlertTriangle, Clock } from "lucide-react";
import { getTrip, type Trip } from "@/lib/api";
import ItineraryView from "@/components/ItineraryView";

export default function SharedItineraryPage() {
  const params = useParams();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTrip(tripId)
      .then(setTrip)
      .catch(() => setError("Trip not found"))
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 px-6">
        <div className="max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Not Found</h1>
          <p className="text-slate-400">{error || "Trip not found"}</p>
        </div>
      </div>
    );
  }

  if (!trip.itinerary) {
    return (
      <div className="min-h-screen bg-stone-950">
        <nav className="sticky top-0 z-30 bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/40">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-white font-bold w-fit"
            >
              <Compass className="w-5 h-5 text-amber-400" />
              ItineraryAI
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <Clock className="w-14 h-14 text-amber-500/40 mx-auto mb-5" />
          <h1 className="text-2xl font-bold text-white mb-3">
            Itinerary Not Ready Yet
          </h1>
          <p className="text-slate-400 mb-1">
            The organizer hasn&apos;t generated the itinerary for{" "}
            <span className="text-amber-400 font-semibold">{trip.title}</span>{" "}
            yet.
          </p>
          <p className="text-slate-600 text-sm mt-2">Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <nav className="sticky top-0 z-30 bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-white font-bold w-fit"
          >
            <Compass className="w-5 h-5 text-amber-400" />
            ItineraryAI
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-amber-400/70 text-sm font-semibold tracking-wider uppercase mb-2">
            Trip Itinerary
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {trip.title}
          </h1>
          <p className="text-slate-500">
            {trip.durationDays} days &middot; Organized by{" "}
            <span className="text-slate-300">{trip.organiserName}</span>
          </p>
        </motion.div>

        <ItineraryView itinerary={trip.itinerary} />
      </div>

      <footer className="border-t border-stone-800/40 py-8 px-6 mt-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-600 text-sm">
            Powered by{" "}
            <Link href="/" className="text-amber-400/70 hover:text-amber-400">
              ItineraryAI
            </Link>{" "}
            &mdash; Group trip planning made effortless.
          </p>
        </div>
      </footer>
    </div>
  );
}

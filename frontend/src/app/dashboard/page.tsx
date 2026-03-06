"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Compass,
  Plus,
  MapPin,
  Users,
  Sparkles,
  Loader2,
  Copy,
  Check,
  LogOut,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyTrips, type TripSummary } from "@/lib/api";
import CreateTripModal from "@/components/CreateTripModal";

const STATUS_CONFIG = {
  draft: {
    label: "No responses yet",
    color: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  },
  collecting_responses: {
    label: "Collecting responses",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  itinerary_ready: {
    label: "Itinerary ready",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
} as const;

export default function Dashboard() {
  const { user, token, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !token) {
      router.push("/");
      return;
    }

    getMyTrips(token)
      .then(setTrips)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, token, authLoading, router]);

  const copySurveyLink = async (tripId: string) => {
    const link = `${window.location.origin}/fillSurveyForm?tripId=${tripId}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(tripId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const refreshTrips = () => {
    if (!token) return;
    setLoading(true);
    getMyTrips(token)
      .then(setTrips)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-white font-bold"
          >
            <Compass className="w-5 h-5 text-amber-400" />
            ItineraryAI
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Trip
            </button>
            <div className="flex items-center gap-2">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-white/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-500/30 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name.charAt(0)}
                </div>
              )}
              <button
                onClick={signOut}
                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-amber-400/70 text-sm font-semibold tracking-wider uppercase mb-2">
            Dashboard
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Welcome back, {user?.name.split(" ")[0]}
          </h1>
          <p className="text-slate-500 mt-2">
            {trips.length === 0
              ? "You haven't created any trips yet."
              : `You have ${trips.length} trip${trips.length > 1 ? "s" : ""}.`}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : trips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-12 rounded-2xl bg-stone-900/60 border border-stone-800/60 text-center"
          >
            <MapPin className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No trips yet
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Create your first trip and share the survey link with your group.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Create Your First Trip
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {trips.map((trip, i) => {
              const statusConfig = STATUS_CONFIG[trip.status];
              return (
                <motion.div
                  key={trip._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group p-5 rounded-2xl bg-stone-900/60 border border-stone-800/60 hover:border-stone-700/60 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-lg font-bold text-white truncate">
                          {trip.title}
                        </h3>
                        <span
                          className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400/60" />
                          {trip.source} → {trip.destination}
                        </span>
                        <span>{trip.durationDays} days</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {trip.memberCount}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copySurveyLink(trip._id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-slate-300 text-sm hover:bg-stone-700 transition-colors cursor-pointer"
                        title="Copy survey link"
                      >
                        {copiedId === trip._id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        Survey Link
                      </button>
                      <Link
                        href={`/trip/${trip._id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-amber-500/20 transition-all"
                      >
                        {trip.status === "itinerary_ready" ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            View
                          </>
                        ) : (
                          <>
                            Open
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <CreateTripModal
          onClose={() => {
            setShowModal(false);
            refreshTrips();
          }}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  MapPin,
  Users,
  Sparkles,
  ArrowRight,
  Plus,
  Globe,
  Shield,
  Zap,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";
import CreateTripModal from "@/components/CreateTripModal";

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const STARS = Array.from({ length: 45 }, (_, i) => ({
  left: Math.round(seededRandom(i) * 10000) / 100,
  top: Math.round(seededRandom(i + 100) * 5500) / 100,
  size: Math.round((1 + seededRandom(i + 200) * 1.5) * 100) / 100,
  opacity: Math.round((0.15 + seededRandom(i + 300) * 0.5) * 100) / 100,
  delay: Math.round(seededRandom(i + 400) * 400) / 100,
  duration: Math.round((2.5 + seededRandom(i + 500) * 3) * 100) / 100,
}));

const STEPS = [
  {
    icon: <MapPin className="w-7 h-7" />,
    title: "Create & Share",
    description:
      "Create the trip with your source, destination, and duration, then drop the survey link in the group chat before the planning chaos starts.",
    step: "01",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: "Everyone Votes",
    description:
      "Everyone shares budget, food, travel style, activities, and non-negotiables privately, so the real preferences show up without peer pressure.",
    step: "02",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: <Sparkles className="w-7 h-7" />,
    title: "AI Researches & Plans",
    description:
      "We aggregate the group, detect conflicts, research transport, stays, and destination ideas, then stream back a day-by-day plan everyone can work with.",
    step: "03",
    gradient: "from-violet-500 to-purple-500",
  },
];

const FEATURES = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Anonymous Preferences",
    description:
      "No one sees anyone else's answers, so people can be honest about budget, food, and dealbreakers.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Conflict-Aware Planning",
    description:
      "The system spots clashes like mixed budgets or different travel styles before the itinerary is generated.",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Real-World Research",
    description:
      "The AI researches actual destinations, stays, and transport options instead of making up a fantasy trip.",
  },
];

function GoogleSignInPanel({
  onSignIn,
  title,
  subtitle,
  width,
  compact = false,
  minimal = false,
}: {
  onSignIn: (credential: string) => void;
  title?: string;
  subtitle?: string;
  width: string;
  compact?: boolean;
  minimal?: boolean;
}) {
  if (compact) {
    return (
      <div className="rounded-full border border-white/10 bg-white/[0.05] p-1.5 shadow-lg shadow-black/20 backdrop-blur-md">
        <GoogleLogin
          onSuccess={(response) => {
            if (response.credential) onSignIn(response.credential);
          }}
          onError={() => {}}
          shape="pill"
          theme="filled_black"
          size="medium"
          text="signin_with"
          width={width}
        />
      </div>
    );
  }

  if (minimal) {
    return (
      <div className="w-full max-w-sm px-3 py-2">
        {title ? (
          <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300/70">
            {title}
          </p>
        ) : null}
        <div className="flex justify-center">
          <div className="scale-95 rounded-full bg-white/[0.05] p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:scale-100">
            <GoogleLogin
              onSuccess={(response) => {
                if (response.credential) onSignIn(response.credential);
              }}
              onError={() => {}}
              shape="pill"
              theme="filled_black"
              size="medium"
              text="signin_with"
              width={width}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
      {title ? (
        <div className="mb-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300/80">
            {title}
          </p>
          {subtitle ? (
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex justify-center">
        <div className="rounded-full border border-white/10 bg-stone-950/70 p-1.5 shadow-lg shadow-black/20">
          <GoogleLogin
            onSuccess={(response) => {
              if (response.credential) onSignIn(response.credential);
            }}
            onError={() => {}}
            shape="pill"
            theme="filled_black"
            size="large"
            text="signin_with"
            width={width}
          />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const { user, loading, signIn, signOut } = useAuth();

  const handleCreateTrip = () => {
    if (!user) return;
    setShowModal(true);
  };

  return (
    <main className="bg-stone-950">
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-start pt-32 pb-16 sm:justify-center sm:pt-0 sm:pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/80 to-amber-950/50" />

        {STARS.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}

        <div className="absolute top-[20%] right-[15%] w-80 h-80 rounded-full bg-amber-500/[0.04] blur-[100px]" />
        <div className="absolute top-[45%] left-[10%] w-64 h-64 rounded-full bg-indigo-500/[0.04] blur-[80px]" />

        {/* Nav */}
        <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-lg sm:text-xl">
              <Compass className="w-6 h-6 text-amber-400" />
              ItineraryAI
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
              ) : user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full bg-white/[0.08] backdrop-blur-sm border border-white/[0.08] text-white text-sm font-medium hover:bg-white/[0.15] transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="sm:hidden">Trips</span>
                    <span className="hidden sm:inline">My Trips</span>
                  </Link>
                  <button
                    onClick={handleCreateTrip}
                    className="hidden sm:inline-flex px-4 py-2.5 sm:px-5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    Create Trip
                  </button>
                  <div className="flex items-center gap-2 sm:ml-1">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border border-white/20"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amber-500/30 flex items-center justify-center text-white text-xs font-bold">
                        {user.name.charAt(0)}
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
                </>
              ) : (
                <div className="hidden sm:flex sm:w-auto sm:justify-end">
                  <GoogleSignInPanel
                    onSignIn={(credential) => {
                      signIn(credential);
                    }}
                    width="210"
                    compact
                  />
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] text-amber-300/90 text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Built for trips that usually never happen
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="text-4xl sm:text-5xl md:text-[3.35rem] lg:text-[4rem] font-bold text-white mb-5 leading-[1.03] tracking-tight"
          >
            <span className="block">Where Group Trip Plans</span>
            <span className="block bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">
              Finally Leave the Group Chat
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="text-base sm:text-lg md:text-xl text-slate-400 mb-9 max-w-2xl mx-auto leading-relaxed"
          >
            Different budgets, different vibes, different food choices, zero
            clarity on where to go. ItineraryAI collects honest preferences,
            resolves the mess peacefully, and turns the group&apos;s common ground
            into a real plan.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.36 }}
            className="flex justify-center"
          >
            {user ? (
              <button
                onClick={handleCreateTrip}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 text-base sm:gap-3 sm:px-9 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold sm:text-lg rounded-full shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Plan Your Trip
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <div className="inline-flex flex-col items-center">
                <GoogleSignInPanel
                  onSignIn={(credential) => {
                    signIn(credential);
                  }}
                  title="Start Planning"
                  width="280"
                  minimal
                />
              </div>
            )}
          </motion.div>
        </div>

        {/* Mountains */}
        <div className="absolute bottom-0 left-0 right-0 z-[5]">
          <svg
            viewBox="0 0 1440 380"
            className="w-full block"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,380 L0,240 Q120,140 280,200 Q420,110 580,190 Q720,90 900,170 Q1060,80 1200,180 Q1340,130 1440,200 L1440,380Z"
              fill="#292524"
              opacity="0.5"
            />
            <path
              d="M0,380 L0,270 Q160,180 320,250 Q460,170 620,240 Q780,150 940,220 Q1100,160 1260,230 Q1370,200 1440,250 L1440,380Z"
              fill="#292524"
              opacity="0.8"
            />
            <path
              d="M0,380 L0,300 Q200,250 400,300 Q580,250 760,290 Q940,250 1120,290 Q1300,260 1440,300 L1440,380Z"
              fill="#1c1917"
            />
          </svg>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-[#1c1917] relative py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-amber-400/80 text-sm font-semibold tracking-widest uppercase mb-3">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Three Steps Between &quot;We Should Go&quot; and Actually Going
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              No endless threads, no awkward budget debates, no one-person trip
              planning burden.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {STEPS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative group p-7 rounded-2xl bg-stone-900/60 border border-stone-800/60 hover:border-stone-700/60 transition-colors"
              >
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${item.gradient} text-white mb-5`}
                >
                  {item.icon}
                </div>
                <span className="absolute top-7 right-7 text-5xl font-black text-stone-800/80 select-none">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold text-white mb-2.5">
                  {item.title}
                </h3>
                <p className="text-slate-400 leading-relaxed text-[0.95rem]">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-stone-950 py-28 px-6 border-t border-stone-800/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-amber-400/80 text-sm font-semibold tracking-widest uppercase mb-3">
                Why ItineraryAI
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-snug">
                We Solve the Part That Usually{" "}
                <span className="bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text text-transparent">
                  Kills the Trip
                </span>{" "}
                Before It Starts
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">
                Most group trips do not fail because people do not want to
                travel. They fail because budgets clash, preferences pull in
                different directions, and nobody wants to play referee. We
                collect the truth, surface the conflicts, and let AI build the
                compromise.
              </p>

              <div className="space-y-5">
                {FEATURES.map((feat, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-0.5 p-2 rounded-lg bg-amber-500/10 text-amber-400">
                      {feat.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        {feat.title}
                      </h4>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="p-7 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-900/80 border border-stone-800/60 font-mono text-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  <span className="ml-2 text-xs text-slate-600 font-sans">
                    AI Reasoning Engine
                  </span>
                </div>
                <div className="space-y-3 leading-relaxed">
                  <p className="text-slate-500">
                    <span className="text-emerald-400/80">aggregating</span> 5
                    anonymous responses...
                  </p>
                  <p className="text-slate-500">
                    <span className="text-amber-400/80">detecting</span>{" "}
                    budget and travel-style conflicts...
                  </p>
                  <p className="text-slate-500">
                    <span className="text-sky-400/80">planner</span> analyzing
                    group constraints and common ground...
                  </p>
                  <p className="text-slate-500">
                    <span className="text-violet-400/80">tools</span>{" "}
                    researching stays, transport, and destination options...
                  </p>
                  <p className="text-slate-500">
                    <span className="text-cyan-400/80">critic</span> reviewing
                    itinerary against budget and non-negotiables...
                  </p>
                  <div className="mt-4 pt-4 border-t border-stone-800">
                    <p className="text-amber-300/90">
                      ✓ Shared itinerary ready with realistic costs, clear
                      trade-offs, and less drama.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-28 px-6 bg-[#1c1917]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
            Make the Trip Happen Before It Becomes Another Group Joke
          </h2>
          <p className="text-slate-500 text-lg mb-10">
            Create the trip, share one link, and let the app do the peaceful
            negotiating for you.
          </p>
          {user ? (
            <button
              onClick={handleCreateTrip}
              className="group inline-flex items-center gap-3 px-9 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-lg rounded-full shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
            >
              Start Planning
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          ) : (
            <div className="mx-auto flex justify-center">
              <GoogleSignInPanel
                onSignIn={(credential) => {
                  signIn(credential);
                }}
                title="Start with Google"
                subtitle="Sign in once to create trips, track responses, and generate shareable itineraries."
                width="280"
              />
            </div>
          )}
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-stone-950 border-t border-stone-800/40 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Compass className="w-5 h-5 text-amber-400" />
            ItineraryAI
          </div>
          <p className="text-slate-600 text-sm">
            Built to turn group trip ideas into actual group trips.
          </p>
        </div>
      </footer>

      {/* Modal */}
      {showModal && <CreateTripModal onClose={() => setShowModal(false)} />}
    </main>
  );
}

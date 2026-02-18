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
} from "lucide-react";
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
      "Name your trip, set the duration, and get a shareable link in seconds. Send it to your WhatsApp group and you're done.",
    step: "01",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: "Everyone Votes",
    description:
      "Each member privately fills out their budget, food preferences, travel style, and dealbreakers. No peer pressure.",
    step: "02",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: <Sparkles className="w-7 h-7" />,
    title: "AI Plans It All",
    description:
      "Our AI reasons through trade-offs, checks real pricing, and builds a day-by-day itinerary that respects everyone's boundaries.",
    step: "03",
    gradient: "from-violet-500 to-purple-500",
  },
];

const FEATURES = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Anonymous Preferences",
    description: "No one sees anyone else's answers. Honest input, better trips.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Instant Itineraries",
    description: "From survey to itinerary in under a minute. No manual planning.",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Smart Negotiation",
    description:
      "AI balances luxury seekers and budget travelers with creative compromises.",
  },
];

export default function Home() {
  const [showModal, setShowModal] = useState(false);

  return (
    <main className="bg-stone-950">
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
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
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-white font-bold text-xl">
              <Compass className="w-6 h-6 text-amber-400" />
              ItineraryAI
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-full bg-white/[0.08] backdrop-blur-sm border border-white/[0.08] text-white text-sm font-medium hover:bg-white/[0.15] transition-colors cursor-pointer"
            >
              Create Trip
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] text-amber-300/90 text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Group Travel Planning
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-7 leading-[1.08] tracking-tight"
          >
            Where Group Chaos
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">
              Becomes Adventure
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Stop drowning in WhatsApp threads. Everyone shares their preferences
            privately, and our AI crafts the itinerary your whole group will
            love.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.36 }}
          >
            <button
              onClick={() => setShowModal(true)}
              className="group inline-flex items-center gap-3 px-9 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-lg rounded-full shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Plan Your Trip
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
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
              Three Steps to the Perfect Trip
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              No more 200-message threads. No more one person doing all the
              work.
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
                AI That Actually{" "}
                <span className="bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text text-transparent">
                  Understands
                </span>{" "}
                Group Dynamics
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">
                Our AI doesn&apos;t just average preferences. It reasons through
                trade-offs like a seasoned travel agent — finding creative
                solutions that respect every member&apos;s constraints.
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
                    <span className="text-emerald-400/80">analyzing</span>{" "}
                    5 member preferences...
                  </p>
                  <p className="text-slate-500">
                    <span className="text-amber-400/80">conflict</span>{" "}
                    &quot;Friend A wants luxury, Friend B has tight
                    budget&quot;
                  </p>
                  <p className="text-slate-500">
                    <span className="text-violet-400/80">searching</span>{" "}
                    boutique stays under ₹2,000/night...
                  </p>
                  <p className="text-slate-500">
                    <span className="text-emerald-400/80">found</span>{" "}
                    &quot;The Wanderer&apos;s Nest&quot; — ₹1,200/night, 4.8★
                  </p>
                  <div className="mt-4 pt-4 border-t border-stone-800">
                    <p className="text-amber-300/90">
                      ✓ Luxury feel at budget price. Everyone&apos;s happy.
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
            Ready to Plan Without the Drama?
          </h2>
          <p className="text-slate-500 text-lg mb-10">
            Create your trip, share the link, and let AI handle the rest.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="group inline-flex items-center gap-3 px-9 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-lg rounded-full shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
          >
            Start Planning
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
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
            Built with AI to make group travel actually fun.
          </p>
        </div>
      </footer>

      {/* Modal */}
      {showModal && <CreateTripModal onClose={() => setShowModal(false)} />}
    </main>
  );
}

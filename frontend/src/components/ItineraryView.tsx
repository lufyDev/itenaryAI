"use client";

import {
  Sunrise,
  Sun,
  Moon,
  Hotel,
  Scale,
  IndianRupee,
  MapPin,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Itinerary, ItineraryDay } from "@/lib/api";

function formatCost(amount: number | undefined) {
  if (amount == null) return "—";
  return amount.toLocaleString("en-IN");
}

function TimeSlot({
  icon,
  label,
  text,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400 shrink-0">
          {icon}
        </div>
        <div className="w-px flex-1 bg-stone-800 mt-1" />
      </div>
      <div className="pb-5">
        <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function DayCard({ day, index }: { day: ItineraryDay; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="rounded-2xl bg-stone-900/50 border border-stone-800/50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
            <MapPin className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">Day {day.day}</h3>
          </div>
        </div>
        <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg">
          <IndianRupee className="w-3.5 h-3.5" />
          {formatCost(day.estimatedCostPerPerson)}
          <span className="text-emerald-400/60 text-xs ml-0.5">/person</span>
        </div>
      </div>

      <div className="px-6 pt-5">
        <TimeSlot
          icon={<Sunrise className="w-4 h-4" />}
          label="Morning"
          text={day.morning}
        />
        <TimeSlot
          icon={<Sun className="w-4 h-4" />}
          label="Afternoon"
          text={day.afternoon}
        />
        <TimeSlot
          icon={<Moon className="w-4 h-4" />}
          label="Evening"
          text={day.evening}
        />
      </div>

      <div className="mx-6 mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-stone-800/60 text-slate-300">
        <Hotel className="w-4 h-4 text-amber-400/60 shrink-0" />
        <span className="text-sm">{day.stay}</span>
      </div>
    </motion.div>
  );
}

export default function ItineraryView({
  itinerary,
}: {
  itinerary: Itinerary;
}) {
  return (
    <div className="space-y-5">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/15"
      >
        <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Trip Summary
        </p>
        <p className="text-white/90 text-base leading-relaxed mb-5">
          {itinerary.summary}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900/80 border border-stone-700/50">
          <Wallet className="w-4 h-4 text-amber-400" />
          <span className="text-white font-semibold">
            ₹{formatCost(itinerary.totalEstimatedCostPerPerson)}
          </span>
          <span className="text-slate-500 text-sm">per person total</span>
        </div>
      </motion.div>

      {/* Day Cards */}
      <div className="space-y-4">
        {(itinerary.days ?? []).map((day, i) => (
          <DayCard key={day.day} day={day} index={i} />
        ))}
      </div>

      {/* Trade-offs */}
      {itinerary.tradeOffExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (itinerary.days?.length ?? 0) * 0.08 + 0.1 }}
          className="p-6 rounded-2xl bg-stone-900/50 border border-violet-500/15"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Scale className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-violet-400 text-sm font-semibold">
              Trade-offs & Reasoning
            </p>
          </div>
          <p className="text-slate-400 leading-relaxed text-sm pl-[2.625rem]">
            {itinerary.tradeOffExplanation}
          </p>
        </motion.div>
      )}
    </div>
  );
}

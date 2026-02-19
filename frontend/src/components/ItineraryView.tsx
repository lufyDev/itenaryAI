"use client";

import { Sunrise, Sun, Moon, Home, Scale, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";
import type { Itinerary, ItineraryDay } from "@/lib/api";

function formatCost(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function TimeSlot({
  icon,
  label,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <div className="flex gap-3.5">
      <div className="mt-0.5 text-amber-400/50">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function DayCard({ day, index }: { day: ItineraryDay; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800/60"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400 text-sm font-bold">
            {day.day}
          </span>
          <h3 className="text-lg font-bold text-white">Day {day.day}</h3>
        </div>
        <span className="text-sm text-slate-500 flex items-center gap-1">
          <IndianRupee className="w-3.5 h-3.5" />
          {day.estimatedCostPerPerson.toLocaleString("en-IN")}/person
        </span>
      </div>

      <div className="space-y-4">
        <TimeSlot
          icon={<Sunrise className="w-4 h-4" />}
          label="Morning"
          description={day.morning}
        />
        <TimeSlot
          icon={<Sun className="w-4 h-4" />}
          label="Afternoon"
          description={day.afternoon}
        />
        <TimeSlot
          icon={<Moon className="w-4 h-4" />}
          label="Evening"
          description={day.evening}
        />
      </div>

      <div className="mt-5 pt-4 border-t border-stone-800/60 flex items-center gap-2.5 text-slate-400">
        <Home className="w-4 h-4 shrink-0" />
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
    <div className="space-y-6">
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20"
      >
        <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
          Trip Summary
        </p>
        <p className="text-white text-lg leading-relaxed mb-4">
          {itinerary.summary}
        </p>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 text-sm font-semibold">
          <IndianRupee className="w-4 h-4" />
          {formatCost(itinerary.totalEstimatedCostPerPerson)} / person total
        </div>
      </motion.div>

      {/* Day Cards */}
      <div className="space-y-4">
        {itinerary.days.map((day, i) => (
          <DayCard key={day.day} day={day} index={i} />
        ))}
      </div>

      {/* Trade-offs */}
      {itinerary.tradeOffExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: itinerary.days.length * 0.1 }}
          className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800/60"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <Scale className="w-5 h-5 text-violet-400" />
            <p className="text-violet-400 text-sm font-semibold">
              Trade-offs & Reasoning
            </p>
          </div>
          <p className="text-slate-400 leading-relaxed text-[0.95rem]">
            {itinerary.tradeOffExplanation}
          </p>
        </motion.div>
      )}
    </div>
  );
}

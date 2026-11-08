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
  AlertTriangle,
  Bus,
  Compass,
  UtensilsCrossed,
  BedDouble,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Itinerary, ItineraryDay, ScheduleEntry, ScheduleKind } from "@/lib/api";
import { entrySpan, formatClock, formatDuration } from "@/lib/schedule";

const KIND_ICONS: Record<ScheduleKind, React.ReactNode> = {
  travel: <Bus className="w-4 h-4" />,
  activity: <Compass className="w-4 h-4" />,
  meal: <UtensilsCrossed className="w-4 h-4" />,
  rest: <BedDouble className="w-4 h-4" />,
};

function formatCost(amount: number | undefined) {
  if (amount == null) return "—";
  return amount.toLocaleString("en-IN");
}

function TimelineRow({
  icon,
  heading,
  text,
  highlight = false,
}: {
  icon: React.ReactNode;
  heading: React.ReactNode;
  text: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            highlight ? "bg-sky-500/15 text-sky-300" : "bg-stone-800 text-amber-400"
          }`}
        >
          {icon}
        </div>
        <div className="w-px flex-1 bg-stone-800 mt-1" />
      </div>
      <div className="pb-5 min-w-0">
        <p className="text-xs font-semibold text-amber-400/80 tracking-wide mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          {heading}
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function ScheduleRow({ entry }: { entry: ScheduleEntry }) {
  const span = entrySpan(entry.start, entry.end);
  return (
    <TimelineRow
      icon={KIND_ICONS[entry.kind] ?? <Compass className="w-4 h-4" />}
      highlight={span?.overnight}
      heading={
        <>
          <span>
            {formatClock(entry.start)} – {formatClock(entry.end)}
          </span>
          {span?.overnight && (
            <span className="px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-300 text-[11px] font-medium">
              <Moon className="w-3 h-3 inline -mt-0.5 mr-1" />
              arrives next day
            </span>
          )}
          {span && span.minutes > 0 && (
            <span className="text-slate-500 font-normal">
              {formatDuration(span.minutes)}
            </span>
          )}
        </>
      }
      text={entry.activity}
    />
  );
}

function LegacySlots({ day }: { day: ItineraryDay }) {
  const slots = [
    { label: "Morning", icon: <Sunrise className="w-4 h-4" />, text: day.morning },
    { label: "Afternoon", icon: <Sun className="w-4 h-4" />, text: day.afternoon },
    { label: "Evening", icon: <Moon className="w-4 h-4" />, text: day.evening },
  ];
  return (
    <>
      {slots
        .filter((slot) => slot.text)
        .map((slot) => (
          <TimelineRow
            key={slot.label}
            icon={slot.icon}
            heading={<span className="uppercase tracking-wider">{slot.label}</span>}
            text={slot.text as string}
          />
        ))}
    </>
  );
}

export interface TripRoute {
  source: string;
  destination: string;
  durationDays: number;
}

/**
 * Day 1..N are the days at the destination. Day 0 and Day N+1 are travel days
 * around them (e.g. the Friday-night bus for a Sat-Mon trip), so they get
 * their own names instead of numbers that look like extra holiday days.
 */
function dayHeading(day: ItineraryDay, route?: TripRoute) {
  if (day.day === 0) {
    return {
      title: "Departure",
      subtitle: route
        ? `Leave ${route.source} · the day before Day 1`
        : "The day before Day 1",
      travel: true,
    };
  }
  if (route && day.day > route.durationDays) {
    return {
      title: "Return",
      subtitle: `Back to ${route.source} · the day after Day ${route.durationDays}`,
      travel: true,
    };
  }
  return { title: `Day ${day.day}`, subtitle: null, travel: false };
}

function DayCard({
  day,
  index,
  route,
}: {
  day: ItineraryDay;
  index: number;
  route?: TripRoute;
}) {
  const heading = dayHeading(day, route);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="rounded-2xl bg-stone-900/50 border border-stone-800/50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800/50">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              heading.travel
                ? "bg-sky-500/10"
                : "bg-gradient-to-br from-amber-500/20 to-orange-500/10"
            }`}
          >
            {heading.travel ? (
              <Bus className="w-4.5 h-4.5 text-sky-300" />
            ) : (
              <MapPin className="w-4.5 h-4.5 text-amber-400" />
            )}
          </div>
          <div>
            <h3 className="text-white font-bold">{heading.title}</h3>
            {heading.subtitle && (
              <p className="text-slate-500 text-xs mt-0.5">{heading.subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg">
          <IndianRupee className="w-3.5 h-3.5" />
          {formatCost(day.estimatedCostPerPerson)}
          <span className="text-emerald-400/60 text-xs ml-0.5">/person</span>
        </div>
      </div>

      <div className="px-6 pt-5">
        {day.schedule?.length ? (
          day.schedule.map((entry, i) => <ScheduleRow key={i} entry={entry} />)
        ) : (
          <LegacySlots day={day} />
        )}
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
  issues = [],
  route,
}: {
  itinerary: Itinerary;
  issues?: string[];
  // Lets travel days (Day 0, Day N+1) be labelled as departure and return.
  route?: TripRoute;
}) {
  return (
    <div className="space-y-5">
      {issues.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-amber-300 text-sm font-semibold">
              Double-check this plan
            </p>
          </div>
          <p className="text-slate-400 text-sm mb-2">
            Our AI reviewer still had concerns after several revisions:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-300 text-sm">
            {issues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

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
          <DayCard key={day.day} day={day} index={i} route={route} />
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

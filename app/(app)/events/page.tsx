"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Users, Crown, Zap } from "lucide-react";
import clsx from "clsx";

type Category = "all" | "motorsport" | "art" | "finance" | "culture" | "travel" | "sport";

interface EliteEvent {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  country: string;
  dateRange: string;
  category: Category;
  price: string;
  capacity: number;
  rsvpCount: number;
  accentFrom: string;
  accentTo: string;
  exclusive: boolean;
  description: string;
}

const EVENTS: EliteEvent[] = [
  {
    id: "mgp",
    title: "Monaco Grand Prix",
    subtitle: "VIP Paddock Club & Superyacht",
    location: "Circuit de Monaco",
    country: "Monaco",
    dateRange: "May 22–25, 2027",
    category: "motorsport",
    price: "€28,000 pp",
    capacity: 36,
    rsvpCount: 29,
    accentFrom: "from-red-950/80",
    accentTo: "to-surface-900",
    exclusive: true,
    description:
      "The crown jewel of Formula 1. Paddock Club access, a chartered superyacht in the harbour, and invitations to the exclusive post-race gala — attended by drivers, royalty, and industry leaders.",
  },
  {
    id: "artbasel",
    title: "Art Basel Miami Beach",
    subtitle: "Collector Preview & Private Dinners",
    location: "Miami Beach Convention Center",
    country: "USA",
    dateRange: "December 2–7, 2026",
    category: "art",
    price: "$14,000 pp",
    capacity: 52,
    rsvpCount: 38,
    accentFrom: "from-violet-950/80",
    accentTo: "to-surface-900",
    exclusive: false,
    description:
      "Exclusive preview access before the public opening. Guided tours with top gallery directors, private collector dinners, and studio visits with blue-chip artists.",
  },
  {
    id: "davos",
    title: "Davos Alpine Retreat",
    subtitle: "WEF Fringe · Private Chalet Sessions",
    location: "Davos Platz",
    country: "Switzerland",
    dateRange: "January 19–23, 2027",
    category: "finance",
    price: "CHF 42,000 pp",
    capacity: 18,
    rsvpCount: 15,
    accentFrom: "from-blue-950/80",
    accentTo: "to-surface-900",
    exclusive: true,
    description:
      "An intimate, off-programme gathering during the World Economic Forum. Private roundtables with sovereign fund managers, tech founders, and heads of state — in an exclusive rented chalet.",
  },
  {
    id: "cannes",
    title: "Cannes Film Festival",
    subtitle: "Palais Access & Red Carpet",
    location: "Palais des Festivals",
    country: "France",
    dateRange: "May 13–23, 2027",
    category: "culture",
    price: "€19,500 pp",
    capacity: 40,
    rsvpCount: 27,
    accentFrom: "from-amber-950/80",
    accentTo: "to-surface-900",
    exclusive: false,
    description:
      "Screening invitations, red carpet access, and private yacht dinners with film industry luminaries. The world's most glamorous cultural event — experienced at its absolute finest.",
  },
  {
    id: "maldives",
    title: "Private Island Retreat",
    subtitle: "North Malé Atoll · Members Only",
    location: "Velaa Private Island",
    country: "Maldives",
    dateRange: "March 5–12, 2027",
    category: "travel",
    price: "$26,000 pp",
    capacity: 20,
    rsvpCount: 14,
    accentFrom: "from-cyan-950/80",
    accentTo: "to-surface-900",
    exclusive: true,
    description:
      "An entire private island reserved exclusively for EliteMatch members. Overwater villas, bespoke diving expeditions, Michelin-calibre dining, and curated connection evenings at sunset.",
  },
  {
    id: "wimbledon",
    title: "Wimbledon Championships",
    subtitle: "Royal Box & Debenture Seats",
    location: "All England Club",
    country: "United Kingdom",
    dateRange: "July 1–6, 2027",
    category: "sport",
    price: "£16,000 pp",
    capacity: 30,
    rsvpCount: 24,
    accentFrom: "from-emerald-950/80",
    accentTo: "to-surface-900",
    exclusive: false,
    description:
      "Centre Court debenture seats for the final week. Champagne garden, strawberries and cream, and exclusive post-match player receptions at the most storied tennis tournament on earth.",
  },
  {
    id: "venice",
    title: "Venice Biennale",
    subtitle: "Vernissage & Palazzo Dinners",
    location: "Giardini & Arsenale",
    country: "Italy",
    dateRange: "April 23–27, 2027",
    category: "art",
    price: "€11,000 pp",
    capacity: 45,
    rsvpCount: 22,
    accentFrom: "from-rose-950/80",
    accentTo: "to-surface-900",
    exclusive: false,
    description:
      "Vernissage week access to the world's oldest and most prestigious art exhibition. Private palazzo dinners, gondola evenings, and curated studio visits across the lagoon city.",
  },
  {
    id: "leman",
    title: "24 Hours of Le Mans",
    subtitle: "La Sarthe Hospitality Suite",
    location: "Circuit de la Sarthe",
    country: "France",
    dateRange: "June 12–15, 2027",
    category: "motorsport",
    price: "€9,500 pp",
    capacity: 50,
    rsvpCount: 31,
    accentFrom: "from-orange-950/80",
    accentTo: "to-surface-900",
    exclusive: false,
    description:
      "The ultimate endurance race. A private hospitality suite with trackside views, paddock walk access, and an unforgettable overnight experience as the cars thunder through the dark.",
  },
];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All Events" },
  { value: "motorsport", label: "Motorsport" },
  { value: "art", label: "Art & Design" },
  { value: "finance", label: "Finance" },
  { value: "culture", label: "Culture" },
  { value: "travel", label: "Travel" },
  { value: "sport", label: "Sport" },
];

export default function EventsPage() {
  const [category, setCategory] = useState<Category>("all");
  const [rsvpd, setRsvpd] = useState<Set<string>>(new Set());

  const visible = EVENTS.filter(
    (e) => category === "all" || e.category === category
  );

  function toggleRsvp(id: string) {
    setRsvpd((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gold-500 text-xs tracking-[0.3em] uppercase mb-3">
          Exclusive to Verified Members
        </p>
        <h1 className="font-serif text-4xl text-white mb-3">Elite Events</h1>
        <p className="text-white/40 text-sm max-w-lg leading-relaxed">
          Curated experiences at the world&apos;s most extraordinary venues. Meet fellow
          members in settings worthy of your ambitions.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setCategory(value)}
            className={clsx(
              "flex-shrink-0 px-4 py-2 rounded-xl border text-sm transition-all",
              category === value
                ? "border-gold-500/60 bg-gold-500/10 text-gold-400"
                : "border-surface-500 text-white/40 hover:border-white/20 hover:text-white/60"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {visible.map((event, i) => {
            const filled = Math.round((event.rsvpCount / event.capacity) * 100);
            const almostFull = event.rsvpCount >= event.capacity - 4;
            const attending = rsvpd.has(event.id);

            return (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className={`relative card overflow-hidden bg-gradient-to-br ${event.accentFrom} ${event.accentTo}`}
              >
                <div className="p-6">
                  {/* Badge row */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {event.exclusive && (
                      <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gold-500/15 border border-gold-500/40 text-gold-400">
                        <Crown size={10} /> Members Only
                      </span>
                    )}
                    <span className="text-xs px-2.5 py-1 rounded-full bg-surface-700/70 border border-surface-500 text-white/40 capitalize">
                      {event.category}
                    </span>
                    {almostFull && (
                      <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
                        <Zap size={9} /> Almost Full
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Left info */}
                    <div className="flex-1 min-w-0">
                      <h2 className="font-serif text-2xl text-white mb-0.5">
                        {event.title}
                      </h2>
                      <p className="text-gold-500/70 text-sm mb-3">{event.subtitle}</p>
                      <p className="text-white/50 text-sm leading-relaxed mb-4">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-white/35 text-xs">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={12} />
                          {event.location}, {event.country}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {event.dateRange}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users size={12} />
                          {event.rsvpCount + (attending ? 1 : 0)}/{event.capacity} attending
                        </span>
                      </div>
                    </div>

                    {/* Right: price + RSVP */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-4 flex-shrink-0">
                      <div className="text-left md:text-right">
                        <p className="text-white/30 text-xs mb-0.5">from</p>
                        <p className="text-white font-semibold text-lg">{event.price}</p>
                      </div>

                      {/* Capacity bar */}
                      <div className="w-28 hidden md:block">
                        <div className="flex justify-between text-white/25 text-[10px] mb-1">
                          <span>{filled}% booked</span>
                        </div>
                        <div className="h-1 bg-surface-500 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gold-500/70 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, filled + (attending ? Math.round(100 / event.capacity) : 0))}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => toggleRsvp(event.id)}
                        className={clsx(
                          "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
                          attending
                            ? "bg-gold-500/20 border border-gold-500/60 text-gold-400"
                            : "btn-gold"
                        )}
                      >
                        {attending ? "✓ Attending" : "RSVP"}
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Gold left accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gold-500/30" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {visible.length === 0 && (
        <div className="text-center py-20 text-white/30">
          No events in this category yet — check back soon.
        </div>
      )}
    </div>
  );
}

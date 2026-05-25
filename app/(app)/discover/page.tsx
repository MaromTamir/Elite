"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { X, Heart, Star, SlidersHorizontal, RefreshCw } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import SwipeCard, { SwipeCardHandle } from "@/components/SwipeCard";
import MatchModal from "@/components/MatchModal";
import FilterPanel, { Filters, DEFAULT_FILTERS } from "@/components/FilterPanel";
import { Profile } from "@/lib/types";
import { subYears, format } from "date-fns";

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [match, setMatch] = useState<Profile | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<Filters>(DEFAULT_FILTERS);

  const cardRef = useRef<SwipeCardHandle>(null);

  useEffect(() => {
    loadProfiles(filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProfiles(f: Filters) {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: swiped } = await supabase
      .from("swipes")
      .select("swiped_id")
      .eq("swiper_id", user.id);
    const swipedIds = [...(swiped ?? []).map((s) => s.swiped_id), user.id];

    let query = supabase
      .from("profiles")
      .select("*")
      .eq("verification_status", "verified")
      .limit(30);

    if (swipedIds.length > 0) {
      query = query.not("id", "in", `(${swipedIds.join(",")})`);
    }
    if (f.minAge > 18) {
      query = query.lte(
        "birth_date",
        format(subYears(new Date(), f.minAge), "yyyy-MM-dd")
      );
    }
    if (f.maxAge < 80) {
      query = query.gte(
        "birth_date",
        format(subYears(new Date(), f.maxAge + 1), "yyyy-MM-dd")
      );
    }
    if (f.wealthTiers.length > 0) query = query.in("wealth_tier", f.wealthTiers);
    if (f.genders.length > 0) query = query.in("gender", f.genders);

    const { data } = await query;
    setProfiles(data ?? []);
    setIndex(0);
    setLoading(false);
  }

  const handleSwipe = useCallback(
    async (profile: Profile, action: "like" | "pass" | "super_like") => {
      setSwiping(true);
      try {
        const res = await fetch("/api/swipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ swiped_id: profile.id, action }),
        });
        const json = await res.json();
        if (action !== "pass" && json.matched) {
          setMatch(profile);
          setMatchId(json.match_id);
        }
      } catch {
        // silently continue
      }
      setIndex((i) => i + 1);
      setSwiping(false);
    },
    []
  );

  const triggerSwipe = useCallback(
    (action: "like" | "pass" | "super_like") => {
      if (swiping || !profiles[index]) return;
      cardRef.current?.swipe(action);
    },
    [swiping, profiles, index]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") triggerSwipe("pass");
      if (e.key === "ArrowRight") triggerSwipe("like");
      if (e.key === "ArrowUp") triggerSwipe("super_like");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [triggerSwipe]);

  const activeFilterCount =
    filters.wealthTiers.length +
    filters.genders.length +
    (filters.minAge > 18 ? 1 : 0) +
    (filters.maxAge < 80 ? 1 : 0);

  const stack = profiles.slice(index, index + 3);
  const current = profiles[index];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-5">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="font-serif text-gold-500 text-3xl tracking-[0.3em]"
        >
          ELITEMATCH
        </motion.div>
        <p className="text-white/25 text-sm tracking-widest">
          Finding your matches…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 pb-8">
      {match && (
        <MatchModal
          profile={match}
          matchId={matchId ?? undefined}
          onClose={() => setMatch(null)}
        />
      )}
      {showFilters && (
        <FilterPanel
          filters={pendingFilters}
          onChange={setPendingFilters}
          onClose={() => setShowFilters(false)}
          onApply={() => {
            setFilters(pendingFilters);
            loadProfiles(pendingFilters);
          }}
        />
      )}

      {/* Top bar */}
      <div className="w-full max-w-sm flex items-center justify-between">
        <h1 className="font-serif text-xl text-white tracking-wide">Discover</h1>
        <button
          onClick={() => {
            setPendingFilters(filters);
            setShowFilters(true);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-colors ${
            activeFilterCount > 0
              ? "border-gold-500/60 text-gold-400 bg-gold-500/10"
              : "border-surface-500 text-white/40 hover:border-white/20 hover:text-white/60"
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-gold-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {!current ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-80 gap-4 text-center px-4"
        >
          <div className="text-4xl font-serif text-white/15">✦</div>
          <p className="text-white/50 text-xl font-serif">
            {activeFilterCount > 0 ? "No matches for these filters" : "You've seen everyone"}
          </p>
          <p className="text-white/30 text-sm max-w-xs leading-relaxed">
            {activeFilterCount > 0
              ? "Adjust your filters to discover more elite members"
              : "New verified members join every week — check back soon"}
          </p>
          <div className="flex gap-3 mt-2">
            {activeFilterCount > 0 && (
              <button
                className="btn-gold text-sm"
                onClick={() => {
                  setFilters(DEFAULT_FILTERS);
                  loadProfiles(DEFAULT_FILTERS);
                }}
              >
                Clear Filters
              </button>
            )}
            <button
              className="btn-ghost text-sm flex items-center gap-2"
              onClick={() => loadProfiles(filters)}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Card stack */}
          <div className="relative w-full max-w-sm" style={{ height: 520 }}>
            {stack.map((profile, i) => (
              <SwipeCard
                key={profile.id}
                ref={i === 0 ? cardRef : undefined}
                profile={profile}
                stackOffset={i}
                onSwipe={(action) => handleSwipe(profile, action)}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-5">
            {/* Pass */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => triggerSwipe("pass")}
              disabled={swiping}
              className="w-16 h-16 rounded-full bg-surface-700 border-2 border-surface-500
                         hover:border-red-500/70 flex items-center justify-center
                         text-white/40 hover:text-red-400 transition-colors
                         disabled:opacity-30 shadow-xl"
            >
              <X size={26} />
            </motion.button>

            {/* Super Like */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => triggerSwipe("super_like")}
              disabled={swiping}
              className="w-13 h-13 w-12 h-12 rounded-full bg-surface-700 border-2 border-surface-500
                         hover:border-gold-500/70 flex items-center justify-center
                         text-white/30 hover:text-gold-400 transition-colors
                         disabled:opacity-30 shadow-xl"
            >
              <Star size={20} />
            </motion.button>

            {/* Like */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => triggerSwipe("like")}
              disabled={swiping}
              className="w-16 h-16 rounded-full bg-surface-700 border-2 border-surface-500
                         hover:border-emerald-500/70 flex items-center justify-center
                         text-white/40 hover:text-emerald-400 transition-colors
                         disabled:opacity-30 shadow-xl"
            >
              <Heart size={26} />
            </motion.button>
          </div>

          <p className="text-white/20 text-xs text-center">
            {profiles.length - index - 1} remaining · ← / → keys ·{" "}
            <Link href="/matches" className="hover:text-white/40 transition-colors underline underline-offset-2">
              View matches
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

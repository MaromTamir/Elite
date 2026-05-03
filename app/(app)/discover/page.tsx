"use client";
import { useEffect, useState, useCallback } from "react";
import { X, Heart, Star, SlidersHorizontal, Info } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import ProfileCard from "@/components/ProfileCard";
import MatchModal from "@/components/MatchModal";
import FilterPanel, { Filters, DEFAULT_FILTERS } from "@/components/FilterPanel";
import { Profile } from "@/lib/types";
import { subYears, format } from "date-fns";

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const [match, setMatch] = useState<Profile | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<Filters>(DEFAULT_FILTERS);

  useEffect(() => { loadProfiles(filters); }, []);

  async function loadProfiles(f: Filters) {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: swiped } = await supabase
      .from("swipes").select("swiped_id").eq("swiper_id", user.id);
    const swipedIds = [(swiped ?? []).map(s => s.swiped_id), user.id].flat();

    let query = supabase.from("profiles").select("*")
      .eq("verification_status", "verified")
      .limit(30);

    if (swipedIds.length > 0) {
      query = query.not("id", "in", `(${swipedIds.join(",")})`);
    }

    // Age filter → convert to birth_date range
    if (f.minAge > 18) {
      query = query.lte("birth_date", format(subYears(new Date(), f.minAge), "yyyy-MM-dd"));
    }
    if (f.maxAge < 80) {
      query = query.gte("birth_date", format(subYears(new Date(), f.maxAge + 1), "yyyy-MM-dd"));
    }

    // Wealth filter
    if (f.wealthTiers.length > 0) {
      query = query.in("wealth_tier", f.wealthTiers);
    }

    // Gender filter
    if (f.genders.length > 0) {
      query = query.in("gender", f.genders);
    }

    const { data } = await query;
    setProfiles(data ?? []);
    setIndex(0);
    setLoading(false);
  }

  function applyFilters() {
    setFilters(pendingFilters);
    loadProfiles(pendingFilters);
  }

  const swipe = useCallback(async (action: "like" | "pass" | "super_like") => {
    const profile = profiles[index];
    if (!profile) return;

    const res = await fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ swiped_id: profile.id, action }),
    });
    const json = await res.json();

    if (action !== "pass" && json.matched) {
      setMatch(profile);
      setMatchId(json.match_id);
    } else {
      setActionMsg(action === "super_like" ? "Super Like ★" : action === "like" ? "Liked ♥" : "Passed");
      setTimeout(() => setActionMsg(""), 900);
    }

    setIndex(i => i + 1);
  }, [profiles, index]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") swipe("pass");
      if (e.key === "ArrowRight") swipe("like");
      if (e.key === "ArrowUp") swipe("super_like");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [swipe]);

  const activeFilterCount = (filters.wealthTiers.length + filters.genders.length)
    + (filters.minAge > 18 ? 1 : 0) + (filters.maxAge < 80 ? 1 : 0);

  const current = profiles[index];

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-white/30 text-sm">Finding your matches…</div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6">
      {match && <MatchModal profile={match} matchId={matchId ?? undefined} onClose={() => setMatch(null)} />}
      {showFilters && (
        <FilterPanel
          filters={pendingFilters}
          onChange={setPendingFilters}
          onClose={() => setShowFilters(false)}
          onApply={applyFilters}
        />
      )}

      {/* Filter button */}
      <div className="w-full max-w-sm flex justify-end">
        <button onClick={() => { setPendingFilters(filters); setShowFilters(true); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-colors ${
            activeFilterCount > 0
              ? "border-gold-500/60 text-gold-400 bg-gold-500/10"
              : "border-surface-500 text-white/40 hover:border-white/20 hover:text-white/60"}`}>
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-gold-500 text-black text-xs font-bold w-4 h-4 rounded-full
                             flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {!current ? (
        <div className="flex flex-col items-center justify-center h-72 gap-4">
          <div className="text-white/20 text-5xl font-serif">✦</div>
          <p className="text-white/50 text-lg font-serif">
            {activeFilterCount > 0 ? "No matches for these filters" : "You've seen everyone"}
          </p>
          <p className="text-white/30 text-sm">
            {activeFilterCount > 0 ? "Try adjusting your filters" : "Check back soon for new members"}
          </p>
          <div className="flex gap-3 mt-2">
            {activeFilterCount > 0 && (
              <button className="btn-gold text-sm"
                onClick={() => { setFilters(DEFAULT_FILTERS); loadProfiles(DEFAULT_FILTERS); }}>
                Clear Filters
              </button>
            )}
            <button className="btn-ghost text-sm"
              onClick={() => loadProfiles(filters)}>
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="w-full max-w-sm relative">
            {profiles[index + 1] && (
              <div className="absolute inset-0 translate-y-3 scale-95 opacity-30 pointer-events-none rounded-2xl overflow-hidden">
                <ProfileCard profile={profiles[index + 1]} blurred />
              </div>
            )}
            {actionMsg && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <span className="bg-black/70 text-white text-2xl px-6 py-3 rounded-2xl font-serif">
                  {actionMsg}
                </span>
              </div>
            )}
            <ProfileCard profile={current} />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-5">
            <button onClick={() => swipe("pass")}
              className="w-14 h-14 rounded-full border-2 border-surface-500 hover:border-red-500/60
                         flex items-center justify-center text-white/40 hover:text-red-400 transition-all">
              <X size={22} />
            </button>
            <Link href={`/members/${current.id}`}
              className="w-10 h-10 rounded-full border border-surface-500 hover:border-white/30
                         flex items-center justify-center text-white/25 hover:text-white/50 transition-all">
              <Info size={15} />
            </Link>
            <button onClick={() => swipe("super_like")}
              className="w-12 h-12 rounded-full border-2 border-surface-500 hover:border-gold-500/60
                         flex items-center justify-center text-white/30 hover:text-gold-400 transition-all">
              <Star size={18} />
            </button>
            <button onClick={() => swipe("like")}
              className="w-14 h-14 rounded-full border-2 border-surface-500 hover:border-emerald-500/60
                         flex items-center justify-center text-white/40 hover:text-emerald-400 transition-all">
              <Heart size={22} />
            </button>
          </div>

          <p className="text-white/20 text-xs">
            {profiles.length - index - 1} remaining · ← / → keys work ·{" "}
            <Link href="/matches" className="hover:text-white/40 transition-colors">View matches</Link>
          </p>
        </>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState, useCallback } from "react";
import { Heart, X, Star } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Profile } from "@/lib/types";
import ProfileCard from "@/components/ProfileCard";
import MatchModal from "@/components/MatchModal";
import Link from "next/link";

interface Liker {
  swiper_id: string;
  action: string;
  created_at: string;
  profile: Profile;
}

export default function LikesPage() {
  const [likers, setLikers] = useState<Liker[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [match, setMatch] = useState<Profile | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // Who liked me
    const { data: swipes } = await supabase
      .from("swipes")
      .select("swiper_id, action, created_at, profile:profiles!swipes_swiper_id_fkey(*)")
      .eq("swiped_id", user.id)
      .in("action", ["like", "super_like"])
      .order("created_at", { ascending: false });

    // Who I've already swiped
    const { data: mine } = await supabase
      .from("swipes").select("swiped_id").eq("swiper_id", user.id);
    const swiped = new Set((mine ?? []).map(s => s.swiped_id));

    const pending = (swipes ?? [])
      .filter(s => !swiped.has(s.swiper_id))
      .map(s => ({ ...s, profile: s.profile as unknown as Profile }));

    setLikers(pending);
    setLoading(false);
  }

  const act = useCallback(async (swiped_id: string, action: "like" | "pass" | "super_like", profile: Profile) => {
    const res = await fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ swiped_id, action }),
    });
    const json = await res.json();
    if (json.matched) setMatch(profile);
    setLikers(prev => prev.filter(l => l.swiper_id !== swiped_id));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-white/30 text-sm">Loading…</div>
  );

  return (
    <div>
      {match && <MatchModal profile={match} onClose={() => setMatch(null)} />}

      <div className="flex items-center gap-3 mb-8">
        <h1 className="font-serif text-3xl text-white">Likes Received</h1>
        {likers.length > 0 && (
          <span className="bg-gold-500 text-black text-xs font-bold px-2.5 py-1 rounded-full">
            {likers.length}
          </span>
        )}
      </div>

      {likers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-72 gap-4">
          <Heart size={40} className="text-white/10" />
          <p className="text-white/40 font-serif text-lg">No new likes yet</p>
          <p className="text-white/25 text-sm">Keep your profile active to attract more connections</p>
          <Link href="/profile" className="btn-ghost text-sm mt-2">Update Profile</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {likers.map(({ swiper_id, action: swipeAction, profile }) => (
            <div key={swiper_id} className="flex flex-col gap-3">
              <Link href={`/members/${swiper_id}`} className="block">
                <div className="relative group">
                  <ProfileCard profile={profile} />
                  {swipeAction === "super_like" && (
                    <div className="absolute top-3 right-3 bg-gold-500 rounded-full p-1.5">
                      <Star size={14} className="text-black" />
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent
                                  group-hover:ring-gold-500/30 transition-all pointer-events-none" />
                </div>
              </Link>
              <div className="flex gap-2">
                <button onClick={() => act(swiper_id, "pass", profile)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                             border border-surface-500 hover:border-red-500/40 text-white/40
                             hover:text-red-400 transition-all text-sm">
                  <X size={16} /> Pass
                </button>
                <button onClick={() => act(swiper_id, "like", profile)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                             bg-gold-500/20 border border-gold-500/40 text-gold-400
                             hover:bg-gold-500/30 transition-all text-sm font-medium">
                  <Heart size={16} /> Like Back
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase";
import ProfileCard from "@/components/ProfileCard";
import { Profile } from "@/lib/types";

interface MatchRow {
  id: string;
  created_at: string;
  other_profile: Profile;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("matches")
        .select("*, user1:profiles!matches_user1_id_fkey(*), user2:profiles!matches_user2_id_fkey(*)")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      const enriched = (data ?? []).map((m: Record<string, unknown>) => ({
        id: m.id as string,
        created_at: m.created_at as string,
        other_profile: (m["user1_id"] === user.id ? m.user2 : m.user1) as Profile,
      }));

      setMatches(enriched);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-white/30 text-sm">Loading…</div>;
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <div className="text-white/20 text-5xl font-serif">♥</div>
        <p className="text-white/50 font-serif text-lg">No matches yet</p>
        <p className="text-white/30 text-sm">Keep discovering to find your connection</p>
        <Link href="/discover" className="btn-gold text-sm mt-2">Discover Members</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-white mb-8">
        Your Matches <span className="text-gold-500">({matches.length})</span>
      </h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((m) => (
          <Link key={m.id} href={`/messages/${m.id}`} className="group">
            <div className="relative">
              <ProfileCard profile={m.other_profile} compact />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent
                              group-hover:ring-gold-500/30 transition-all pointer-events-none" />
            </div>
            <p className="text-white/25 text-xs mt-2 px-1">
              Matched {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

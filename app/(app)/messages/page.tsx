"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase";
import { Profile } from "@/lib/types";

interface Thread {
  id: string;
  created_at: string;
  other: Profile;
  last?: { content: string; sender_id: string; created_at: string };
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("matches")
        .select(`
          id, created_at,
          user1:profiles!matches_user1_id_fkey(id, display_name, avatar_url, verified, wealth_tier, occupation),
          user2:profiles!matches_user2_id_fkey(id, display_name, avatar_url, verified, wealth_tier, occupation),
          messages(id, content, sender_id, created_at)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      const result: Thread[] = (data ?? []).map((m: Record<string, unknown>) => {
        const other = (m["user1_id"] === user.id ? m.user2 : m.user1) as Profile;
        const msgs = (m.messages as { id: string; content: string; sender_id: string; created_at: string }[]) ?? [];
        const last = msgs.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))[0];
        return { id: m.id as string, created_at: m.created_at as string, other, last };
      });

      setThreads(result);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-white/30 text-sm">Loading…</div>;
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <p className="text-white/50 font-serif text-lg">No conversations yet</p>
        <Link href="/matches" className="btn-ghost text-sm">View Matches</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-white mb-8">Messages</h1>
      <div className="flex flex-col gap-1">
        {threads.map((t) => (
          <Link key={t.id} href={`/messages/${t.id}`}
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-700 transition-colors">
            <div className="w-12 h-12 rounded-full bg-surface-600 flex items-center justify-center
                            text-white/30 font-serif text-lg flex-shrink-0 overflow-hidden">
              {t.other?.avatar_url
                ? <img src={t.other.avatar_url} alt="" className="w-full h-full object-cover" />
                : t.other?.display_name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-white text-sm font-medium">{t.other?.display_name}</span>
                {t.last && (
                  <span className="text-white/25 text-xs">
                    {formatDistanceToNow(new Date(t.last.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              <p className="text-white/35 text-xs truncate">
                {t.last
                  ? (t.last.sender_id === userId ? "You: " : "") + t.last.content
                  : "Say hello ✦"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

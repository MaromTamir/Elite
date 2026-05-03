"use client";
import { useEffect, useRef, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Message, Profile } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";

export default function MessageThreadPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [other, setOther] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    init();
  }, [matchId]);

  async function init() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // Load match + other profile
    const { data: match } = await supabase
      .from("matches")
      .select("*, user1:profiles!matches_user1_id_fkey(*), user2:profiles!matches_user2_id_fkey(*)")
      .eq("id", matchId)
      .single();

    if (match) {
      setOther(match.user1_id === user.id ? match.user2 : match.user1);
    }

    // Load messages
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true });

    setMessages(msgs ?? []);
    setLoading(false);

    // Mark unread as read
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("match_id", matchId)
      .neq("sender_id", user.id)
      .is("read_at", null);

    // Subscribe to new messages
    supabase.channel(`messages:${matchId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    const supabase = createClient();
    const content = text.trim();
    setText("");

    await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: userId,
      content,
    });
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-white/30 text-sm">Loading…</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-surface-600">
        <button onClick={() => router.back()}
          className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-surface-600 flex items-center justify-center
                        text-white/40 font-serif overflow-hidden">
          {other?.avatar_url
            ? <img src={other.avatar_url} alt="" className="w-full h-full object-cover" />
            : other?.display_name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-white font-medium text-sm">{other?.display_name}</p>
          <p className="text-white/30 text-xs">{other?.occupation}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/25 text-sm">Send the first message ✦</p>
          </div>
        )}
        {messages.map((msg) => {
          const mine = msg.sender_id === userId;
          return (
            <div key={msg.id} className={clsx("flex flex-col gap-1 max-w-xs", mine ? "self-end items-end" : "items-start")}>
              <div className={clsx("px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                mine
                  ? "bg-gold-500/20 text-white border border-gold-500/20 rounded-br-sm"
                  : "bg-surface-700 text-white/80 rounded-bl-sm"
              )}>
                {msg.content}
              </div>
              <span className="text-white/20 text-xs">
                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="flex gap-3 pt-4 border-t border-surface-600">
        <input
          className="input-field flex-1"
          placeholder="Write a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit"
          disabled={!text.trim()}
          className="btn-gold px-4 py-3 disabled:opacity-40">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

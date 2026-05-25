"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, MessageCircle, User, Compass, LogOut, Star, Settings, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import clsx from "clsx";

const NAV = [
  { href: "/discover",  icon: Compass,       label: "Discover"  },
  { href: "/likes",     icon: Star,          label: "Likes"     },
  { href: "/matches",   icon: Heart,         label: "Matches"   },
  { href: "/events",    icon: CalendarDays,  label: "Events"    },
  { href: "/messages",  icon: MessageCircle, label: "Messages"  },
  { href: "/profile",   icon: User,          label: "Profile"   },
  { href: "/settings",  icon: Settings,      label: "Settings"  },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [newLikes, setNewLikes] = useState(0);

  useEffect(() => {
    loadCounts();
    const supabase = createClient();
    const channel = supabase
      .channel("nav-counts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, loadCounts)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "swipes" }, loadCounts)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadCounts() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: matches } = await supabase
      .from("matches")
      .select("id")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (matches && matches.length > 0) {
      const matchIds = matches.map((m) => m.id);
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("match_id", matchIds)
        .neq("sender_id", user.id)
        .is("read_at", null);
      setUnread(count ?? 0);
    }

    const { data: swipedByMe } = await supabase
      .from("swipes")
      .select("swiped_id")
      .eq("swiper_id", user.id);
    const swiped = new Set((swipedByMe ?? []).map((s) => s.swiped_id));

    const { count: likeCount } = await supabase
      .from("swipes")
      .select("*", { count: "exact", head: true })
      .eq("swiped_id", user.id)
      .in("action", ["like", "super_like"]);

    setNewLikes(Math.max(0, (likeCount ?? 0) - swiped.size));
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const badges: Record<string, number> = {
    "/messages": unread,
    "/likes": newLikes,
  };

  return (
    <header className="bg-surface-800/95 backdrop-blur-sm border-b border-surface-600 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="font-serif text-xl text-gold-500 tracking-widest hidden sm:block select-none">
          ELITEMATCH
        </span>

        <nav className="flex items-center gap-0.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const badge = badges[href] ?? 0;
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "text-gold-500 bg-gold-500/10"
                    : "text-white/40 hover:text-white/70"
                )}
              >
                <Icon size={16} />
                <span className="hidden md:block">{label}</span>
                {badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-gold-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white/30 hover:text-white/60 transition-colors ml-1"
          >
            <LogOut size={16} />
          </button>
        </nav>
      </div>
    </header>
  );
}

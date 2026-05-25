"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Sparkles, Copy, Check } from "lucide-react";
import { Profile } from "@/lib/types";

interface Props {
  profile: Profile;
  matchId?: string;
  onClose: () => void;
}

const ICE_BREAKERS: Record<string, string[]> = {
  Finance: [
    "Curious where you think rates are heading over the next cycle — private credit or back to equities?",
    "What's the most contrarian macro bet you've been tracking lately?",
  ],
  Technology: [
    "I'd love your take on AI's real impact on private wealth — hype or structural shift?",
    "What tech thesis are you most excited about that the mainstream hasn't caught onto yet?",
  ],
  "Art Collecting": [
    "Have you been following the secondary market lately? Curious what you've had your eye on.",
    "Any emerging artists you think will define the next decade?",
  ],
  "Private Aviation": [
    "I've been weighing fractional vs whole aircraft — what's your experience been?",
    "Best spontaneous flight you've ever taken?",
  ],
  Yachting: [
    "Mediterranean or Caribbean — where are you based this season?",
    "What's been the highlight destination on your last passage?",
  ],
  "Formula 1": [
    "Monaco or Monza — which GP never gets old for you?",
    "Were you at any of the races this season? I was at Silverstone — electric.",
  ],
  Philanthropy: [
    "What cause have you been most focused on recently — and what made it personal?",
    "Do you find impact investing actually moves the needle, or is direct philanthropy still king?",
  ],
  Golf: [
    "What's your home course? I've been working on Pebble Beach for years.",
    "Any bucket-list courses you're still chasing?",
  ],
  Philosophy: [
    "What's a philosophical idea you keep returning to that most people in your circle dismiss?",
    "Do you think ambition and contentment are truly reconcilable?",
  ],
  Literature: [
    "What's the last book that genuinely changed how you think — not just entertained you?",
    "Fiction or non-fiction for long-haul flights?",
  ],
};

const FALLBACKS = [
  "Your profile caught my attention. What's been the most meaningful experience of your year so far?",
  "I'd love to hear about the most extraordinary place you've been to recently.",
  "What's driving your ambitions right now — beyond the obvious?",
];

function getIceBreakers(profile: Profile): string[] {
  const suggestions: string[] = [];

  for (const tag of [...(profile.lifestyle ?? []), ...(profile.interests ?? [])]) {
    const options = ICE_BREAKERS[tag];
    if (options) {
      for (const opt of options) {
        if (!suggestions.includes(opt)) suggestions.push(opt);
        if (suggestions.length >= 3) return suggestions;
      }
    }
  }

  let i = 0;
  while (suggestions.length < 3 && i < FALLBACKS.length) {
    suggestions.push(FALLBACKS[i++]);
  }
  return suggestions.slice(0, 3);
}

export default function MatchModal({ profile, matchId, onClose }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState<number | null>(null);
  const breakers = getIceBreakers(profile);

  function copyBreaker(text: string, idx: number) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(idx);
    setTimeout(() => setCopied(null), 1800);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="relative card p-8 max-w-sm w-full text-center flex flex-col items-center gap-5 border-gold-500/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold ambient glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-radial from-gold-500/8 via-transparent to-transparent pointer-events-none" />
        {/* Top shimmer line */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-gold-500 text-xs tracking-[0.35em] uppercase"
        >
          It&apos;s a Match
        </motion.p>

        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 22 }}
          className="w-24 h-24 rounded-full overflow-hidden bg-surface-600 ring-4 ring-gold-500/50 shadow-lg shadow-gold-500/10"
        >
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.display_name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 font-serif text-4xl">
              {profile.display_name?.[0]?.toUpperCase()}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-serif text-3xl text-white mb-0.5">{profile.display_name}</h2>
          <p className="text-white/40 text-sm">
            {profile.occupation}
            {profile.location ? ` · ${profile.location}` : ""}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/45 text-sm leading-relaxed"
        >
          You and {profile.display_name} have both expressed interest. Make the first move.
        </motion.p>

        {/* Ice Breakers */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full"
        >
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles size={12} className="text-gold-500/70" />
            <span className="text-white/30 text-xs tracking-widest uppercase">
              Suggested openers
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {breakers.map((text, idx) => (
              <button
                key={idx}
                onClick={() => copyBreaker(text, idx)}
                className="group flex items-start gap-2 text-left px-3 py-2.5 rounded-xl
                           border border-surface-500 hover:border-gold-500/40
                           bg-surface-600/50 hover:bg-gold-500/5
                           transition-all text-white/50 hover:text-white/70 text-xs leading-relaxed"
              >
                <span className="flex-1">{text}</span>
                <span className="flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AnimatePresence mode="wait">
                    {copied === idx ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check size={13} className="text-emerald-400" />
                      </motion.span>
                    ) : (
                      <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Copy size={13} className="text-white/30" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-2.5 w-full"
        >
          {matchId && (
            <button
              onClick={() => {
                onClose();
                router.push(`/messages/${matchId}`);
              }}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3.5"
            >
              <MessageCircle size={16} /> Send a Message
            </button>
          )}
          <button onClick={onClose} className="btn-ghost w-full text-sm py-3">
            Keep Discovering
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

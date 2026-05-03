"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Profile } from "@/lib/types";

interface Props {
  profile: Profile;
  matchId?: string;
  onClose: () => void;
}

export default function MatchModal({ profile, matchId, onClose }: Props) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative card p-10 max-w-sm w-full text-center flex flex-col items-center gap-6
                      border-gold-500/30"
        onClick={e => e.stopPropagation()}>

        {/* Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gold-500/5 pointer-events-none" />

        <div className="text-gold-500 text-xs tracking-[0.3em] uppercase">It&apos;s a Match</div>

        {/* Avatar */}
        <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-600 ring-4 ring-gold-500/40">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.display_name} width={96} height={96}
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 font-serif text-4xl">
              {profile.display_name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-serif text-3xl text-white mb-1">{profile.display_name}</h2>
          <p className="text-white/40 text-sm">
            {profile.occupation}{profile.location ? ` · ${profile.location}` : ""}
          </p>
        </div>

        <p className="text-white/50 text-sm leading-relaxed">
          You and {profile.display_name} have both expressed interest. Reach out and say hello.
        </p>

        <div className="flex flex-col gap-3 w-full">
          {matchId && (
            <button
              onClick={() => { onClose(); router.push(`/messages/${matchId}`); }}
              className="btn-gold w-full">
              Send a Message
            </button>
          )}
          <button onClick={onClose} className="btn-ghost w-full text-sm">
            Keep Discovering
          </button>
        </div>
      </div>
    </div>
  );
}

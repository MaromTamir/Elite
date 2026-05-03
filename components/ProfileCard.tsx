import Image from "next/image";
import { MapPin, Briefcase, Shield } from "lucide-react";
import { Profile, WEALTH_TIER_BADGE } from "@/lib/types";
import clsx from "clsx";

interface Props {
  profile: Profile;
  blurred?: boolean;
  compact?: boolean;
}

export default function ProfileCard({ profile, blurred = false, compact = false }: Props) {
  const age = profile.birth_date
    ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear()
    : null;

  return (
    <div className={clsx("card overflow-hidden", compact ? "flex items-center gap-4 p-4" : "")}>
      {/* Photo */}
      <div className={clsx(
        "relative bg-surface-600 flex-shrink-0",
        compact ? "w-14 h-14 rounded-xl" : "aspect-[3/4] w-full"
      )}>
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.display_name}
            fill
            className={clsx("object-cover", blurred && "blur-lg scale-110")}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-4xl font-serif">
            {profile.display_name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}

        {blurred && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/60 text-xs bg-black/50 px-3 py-1 rounded-full">
              Match to reveal
            </span>
          </div>
        )}

        {/* Wealth badge */}
        {!compact && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm
                          border border-gold-500/40 rounded-full px-3 py-1">
            <Shield size={11} className="text-gold-500" />
            <span className="text-gold-400 text-xs font-medium">
              {WEALTH_TIER_BADGE[profile.wealth_tier]}
            </span>
            {profile.verified && (
              <span className="text-emerald-400 text-xs">✓</span>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className={clsx(compact ? "min-w-0" : "p-5")}>
        <div className="flex items-center gap-2 mb-1">
          <h3 className={clsx("text-white font-semibold truncate", compact ? "text-base" : "text-xl")}>
            {profile.display_name}
            {age && <span className="text-white/50 font-normal ml-1">{age}</span>}
          </h3>
          {compact && profile.verified && (
            <Shield size={12} className="text-gold-500 flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-3 text-white/40 text-xs mb-3 flex-wrap">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {profile.location}
            </span>
          )}
          {profile.occupation && (
            <span className="flex items-center gap-1">
              <Briefcase size={11} /> {profile.occupation}
              {profile.company ? ` · ${profile.company}` : ""}
            </span>
          )}
        </div>

        {!compact && profile.bio && (
          <p className="text-white/55 text-sm leading-relaxed mb-4 line-clamp-3">{profile.bio}</p>
        )}

        {!compact && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 5).map((interest) => (
              <span key={interest}
                className="text-xs px-2.5 py-1 rounded-full border border-surface-500 text-white/45">
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

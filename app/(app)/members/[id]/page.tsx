"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Briefcase, Shield, Heart, X, MessageCircle, Star } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Profile, WEALTH_TIER_LABELS } from "@/lib/types";
import MatchModal from "@/components/MatchModal";
import CompatibilityScore from "@/components/CompatibilityScore";

export default function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState("");
  const [mySwipe, setMySwipe] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [acting, setActing] = useState(false);
  const [match, setMatch] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [{ data: p }, { data: me }, { data: swipe }, { data: matchData }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).single(),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("swipes")
          .select("action")
          .eq("swiper_id", user.id)
          .eq("swiped_id", id)
          .single(),
        supabase
          .from("matches")
          .select("id")
          .or(
            `and(user1_id.eq.${user.id},user2_id.eq.${id}),and(user1_id.eq.${id},user2_id.eq.${user.id})`
          )
          .single(),
      ]);

    setProfile(p);
    setMyProfile(me);
    setMySwipe(swipe?.action ?? null);
    setMatchId(matchData?.id ?? null);
    setLoading(false);
  }

  async function swipeAction(action: "like" | "pass" | "super_like") {
    if (!profile) return;
    setActing(true);
    const res = await fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ swiped_id: id, action }),
    });
    const json = await res.json();
    setMySwipe(action);
    if (json.matched) {
      setMatchId(json.match_id);
      setMatch(profile);
    }
    setActing(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="text-gold-500/60 font-serif tracking-widest"
        >
          ELITEMATCH
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-20 text-white/30">Profile not found</div>;
  }

  const photos = [profile.avatar_url, ...(profile.photos ?? [])].filter(
    Boolean
  ) as string[];
  const age = profile.birth_date
    ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear()
    : null;

  const sharedLifestyle = (myProfile?.lifestyle ?? []).filter((l) =>
    (profile.lifestyle ?? []).includes(l)
  );
  const sharedInterests = (myProfile?.interests ?? []).filter((i) =>
    (profile.interests ?? []).includes(i)
  );

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {match && (
        <MatchModal
          profile={match}
          matchId={matchId ?? undefined}
          onClose={() => setMatch(null)}
        />
      )}

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-white/40 hover:text-white mb-6 transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Photo gallery */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-700 mb-6"
      >
        {photos.length > 0 ? (
          <>
            <Image
              src={photos[photoIndex]}
              alt={profile.display_name}
              fill
              className="object-cover transition-opacity duration-300"
            />
            {photos.length > 1 && (
              <>
                <div className="absolute top-3 left-3 right-3 flex gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      className={`h-0.5 rounded-full flex-1 transition-all ${
                        i === photoIndex ? "bg-white" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setPhotoIndex((i) => Math.max(0, i - 1))}
                  className="absolute left-0 top-0 bottom-0 w-1/3"
                />
                <button
                  onClick={() => setPhotoIndex((i) => Math.min(photos.length - 1, i + 1))}
                  className="absolute right-0 top-0 bottom-0 w-1/3"
                />
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/10 font-serif text-8xl">
            {profile.display_name?.[0]?.toUpperCase()}
          </div>
        )}

        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/65 backdrop-blur-sm border border-gold-500/40 rounded-full px-3 py-1.5">
          <Shield size={12} className="text-gold-500" />
          <span className="text-gold-400 text-xs font-medium">
            {WEALTH_TIER_LABELS[profile.wealth_tier]}
          </span>
          {profile.verified && <span className="text-emerald-400 text-xs">✓</span>}
        </div>
      </motion.div>

      {/* Name & basics */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-6"
      >
        <h1 className="font-serif text-4xl text-white mb-1">
          {profile.display_name}
          {age && <span className="text-white/40 font-light">, {age}</span>}
        </h1>
        <div className="flex flex-wrap gap-4 text-white/50 text-sm mt-2">
          {profile.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {profile.location}
            </span>
          )}
          {profile.occupation && (
            <span className="flex items-center gap-1.5">
              <Briefcase size={14} />
              {profile.occupation}
              {profile.company ? ` · ${profile.company}` : ""}
            </span>
          )}
        </div>
      </motion.div>

      {/* Compatibility score */}
      {myProfile && profile.id !== userId && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-4"
        >
          <CompatibilityScore myProfile={myProfile} theirProfile={profile} />
        </motion.div>
      )}

      {/* Shared tags */}
      {(sharedLifestyle.length > 0 || sharedInterests.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="card p-5 mb-4"
        >
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
            In Common
          </p>
          <div className="flex flex-wrap gap-2">
            {[...sharedLifestyle, ...sharedInterests].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full border border-gold-500/40 text-gold-400/80 text-sm bg-gold-500/5"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Bio */}
      {profile.bio && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="card p-6 mb-4"
        >
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">About</p>
          <p className="text-white/70 leading-relaxed">{profile.bio}</p>
        </motion.div>
      )}

      {/* Looking for */}
      {profile.looking_for && (
        <div className="card p-6 mb-4">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
            Looking For
          </p>
          <p className="text-white/70 leading-relaxed">{profile.looking_for}</p>
        </div>
      )}

      {/* Lifestyle */}
      {profile.lifestyle?.length > 0 && (
        <div className="card p-6 mb-4">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Lifestyle</p>
          <div className="flex flex-wrap gap-2">
            {profile.lifestyle.map((l) => (
              <span
                key={l}
                className={`px-3 py-1.5 rounded-full border text-sm ${
                  sharedLifestyle.includes(l)
                    ? "border-gold-500/50 text-gold-400/90 bg-gold-500/8"
                    : "border-surface-500 text-white/45"
                }`}
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {profile.interests?.length > 0 && (
        <div className="card p-6 mb-8">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Interests</p>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className={`px-3 py-1.5 rounded-full border text-sm ${
                  sharedInterests.includes(interest)
                    ? "border-gold-500/50 text-gold-400/90 bg-gold-500/8"
                    : "border-surface-500 text-white/45"
                }`}
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sticky action bar */}
      {profile.id !== userId && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface-900/95 backdrop-blur-sm border-t border-surface-700">
          <div className="max-w-2xl mx-auto">
            {matchId ? (
              <button
                onClick={() => router.push(`/messages/${matchId}`)}
                className="btn-gold w-full flex items-center justify-center gap-2 py-4 text-base"
              >
                <MessageCircle size={18} /> Send a Message
              </button>
            ) : mySwipe ? (
              <div className="card p-4 text-center text-white/40 text-sm">
                You already{" "}
                {mySwipe === "like" || mySwipe === "super_like" ? "liked" : "passed on"}{" "}
                this profile
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => swipeAction("pass")}
                  disabled={acting}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-surface-500 hover:border-red-500/50 text-white/40 hover:text-red-400 transition-all text-base disabled:opacity-40"
                >
                  <X size={20} /> Pass
                </button>
                <button
                  onClick={() => swipeAction("super_like")}
                  disabled={acting}
                  className="w-14 flex items-center justify-center rounded-xl border-2 border-surface-500 hover:border-gold-500/50 text-white/30 hover:text-gold-400 transition-all disabled:opacity-40"
                >
                  <Star size={18} />
                </button>
                <button
                  onClick={() => swipeAction("like")}
                  disabled={acting}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-gold-500/20 border-2 border-gold-500/50 text-gold-400 hover:bg-gold-500/30 transition-all text-base font-medium disabled:opacity-40"
                >
                  <Heart size={20} /> Like
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

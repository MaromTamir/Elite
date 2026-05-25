"use client";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  PanInfo,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Shield, MapPin, Briefcase, Info } from "lucide-react";
import { Profile, WEALTH_TIER_BADGE } from "@/lib/types";

export interface SwipeCardHandle {
  swipe: (action: "like" | "pass" | "super_like") => Promise<void>;
}

interface Props {
  profile: Profile;
  onSwipe: (action: "like" | "pass" | "super_like") => void;
  stackOffset: number; // 0 = top, 1 = behind, 2 = far behind
}

const SPRING = { type: "spring" as const, stiffness: 320, damping: 30 };

const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard(
  { profile, onSwipe, stackOffset },
  ref
) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-20, 20]);
  const controls = useAnimation();

  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -20], [1, 0]);
  const superOpacity = useTransform(y, [-100, -20], [1, 0]);

  const isTop = stackOffset === 0;

  const age = profile.birth_date
    ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear()
    : null;

  useEffect(() => {
    if (stackOffset === 0) {
      controls.start({ scale: 1, y: 0, opacity: 1, transition: SPRING });
    } else if (stackOffset === 1) {
      controls.start({ scale: 0.95, y: 16, opacity: 0.85, transition: SPRING });
    } else {
      controls.start({ scale: 0.90, y: 32, opacity: 0.65, transition: SPRING });
    }
  }, [stackOffset, controls]);

  useImperativeHandle(ref, () => ({
    async swipe(action) {
      if (action === "like") {
        await controls.start({
          x: 1200,
          y: -60,
          rotate: 22,
          opacity: 0,
          transition: { duration: 0.38, ease: "easeIn" },
        });
      } else if (action === "pass") {
        await controls.start({
          x: -1200,
          y: -60,
          rotate: -22,
          opacity: 0,
          transition: { duration: 0.38, ease: "easeIn" },
        });
      } else {
        await controls.start({
          y: -1100,
          opacity: 0,
          transition: { duration: 0.38, ease: "easeIn" },
        });
      }
      onSwipe(action);
    },
  }));

  async function handleDragEnd(_: unknown, info: PanInfo) {
    const { offset, velocity } = info;

    if (offset.y < -100 || velocity.y < -550) {
      await controls.start({
        y: -1100,
        opacity: 0,
        transition: { duration: 0.35, ease: "easeIn" },
      });
      onSwipe("super_like");
    } else if (offset.x > 120 || velocity.x > 550) {
      await controls.start({
        x: 1200,
        y: -60,
        rotate: 22,
        opacity: 0,
        transition: { duration: 0.35, ease: "easeIn" },
      });
      onSwipe("like");
    } else if (offset.x < -120 || velocity.x < -550) {
      await controls.start({
        x: -1200,
        y: -60,
        rotate: -22,
        opacity: 0,
        transition: { duration: 0.35, ease: "easeIn" },
      });
      onSwipe("pass");
    } else {
      controls.start({ x: 0, y: 0, rotate: 0, scale: 1, transition: SPRING });
    }
  }

  return (
    <motion.div
      className="absolute inset-0 rounded-2xl overflow-hidden"
      style={
        isTop
          ? { x, y, rotate, zIndex: 30, cursor: "grab" }
          : { zIndex: stackOffset === 1 ? 20 : 10, pointerEvents: "none" }
      }
      drag={isTop ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.72}
      whileDrag={{ cursor: "grabbing" }}
      onDragEnd={isTop ? handleDragEnd : undefined}
      animate={controls}
    >
      {/* LIKE overlay */}
      {isTop && (
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-8 left-6 z-20 pointer-events-none"
        >
          <div className="border-[3px] border-emerald-400 rounded-xl px-4 py-1.5 -rotate-12">
            <span className="text-emerald-400 font-bold text-2xl tracking-[0.18em]">LIKE</span>
          </div>
        </motion.div>
      )}

      {/* NOPE overlay */}
      {isTop && (
        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-8 right-6 z-20 pointer-events-none"
        >
          <div className="border-[3px] border-red-400 rounded-xl px-4 py-1.5 rotate-12">
            <span className="text-red-400 font-bold text-2xl tracking-[0.18em]">NOPE</span>
          </div>
        </motion.div>
      )}

      {/* SUPER LIKE overlay */}
      {isTop && (
        <motion.div
          style={{ opacity: superOpacity }}
          className="absolute bottom-36 left-0 right-0 z-20 pointer-events-none flex justify-center"
        >
          <div className="border-[3px] border-gold-500 rounded-xl px-6 py-1.5">
            <span className="text-gold-500 font-bold text-2xl tracking-[0.18em]">SUPER LIKE</span>
          </div>
        </motion.div>
      )}

      {/* Card body */}
      <div className="w-full h-full bg-surface-700 border border-surface-500 select-none flex flex-col">
        {/* Photo */}
        <div className="relative flex-1 bg-surface-600">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.display_name}
              fill
              className="object-cover"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/10 font-serif text-8xl">
              {profile.display_name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Wealth badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/65 backdrop-blur-sm border border-gold-500/40 rounded-full px-3 py-1">
            <Shield size={11} className="text-gold-500" />
            <span className="text-gold-400 text-xs font-medium">
              {WEALTH_TIER_BADGE[profile.wealth_tier]}
            </span>
            {profile.verified && (
              <span className="text-emerald-400 text-xs ml-0.5">✓</span>
            )}
          </div>

          {/* Info button */}
          {isTop && (
            <Link
              href={`/members/${profile.id}`}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/55 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
            >
              <Info size={14} />
            </Link>
          )}
        </div>

        {/* Info strip */}
        <div className="p-5 flex-shrink-0">
          <div className="flex items-baseline gap-2 mb-1.5">
            <h3 className="font-serif text-2xl text-white leading-tight">
              {profile.display_name}
            </h3>
            {age && <span className="text-white/40 text-lg">{age}</span>}
          </div>
          <div className="flex flex-wrap gap-3 text-white/45 text-sm mb-3">
            {profile.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={13} />
                {profile.location}
              </span>
            )}
            {profile.occupation && (
              <span className="flex items-center gap-1.5">
                <Briefcase size={13} />
                {profile.occupation}
              </span>
            )}
          </div>
          {profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full border border-surface-500 text-white/40"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default SwipeCard;

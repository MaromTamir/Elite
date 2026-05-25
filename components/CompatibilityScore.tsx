"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Profile } from "@/lib/types";

interface Props {
  myProfile: Profile;
  theirProfile: Profile;
}

function calcScore(a: Profile, b: Profile) {
  const tiers = ["affluent", "hnw", "uhnw", "uuhnw"];

  const lifestyleCommon = (a.lifestyle ?? []).filter((l) =>
    (b.lifestyle ?? []).includes(l)
  ).length;
  const lifestyleMax = Math.max(1, Math.max(a.lifestyle?.length ?? 1, b.lifestyle?.length ?? 1));
  const lifestyle = Math.round(Math.min(40, (lifestyleCommon / lifestyleMax) * 80));

  const interestCommon = (a.interests ?? []).filter((i) =>
    (b.interests ?? []).includes(i)
  ).length;
  const interestMax = Math.max(1, Math.max(a.interests?.length ?? 1, b.interests?.length ?? 1));
  const interests = Math.round(Math.min(30, (interestCommon / interestMax) * 60));

  const ageA = a.birth_date
    ? new Date().getFullYear() - new Date(a.birth_date).getFullYear()
    : 35;
  const ageB = b.birth_date
    ? new Date().getFullYear() - new Date(b.birth_date).getFullYear()
    : 35;
  const age = Math.round(Math.max(0, 20 - Math.abs(ageA - ageB) * 1.4));

  const tierDiff = Math.abs(
    tiers.indexOf(a.wealth_tier) - tiers.indexOf(b.wealth_tier)
  );
  const wealth = Math.max(0, 10 - tierDiff * 3);

  const total = lifestyle + interests + age + wealth;
  return { total, lifestyle, interests, age, wealth };
}

export default function CompatibilityScore({ myProfile, theirProfile }: Props) {
  const { total, lifestyle, interests, age, wealth } = calcScore(
    myProfile,
    theirProfile
  );
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * total));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    }
    const id = setTimeout(() => {
      frameRef.current = requestAnimationFrame(tick);
    }, 400);
    return () => {
      clearTimeout(id);
      cancelAnimationFrame(frameRef.current);
    };
  }, [total]);

  const R = 42;
  const circ = 2 * Math.PI * R;
  const gold = "#C9A84C";
  const blue = "#60A5FA";
  const gray = "#6B7280";
  const strokeColor = total >= 70 ? gold : total >= 50 ? blue : gray;
  const label =
    total >= 80
      ? "Exceptional Match"
      : total >= 65
      ? "Strong Compatibility"
      : total >= 50
      ? "Good Potential"
      : "Explore Together";

  const bars = [
    { key: "Lifestyle", val: lifestyle, max: 40 },
    { key: "Interests", val: interests, max: 30 },
    { key: "Age", val: age, max: 20 },
    { key: "Wealth", val: wealth, max: 10 },
  ];

  return (
    <div className="card p-6">
      <p className="text-white/40 text-xs uppercase tracking-widest mb-5">
        Compatibility Score
      </p>
      <div className="flex items-center gap-6">
        {/* Ring */}
        <div className="relative flex-shrink-0 w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="#2A2A2A"
              strokeWidth="8"
            />
            <motion.circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={strokeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: circ - (total / 100) * circ }}
              transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-2xl leading-none" style={{ color: strokeColor }}>
              {count}
            </span>
            <span className="text-white/30 text-[10px]">/ 100</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium mb-3">{label}</p>
          <div className="space-y-2">
            {bars.map(({ key, val, max }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-white/35 text-xs w-14 flex-shrink-0">{key}</span>
                <div className="flex-1 h-1.5 bg-surface-500 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: strokeColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(val / max) * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.6, ease: "easeOut" }}
                  />
                </div>
                <span className="text-white/25 text-xs w-5 text-right flex-shrink-0">
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

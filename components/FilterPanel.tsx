"use client";
import { X } from "lucide-react";
import { WealthTier } from "@/lib/types";

export interface Filters {
  minAge: number;
  maxAge: number;
  wealthTiers: WealthTier[];
  genders: string[];
}

export const DEFAULT_FILTERS: Filters = {
  minAge: 18,
  maxAge: 80,
  wealthTiers: [],
  genders: [],
};

const TIERS: { value: WealthTier; label: string }[] = [
  { value: "affluent", label: "Affluent ($1M–$10M)" },
  { value: "hnw",      label: "HNW ($10M–$30M)" },
  { value: "uhnw",     label: "UHNW ($30M–$100M)" },
  { value: "uuhnw",    label: "UUHNW ($100M+)" },
];

const GENDERS = [
  { value: "man",      label: "Men" },
  { value: "woman",    label: "Women" },
  { value: "non_binary", label: "Non-binary" },
];

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClose: () => void;
  onApply: () => void;
}

export default function FilterPanel({ filters, onChange, onClose, onApply }: Props) {
  function toggleTier(t: WealthTier) {
    const existing = filters.wealthTiers.includes(t);
    onChange({
      ...filters,
      wealthTiers: existing ? filters.wealthTiers.filter(x => x !== t) : [...filters.wealthTiers, t],
    });
  }

  function toggleGender(g: string) {
    const existing = filters.genders.includes(g);
    onChange({
      ...filters,
      genders: existing ? filters.genders.filter(x => x !== g) : [...filters.genders, g],
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative card w-full max-w-md p-6 flex flex-col gap-6"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Filters</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Age range */}
        <div>
          <p className="text-white/60 text-xs uppercase tracking-widest mb-3">Age Range</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-white/30 text-xs block mb-1">Min</label>
              <input type="number" min={18} max={99} className="input-field text-center"
                value={filters.minAge}
                onChange={e => onChange({ ...filters, minAge: +e.target.value })} />
            </div>
            <span className="text-white/30 mt-5">–</span>
            <div className="flex-1">
              <label className="text-white/30 text-xs block mb-1">Max</label>
              <input type="number" min={18} max={99} className="input-field text-center"
                value={filters.maxAge}
                onChange={e => onChange({ ...filters, maxAge: +e.target.value })} />
            </div>
          </div>
        </div>

        {/* Wealth tiers */}
        <div>
          <p className="text-white/60 text-xs uppercase tracking-widest mb-3">Wealth Tier</p>
          <div className="flex flex-col gap-2">
            {TIERS.map(({ value, label }) => (
              <button key={value} onClick={() => toggleTier(value)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm text-left
                            transition-colors ${filters.wealthTiers.includes(value)
                  ? "border-gold-500/60 bg-gold-500/10 text-gold-400"
                  : "border-surface-500 text-white/50 hover:border-white/20"}`}>
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                  filters.wealthTiers.includes(value)
                    ? "border-gold-500 bg-gold-500"
                    : "border-surface-400"}`}>
                  {filters.wealthTiers.includes(value) && (
                    <span className="text-black text-xs font-bold">✓</span>
                  )}
                </div>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div>
          <p className="text-white/60 text-xs uppercase tracking-widest mb-3">Show Me</p>
          <div className="flex gap-2">
            {GENDERS.map(({ value, label }) => (
              <button key={value} onClick={() => toggleGender(value)}
                className={`flex-1 py-2 rounded-xl border text-sm transition-colors ${
                  filters.genders.includes(value)
                    ? "border-gold-500/60 bg-gold-500/10 text-gold-400"
                    : "border-surface-500 text-white/50 hover:border-white/20"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => onChange(DEFAULT_FILTERS)}
            className="btn-ghost flex-1 text-sm py-2.5">Reset</button>
          <button onClick={() => { onApply(); onClose(); }}
            className="btn-gold flex-1 text-sm py-2.5">Apply Filters</button>
        </div>
      </div>
    </div>
  );
}

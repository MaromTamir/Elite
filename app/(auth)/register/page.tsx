"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { WEALTH_TIER_LABELS, LIFESTYLE_OPTIONS, INTEREST_OPTIONS } from "@/lib/types";

const STEPS = ["Account", "Identity", "Lifestyle", "Preferences"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    display_name: "",
    birth_date: "",
    gender: "man",
    seeking: [] as string[],
    location: "",
    occupation: "",
    company: "",
    wealth_tier: "hnw",
    net_worth_range: "$10M–$30M",
    bio: "",
    interests: [] as string[],
    lifestyle: [] as string[],
    looking_for: "",
  });

  function toggle(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }

  function update(key: string, val: unknown) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        profile: {
          full_name: form.full_name,
          display_name: form.display_name,
          birth_date: form.birth_date,
          gender: form.gender,
          seeking: form.seeking,
          location: form.location,
          occupation: form.occupation,
          company: form.company || null,
          wealth_tier: form.wealth_tier,
          net_worth_range: form.net_worth_range,
          bio: form.bio || null,
          interests: form.interests,
          lifestyle: form.lifestyle,
          looking_for: form.looking_for || null,
          photos: [],
        },
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Registration failed");
      setLoading(false);
      return;
    }

    // Sign in immediately after account creation
    const supabase = createClient();
    await supabase.auth.signInWithPassword({ email: form.email, password: form.password });

    router.push("/discover");
  }

  const stepContent = [
    // Step 0 — Account
    <div key="account" className="flex flex-col gap-4">
      <h2 className="font-serif text-2xl text-white mb-1">Create your account</h2>
      <p className="text-white/40 text-sm mb-4">Your credentials are encrypted and private.</p>
      <label className="text-white/60 text-xs uppercase tracking-widest">Email</label>
      <input className="input-field" type="email" placeholder="you@example.com"
        value={form.email} onChange={(e) => update("email", e.target.value)} required />
      <label className="text-white/60 text-xs uppercase tracking-widest">Password</label>
      <input className="input-field" type="password" placeholder="Min 8 characters"
        value={form.password} onChange={(e) => update("password", e.target.value)} required />
    </div>,

    // Step 1 — Identity
    <div key="identity" className="flex flex-col gap-4">
      <h2 className="font-serif text-2xl text-white mb-1">About you</h2>
      <p className="text-white/40 text-sm mb-4">This information is used for matching and verification.</p>
      <label className="text-white/60 text-xs uppercase tracking-widest">Legal Full Name</label>
      <input className="input-field" placeholder="Full Name"
        value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
      <label className="text-white/60 text-xs uppercase tracking-widest">Display Name</label>
      <input className="input-field" placeholder="How you appear to matches"
        value={form.display_name} onChange={(e) => update("display_name", e.target.value)} />
      <label className="text-white/60 text-xs uppercase tracking-widest">Date of Birth</label>
      <input className="input-field" type="date"
        value={form.birth_date} onChange={(e) => update("birth_date", e.target.value)} />
      <label className="text-white/60 text-xs uppercase tracking-widest">Gender</label>
      <select className="input-field" value={form.gender} onChange={(e) => update("gender", e.target.value)}>
        <option value="man">Man</option>
        <option value="woman">Woman</option>
        <option value="non_binary">Non-binary</option>
        <option value="prefer_not_to_say">Prefer not to say</option>
      </select>
      <label className="text-white/60 text-xs uppercase tracking-widest">Location</label>
      <input className="input-field" placeholder="City, Country"
        value={form.location} onChange={(e) => update("location", e.target.value)} />
      <label className="text-white/60 text-xs uppercase tracking-widest">Occupation</label>
      <input className="input-field" placeholder="CEO, Investor, Entrepreneur…"
        value={form.occupation} onChange={(e) => update("occupation", e.target.value)} />
      <label className="text-white/60 text-xs uppercase tracking-widest">Company (optional)</label>
      <input className="input-field" placeholder="Company or Fund name"
        value={form.company} onChange={(e) => update("company", e.target.value)} />
      <label className="text-white/60 text-xs uppercase tracking-widest">Wealth Tier</label>
      <select className="input-field" value={form.wealth_tier} onChange={(e) => update("wealth_tier", e.target.value)}>
        {Object.entries(WEALTH_TIER_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </div>,

    // Step 2 — Lifestyle
    <div key="lifestyle" className="flex flex-col gap-4">
      <h2 className="font-serif text-2xl text-white mb-1">Your lifestyle</h2>
      <p className="text-white/40 text-sm mb-2">Select all that apply.</p>
      <label className="text-white/60 text-xs uppercase tracking-widest mb-1">Lifestyle</label>
      <div className="flex flex-wrap gap-2">
        {LIFESTYLE_OPTIONS.map((opt) => (
          <button key={opt} type="button"
            onClick={() => update("lifestyle", toggle(form.lifestyle, opt))}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              form.lifestyle.includes(opt)
                ? "bg-gold-500/20 border-gold-500 text-gold-400"
                : "border-surface-500 text-white/50 hover:border-white/30"
            }`}>{opt}</button>
        ))}
      </div>
      <label className="text-white/60 text-xs uppercase tracking-widest mt-2 mb-1">Interests</label>
      <div className="flex flex-wrap gap-2">
        {INTEREST_OPTIONS.map((opt) => (
          <button key={opt} type="button"
            onClick={() => update("interests", toggle(form.interests, opt))}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              form.interests.includes(opt)
                ? "bg-gold-500/20 border-gold-500 text-gold-400"
                : "border-surface-500 text-white/50 hover:border-white/30"
            }`}>{opt}</button>
        ))}
      </div>
      <label className="text-white/60 text-xs uppercase tracking-widest mt-2">Bio (optional)</label>
      <textarea className="input-field h-28 resize-none" placeholder="Tell us about yourself…"
        value={form.bio} onChange={(e) => update("bio", e.target.value)} />
    </div>,

    // Step 3 — Preferences
    <div key="prefs" className="flex flex-col gap-4">
      <h2 className="font-serif text-2xl text-white mb-1">Your preferences</h2>
      <p className="text-white/40 text-sm mb-4">Who are you looking for?</p>
      <label className="text-white/60 text-xs uppercase tracking-widest mb-1">Interested in</label>
      <div className="flex gap-3">
        {["man","woman","non_binary"].map((g) => (
          <button key={g} type="button"
            onClick={() => update("seeking", toggle(form.seeking, g))}
            className={`flex-1 py-2 rounded-xl border text-sm transition-colors ${
              form.seeking.includes(g)
                ? "bg-gold-500/20 border-gold-500 text-gold-400"
                : "border-surface-500 text-white/50"
            }`}>{g === "non_binary" ? "Non-binary" : g.charAt(0).toUpperCase() + g.slice(1)}</button>
        ))}
      </div>
      <label className="text-white/60 text-xs uppercase tracking-widest mt-2">What you&apos;re looking for</label>
      <textarea className="input-field h-24 resize-none"
        placeholder="Describe your ideal match…"
        value={form.looking_for} onChange={(e) => update("looking_for", e.target.value)} />
      <div className="card p-5 mt-2">
        <p className="text-gold-500 text-xs uppercase tracking-widest mb-2">Verification</p>
        <p className="text-white/50 text-sm leading-relaxed">
          After submitting, our concierge team will contact you within 48 hours to complete
          wealth verification. Your profile will be visible once verified.
        </p>
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="font-serif text-2xl text-gold-500 tracking-widest mb-10">
        ELITEMATCH
      </Link>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
              ${i < step ? "bg-gold-500 text-black" : i === step ? "border-2 border-gold-500 text-gold-500" : "border border-surface-500 text-white/30"}`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? "text-white/70" : "text-white/25"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-surface-500 ml-1" />}
          </div>
        ))}
      </div>

      <div className="card w-full max-w-lg p-10">
        {stepContent[step]}

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3 mt-4">
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button className="btn-ghost flex-1" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="btn-gold flex-1" onClick={() => setStep(step + 1)}>
              Continue
            </button>
          ) : (
            <button className="btn-gold flex-1" onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting…" : "Submit Application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Upload, X, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Profile, WEALTH_TIER_LABELS, LIFESTYLE_OPTIONS, INTEREST_OPTIONS } from "@/lib/types";

const MAX_PHOTOS = 6;

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) setProfile(data);
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      display_name: profile.display_name,
      bio: profile.bio,
      occupation: profile.occupation,
      company: profile.company,
      location: profile.location,
      interests: profile.interests,
      lifestyle: profile.lifestyle,
      looking_for: profile.looking_for,
      wealth_tier: profile.wealth_tier,
    }).eq("id", userId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function uploadPhoto(file: File, slot: "avatar" | number) {
    const supabase = createClient();
    setUploadingIdx(slot === "avatar" ? -1 : slot);
    const ext = file.name.split(".").pop();
    const path = slot === "avatar"
      ? `${userId}/avatar.${ext}`
      : `${userId}/photo_${slot}.${ext}`;

    await supabase.storage.from("profile-photos").upload(path, file, { upsert: true });
    const { data: { publicUrl } } = supabase.storage.from("profile-photos").getPublicUrl(path);

    if (slot === "avatar") {
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
      setProfile(p => ({ ...p, avatar_url: publicUrl }));
    } else {
      const photos = [...(profile.photos ?? [])];
      photos[slot] = publicUrl;
      await supabase.from("profiles").update({ photos }).eq("id", userId);
      setProfile(p => ({ ...p, photos }));
    }
    setUploadingIdx(null);
  }

  async function removePhoto(slot: number) {
    const supabase = createClient();
    const photos = [...(profile.photos ?? [])];
    photos.splice(slot, 1);
    await supabase.from("profiles").update({ photos }).eq("id", userId);
    setProfile(p => ({ ...p, photos }));
  }

  function toggle(field: "interests" | "lifestyle", val: string) {
    const arr = (profile[field] ?? []) as string[];
    setProfile(p => ({
      ...p,
      [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val],
    }));
  }

  if (loading) return (
    <div className="text-white/30 text-sm text-center py-20">Loading profile…</div>
  );

  const photos = profile.photos ?? [];
  const photoSlots = Array.from({ length: MAX_PHOTOS - 1 }, (_, i) => photos[i] ?? null);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-white">Your Profile</h1>
        <button onClick={save} disabled={saving} className="btn-gold text-sm py-2 px-5">
          {saved ? "Saved ✓" : saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col gap-5">

        {/* Photos */}
        <div className="card p-6">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-4">
            Photos <span className="text-white/25 normal-case tracking-normal">({photos.length + (profile.avatar_url ? 1 : 0)}/{MAX_PHOTOS})</span>
          </p>

          <div className="grid grid-cols-3 gap-3">
            {/* Avatar — always slot 0 */}
            <PhotoSlot
              url={profile.avatar_url ?? null}
              label="Main Photo"
              uploading={uploadingIdx === -1}
              onUpload={f => uploadPhoto(f, "avatar")}
              onRemove={() => {
                const supabase = createClient();
                supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
                setProfile(p => ({ ...p, avatar_url: undefined }));
              }}
            />

            {/* Additional photos */}
            {photoSlots.map((url, i) => (
              <PhotoSlot
                key={i}
                url={url}
                uploading={uploadingIdx === i}
                onUpload={f => uploadPhoto(f, i)}
                onRemove={() => removePhoto(i)}
              />
            ))}
          </div>
          <p className="text-white/25 text-xs mt-3">Tap a slot to upload · First photo is your main profile picture</p>
        </div>

        {/* Basic info */}
        <div className="card p-6 flex flex-col gap-4">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Basic Info</p>
          {[
            { label: "Display Name", key: "display_name" },
            { label: "Occupation",   key: "occupation"   },
            { label: "Company",      key: "company"      },
            { label: "Location",     key: "location"     },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="text-white/40 text-xs uppercase tracking-widest block mb-1.5">{label}</label>
              <input className="input-field"
                value={(profile[key as keyof Profile] as string) ?? ""}
                onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="text-white/40 text-xs uppercase tracking-widest block mb-1.5">Wealth Tier</label>
            <select className="input-field" value={profile.wealth_tier ?? "hnw"}
              onChange={e => setProfile(p => ({ ...p, wealth_tier: e.target.value as Profile["wealth_tier"] }))}>
              {Object.entries(WEALTH_TIER_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bio */}
        <div className="card p-6">
          <label className="text-white/60 text-xs uppercase tracking-widest block mb-3">Bio</label>
          <textarea className="input-field h-28 resize-none"
            placeholder="Tell members about yourself…"
            value={profile.bio ?? ""}
            onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
        </div>

        {/* Lifestyle */}
        <div className="card p-6">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-4">Lifestyle</p>
          <div className="flex flex-wrap gap-2">
            {LIFESTYLE_OPTIONS.map(opt => (
              <button key={opt} type="button" onClick={() => toggle("lifestyle", opt)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  (profile.lifestyle ?? []).includes(opt)
                    ? "bg-gold-500/20 border-gold-500 text-gold-400"
                    : "border-surface-500 text-white/40 hover:border-white/30"}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="card p-6">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-4">Interests</p>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map(opt => (
              <button key={opt} type="button" onClick={() => toggle("interests", opt)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  (profile.interests ?? []).includes(opt)
                    ? "bg-gold-500/20 border-gold-500 text-gold-400"
                    : "border-surface-500 text-white/40 hover:border-white/30"}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Looking for */}
        <div className="card p-6">
          <label className="text-white/60 text-xs uppercase tracking-widest block mb-3">Looking For</label>
          <textarea className="input-field h-24 resize-none"
            placeholder="Describe your ideal match…"
            value={profile.looking_for ?? ""}
            onChange={e => setProfile(p => ({ ...p, looking_for: e.target.value }))} />
        </div>

      </div>
    </div>
  );
}

function PhotoSlot({ url, label, uploading, onUpload, onRemove }: {
  url: string | null;
  label?: string;
  uploading: boolean;
  onUpload: (f: File) => void;
  onRemove: () => void;
}) {
  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-600 group">
      {url ? (
        <>
          <Image src={url} alt="" fill className="object-cover" />
          <button onClick={onRemove}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 rounded-full
                       flex items-center justify-center text-white opacity-0 group-hover:opacity-100
                       transition-opacity hover:bg-red-500/80">
            <X size={12} />
          </button>
          {label && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent
                            px-2 py-1.5">
              <span className="text-white/60 text-xs">{label}</span>
            </div>
          )}
        </>
      ) : (
        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer
                           hover:bg-surface-500 transition-colors gap-1">
          {uploading ? (
            <span className="text-white/30 text-xs">Uploading…</span>
          ) : (
            <>
              <Plus size={20} className="text-white/20" />
              {label && <span className="text-white/20 text-xs">{label}</span>}
            </>
          )}
          <input type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
        </label>
      )}
    </div>
  );
}

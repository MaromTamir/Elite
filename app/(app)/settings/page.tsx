"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, LogOut, Trash2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Profile, WEALTH_TIER_LABELS } from "@/lib/types";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setEmail(user.email ?? "");
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) setProfile(data);
    setLoading(false);
  }

  function flash(text: string, ok = true) {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) { flash("Passwords don't match", false); return; }
    if (newPassword.length < 8) { flash("Password must be at least 8 characters", false); return; }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) flash(error.message, false);
    else { flash("Password updated"); setNewPassword(""); setConfirmPassword(""); }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  async function deleteAccount() {
    const res = await fetch("/api/account/delete", { method: "DELETE" });
    if (res.ok) {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    } else {
      flash("Failed to delete account", false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-white/30 text-sm">Loading…</div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-serif text-3xl text-white mb-8">Settings</h1>

      <div className="flex flex-col gap-5">
        {/* Account status */}
        <div className="card p-6">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-4">Account Status</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium mb-1">{email}</p>
              <div className="flex items-center gap-2">
                <Shield size={12} className={profile.verification_status === "verified"
                  ? "text-emerald-400" : "text-amber-400"} />
                <span className={`text-xs capitalize ${profile.verification_status === "verified"
                  ? "text-emerald-400" : "text-amber-400"}`}>
                  {profile.verification_status === "verified" ? "Verified Member" : `Verification ${profile.verification_status}`}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/30 text-xs">{WEALTH_TIER_LABELS[profile.wealth_tier as keyof typeof WEALTH_TIER_LABELS]}</p>
              {profile.is_premium && (
                <span className="text-gold-400 text-xs">Premium</span>
              )}
            </div>
          </div>
          {profile.verification_status !== "verified" && (
            <p className="text-white/30 text-xs mt-3 pt-3 border-t border-surface-500">
              Your profile is under review. You will appear in Discover once verified by our team.
            </p>
          )}
        </div>

        {/* Profile link */}
        <div className="card p-6">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-4">Your Profile</p>
          <Link href="/profile" className="btn-ghost text-sm inline-flex">
            Edit Profile & Photos →
          </Link>
        </div>

        {/* Change password */}
        <div className="card p-6">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-4">Change Password</p>
          <div className="flex flex-col gap-3">
            <PasswordInput
              placeholder="New password"
              value={newPassword}
              onChange={setNewPassword}
            />
            <PasswordInput
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
            <button onClick={changePassword} disabled={saving || !newPassword}
              className="btn-gold self-start text-sm py-2 px-5 disabled:opacity-40">
              {saving ? "Saving…" : "Update Password"}
            </button>
          </div>
        </div>

        {/* Admin panel link */}
        {profile.is_admin && (
          <div className="card p-6 border-gold-500/20">
            <p className="text-white/60 text-xs uppercase tracking-widest mb-3">Administration</p>
            <Link href="/admin" className="btn-gold text-sm inline-flex">
              Open Admin Panel →
            </Link>
          </div>
        )}

        {/* Message */}
        {msg && (
          <div className={`px-4 py-3 rounded-xl border text-sm ${msg.ok
            ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
            : "bg-red-400/10 border-red-400/20 text-red-400"}`}>
            {msg.text}
          </div>
        )}

        {/* Danger zone */}
        <div className="card p-6 border-red-500/10">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-4">Account Actions</p>
          <div className="flex gap-3">
            <button onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-500
                         text-white/50 hover:text-white hover:border-white/30 text-sm transition-colors">
              <LogOut size={14} /> Sign Out
            </button>
            <button onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20
                         text-red-400/60 hover:text-red-400 hover:border-red-500/40 text-sm transition-colors">
              <Trash2 size={14} /> Delete Account
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-white/70 text-sm mb-3">
                This permanently deletes your account and all data. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="btn-ghost text-sm py-2 px-4">Cancel</button>
                <button onClick={deleteAccount}
                  className="bg-red-500 hover:bg-red-400 text-white text-sm py-2 px-4 rounded-xl transition-colors">
                  Yes, Delete My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordInput({ placeholder, value, onChange }: {
  placeholder: string; value: string; onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} className="input-field pr-10"
        placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

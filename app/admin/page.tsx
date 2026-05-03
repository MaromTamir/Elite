"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle, XCircle, Clock, Users, Shield, RefreshCw } from "lucide-react";
import { Profile, WEALTH_TIER_LABELS } from "@/lib/types";
import clsx from "clsx";

type Tab = "pending" | "all";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [pendingRes, allRes] = await Promise.all([
      fetch("/api/admin/profiles").then(r => r.json()),
      fetch("/api/admin/all-profiles").then(r => r.json()),
    ]);
    setProfiles(Array.isArray(pendingRes) ? pendingRes : []);
    setAllProfiles(Array.isArray(allRes) ? allRes : []);
    setLoading(false);
  }

  async function act(profile_id: string, action: "approve" | "reject") {
    setActing(profile_id);
    await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id, action }),
    });
    await loadAll();
    setActing(null);
  }

  const verified = allProfiles.filter(p => p.verification_status === "verified").length;
  const pending = allProfiles.filter(p => p.verification_status === "pending").length;
  const rejected = allProfiles.filter(p => p.verification_status === "rejected").length;

  const displayed = tab === "pending" ? profiles : allProfiles;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-white">Member Verification</h1>
        <button onClick={loadAll} className="btn-ghost text-sm py-2 px-4 flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Members", value: allProfiles.length, icon: Users, color: "text-white" },
          { label: "Pending Review", value: pending, icon: Clock, color: "text-amber-400" },
          { label: "Verified", value: verified, icon: CheckCircle, color: "text-emerald-400" },
          { label: "Rejected", value: rejected, icon: XCircle, color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center gap-3 mb-1">
              <s.icon size={16} className={s.color} />
              <span className="text-white/40 text-xs uppercase tracking-widest">{s.label}</span>
            </div>
            <span className={`font-serif text-3xl ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-700 p-1 rounded-xl w-fit">
        {(["pending", "all"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={clsx("px-5 py-2 rounded-lg text-sm transition-colors capitalize",
              tab === t ? "bg-gold-500 text-black font-semibold" : "text-white/50 hover:text-white")}>
            {t === "pending" ? `Pending (${pending})` : `All Members (${allProfiles.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-white/30 text-sm py-20 text-center">Loading…</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle size={40} className="text-emerald-400/40 mx-auto mb-3" />
          <p className="text-white/40">No pending reviews</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map(p => (
            <div key={p.id} className="card p-5 flex items-center gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-xl bg-surface-600 overflow-hidden flex-shrink-0 relative">
                {p.avatar_url
                  ? <Image src={p.avatar_url} alt="" fill className="object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-white/20 font-serif text-2xl">
                      {p.display_name?.[0]?.toUpperCase()}
                    </div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-semibold">{p.display_name}</span>
                  <span className="text-white/30 text-sm">({p.full_name})</span>
                  <StatusBadge status={p.verification_status} />
                </div>
                <div className="flex flex-wrap gap-3 text-white/40 text-xs">
                  <span>{p.occupation}{p.company ? ` · ${p.company}` : ""}</span>
                  <span>{p.location}</span>
                  <span>{WEALTH_TIER_LABELS[p.wealth_tier]}</span>
                </div>
                {p.bio && <p className="text-white/30 text-xs mt-1 line-clamp-1">{p.bio}</p>}
              </div>

              {/* Date */}
              <div className="text-white/25 text-xs hidden lg:block flex-shrink-0">
                {new Date(p.created_at).toLocaleDateString()}
              </div>

              {/* Actions — only shown for pending/in_review */}
              {(p.verification_status === "pending" || p.verification_status === "in_review") && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => act(p.id, "reject")}
                    disabled={acting === p.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-500/30
                               text-red-400 hover:bg-red-500/10 text-sm transition-colors disabled:opacity-40">
                    <XCircle size={14} /> Reject
                  </button>
                  <button
                    onClick={() => act(p.id, "approve")}
                    disabled={acting === p.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/20
                               border border-emerald-500/40 text-emerald-400
                               hover:bg-emerald-500/30 text-sm transition-colors disabled:opacity-40">
                    <CheckCircle size={14} />
                    {acting === p.id ? "Saving…" : "Approve"}
                  </button>
                </div>
              )}

              {p.verification_status === "verified" && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs flex-shrink-0">
                  <Shield size={12} /> Verified
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    in_review: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    verified: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    rejected: "text-red-400 bg-red-400/10 border-red-400/20",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      const { data } = await supabase
        .from("profiles").select("is_admin").eq("id", user.id).single();

      if (!data?.is_admin) { router.replace("/discover"); return; }
      setReady(true);
    }
    check();
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <span className="font-serif text-gold-500 tracking-widest">ELITEMATCH</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      <header className="bg-surface-800 border-b border-surface-600 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-serif text-gold-500 tracking-widest">ELITEMATCH</span>
          <span className="text-white/30 text-xs uppercase tracking-widest border border-surface-500 px-2 py-1 rounded">
            Admin
          </span>
        </div>
        <Link href="/discover" className="text-white/40 hover:text-white text-sm transition-colors">
          ← Back to App
        </Link>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">{children}</main>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/discover");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col items-center justify-center px-4">
      <Link href="/" className="font-serif text-2xl text-gold-500 tracking-widest mb-12">
        ELITEMATCH
      </Link>

      <div className="card w-full max-w-md p-10">
        <h1 className="font-serif text-3xl text-white mb-2">Welcome back</h1>
        <p className="text-white/40 text-sm mb-8">Sign in to your private account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-white/60 text-xs uppercase tracking-widest block mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="text-white/60 text-xs uppercase tracking-widest block mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button type="submit" className="btn-gold mt-2" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-white/30 text-sm mt-6">
          Not a member?{" "}
          <Link href="/register" className="text-gold-500 hover:text-gold-400">
            Apply for access
          </Link>
        </p>
      </div>
    </div>
  );
}

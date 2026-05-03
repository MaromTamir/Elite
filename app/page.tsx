import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface-900 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-surface-700">
        <span className="font-serif text-2xl text-gold-500 tracking-widest">ELITEMATCH</span>
        <div className="flex gap-4">
          <Link href="/login" className="btn-ghost text-sm py-2 px-5">Sign In</Link>
          <Link href="/register" className="btn-gold text-sm py-2 px-5">Apply for Access</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-gold-500 text-xs tracking-[0.3em] uppercase mb-6">
          By Invitation &amp; Application Only
        </p>
        <h1 className="font-serif text-5xl md:text-7xl font-light text-white leading-tight mb-6 max-w-4xl">
          Where Extraordinary
          <br />
          <span className="text-gold-500">People Connect</span>
        </h1>
        <p className="text-white/50 text-lg max-w-xl mb-12 leading-relaxed">
          EliteMatch is the most exclusive dating platform for verified high net worth
          individuals. Every member is personally vetted. Absolute discretion guaranteed.
        </p>
        <Link href="/register" className="btn-gold text-base px-10 py-4">
          Request Access
        </Link>
        <p className="text-white/25 text-xs mt-4">
          Membership from $5,000/year · All applicants reviewed within 48 hours
        </p>
      </section>

      {/* Stats */}
      <section className="border-t border-surface-700 grid grid-cols-3 divide-x divide-surface-700">
        {[
          { value: "12,400+", label: "Verified Members" },
          { value: "$47M", label: "Avg. Net Worth" },
          { value: "98%", label: "Discretion Rating" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center py-10 gap-2">
            <span className="font-serif text-3xl text-gold-500">{s.value}</span>
            <span className="text-white/40 text-xs tracking-widest uppercase">{s.label}</span>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="px-8 py-20 max-w-5xl mx-auto w-full">
        <h2 className="font-serif text-3xl text-center text-white mb-14">
          Designed for the <span className="text-gold-500">Discerning</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Wealth Verification",
              body: "Every member's net worth is independently verified through our discreet financial vetting process.",
            },
            {
              title: "Curated Matching",
              body: "Our algorithm considers lifestyle, values, and ambition — not just photos.",
            },
            {
              title: "Private by Default",
              body: "Profile photos are blurred until you mutually match. Your identity stays protected.",
            },
          ].map((f) => (
            <div key={f.title} className="card p-8">
              <div className="w-8 h-px bg-gold-500 mb-6" />
              <h3 className="text-white font-semibold mb-3">{f.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-700 px-8 py-6 flex items-center justify-between text-white/25 text-xs">
        <span className="font-serif text-gold-500/60 tracking-widest">ELITEMATCH</span>
        <span>© 2026 EliteMatch. All rights reserved.</span>
      </footer>
    </main>
  );
}

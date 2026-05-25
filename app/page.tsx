import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface-900 flex flex-col overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-60 -right-60 w-[700px] h-[700px] rounded-full opacity-[0.035]"
          style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.02]"
          style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 60%)" }}
        />
      </div>

      {/* Nav */}
      <nav className="relative flex items-center justify-between px-8 py-6 border-b border-surface-700/80">
        <span className="font-serif text-2xl text-gold-500 tracking-widest animate-shimmer">
          ELITEMATCH
        </span>
        <div className="flex gap-4">
          <Link href="/login" className="btn-ghost text-sm py-2 px-5">
            Sign In
          </Link>
          <Link href="/register" className="btn-gold text-sm py-2 px-5">
            Apply for Access
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        {/* Thin gold rule */}
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-gold-500/40 mb-8 mx-auto" />

        <p className="text-gold-500 text-xs tracking-[0.35em] uppercase mb-6 animate-fadein">
          By Invitation &amp; Application Only
        </p>
        <h1 className="font-serif text-5xl md:text-7xl font-light text-white leading-[1.08] mb-6 max-w-4xl animate-fadein-slow">
          Where Extraordinary
          <br />
          <span className="text-gold-500">People Connect</span>
        </h1>
        <p className="text-white/45 text-lg max-w-xl mb-12 leading-relaxed animate-fadein-slower">
          EliteMatch is the world&apos;s most exclusive dating platform for verified
          high net worth individuals. Every member personally vetted.
          Absolute discretion guaranteed.
        </p>

        <div className="flex flex-col items-center gap-4 animate-fadein-slower">
          <Link href="/register" className="btn-gold text-base px-12 py-4 shadow-gold">
            Request Access
          </Link>
          <p className="text-white/20 text-xs">
            Membership from $5,000/year · Reviewed within 48 hours
          </p>
        </div>

        <div className="w-px h-12 bg-gradient-to-b from-gold-500/40 to-transparent mt-16 mx-auto" />
      </section>

      {/* Stats */}
      <section className="relative border-t border-surface-700 grid grid-cols-3 divide-x divide-surface-700">
        {[
          { value: "12,400+", label: "Verified Members" },
          { value: "$47M",    label: "Avg. Net Worth"   },
          { value: "98%",     label: "Discretion Rating" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center py-10 gap-2">
            <span className="font-serif text-3xl text-gold-500">{s.value}</span>
            <span className="text-white/35 text-xs tracking-widest uppercase">{s.label}</span>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="relative px-8 py-20 max-w-5xl mx-auto w-full">
        <p className="text-gold-500/60 text-xs tracking-[0.3em] uppercase text-center mb-3">
          Why EliteMatch
        </p>
        <h2 className="font-serif text-3xl text-center text-white mb-14">
          Designed for the <span className="text-gold-500">Discerning</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Wealth Verification",
              body: "Every member's net worth is independently verified through our discreet financial vetting process. No exceptions.",
            },
            {
              title: "Curated Matching",
              body: "Our algorithm weighs lifestyle, values, ambition, and compatibility — not just photographs.",
            },
            {
              title: "Private by Default",
              body: "Profile photos are blurred until you mutually match. Your identity stays protected at every stage.",
            },
            {
              title: "Elite Events",
              body: "Exclusive access to curated gatherings — from Monaco Grand Prix paddocks to private island retreats.",
            },
            {
              title: "Concierge Support",
              body: "A dedicated human concierge team available around the clock to assist with any aspect of your experience.",
            },
            {
              title: "Zero Compromise",
              body: "We reject over 85% of applicants. The quality of your experience depends on the quality of our community.",
            },
          ].map((f) => (
            <div key={f.title} className="card p-8 group hover:border-gold-500/30 transition-colors">
              <div className="w-8 h-px bg-gold-500/60 mb-6 group-hover:w-12 transition-all duration-300" />
              <h3 className="text-white font-semibold mb-3">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="relative border-t border-surface-700 py-20 px-8 text-center">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 50%, #C9A84C 0%, transparent 100%)",
          }}
        />
        <p className="text-gold-500 text-xs tracking-[0.3em] uppercase mb-4">
          An Extraordinary Community Awaits
        </p>
        <h2 className="font-serif text-4xl text-white mb-8 max-w-2xl mx-auto leading-tight">
          Your story deserves a worthy co-author
        </h2>
        <Link href="/register" className="btn-gold text-base px-12 py-4">
          Apply Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-700 px-8 py-6 flex items-center justify-between text-white/20 text-xs">
        <span className="font-serif text-gold-500/50 tracking-widest">ELITEMATCH</span>
        <span>© 2026 EliteMatch. All rights reserved.</span>
      </footer>
    </main>
  );
}

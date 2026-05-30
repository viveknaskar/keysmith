"use client";

import { ShieldCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="relative text-center pt-16 pb-10 select-none">
      {/* Soft glow behind the logo, breathing slowly. */}
      <div
        aria-hidden
        className="ks-hero-glow pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 w-[320px] h-[320px]"
        style={{
          background: 'radial-gradient(circle, rgba(122,162,247,0.18) 0%, transparent 65%)',
        }}
      />

      {/* Logo mark */}
      <div className="relative flex items-center justify-center mb-6">
        <div
          className="ks-card w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(160deg, #1a1a1f 0%, #121216 100%)', border: '1px solid #2e2e38' }}
        >
          <ShieldCheck className="w-8 h-8" style={{ color: '#7aa2f7' }} />
        </div>
      </div>

      {/* Title */}
      <h1 className="ks-title relative text-5xl sm:text-6xl font-semibold tracking-tight mb-4">
        Keysmith
      </h1>

      {/* Tagline */}
      <p className="relative text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
        Strong, high-entropy passwords and passphrases, generated entirely in
        your browser.
      </p>

      {/* Sub-badge */}
      <div
        className="ks-card relative inline-flex items-center gap-2 mt-6 px-3.5 py-1.5 rounded-full text-xs font-medium"
        style={{ background: '#141417', border: '1px solid #26262b', color: '#a1a1aa' }}
      >
        <span className="ks-dot relative w-1.5 h-1.5 rounded-full" style={{ background: '#7aa2f7' }} />
        100% client-side · Zero data stored · No network requests
      </div>
    </header>
  );
}

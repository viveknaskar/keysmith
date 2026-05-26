"use client";

import { ShieldCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="relative text-center pt-16 pb-10 select-none">
      {/* Logo mark */}
      <div className="flex items-center justify-center mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: '#141417', border: '1px solid #26262b' }}
        >
          <ShieldCheck className="w-7 h-7" style={{ color: '#7aa2f7' }} />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight mb-4 text-white">
        EntropyPass
      </h1>

      {/* Tagline */}
      <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
        Strong, high-entropy passwords and passphrases, generated entirely in
        your browser.
      </p>

      {/* Sub-badge */}
      <div
        className="inline-flex items-center gap-2 mt-6 px-3.5 py-1.5 rounded-full text-xs font-medium"
        style={{ background: '#141417', border: '1px solid #26262b', color: '#a1a1aa' }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#7aa2f7' }} />
        100% client-side · Zero data stored · No network requests
      </div>
    </header>
  );
}

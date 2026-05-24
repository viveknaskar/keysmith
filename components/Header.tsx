"use client";

import { Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="relative text-center py-16 select-none">
      {/* Logo mark */}
      <div className="flex items-center justify-center mb-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(124,58,237,0.15) 100%)',
            border: '1px solid rgba(0,212,255,0.2)',
            boxShadow: '0 0 30px rgba(0,212,255,0.1)',
          }}
        >
          <Shield className="w-8 h-8" style={{ color: '#00d4ff' }} />
        </div>
      </div>

      {/* Title */}
      <h1
        className="text-6xl font-bold tracking-tight mb-4"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 50%, #7c3aed 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        EntropyPass
      </h1>

      {/* Tagline */}
      <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
        Generate strong, high-entropy passwords and passphrases &mdash;
        powered by your browser&rsquo;s cryptographically secure RNG.
      </p>

      {/* Sub-badge */}
      <div className="inline-flex items-center gap-2 mt-5 px-4 py-1.5 rounded-full text-xs font-medium"
        style={{
          background: 'rgba(0,212,255,0.06)',
          border: '1px solid rgba(0,212,255,0.15)',
          color: '#00d4ff',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: '#00d4ff' }}
        />
        100% client-side &middot; Zero data stored &middot; No network requests
      </div>
    </header>
  );
}

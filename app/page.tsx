"use client";

import { useState, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { FeatureOverview } from '@/components/FeatureOverview';
import { PasswordConfig } from '@/components/PasswordConfig';
import { GeneratedPassword } from '@/components/GeneratedPassword';
import { PasswordStrengthTester } from '@/components/PasswordStrengthTester';
import { PasswordHistory, HistoryEntry } from '@/components/PasswordHistory';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Home() {
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordEntropyBits, setPasswordEntropyBits] = useState(0);
  const [regenerateTrigger, setRegenerateTrigger] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const historyIdRef = useRef(0);

  // Stable identity: PasswordConfig's regenerate effect depends on this, so an
  // inline arrow here would make that effect re-run every render and loop.
  const handlePasswordGenerated = useCallback((pw: string, bits: number) => {
    setGeneratedPassword(pw);
    setPasswordEntropyBits(bits);
    setHistory(h => [
      { id: historyIdRef.current++, password: pw, entropyBits: bits, createdAt: new Date() },
      ...h,
    ].slice(0, 10));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#0b0b0d' }}>
      {/* Layered, subtle backdrop for depth, no neon */}
      <div
        className="fixed top-0 left-0 right-0 h-[420px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(122,162,247,0.07) 0%, transparent 70%)',
        }}
      />
      <div
        className="fixed bottom-0 left-0 right-0 h-[360px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 100% at 50% 100%, rgba(122,162,247,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 py-10 space-y-8">
        <Header />
        <FeatureOverview />
        <ErrorBoundary>
          <PasswordConfig
            regenerateTrigger={regenerateTrigger}
            onPasswordGenerated={handlePasswordGenerated}
          />
          <GeneratedPassword
            password={generatedPassword}
            entropyBits={passwordEntropyBits}
            onRegenerate={() => setRegenerateTrigger(t => t + 1)}
          />
          <PasswordHistory entries={history} onClear={() => setHistory([])} />
          <PasswordStrengthTester />
        </ErrorBoundary>

        <footer className="text-center text-xs text-zinc-700 py-4">
          Keysmith. All generation happens client-side. Nothing is stored or transmitted.
        </footer>
      </div>
    </div>
  );
}

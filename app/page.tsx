"use client";

import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { FeatureOverview } from '@/components/FeatureOverview';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { PasswordConfig } from '@/components/PasswordConfig';
import { GeneratedPassword } from '@/components/GeneratedPassword';
import { PasswordStrengthTester } from '@/components/PasswordStrengthTester';
import { PasswordHistory, HistoryEntry } from '@/components/PasswordHistory';

export default function Home() {
  const [entropyLevel, setEntropyLevel] = useState<'weak' | 'moderate' | 'strong'>('weak');
  const [canvasEntropy, setCanvasEntropy] = useState<number[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordEntropyBits, setPasswordEntropyBits] = useState(0);
  const [regenerateTrigger, setRegenerateTrigger] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const historyIdRef = useRef(0);

  useEffect(() => {
    if (canvasEntropy.length === 0) {
      setEntropyLevel('weak');
    } else if (canvasEntropy.length < 120) {
      setEntropyLevel('moderate');
    } else {
      setEntropyLevel('strong');
    }
  }, [canvasEntropy]);

  return (
    <div className="min-h-screen" style={{ background: '#050505' }}>
      {/* Background grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Top gradient blob */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 py-10 space-y-8">
        <Header />
        <FeatureOverview />
        <DrawingCanvas
          entropyLevel={entropyLevel}
          onEntropyChange={setCanvasEntropy}
        />
        <PasswordConfig
          canvasEntropy={canvasEntropy}
          hasDrawnEntropy={canvasEntropy.length > 0}
          regenerateTrigger={regenerateTrigger}
          onPasswordGenerated={(pw, bits) => {
            setGeneratedPassword(pw);
            setPasswordEntropyBits(bits);
            setHistory(h => [
              { id: historyIdRef.current++, password: pw, entropyBits: bits, createdAt: new Date() },
              ...h,
            ].slice(0, 10));
          }}
        />
        <GeneratedPassword
          password={generatedPassword}
          entropyBits={passwordEntropyBits}
          onRegenerate={() => setRegenerateTrigger(t => t + 1)}
        />
        <PasswordHistory entries={history} onClear={() => setHistory([])} />
        <PasswordStrengthTester />

        <footer className="text-center text-xs text-zinc-700 py-4">
          EntropyPass &mdash; All generation happens client-side. Nothing is stored or transmitted.
        </footer>
      </div>
    </div>
  );
}

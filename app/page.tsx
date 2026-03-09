"use client";

import { useState, useEffect } from 'react';
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
  const historyIdRef = { current: 0 };

  // Calculate entropy level based on canvas data
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
    <div className="min-h-screen bg-slate-900 dark:bg-slate-900 light:bg-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Header />
        
        <div className="space-y-8">
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
        </div>
      </div>
    </div>
  );
}
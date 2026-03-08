"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { FeatureOverview } from '@/components/FeatureOverview';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { PasswordConfig } from '@/components/PasswordConfig';
import { GeneratedPassword } from '@/components/GeneratedPassword';
import { PasswordStrengthTester } from '@/components/PasswordStrengthTester';

export default function Home() {
  const [entropyLevel, setEntropyLevel] = useState<'weak' | 'moderate' | 'strong'>('weak');
  const [canvasEntropy, setCanvasEntropy] = useState<number[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordEntropyBits, setPasswordEntropyBits] = useState(0);
  const [regenerateTrigger, setRegenerateTrigger] = useState(0);

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
    <div className="min-h-screen bg-slate-900">
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
            regenerateTrigger={regenerateTrigger}
            onPasswordGenerated={(pw, bits) => {
              setGeneratedPassword(pw);
              setPasswordEntropyBits(bits);
            }}
          />

          <GeneratedPassword
            password={generatedPassword}
            entropyBits={passwordEntropyBits}
            onRegenerate={() => setRegenerateTrigger(t => t + 1)}
          />
          
          <PasswordStrengthTester />
        </div>
      </div>
    </div>
  );
}
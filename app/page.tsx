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
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'moderate' | 'strong'>('weak');

  // Calculate entropy level based on canvas data
  useEffect(() => {
    if (canvasEntropy.length === 0) {
      setEntropyLevel('weak');
    } else if (canvasEntropy.length < 50) {
      setEntropyLevel('moderate');
    } else {
      setEntropyLevel('strong');
    }
  }, [canvasEntropy]);

  // Calculate password strength
  useEffect(() => {
    if (generatedPassword.length === 0) {
      setPasswordStrength('weak');
    } else if (generatedPassword.length < 12) {
      setPasswordStrength('moderate');
    } else {
      setPasswordStrength('strong');
    }
  }, [generatedPassword]);

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
            onPasswordGenerated={setGeneratedPassword}
          />
          
          <GeneratedPassword 
            password={generatedPassword}
            strength={passwordStrength}
          />
          
          <PasswordStrengthTester />
        </div>
      </div>
    </div>
  );
}
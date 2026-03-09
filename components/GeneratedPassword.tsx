"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommon from '@zxcvbn-ts/language-common';
import * as zxcvbnEn from '@zxcvbn-ts/language-en';

zxcvbnOptions.setOptions({
  translations: zxcvbnEn.translations,
  graphs: zxcvbnCommon.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommon.dictionary,
    ...zxcvbnEn.dictionary,
  },
});

interface GeneratedPasswordProps {
  password: string;
  entropyBits: number;
  onRegenerate: () => void;
}

type Strength = 'weak' | 'moderate' | 'strong';

function getStrength(bits: number): Strength {
  if (bits >= 80) return 'strong';
  if (bits >= 60) return 'moderate';
  return 'weak';
}

// Assumes 1 trillion guesses/sec (aggressive offline attack)
function getCrackTime(bits: number): string {
  if (bits === 0) return '';
  const guessesPerSecond = 1e12;
  const combinations = Math.pow(2, bits);
  const seconds = combinations / 2 / guessesPerSecond; // average case: half the keyspace

  if (seconds < 1) return 'less than a second';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 1000) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 31536000 * 1e6) return `${(seconds / 31536000 / 1000).toFixed(1)}K years`;
  if (seconds < 31536000 * 1e9) return `${(seconds / 31536000 / 1e6).toFixed(1)}M years`;
  return 'longer than the age of the universe';
}

function getCharBreakdown(password: string) {
  return {
    lower:   (password.match(/[a-z]/g) ?? []).length,
    upper:   (password.match(/[A-Z]/g) ?? []).length,
    numbers: (password.match(/[0-9]/g) ?? []).length,
    special: (password.match(/[^a-zA-Z0-9]/g) ?? []).length,
  };
}

export function GeneratedPassword({ password, entropyBits, onRegenerate }: GeneratedPasswordProps) {
  const [visible, setVisible] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success('Password copied to clipboard');
    } catch {
      toast.error('Failed to copy — please select and copy manually');
    }
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  const [zxcvbnScore, setZxcvbnScore] = useState<number | null>(null);
  const [zxcvbnFeedback, setZxcvbnFeedback] = useState<string[]>([]);

  useEffect(() => {
    if (!password) { setZxcvbnScore(null); setZxcvbnFeedback([]); return; }
    const result = zxcvbn(password);
    setZxcvbnScore(result.score);
    const warnings = [
      result.feedback.warning,
      ...(result.feedback.suggestions ?? []),
    ].filter(Boolean) as string[];
    setZxcvbnFeedback(warnings);
  }, [password]);

  const strength = getStrength(entropyBits);
  const crackTime = getCrackTime(entropyBits);
  const breakdown = getCharBreakdown(password);

  const zxcvbnLabel = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const zxcvbnBarColor = [
    'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500',
  ];

  const badgeColor: Record<Strength, string> = {
    strong:   'bg-green-900/30 text-green-400 hover:bg-green-900/30 border-green-700',
    moderate: 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/30 border-yellow-700',
    weak:     'bg-red-900/30 text-red-400 hover:bg-red-900/30 border-red-700',
  };

  const strengthLabel: Record<Strength, string> = {
    strong:   'Strong',
    moderate: 'Moderate',
    weak:     'Weak',
  };

  if (!password) {
    return (
      <Card className="bg-slate-800 border border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Generated Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-300">
            Configure your password settings and click "Generate Secure Password" to create a new password.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">
          Generated Password
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            value={password}
            readOnly
            onClick={handleInputClick}
            className="font-mono text-sm bg-slate-900 border-slate-600 text-white cursor-pointer"
            type={visible ? 'text' : 'password'}
          />
          <Button
            onClick={() => setVisible(v => !v)}
            variant="outline"
            size="icon"
            className="flex-shrink-0"
            title={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            onClick={onRegenerate}
            variant="outline"
            size="icon"
            className="flex-shrink-0"
            title="Regenerate"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="icon"
            className="flex-shrink-0"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Badge className={badgeColor[strength]}>
            {strengthLabel[strength]}
          </Badge>
          <span className="text-sm text-slate-300">
            {Math.round(entropyBits)} bits &middot; {password.length} chars
          </span>
        </div>

        {crackTime && (
          <div className="rounded-lg bg-slate-900 border border-slate-700 p-3 space-y-2">
            <div className="text-xs text-slate-400">
              At 1 trillion guesses/sec (offline attack), this password would take:
            </div>
            <div className="text-sm font-semibold text-white">{crackTime} to crack</div>
            <div className="flex gap-3 text-xs text-slate-400 flex-wrap pt-1">
              {breakdown.lower   > 0 && <span>{breakdown.lower} lowercase</span>}
              {breakdown.upper   > 0 && <span>{breakdown.upper} uppercase</span>}
              {breakdown.numbers > 0 && <span>{breakdown.numbers} numbers</span>}
              {breakdown.special > 0 && <span>{breakdown.special} special</span>}
            </div>
          </div>
        )}

        {zxcvbnScore !== null && (
          <div className="rounded-lg bg-slate-900 border border-slate-700 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Pattern analysis (zxcvbn)</span>
              <span className="text-xs font-medium text-white">{zxcvbnLabel[zxcvbnScore]}</span>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${i <= zxcvbnScore ? zxcvbnBarColor[zxcvbnScore] : 'bg-slate-700'}`}
                />
              ))}
            </div>
            {zxcvbnFeedback.length > 0 && (
              <ul className="text-xs text-slate-400 space-y-0.5 pt-1">
                {zxcvbnFeedback.map((tip, i) => <li key={i}>&bull; {tip}</li>)}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

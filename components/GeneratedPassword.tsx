"use client";

import { Button } from '@/components/ui/button';
import { Copy, Eye, EyeOff, RefreshCw, ClipboardX, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
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

function getCrackTime(bits: number): string {
  if (bits === 0) return '';
  const guessesPerSecond = 1e12;
  const combinations = Math.pow(2, bits);
  const seconds = combinations / 2 / guessesPerSecond;
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

const strengthConfig: Record<Strength, { color: string; bg: string; border: string; label: string; Icon: typeof Shield }> = {
  strong:   { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)',  label: 'Strong',   Icon: ShieldCheck },
  moderate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'Moderate', Icon: Shield },
  weak:     { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  label: 'Weak',     Icon: ShieldAlert },
};

const zxcvbnColors = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#22c55e'];
const zxcvbnLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

export function GeneratedPassword({ password, entropyBits, onRegenerate }: GeneratedPasswordProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zxcvbnScore, setZxcvbnScore] = useState<number | null>(null);
  const [zxcvbnFeedback, setZxcvbnFeedback] = useState<string[]>([]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success('Password copied to clipboard');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy — please select and copy manually');
    }
  };

  const clearClipboard = async () => {
    try {
      await navigator.clipboard.writeText('');
      toast.success('Clipboard cleared');
      setCopied(false);
    } catch {
      toast.error('Could not clear clipboard — clear it manually');
    }
  };

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

  if (!password) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.1)' }}
        >
          <Shield className="w-6 h-6 text-zinc-700" />
        </div>
        <p className="text-sm text-zinc-600">
          Configure your settings above and generate a password to see it here.
        </p>
      </div>
    );
  }

  const strength = getStrength(entropyBits);
  const crackTime = getCrackTime(entropyBits);
  const breakdown = getCharBreakdown(password);
  const cfg = strengthConfig[strength];
  const { Icon: StrengthIcon } = cfg;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: '#0a0a0a',
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 0 30px ${cfg.bg}`,
      }}
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid #141414' }}
      >
        <div className="flex items-center gap-2.5">
          <StrengthIcon className="w-4 h-4" style={{ color: cfg.color }} />
          <h2 className="text-base font-semibold text-white">Generated Password</h2>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
          {cfg.label}
        </span>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Password display */}
        <div
          className="flex items-center gap-2 p-3 rounded-xl"
          style={{ background: '#050505', border: '1px solid #1a1a1a' }}
        >
          <input
            value={password}
            readOnly
            type={visible ? 'text' : 'password'}
            onClick={e => (e.target as HTMLInputElement).select()}
            className="flex-1 bg-transparent font-mono text-sm text-white outline-none cursor-pointer min-w-0"
            style={{ letterSpacing: visible ? '0.02em' : '0.1em' }}
          />
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setVisible(v => !v)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: '#555', border: '1px solid #1a1a1a' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#555')}
              title={visible ? 'Hide' : 'Show'}
            >
              {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onRegenerate}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: '#555', border: '1px solid #1a1a1a' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#555')}
              title="Regenerate"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {copied && (
              <button
                onClick={clearClipboard}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: '#555', border: '1px solid #1a1a1a' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f59e0b')}
                onMouseLeave={e => (e.currentTarget.style.color = '#555')}
                title="Clear clipboard"
              >
                <ClipboardX className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={copyToClipboard}
              className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all"
              style={{
                background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(0,212,255,0.08)',
                border: `1px solid ${copied ? 'rgba(34,197,94,0.2)' : 'rgba(0,212,255,0.15)'}`,
                color: copied ? '#22c55e' : '#00d4ff',
              }}
              title="Copy"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Entropy', value: `${Math.round(entropyBits)} bits` },
            { label: 'Length',  value: `${password.length} chars` },
            { label: 'Crack time', value: crackTime },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg px-3 py-2.5 text-center"
              style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
            >
              <div className="text-xs text-zinc-600 mb-1">{label}</div>
              <div className="text-xs font-semibold text-white truncate" title={value}>{value}</div>
            </div>
          ))}
        </div>

        {/* Character breakdown */}
        <div
          className="rounded-lg px-4 py-3"
          style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
        >
          <div className="text-xs text-zinc-600 mb-2.5">Character breakdown</div>
          <div className="flex gap-3 flex-wrap">
            {breakdown.lower   > 0 && <span className="text-xs"><span className="text-zinc-500">{breakdown.lower}</span> <span className="text-zinc-700">lowercase</span></span>}
            {breakdown.upper   > 0 && <span className="text-xs"><span className="text-zinc-500">{breakdown.upper}</span> <span className="text-zinc-700">uppercase</span></span>}
            {breakdown.numbers > 0 && <span className="text-xs"><span className="text-zinc-500">{breakdown.numbers}</span> <span className="text-zinc-700">numbers</span></span>}
            {breakdown.special > 0 && <span className="text-xs"><span className="text-zinc-500">{breakdown.special}</span> <span className="text-zinc-700">special</span></span>}
          </div>
        </div>

        {/* zxcvbn analysis */}
        {zxcvbnScore !== null && (
          <div
            className="rounded-lg px-4 py-3 space-y-2.5"
            style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-600">Pattern analysis (zxcvbn)</span>
              <span className="text-xs font-medium" style={{ color: zxcvbnColors[zxcvbnScore] }}>
                {zxcvbnLabels[zxcvbnScore]}
              </span>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full"
                  style={{
                    background: i <= zxcvbnScore ? zxcvbnColors[zxcvbnScore] : '#1f1f1f',
                    boxShadow: i <= zxcvbnScore ? `0 0 6px ${zxcvbnColors[zxcvbnScore]}60` : 'none',
                  }}
                />
              ))}
            </div>
            {zxcvbnFeedback.length > 0 && (
              <ul className="text-xs text-zinc-600 space-y-0.5">
                {zxcvbnFeedback.map((tip, i) => <li key={i} className="flex gap-1.5"><span>·</span>{tip}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

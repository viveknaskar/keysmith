"use client";

import { Button } from '@/components/ui/button';
import { Copy, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export interface HistoryEntry {
  id: number;
  password: string;
  entropyBits: number;
  createdAt: Date;
}

interface PasswordHistoryProps {
  entries: HistoryEntry[];
  onClear: () => void;
}

function strengthInfo(bits: number) {
  if (bits >= 80) return { label: 'Strong',   color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)' };
  if (bits >= 60) return { label: 'Moderate', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' };
  return            { label: 'Weak',     color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)' };
}

export function PasswordHistory({ entries, onClear }: PasswordHistoryProps) {
  if (entries.length === 0) return null;

  const copy = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success('Password copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid #141414' }}
      >
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-zinc-600" />
          <div>
            <h2 className="text-base font-semibold text-white">Session History</h2>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ background: '#111', border: '1px solid #222', color: '#555' }}
          >
            {entries.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-zinc-700 hidden sm:block">Never stored · cleared on tab close</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-zinc-600 hover:text-red-400 hover:bg-red-950/30 h-8 gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all
          </Button>
        </div>
      </div>

      {/* Entries */}
      <div className="px-4 py-3 space-y-1.5">
        {entries.map((entry, idx) => {
          const { label, color, bg, border } = strengthInfo(entry.entropyBits);
          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all group"
              style={{ background: '#0d0d0d', border: '1px solid #161616' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#222')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#161616')}
            >
              <span className="text-xs text-zinc-700 font-mono w-4 shrink-0 select-none">
                {idx + 1}
              </span>
              <span className="font-mono text-sm text-white flex-1 truncate select-none tracking-widest">
                {'•'.repeat(Math.min(entry.password.length, 24))}
              </span>
              <span
                className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: bg, border: `1px solid ${border}`, color }}
              >
                {label}
              </span>
              <span className="text-xs text-zinc-700 font-mono shrink-0">
                {Math.round(entry.entropyBits)}b
              </span>
              <button
                className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: '#555', border: '1px solid #1a1a1a' }}
                onClick={() => copy(entry.password)}
                onMouseEnter={e => (e.currentTarget.style.color = '#00d4ff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#555')}
                title="Copy password"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

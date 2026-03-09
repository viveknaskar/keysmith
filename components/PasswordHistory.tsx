"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2 } from 'lucide-react';
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

  const strengthLabel = (bits: number) => {
    if (bits >= 80) return { label: 'Strong', cls: 'bg-green-900/30 text-green-400 border-green-700' };
    if (bits >= 60) return { label: 'Moderate', cls: 'bg-yellow-900/30 text-yellow-400 border-yellow-700' };
    return { label: 'Weak', cls: 'bg-red-900/30 text-red-400 border-red-700' };
  };

  return (
    <Card className="bg-slate-800 border border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">
            Session History
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClear} className="text-slate-400 hover:text-red-400">
            <Trash2 className="w-4 h-4 mr-1" /> Clear
          </Button>
        </div>
        <p className="text-xs text-slate-400">Cleared when you close the tab. Never stored.</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map(entry => {
          const { label, cls } = strengthLabel(entry.entropyBits);
          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
            >
              <span className="font-mono text-sm text-white flex-1 truncate">
                {'•'.repeat(entry.password.length)}
              </span>
              <Badge className={`${cls} shrink-0 text-xs`}>{label}</Badge>
              <span className="text-xs text-slate-500 shrink-0">{Math.round(entry.entropyBits)}b</span>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-7 w-7 text-slate-400 hover:text-white"
                onClick={() => copy(entry.password)}
                title="Copy"
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

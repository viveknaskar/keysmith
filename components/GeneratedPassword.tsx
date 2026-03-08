"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface GeneratedPasswordProps {
  password: string;
  entropyBits: number;
}

type Strength = 'weak' | 'moderate' | 'strong';

function getStrength(bits: number): Strength {
  if (bits >= 80) return 'strong';
  if (bits >= 60) return 'moderate';
  return 'weak';
}

export function GeneratedPassword({ password, entropyBits }: GeneratedPasswordProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const strength = getStrength(entropyBits);

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
            className="font-mono text-sm bg-slate-900 border-slate-600 text-white"
            type="text"
          />
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="icon"
            className="flex-shrink-0"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Badge className={badgeColor[strength]}>
            {strengthLabel[strength]}
          </Badge>
          <span className="text-sm text-slate-300">
            {Math.round(entropyBits)} bits of entropy &middot; {password.length} characters
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

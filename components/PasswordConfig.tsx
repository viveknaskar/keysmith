"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS = new Set('0Ol1I');

interface PasswordConfigProps {
  canvasEntropy: number[];
  onPasswordGenerated: (password: string, entropyBits: number) => void;
}

export function PasswordConfig({ canvasEntropy, onPasswordGenerated }: PasswordConfigProps) {
  const [passwordLength, setPasswordLength] = useState([16]);
  const [options, setOptions] = useState({
    lowercase: true,
    uppercase: true,
    numbers: true,
    special: true,
    excludeAmbiguous: false,
  });

  const filterAmbiguous = (chars: string) =>
    options.excludeAmbiguous ? chars.split('').filter(c => !AMBIGUOUS.has(c)).join('') : chars;

  const getWeatherEntropy = async (): Promise<string> => {
    try {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=51.51&longitude=-0.13&current=temperature_2m,wind_speed_10m,weather_code'
      );
      const data = await response.json();
      return JSON.stringify(data.current);
    } catch {
      return '';
    }
  };

  const generatePassword = async () => {
    const parts: { chars: string; enabled: boolean }[] = [
      { chars: filterAmbiguous(LOWERCASE), enabled: options.lowercase },
      { chars: filterAmbiguous(UPPERCASE), enabled: options.uppercase },
      { chars: filterAmbiguous(NUMBERS),   enabled: options.numbers },
      { chars: SPECIAL,                    enabled: options.special },
    ];

    const enabledParts = parts.filter(p => p.enabled && p.chars.length > 0);
    if (enabledParts.length === 0) {
      alert('Please select at least one character type');
      return;
    }

    const charset = enabledParts.map(p => p.chars).join('');
    const length = passwordLength[0];
    const entropyBits = Math.log2(charset.length) * length;

    // 1. Collect all entropy sources
    const timingEntropy = `${Date.now()}:${performance.now()}`;
    const weatherEntropy = await getWeatherEntropy();
    const canvasEntropyStr = canvasEntropy.join(',');
    const nonce = crypto.randomUUID();

    const entropyString = [timingEntropy, weatherEntropy, canvasEntropyStr, nonce].join('|');

    // 2. SHA-256 hash to mix all entropy into 32 bytes
    const entropyBuffer = new TextEncoder().encode(entropyString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', entropyBuffer);
    const hashBytes = new Uint8Array(hashBuffer);

    // 3. Generate cryptographically secure random bytes
    const randomBytes = new Uint8Array(length * 8);
    crypto.getRandomValues(randomBytes);

    // 4. XOR with repeating hash to incorporate user entropy
    for (let i = 0; i < randomBytes.length; i++) {
      randomBytes[i] ^= hashBytes[i % 32];
    }

    // Helper: pick one char from a charset using rejection sampling
    let byteIdx = 0;
    const pickChar = (cs: string): string => {
      const maxValid = 256 - (256 % cs.length);
      while (true) {
        if (byteIdx >= randomBytes.length) {
          crypto.getRandomValues(randomBytes);
          for (let i = 0; i < randomBytes.length; i++) randomBytes[i] ^= hashBytes[i % 32];
          byteIdx = 0;
        }
        const byte = randomBytes[byteIdx++];
        if (byte < maxValid) return cs[byte % cs.length];
      }
    };

    // 5. Generate base password (length - enabledParts.length chars) from full charset
    const mandatoryCount = Math.min(enabledParts.length, length);
    const baseCount = length - mandatoryCount;
    const base: string[] = [];
    for (let i = 0; i < baseCount; i++) base.push(pickChar(charset));

    // 6. Pick one mandatory char per enabled type
    const mandatory: string[] = enabledParts.map(p => pickChar(p.chars));

    // 7. Fisher-Yates shuffle of the combined array using crypto random values
    const combined = [...base, ...mandatory];
    const shuffleBytes = new Uint32Array(combined.length);
    crypto.getRandomValues(shuffleBytes);
    for (let i = combined.length - 1; i > 0; i--) {
      const j = shuffleBytes[i] % (i + 1);
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    onPasswordGenerated(combined.join(''), entropyBits);
  };

  return (
    <Card className="bg-slate-800 border border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">
          Password Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-slate-300">
              Password Length
            </Label>
            <span className="text-sm text-slate-400 font-mono">
              {passwordLength[0]}
            </span>
          </div>
          <Slider
            value={passwordLength}
            onValueChange={setPasswordLength}
            min={8}
            max={64}
            step={1}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="lowercase"
              checked={options.lowercase}
              onCheckedChange={(checked) =>
                setOptions(prev => ({ ...prev, lowercase: checked }))
              }
            />
            <Label htmlFor="lowercase" className="text-sm text-slate-300">
              Lowercase (a-z)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="uppercase"
              checked={options.uppercase}
              onCheckedChange={(checked) =>
                setOptions(prev => ({ ...prev, uppercase: checked }))
              }
            />
            <Label htmlFor="uppercase" className="text-sm text-slate-300">
              Uppercase (A-Z)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="numbers"
              checked={options.numbers}
              onCheckedChange={(checked) =>
                setOptions(prev => ({ ...prev, numbers: checked }))
              }
            />
            <Label htmlFor="numbers" className="text-sm text-slate-300">
              Numbers (0-9)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="special"
              checked={options.special}
              onCheckedChange={(checked) =>
                setOptions(prev => ({ ...prev, special: checked }))
              }
            />
            <Label htmlFor="special" className="text-sm text-slate-300">
              Special Characters
            </Label>
          </div>

          <div className="flex items-center space-x-2 col-span-2">
            <Switch
              id="excludeAmbiguous"
              checked={options.excludeAmbiguous}
              onCheckedChange={(checked) =>
                setOptions(prev => ({ ...prev, excludeAmbiguous: checked }))
              }
            />
            <Label htmlFor="excludeAmbiguous" className="text-sm text-slate-300">
              Exclude ambiguous characters (0, O, l, 1, I)
            </Label>
          </div>
        </div>

        <Button
          onClick={generatePassword}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
        >
          Generate Secure Password
        </Button>
      </CardContent>
    </Card>
  );
}

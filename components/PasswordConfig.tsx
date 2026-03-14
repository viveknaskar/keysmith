"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Zap, AlertTriangle } from 'lucide-react';
import { wordlists } from 'bip39';
const wordlist = wordlists['english'];

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS = new Set('0Ol1I');

interface PasswordConfigProps {
  canvasEntropy: number[];
  hasDrawnEntropy: boolean;
  regenerateTrigger: number;
  onPasswordGenerated: (password: string, entropyBits: number) => void;
}

export function PasswordConfig({ canvasEntropy, hasDrawnEntropy, regenerateTrigger, onPasswordGenerated }: PasswordConfigProps) {
  const [mode, setMode] = useState<'password' | 'passphrase'>('password');
  const [passwordLength, setPasswordLength] = useState([16]);
  const [options, setOptions] = useState({
    lowercase: true,
    uppercase: true,
    numbers: true,
    special: true,
    excludeAmbiguous: false,
  });
  const [wordCount, setWordCount] = useState([5]);
  const [separator, setSeparator] = useState('-');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (regenerateTrigger > 0) {
      if (mode === 'passphrase') generatePassphrase();
      else generatePassword();
    }
  }, [regenerateTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const generatePassphrase = async () => {
    setIsGenerating(true);
    try {
      const count = wordCount[0];
      const entropyBits = 11 * count;
      const timingEntropy = `${Date.now()}:${performance.now()}`;
      const canvasEntropyStr = canvasEntropy.join(',');
      const nonce = crypto.randomUUID();
      const ikm = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode([timingEntropy, canvasEntropyStr, nonce].join('|')),
        { name: 'HKDF' },
        false,
        ['deriveBits'],
      );
      const derived = await crypto.subtle.deriveBits(
        { name: 'HKDF', hash: 'SHA-256', salt: new TextEncoder().encode('entropypass-v1'), info: new Uint8Array() },
        ikm,
        256,
      );
      const hashBytes = new Uint8Array(derived);
      const words: string[] = [];
      while (words.length < count) {
        const buf = new Uint16Array(count * 4);
        crypto.getRandomValues(buf);
        for (let i = 0; i < buf.length && words.length < count; i++) {
          buf[i] ^= (hashBytes[i % 32] << 8) | hashBytes[(i + 1) % 32];
          const maxValid = 65536 - (65536 % 2048);
          if (buf[i] < maxValid) words.push(wordlist[buf[i] % 2048]);
        }
      }
      onPasswordGenerated(words.join(separator), entropyBits);
    } finally {
      setIsGenerating(false);
    }
  };

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
    setIsGenerating(true);
    try {
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
      const timingEntropy = `${Date.now()}:${performance.now()}`;
      const weatherEntropy = await getWeatherEntropy();
      const canvasEntropyStr = canvasEntropy.join(',');
      const nonce = crypto.randomUUID();
      const deviceEntropy = [
        screen.width, screen.height, screen.colorDepth,
        navigator.hardwareConcurrency ?? 0,
        (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0,
        navigator.language,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      ].join(':');
      const entropyString = [timingEntropy, weatherEntropy, canvasEntropyStr, nonce, deviceEntropy].join('|');
      const ikm = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(entropyString),
        { name: 'HKDF' },
        false,
        ['deriveBits'],
      );
      const derived = await crypto.subtle.deriveBits(
        { name: 'HKDF', hash: 'SHA-256', salt: new TextEncoder().encode('entropypass-v1'), info: new Uint8Array() },
        ikm,
        256,
      );
      const hkdfBytes = new Uint8Array(derived);
      const hashBytes = hkdfBytes;
      const randomBytes = new Uint8Array(length * 8);
      crypto.getRandomValues(randomBytes);
      for (let i = 0; i < randomBytes.length; i++) {
        randomBytes[i] ^= hkdfBytes[i % 32];
      }
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
      const mandatoryCount = Math.min(enabledParts.length, length);
      const baseCount = length - mandatoryCount;
      const base: string[] = [];
      for (let i = 0; i < baseCount; i++) base.push(pickChar(charset));
      const mandatory: string[] = enabledParts.map(p => pickChar(p.chars));
      const combined = [...base, ...mandatory];
      const shuffleBytes = new Uint32Array(combined.length);
      crypto.getRandomValues(shuffleBytes);
      for (let i = combined.length - 1; i > 0; i--) {
        const j = shuffleBytes[i] % (i + 1);
        [combined[i], combined[j]] = [combined[j], combined[i]];
      }
      onPasswordGenerated(combined.join(''), entropyBits);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}
    >
      <div className="px-6 pt-5 pb-3">
        <h2 className="text-base font-semibold text-white">Password Configuration</h2>
      </div>

      <div className="px-6 pb-6">
        <Tabs value={mode} onValueChange={v => setMode(v as 'password' | 'passphrase')}>
          {/* Tab list */}
          <TabsList
            className="w-full mb-6 p-1 rounded-lg h-auto gap-1"
            style={{ background: '#111', border: '1px solid #1a1a1a' }}
          >
            <TabsTrigger
              value="password"
              className="flex-1 text-sm rounded-md py-2 data-[state=active]:text-white data-[state=active]:shadow-none transition-all"
              style={{}}
            >
              Random Password
            </TabsTrigger>
            <TabsTrigger
              value="passphrase"
              className="flex-1 text-sm rounded-md py-2 data-[state=active]:text-white data-[state=active]:shadow-none transition-all"
            >
              Passphrase
            </TabsTrigger>
          </TabsList>

          {/* ── Password tab ── */}
          <TabsContent value="password" className="space-y-6 mt-0">
            {/* Length slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-zinc-400">Password Length</Label>
                <span
                  className="text-sm font-mono px-2 py-0.5 rounded"
                  style={{ background: '#111', color: '#00d4ff', border: '1px solid #1a1a1a' }}
                >
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
              <div className="flex justify-between text-xs text-zinc-700">
                <span>8</span>
                <span>64</span>
              </div>
            </div>

            {/* Character options */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'lowercase', label: 'Lowercase', sub: 'a–z', key: 'lowercase' as const },
                { id: 'uppercase', label: 'Uppercase', sub: 'A–Z', key: 'uppercase' as const },
                { id: 'numbers',   label: 'Numbers',   sub: '0–9', key: 'numbers' as const },
                { id: 'special',   label: 'Symbols',   sub: '!@#…', key: 'special' as const },
              ].map(({ id, label, sub, key }) => (
                <div
                  key={id}
                  className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
                  style={{
                    background: options[key] ? 'rgba(0,212,255,0.04)' : '#0d0d0d',
                    border: `1px solid ${options[key] ? 'rgba(0,212,255,0.15)' : '#1a1a1a'}`,
                  }}
                  onClick={() => setOptions(prev => ({ ...prev, [key]: !prev[key] }))}
                >
                  <div>
                    <div className="text-sm font-medium text-white">{label}</div>
                    <div className="text-xs text-zinc-600 font-mono">{sub}</div>
                  </div>
                  <Switch
                    id={id}
                    checked={options[key]}
                    onCheckedChange={(checked) => setOptions(prev => ({ ...prev, [key]: checked }))}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              ))}
            </div>

            {/* Exclude ambiguous */}
            <div
              className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
              style={{
                background: options.excludeAmbiguous ? 'rgba(245,158,11,0.04)' : '#0d0d0d',
                border: `1px solid ${options.excludeAmbiguous ? 'rgba(245,158,11,0.2)' : '#1a1a1a'}`,
              }}
              onClick={() => setOptions(prev => ({ ...prev, excludeAmbiguous: !prev.excludeAmbiguous }))}
            >
              <div>
                <div className="text-sm font-medium text-white">Exclude ambiguous characters</div>
                <div className="text-xs text-zinc-600 font-mono">0, O, l, 1, I</div>
              </div>
              <Switch
                id="excludeAmbiguous"
                checked={options.excludeAmbiguous}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, excludeAmbiguous: checked }))}
                onClick={e => e.stopPropagation()}
              />
            </div>

            {/* Warning */}
            {!hasDrawnEntropy && (
              <div
                className="flex items-start gap-2.5 rounded-lg px-3 py-2.5"
                style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-600">
                  Drawing on the canvas adds personal entropy to your password. You can still generate without it.
                </p>
              </div>
            )}

            <Button
              onClick={generatePassword}
              disabled={isGenerating}
              className="w-full h-11 text-sm font-semibold transition-all"
              style={{
                background: isGenerating ? '#111' : 'linear-gradient(135deg, #00d4ff, #0ea5e9)',
                color: isGenerating ? '#555' : '#000',
                border: 'none',
                boxShadow: isGenerating ? 'none' : '0 0 20px rgba(0,212,255,0.2)',
              }}
            >
              {isGenerating
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</>
                : <><Zap className="w-4 h-4 mr-2" />Generate Secure Password</>
              }
            </Button>
          </TabsContent>

          {/* ── Passphrase tab ── */}
          <TabsContent value="passphrase" className="space-y-6 mt-0">
            {/* Word count */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-zinc-400">Number of Words</Label>
                <span
                  className="text-sm font-mono px-2 py-0.5 rounded"
                  style={{ background: '#111', color: '#00d4ff', border: '1px solid #1a1a1a' }}
                >
                  {wordCount[0]}
                </span>
              </div>
              <Slider value={wordCount} onValueChange={setWordCount} min={3} max={10} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-zinc-700">
                <span>3</span>
                <span>10</span>
              </div>
            </div>

            {/* Separator */}
            <div className="flex items-center gap-3">
              <Label className="text-sm text-zinc-400 shrink-0">Word Separator</Label>
              <Select value={separator} onValueChange={setSeparator}>
                <SelectTrigger
                  className="flex-1 h-9 text-sm"
                  style={{ background: '#111', border: '1px solid #1a1a1a', color: '#fff' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: '#111', border: '1px solid #222', color: '#fff' }}>
                  <SelectItem value="-">Hyphen — word-word</SelectItem>
                  <SelectItem value=" ">Space — word word</SelectItem>
                  <SelectItem value=".">Dot — word.word</SelectItem>
                  <SelectItem value="_">Underscore — word_word</SelectItem>
                  <SelectItem value="">None — wordword</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Entropy info */}
            <div
              className="rounded-lg px-4 py-3 flex items-center justify-between"
              style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}
            >
              <span className="text-xs text-zinc-500">Estimated entropy</span>
              <span className="text-sm font-mono" style={{ color: '#00d4ff' }}>
                {wordCount[0] * 11} bits
                <span className="text-xs text-zinc-600 ml-1.5">({wordCount[0]} × 11 bits / BIP39)</span>
              </span>
            </div>

            <Button
              onClick={generatePassphrase}
              disabled={isGenerating}
              className="w-full h-11 text-sm font-semibold transition-all"
              style={{
                background: isGenerating ? '#111' : 'linear-gradient(135deg, #7c3aed, #9333ea)',
                color: isGenerating ? '#555' : '#fff',
                border: 'none',
                boxShadow: isGenerating ? 'none' : '0 0 20px rgba(124,58,237,0.25)',
              }}
            >
              {isGenerating
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</>
                : <><Zap className="w-4 h-4 mr-2" />Generate Passphrase</>
              }
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

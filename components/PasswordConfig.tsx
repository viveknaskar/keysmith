"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Zap } from 'lucide-react';
// Import the wordlist JSON directly rather than `import { wordlists } from 'bip39'`.
// The named CommonJS re-export can resolve to `undefined` in some browser bundles,
// and the direct import also keeps only the English list out of the bundle.
import englishWordlist from 'bip39/src/wordlists/english.json';
const wordlist = englishWordlist as string[];

// Radix <SelectItem> forbids an empty-string value, so "no separator" uses a
// sentinel that is mapped back to '' at generation time.
const NO_SEPARATOR = 'none';

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS = new Set('0Ol1I');

interface PasswordConfigProps {
  regenerateTrigger: number;
  onPasswordGenerated: (password: string, entropyBits: number) => void;
}

export function PasswordConfig({ regenerateTrigger, onPasswordGenerated }: PasswordConfigProps) {
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
  const [error, setError] = useState<string | null>(null);

  const generatePassphrase = useCallback(() => {
    setError(null);
    setIsGenerating(true);
    try {
      if (wordlist.length < 2048) {
        setError('Word list failed to load. Please reload the page.');
        return;
      }
      const count = wordCount[0];
      const entropyBits = 11 * count;
      // 2048 (BIP39 wordlist size) divides 65536 evenly, so `% 2048` on a
      // uniform 16-bit value introduces no modulo bias.
      const words: string[] = [];
      const buf = new Uint16Array(count * 2);
      while (words.length < count) {
        crypto.getRandomValues(buf);
        for (let i = 0; i < buf.length && words.length < count; i++) {
          words.push(wordlist[buf[i] % 2048]);
        }
      }
      const sep = separator === NO_SEPARATOR ? '' : separator;
      onPasswordGenerated(words.join(sep), entropyBits);
    } finally {
      setIsGenerating(false);
    }
  }, [wordCount, separator, onPasswordGenerated]);

  const generatePassword = useCallback(() => {
    const filterAmbiguous = (chars: string) =>
      options.excludeAmbiguous ? chars.split('').filter(c => !AMBIGUOUS.has(c)).join('') : chars;

    setError(null);
    setIsGenerating(true);
    try {
      const parts: { chars: string; enabled: boolean }[] = [
        { chars: filterAmbiguous(LOWERCASE), enabled: options.lowercase },
        { chars: filterAmbiguous(UPPERCASE), enabled: options.uppercase },
        { chars: filterAmbiguous(NUMBERS),   enabled: options.numbers },
        { chars: filterAmbiguous(SPECIAL),   enabled: options.special },
      ];
      const enabledParts = parts.filter(p => p.enabled && p.chars.length > 0);
      if (enabledParts.length === 0) {
        setError('Select at least one character type.');
        return;
      }
      const charset = enabledParts.map(p => p.chars).join('');
      const length = passwordLength[0];
      const entropyBits = Math.log2(charset.length) * length;

      // Pull every byte from the browser's CSPRNG. Rejection sampling
      // (discarding bytes >= maxValid) guarantees an unbiased uniform pick.
      const randomBytes = new Uint8Array(length * 8);
      crypto.getRandomValues(randomBytes);
      let byteIdx = 0;
      const pickChar = (cs: string): string => {
        const maxValid = 256 - (256 % cs.length);
        while (true) {
          if (byteIdx >= randomBytes.length) {
            crypto.getRandomValues(randomBytes);
            byteIdx = 0;
          }
          const byte = randomBytes[byteIdx++];
          if (byte < maxValid) return cs[byte % cs.length];
        }
      };

      const mandatoryCount = Math.min(enabledParts.length, length);
      const baseCount = length - mandatoryCount;
      const chars: string[] = [];
      for (let i = 0; i < baseCount; i++) chars.push(pickChar(charset));
      for (let i = 0; i < mandatoryCount; i++) chars.push(pickChar(enabledParts[i].chars));

      // Fisher-Yates shuffle (also CSPRNG-sourced) so the guaranteed-per-class
      // characters aren't predictably clustered at the end.
      const shuffleBytes = new Uint32Array(chars.length);
      crypto.getRandomValues(shuffleBytes);
      for (let i = chars.length - 1; i > 0; i--) {
        const j = shuffleBytes[i] % (i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }
      onPasswordGenerated(chars.join(''), entropyBits);
    } finally {
      setIsGenerating(false);
    }
  }, [options, passwordLength, onPasswordGenerated]);

  useEffect(() => {
    if (regenerateTrigger > 0) {
      if (mode === 'passphrase') generatePassphrase();
      else generatePassword();
    }
  }, [regenerateTrigger, mode, generatePassphrase, generatePassword]);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#141417', border: '1px solid #26262b' }}
    >
      <div className="px-6 pt-5 pb-3">
        <h2 className="text-base font-semibold text-white">Password Configuration</h2>
      </div>

      <div className="px-6 pb-6">
        <Tabs value={mode} onValueChange={v => setMode(v as 'password' | 'passphrase')}>
          {/* Tab list */}
          <TabsList
            className="w-full mb-6 p-1 rounded-lg h-auto gap-1"
            style={{ background: '#1a1a1e', border: '1px solid #26262b' }}
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
                  style={{ background: '#1a1a1e', color: '#7aa2f7', border: '1px solid #26262b' }}
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
                    background: options[key] ? 'rgba(122,162,247,0.07)' : '#1a1a1e',
                    border: `1px solid ${options[key] ? 'rgba(122,162,247,0.22)' : '#26262b'}`,
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
                background: options.excludeAmbiguous ? 'rgba(245,158,11,0.04)' : '#1a1a1e',
                border: `1px solid ${options.excludeAmbiguous ? 'rgba(245,158,11,0.2)' : '#26262b'}`,
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

            {/* Validation error */}
            {error && (
              <div
                className="rounded-lg px-3 py-2.5"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <Button
              onClick={generatePassword}
              disabled={isGenerating}
              className="w-full h-11 text-sm font-semibold transition-all"
              style={{
                background: isGenerating ? '#1a1a1e' : '#7aa2f7',
                color: isGenerating ? '#52525b' : '#0b0b0d',
                border: 'none',
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
                  style={{ background: '#1a1a1e', color: '#7aa2f7', border: '1px solid #26262b' }}
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
                  style={{ background: '#1a1a1e', border: '1px solid #26262b', color: '#fff' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: '#1a1a1e', border: '1px solid #2e2e34', color: '#fff' }}>
                  <SelectItem value="-">Hyphen: word-word</SelectItem>
                  <SelectItem value=" ">Space: word word</SelectItem>
                  <SelectItem value=".">Dot: word.word</SelectItem>
                  <SelectItem value="_">Underscore: word_word</SelectItem>
                  <SelectItem value={NO_SEPARATOR}>None: wordword</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Entropy info */}
            <div
              className="rounded-lg px-4 py-3 flex items-center justify-between"
              style={{ background: 'rgba(122,162,247,0.07)', border: '1px solid rgba(122,162,247,0.12)' }}
            >
              <span className="text-xs text-zinc-500">Estimated entropy</span>
              <span className="text-sm font-mono" style={{ color: '#7aa2f7' }}>
                {wordCount[0] * 11} bits
                <span className="text-xs text-zinc-600 ml-1.5">({wordCount[0]} × 11 bits / BIP39)</span>
              </span>
            </div>

            {error && (
              <div
                className="rounded-lg px-3 py-2.5"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <Button
              onClick={generatePassphrase}
              disabled={isGenerating}
              className="w-full h-11 text-sm font-semibold transition-all"
              style={{
                background: isGenerating ? '#1a1a1e' : 'rgba(122,162,247,0.12)',
                color: isGenerating ? '#52525b' : '#7aa2f7',
                border: `1px solid ${isGenerating ? 'transparent' : 'rgba(122,162,247,0.25)'}`,
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

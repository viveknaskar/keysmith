"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Zap } from 'lucide-react';
import { generatePassword as buildPassword, generatePassphrase as buildPassphrase, NUMBER_BITS } from '@/lib/password';

// Radix <SelectItem> forbids an empty-string value, so "no separator" uses a
// sentinel that is mapped back to '' at generation time.
const NO_SEPARATOR = 'none';

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
  const [passphraseOptions, setPassphraseOptions] = useState({ capitalize: false, includeNumber: false });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passphraseEntropy = wordCount[0] * 11 + (passphraseOptions.includeNumber ? NUMBER_BITS : 0);

  const generatePassphrase = useCallback(() => {
    setError(null);
    setIsGenerating(true);
    try {
      const { value, entropyBits } = buildPassphrase({
        wordCount: wordCount[0],
        separator: separator === NO_SEPARATOR ? '' : separator,
        capitalize: passphraseOptions.capitalize,
        includeNumber: passphraseOptions.includeNumber,
      });
      onPasswordGenerated(value, entropyBits);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate passphrase.');
    } finally {
      setIsGenerating(false);
    }
  }, [wordCount, separator, passphraseOptions, onPasswordGenerated]);

  const generatePassword = useCallback(() => {
    setError(null);
    setIsGenerating(true);
    try {
      const { value, entropyBits } = buildPassword({
        length: passwordLength[0],
        lowercase: options.lowercase,
        uppercase: options.uppercase,
        numbers: options.numbers,
        special: options.special,
        excludeAmbiguous: options.excludeAmbiguous,
      });
      onPasswordGenerated(value, entropyBits);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate password.');
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

            {/* Passphrase options */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'capitalize' as const, label: 'Capitalize words', sub: 'Word-Word' },
                { key: 'includeNumber' as const, label: 'Add a number', sub: 'word-word-42' },
              ].map(({ key, label, sub }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
                  style={{
                    background: passphraseOptions[key] ? 'rgba(122,162,247,0.07)' : '#1a1a1e',
                    border: `1px solid ${passphraseOptions[key] ? 'rgba(122,162,247,0.22)' : '#26262b'}`,
                  }}
                  onClick={() => setPassphraseOptions(prev => ({ ...prev, [key]: !prev[key] }))}
                >
                  <div>
                    <div className="text-sm font-medium text-white">{label}</div>
                    <div className="text-xs text-zinc-600 font-mono">{sub}</div>
                  </div>
                  <Switch
                    checked={passphraseOptions[key]}
                    onCheckedChange={checked => setPassphraseOptions(prev => ({ ...prev, [key]: checked }))}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              ))}
            </div>

            {/* Entropy info */}
            <div
              className="rounded-lg px-4 py-3 flex items-center justify-between"
              style={{ background: 'rgba(122,162,247,0.07)', border: '1px solid rgba(122,162,247,0.12)' }}
            >
              <span className="text-xs text-zinc-500">Estimated entropy</span>
              <span className="text-sm font-mono" style={{ color: '#7aa2f7' }}>
                {Math.round(passphraseEntropy)} bits
                <span className="text-xs text-zinc-600 ml-1.5">
                  ({wordCount[0]} × 11{passphraseOptions.includeNumber ? ' + 6.6' : ''} bits)
                </span>
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

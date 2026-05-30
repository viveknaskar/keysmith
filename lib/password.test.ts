import { describe, it, expect } from 'vitest';
import {
  generatePassword,
  generatePassphrase,
  wordlist,
  LOWERCASE,
  UPPERCASE,
  NUMBERS,
  SPECIAL,
  AMBIGUOUS,
  NUMBER_BITS,
  type PasswordOptions,
  type PassphraseOptions,
} from './password';

const allClasses: PasswordOptions = {
  length: 16,
  lowercase: true,
  uppercase: true,
  numbers: true,
  special: true,
  excludeAmbiguous: false,
};

const passphraseDefaults: PassphraseOptions = {
  wordCount: 5,
  separator: '-',
  capitalize: false,
  includeNumber: false,
};

describe('generatePassword', () => {
  it('produces a password of the requested length across the full slider range', () => {
    for (const length of [8, 16, 32, 64]) {
      const { value } = generatePassword({ ...allClasses, length });
      expect(value).toHaveLength(length);
    }
  });

  it('only emits characters from the enabled classes', () => {
    const { value } = generatePassword({ ...allClasses, length: 64 });
    const fullCharset = new Set((LOWERCASE + UPPERCASE + NUMBERS + SPECIAL).split(''));
    for (const ch of value) expect(fullCharset.has(ch)).toBe(true);
  });

  it('restricts output to a single class when only one is enabled', () => {
    const { value } = generatePassword({
      length: 40,
      lowercase: true,
      uppercase: false,
      numbers: false,
      special: false,
      excludeAmbiguous: false,
    });
    expect(value).toMatch(/^[a-z]+$/);
  });

  it('guarantees at least one character from every enabled class', () => {
    // Run repeatedly: the per-class guarantee must hold every time.
    for (let i = 0; i < 200; i++) {
      const { value } = generatePassword({ ...allClasses, length: 8 });
      expect(value).toMatch(/[a-z]/);
      expect(value).toMatch(/[A-Z]/);
      expect(value).toMatch(/[0-9]/);
      expect(value).toMatch(/[^a-zA-Z0-9]/);
    }
  });

  it('excludes ambiguous characters when requested', () => {
    for (let i = 0; i < 50; i++) {
      const { value } = generatePassword({ ...allClasses, length: 64, excludeAmbiguous: true });
      for (const ch of value) expect(AMBIGUOUS.has(ch)).toBe(false);
    }
  });

  it('reports entropy as length × log2(charset size)', () => {
    const length = 24;
    const charsetSize = LOWERCASE.length + UPPERCASE.length + NUMBERS.length + SPECIAL.length;
    const { entropyBits } = generatePassword({ ...allClasses, length });
    expect(entropyBits).toBeCloseTo(length * Math.log2(charsetSize), 10);
  });

  it('lowers reported entropy when ambiguous characters are excluded', () => {
    const base = generatePassword({ ...allClasses, length: 16 }).entropyBits;
    const reduced = generatePassword({ ...allClasses, length: 16, excludeAmbiguous: true }).entropyBits;
    expect(reduced).toBeLessThan(base);
  });

  it('throws when no character class is enabled', () => {
    expect(() =>
      generatePassword({
        length: 16,
        lowercase: false,
        uppercase: false,
        numbers: false,
        special: false,
        excludeAmbiguous: false,
      }),
    ).toThrow('Select at least one character type.');
  });

  it('reaches every character in the set (rejection sampling is not truncating the alphabet)', () => {
    // 88-symbol charset does not divide 256, so a naive `% len` would bias against
    // the tail. Over many samples every symbol must still be reachable.
    const seen = new Set<string>();
    for (let i = 0; i < 100; i++) {
      for (const ch of generatePassword({ ...allClasses, length: 64 }).value) seen.add(ch);
    }
    const charsetSize = LOWERCASE.length + UPPERCASE.length + NUMBERS.length + SPECIAL.length;
    expect(seen.size).toBe(charsetSize);
  });

  it('does not repeat itself between calls', () => {
    const a = generatePassword({ ...allClasses, length: 32 }).value;
    const b = generatePassword({ ...allClasses, length: 32 }).value;
    expect(a).not.toBe(b);
  });
});

describe('generatePassphrase', () => {
  it('loads the full 2048-word BIP39 list', () => {
    expect(wordlist).toHaveLength(2048);
  });

  it('produces the requested number of words', () => {
    for (const wordCount of [3, 5, 8, 10]) {
      const { value } = generatePassphrase({ ...passphraseDefaults, wordCount });
      expect(value.split('-')).toHaveLength(wordCount);
    }
  });

  it('draws every word from the BIP39 wordlist', () => {
    const words = new Set(wordlist);
    const { value } = generatePassphrase({ ...passphraseDefaults, wordCount: 10 });
    for (const word of value.split('-')) expect(words.has(word)).toBe(true);
  });

  it('applies the chosen separator', () => {
    expect(generatePassphrase({ ...passphraseDefaults, separator: '_' }).value).toContain('_');
    expect(generatePassphrase({ ...passphraseDefaults, separator: '.' }).value).toContain('.');
  });

  it('concatenates words directly when separator is empty', () => {
    const { value } = generatePassphrase({ ...passphraseDefaults, separator: '' });
    expect(value).toMatch(/^[a-z]+$/);
  });

  it('capitalizes the first letter of each word', () => {
    const { value } = generatePassphrase({ ...passphraseDefaults, capitalize: true });
    for (const word of value.split('-')) expect(word[0]).toMatch(/[A-Z]/);
  });

  it('appends a zero-padded two-digit number in 0–99 when requested', () => {
    for (let i = 0; i < 200; i++) {
      const tokens = generatePassphrase({ ...passphraseDefaults, includeNumber: true }).value.split('-');
      const num = tokens[tokens.length - 1];
      expect(num).toMatch(/^\d{2}$/);
      expect(Number(num)).toBeGreaterThanOrEqual(0);
      expect(Number(num)).toBeLessThanOrEqual(99);
    }
  });

  it('reports 11 bits per word', () => {
    expect(generatePassphrase({ ...passphraseDefaults, wordCount: 6 }).entropyBits).toBeCloseTo(66, 10);
  });

  it('adds log2(100) bits for the appended number', () => {
    const { entropyBits } = generatePassphrase({ ...passphraseDefaults, wordCount: 6, includeNumber: true });
    expect(entropyBits).toBeCloseTo(66 + NUMBER_BITS, 10);
  });
});

// Pure, framework-agnostic password/passphrase generation.
//
// All randomness comes from the Web Crypto CSPRNG (`crypto.getRandomValues`).
// These functions are deliberately free of React so the entropy and bias
// guarantees can be unit-tested directly.

// Import the wordlist JSON directly rather than `import { wordlists } from 'bip39'`.
// The named CommonJS re-export can resolve to `undefined` in some browser bundles,
// and the direct import also keeps only the English list out of the bundle.
import englishWordlist from 'bip39/src/wordlists/english.json';

export const wordlist = englishWordlist as string[];

export const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
export const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const NUMBERS = '0123456789';
export const SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';
export const AMBIGUOUS = new Set('0Ol1I');

// Capitalizing word initials is deterministic, so it adds no entropy. A trailing
// random 0–99 adds log2(100) bits, so it counts toward reported strength.
export const NUMBER_BITS = Math.log2(100);

export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  special: boolean;
  excludeAmbiguous: boolean;
}

export interface PassphraseOptions {
  wordCount: number;
  separator: string;
  capitalize: boolean;
  includeNumber: boolean;
}

export interface GenerationResult {
  value: string;
  entropyBits: number;
}

const filterAmbiguous = (chars: string, exclude: boolean) =>
  exclude ? chars.split('').filter(c => !AMBIGUOUS.has(c)).join('') : chars;

export function generatePassword(options: PasswordOptions): GenerationResult {
  const parts: { chars: string; enabled: boolean }[] = [
    { chars: filterAmbiguous(LOWERCASE, options.excludeAmbiguous), enabled: options.lowercase },
    { chars: filterAmbiguous(UPPERCASE, options.excludeAmbiguous), enabled: options.uppercase },
    { chars: filterAmbiguous(NUMBERS, options.excludeAmbiguous),   enabled: options.numbers },
    { chars: filterAmbiguous(SPECIAL, options.excludeAmbiguous),   enabled: options.special },
  ];
  const enabledParts = parts.filter(p => p.enabled && p.chars.length > 0);
  if (enabledParts.length === 0) {
    throw new Error('Select at least one character type.');
  }

  const charset = enabledParts.map(p => p.chars).join('');
  const length = options.length;
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

  return { value: chars.join(''), entropyBits };
}

export function generatePassphrase(options: PassphraseOptions): GenerationResult {
  if (wordlist.length < 2048) {
    throw new Error('Word list failed to load. Please reload the page.');
  }

  const count = options.wordCount;
  let entropyBits = 11 * count;

  // 2048 (BIP39 wordlist size) divides 65536 evenly, so `% 2048` on a uniform
  // 16-bit value introduces no modulo bias.
  const words: string[] = [];
  const buf = new Uint16Array(count * 2);
  while (words.length < count) {
    crypto.getRandomValues(buf);
    for (let i = 0; i < buf.length && words.length < count; i++) {
      let word = wordlist[buf[i] % 2048];
      if (options.capitalize) word = word.charAt(0).toUpperCase() + word.slice(1);
      words.push(word);
    }
  }

  const sep = options.separator;
  let phrase = words.join(sep);

  if (options.includeNumber) {
    // Unbiased random 0–99 (reject bytes >= 200, the largest multiple of 100).
    const numBuf = new Uint8Array(1);
    do { crypto.getRandomValues(numBuf); } while (numBuf[0] >= 200);
    phrase += sep + String(numBuf[0] % 100).padStart(2, '0');
    entropyBits += NUMBER_BITS;
  }

  return { value: phrase, entropyBits };
}

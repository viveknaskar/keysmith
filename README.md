# EntropyPass

 Generate secure, high-entropy passwords using real-world randomness, canvas drawing, device timing, and live weather data.

---

## How it works

Most password generators rely solely on a PRNG seeded with a single entropy source. EntropyPass combines **four independent sources** and mixes them cryptographically before any character is picked:

| Source | What's captured |
|---|---|
| Canvas drawing | x/y coordinates + sub-millisecond timestamps per point |
| Device timing | `Date.now()` and `performance.now()` at generation time |
| Live weather | Temperature, wind speed, and weather code from Open-Meteo |
| Device fingerprint | Screen dimensions, hardware concurrency, language, timezone |

These are concatenated and passed through **HKDF (SHA-256)** to derive a 256-bit key, which is XORed with `crypto.getRandomValues()` output. Characters are selected using **rejection sampling** to guarantee an unbiased uniform distribution. A **Fisher-Yates shuffle** (also crypto-sourced) is applied as the final step.

**Further reading:**

- [Pseudorandom number generator — Wikipedia](https://en.wikipedia.org/wiki/Pseudorandom_number_generator) — overview of PRNGs, their limitations, and why cryptographically secure variants matter
- [Cryptographically secure PRNG — Wikipedia](https://en.wikipedia.org/wiki/Cryptographically_secure_pseudorandom_number_generator) — what makes a PRNG "cryptographically secure" and why `Math.random()` is not suitable for secrets
- [Web Crypto API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) — browser-native CSPRNG via `crypto.getRandomValues()` and `crypto.subtle`
- [Fisher-Yates shuffle — Wikipedia](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle) — the algorithm used to shuffle the final character array without bias
- [HKDF — RFC 5869](https://datatracker.ietf.org/doc/html/rfc5869) — the key derivation function used to mix all entropy sources into a single 256-bit value
- [Modulo bias — explanation](https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/) — why naïve `% charset.length` introduces skew and how rejection sampling fixes it

Nothing is sent to a server. Nothing is stored. Everything runs in the browser.

---

## Features

- **Two generation modes** — random password (8–64 chars) or BIP39 passphrase (3–10 words)
- **Canvas entropy collection** — draws directly contribute to the key material
- **Configurable character sets** — lowercase, uppercase, numbers, symbols, optional ambiguous-char exclusion
- **Real-time strength analysis** — entropy bits, crack-time estimate at 1T guesses/sec, and zxcvbn pattern detection
- **Session history** — last 10 passwords, masked, in-memory only (cleared on tab close)
- **Static export** — deploys as plain HTML/CSS/JS to any host

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Crypto | Web Crypto API — `crypto.subtle.deriveBits`, `crypto.getRandomValues` |
| Strength analysis | `@zxcvbn-ts/core` |
| Passphrase wordlist | `bip39` (BIP39 English, 2048 words) |

---

## Getting started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3000

# Production build (outputs to /out)
npm run build
```

---

## Project structure

```
app/
  layout.tsx          # Root layout, theme, toaster
  page.tsx            # Main orchestrator
  globals.css         # CSS variables + utilities
components/
  Header.tsx          # Hero section
  FeatureOverview.tsx # Feature cards
  DrawingCanvas.tsx   # Entropy collection canvas
  PasswordConfig.tsx  # Generation settings + crypto logic
  GeneratedPassword.tsx  # Output + strength analysis
  PasswordHistory.tsx    # Session history
  PasswordStrengthTester.tsx  # Bitwarden link
  ui/                 # shadcn/ui primitives
```

---

## Security notes

- All cryptographic operations use the browser's native **Web Crypto API** — no third-party crypto libraries
- Passwords exist only in React state; they are never written to `localStorage`, `sessionStorage`, IndexedDB, or sent over the network
- The weather API call (`open-meteo.com`) is a GET request for public meteorological data — no credentials, no identifying info
- Canvas entropy is entirely optional; the generator falls back to `crypto.getRandomValues()` if no drawing is provided

---

## License

MIT

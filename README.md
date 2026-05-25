# EntropyPass

Generate strong, high-entropy passwords and passphrases entirely in your browser, using the Web Crypto API's cryptographically secure random number generator.

---

## How it works

A password is only as good as its source of randomness. EntropyPass uses **`crypto.getRandomValues()`** — the browser's built-in cryptographically secure RNG (CSPRNG) — for every character. This is the same class of generator used by password managers and TLS, and it is fully sufficient on its own: no extra "entropy sources" are needed or used.

To turn raw random bytes into characters without skewing the distribution:

- **Rejection sampling** discards byte values that would land in an incomplete final bucket, so `% charset.length` introduces **no modulo bias** — every character is equally likely.
- When multiple character classes are enabled, one character from each is guaranteed, then a **Fisher-Yates shuffle** (also CSPRNG-sourced) randomizes their positions so they aren't predictably placed.
- Passphrases draw uniformly from the **BIP39 English wordlist** (2048 words = 11 bits each). 2048 divides 65536 evenly, so the 16-bit `% 2048` mapping is unbiased too.

**Further reading:**

- [Cryptographically secure PRNG — Wikipedia](https://en.wikipedia.org/wiki/Cryptographically_secure_pseudorandom_number_generator) — what makes a generator "cryptographically secure" and why `Math.random()` is not suitable for secrets
- [Web Crypto API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) — browser-native CSPRNG via `crypto.getRandomValues()`
- [Fisher-Yates shuffle — Wikipedia](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle) — the algorithm used to shuffle the final character array without bias
- [Modulo bias — explanation](https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/) — why naïve `% charset.length` introduces skew and how rejection sampling fixes it

**Everything runs in the browser. No network requests are made. Nothing is stored.**

---

## Why a CSPRNG?

**CSPRNG** stands for **Cryptographically Secure Pseudo-Random Number Generator**. It's the kind of randomness you must use whenever you generate a *secret* — passwords, encryption keys, tokens, session IDs.

- **Pseudo-Random** — a computer can't conjure true randomness from arithmetic alone, so it expands a hidden internal seed into a stream of numbers that *look* random.
- **Cryptographically Secure** — the defining extra guarantee: even after observing many outputs, an attacker **cannot predict the next value or reconstruct previous ones**. The internal state is seeded from genuine hardware entropy (timing jitter, electrical noise, the OS entropy pool).

In the browser this is exposed as **`crypto.getRandomValues()`** (part of the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)). It's the same class of generator that backs TLS and password managers, and EntropyPass uses it for every single character.

### Why not `Math.random()`?

`Math.random()` is a **regular**, non-cryptographic PRNG. It's perfectly fine for shuffling a game deck or picking a random animation delay — but it is **unsafe for secrets**:

| | `Math.random()` | `crypto.getRandomValues()` |
|---|---|---|
| Predictable from outputs? | **Yes** | No |
| Seed | Small, sometimes guessable | Large, hardware-sourced |
| Designed for secrets? | **No** | Yes |

Most engines implement `Math.random()` with an algorithm such as **xorshift128+**. By observing only a handful of its outputs, researchers have shown you can recover its internal state and then **compute every value it will ever produce** — which, for a password generator, means an attacker could reproduce your "random" password. A CSPRNG is specifically designed so that this is computationally infeasible.

**Rule of thumb:** if the number needs to be a secret or unguessable, use a CSPRNG (`crypto.getRandomValues`) — never `Math.random()`.

> EntropyPass uses **no** `Math.random()` anywhere in its generation path. Every byte comes from `crypto.getRandomValues()`.

---

## Features

- **Two generation modes** : random password (8–64 chars) or BIP39 passphrase (3–10 words)
- **Configurable character sets** : lowercase, uppercase, numbers, symbols, optional ambiguous-char exclusion
- **Real-time strength analysis** : entropy bits, crack-time estimate at 1T guesses/sec, and zxcvbn pattern detection
- **Session history** : last 10 passwords, masked, in-memory only (cleared on tab close)
- **Static export** : deploys as plain HTML/CSS/JS to any host and runs fully offline

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Crypto | Web Crypto API — `crypto.getRandomValues` |
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
  PasswordConfig.tsx  # Generation settings + crypto logic
  GeneratedPassword.tsx  # Output + strength analysis
  PasswordHistory.tsx    # Session history
  PasswordStrengthTester.tsx  # How strength is measured (local-only)
  ui/                 # shadcn/ui primitives
```

---

## Security notes

- All randomness comes from the browser's native **Web Crypto API** (`crypto.getRandomValues`) — no third-party crypto libraries, and no `Math.random()`.
- Passwords exist only in React state; they are never written to `localStorage`, `sessionStorage`, IndexedDB, or sent over the network.
- The app makes **no network requests at runtime** — you can verify this in your browser's DevTools Network tab.
- Reported entropy is the theoretical maximum for the chosen length and character set. Forcing one character per enabled class lowers the true value by a negligible amount.

---

## License

MIT

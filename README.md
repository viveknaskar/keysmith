# Keysmith

Generate strong, high-entropy passwords and passphrases entirely in your browser, using the Web Crypto API's cryptographically secure random number generator.

---

## What is password entropy?

**Entropy** is a measure of *unpredictability*, meaning how hard something is to guess. For passwords it's measured in **bits**: the more entropy, the stronger the password.

The key idea is that **each extra bit doubles the number of guesses an attacker needs.** Entropy is the base-2 logarithm of the number of equally likely possibilities:

```
entropy (bits) = log2(number of possible passwords)
              = length × log2(size of character set)
```

So a 16-character password drawn from 94 possible symbols has `16 × log2(94) ≈ 105 bits` of entropy, which is roughly 4 × 10³¹ possibilities. A rough sense of scale:

| Entropy | Possibilities | Verdict |
|---|---|---|
| ~28 bits | a few hundred million | Trivially cracked |
| ~40 bits | ~1 trillion | Weak (minutes to hours) |
| ~60 bits | ~1 quintillion | Moderate |
| ~80 bits | ~1.2 × 10²⁴ | Strong |
| ~100+ bits | astronomically large | Future-proof |

Two things determine a password's entropy: **how long it is** and **how large the pool of symbols is**, but only if every character is genuinely random. This is the crucial catch. "P@ssw0rd123!" is 12 characters from a large set, yet its real entropy is tiny, because it's a predictable word with predictable substitutions. Entropy math only holds when the characters are chosen unpredictably.

## How Keysmith helps you get there

A strong password needs **both** high theoretical entropy **and** true randomness behind it. Keysmith gives you both:

- **Maximises the character pool.** Toggle lowercase, uppercase, numbers, and symbols to widen the set (more `log2(charset)` per character).
- **Lets you push the length up.** 8 to 64 characters, or 3–10 word passphrases. Length is the cheapest way to add entropy.
- **Makes the randomness real.** Every character comes from the browser's CSPRNG (`crypto.getRandomValues`), so the entropy you see is entropy you actually have, not a number undermined by a predictable pattern.
- **Shows you the number, honestly.** The entropy estimate, a crack-time figure, and a [zxcvbn](https://github.com/dropbox/zxcvbn) pattern check are displayed for every password, so you can see exactly how strong it is and *why*.
- **Offers passphrases.** Memorable word sequences from the 2048-word BIP39 list (11 bits per word) for when you need to type a password by hand.

In short, Keysmith turns the entropy formula above into a tool: you choose length and character types, it supplies the genuine randomness, and it tells you how many bits you ended up with.

## How it works

A password is only as good as its source of randomness. Keysmith uses **`crypto.getRandomValues()`**, the browser's built-in cryptographically secure RNG (CSPRNG), for every character. This is the same class of generator used by password managers and TLS, and it is fully sufficient on its own: no extra "entropy sources" are needed or used.

To turn raw random bytes into characters without skewing the distribution:

- **Rejection sampling** discards byte values that would land in an incomplete final bucket, so `% charset.length` introduces **no modulo bias** and every character is equally likely.
- When multiple character classes are enabled, one character from each is guaranteed, then a **Fisher-Yates shuffle** (also CSPRNG-sourced) randomizes their positions so they aren't predictably placed.
- Passphrases draw uniformly from the **BIP39 English wordlist** (2048 words = 11 bits each). 2048 divides 65536 evenly, so the 16-bit `% 2048` mapping is unbiased too.

**Further reading:**

- [Cryptographically secure PRNG (Wikipedia)](https://en.wikipedia.org/wiki/Cryptographically_secure_pseudorandom_number_generator): what makes a generator "cryptographically secure" and why `Math.random()` is not suitable for secrets
- [Web Crypto API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API): browser-native CSPRNG via `crypto.getRandomValues()`
- [Fisher-Yates shuffle (Wikipedia)](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle): the algorithm used to shuffle the final character array without bias
- [Modulo bias (explanation)](https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/): why naïve `% charset.length` introduces skew and how rejection sampling fixes it

**Everything runs in the browser. No network requests are made. Nothing is stored.**

---

## Why a CSPRNG?

**CSPRNG** stands for **Cryptographically Secure Pseudo-Random Number Generator**. It's the kind of randomness you must use whenever you generate a *secret* such as a password, encryption key, token, or session ID.

- **Pseudo-Random.** A computer can't conjure true randomness from arithmetic alone, so it expands a hidden internal seed into a stream of numbers that *look* random.
- **Cryptographically Secure.** This is the defining extra guarantee: even after observing many outputs, an attacker **cannot predict the next value or reconstruct previous ones**. The internal state is seeded from genuine hardware entropy (timing jitter, electrical noise, the OS entropy pool).

In the browser this is exposed as **`crypto.getRandomValues()`** (part of the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)). It's the same class of generator that backs TLS and password managers, and Keysmith uses it for every single character.

### Why not `Math.random()`?

`Math.random()` is a **regular**, non-cryptographic PRNG. It's perfectly fine for shuffling a game deck or picking a random animation delay, but it is **unsafe for secrets**:

| | `Math.random()` | `crypto.getRandomValues()` |
|---|---|---|
| Predictable from outputs? | **Yes** | No |
| Seed | Small, sometimes guessable | Large, hardware-sourced |
| Designed for secrets? | **No** | Yes |

Most engines implement `Math.random()` with an algorithm such as **xorshift128+**. By observing only a handful of its outputs, researchers have shown you can recover its internal state and then **compute every value it will ever produce**. For a password generator, that means an attacker could reproduce your "random" password. A CSPRNG is specifically designed so that this is computationally infeasible.

**Rule of thumb:** if the number needs to be a secret or unguessable, use a CSPRNG (`crypto.getRandomValues`), never `Math.random()`.

> Keysmith uses **no** `Math.random()` anywhere in its generation path. Every byte comes from `crypto.getRandomValues()`.

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
| Crypto | Web Crypto API (`crypto.getRandomValues`) |
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

- All randomness comes from the browser's native **Web Crypto API** (`crypto.getRandomValues`). No third-party crypto libraries, and no `Math.random()`.
- Passwords exist only in React state; they are never written to `localStorage`, `sessionStorage`, IndexedDB, or sent over the network.
- The app makes **no network requests at runtime**, which you can verify in your browser's DevTools Network tab.
- Reported entropy is the theoretical maximum for the chosen length and character set. Forcing one character per enabled class lowers the true value by a negligible amount.

---

## License

MIT

# Anger Management

A joke app for Even Realities G2 smart glasses. When a flash of anger hits, launch it and the glasses count for you — **6 seconds (Japan)** or **up to ten (USA)** — and when the count finishes, a random *finisher* plays: a famous quote about anger, or a flashy **ANGER MANAGED** graphic.

Display-only and fully local — no bridge, no network.

> Neither "anger peaks for 6 seconds" nor "count to ten" has any real academic source. They're folk beliefs. The glasses count anyway.

## How it works

- **Launch** → the countdown starts immediately: a big number with progress dots.
- **When it finishes** → a random finisher appears.
- **Double-tap during the count** → pause menu (Again / Exit).
- **Tap on a finisher** → next menu (Again / Exit). Swipe to move the cursor, tap to select.

## Settings (phone)

- **Language** — `en` / `ja` (UI language).
- **Region** — Japan (counts 6 → 1) or America (counts 1 → 10).
- **Finisher** — Quote / ANGER MANAGED / Random.
- **Test Mode** — on: skip the count and cycle through every finisher (tap to advance).

## Tech

Even Hub SDK app (Vite + TypeScript). 576×288 monochrome (1-bit) display. The 30-quote pool is fact-checked; misattributed quotes were removed and traditionally-attributed ones are marked "(trad.)".

## Develop

```bash
npm run dev        # dev server (http://localhost:5173)
npm run simulate   # desktop glasses simulator
npm test           # unit tests
npm run assets     # regenerate glasses graphics (requires Pillow)
npm run build && npm run pack   # produce the .ehpk
```

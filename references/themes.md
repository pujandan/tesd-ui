# Theme Registry — per-project identity, one pick per project

Typography + accent family are **project identity, not system identity**. This registry is the sanctioned menu: 13 complete, contrast-verified themes (12 extracted from the pairing reference + `T00`, the system exemplar the preview ships). Every consuming agent **picks ONE theme per project** and applies it as the project's tokens — the craft layer (paper & ink, hairlines, spacing, component look, motion laws) never changes.

## Selection law

- **Random by default.** Rotate through the registry — never open on `T00` just because the preview wears it (that is exemplar gravity, the exact failure this registry exists to kill). Anchor to a specific theme ONLY when the brief explicitly names fonts/brand colors, or the domain makes one tone obvious (luxury hotel → `T10`). State the pick in the layout gate line: `theme: T07 heritage-vintage`.
- **One theme per project** — no mid-project switches, no mixing a second face (ONE voice per page, foundations § Typography).
- **Apply = replace values in BOTH blocks** — the light `:root` tokens and the `[data-theme="dark"]` block — by copying each theme's two fences below. `--accent-soft`, `--grad-accent`, washes and rings re-derive automatically via `color-mix()`/`var()`.
- **Locked, regardless of theme:** the three-role type structure (display · body · mono) + scale + tracking discipline · mono role stays `JetBrains Mono` · component look & contracts · the dark-mode contract (accent goes pastel + `--on-accent` goes dark — mirroring `--on-error`) · spark slot names (override the four `--spark-*` by NAME; the names are historical, the values carry the theme's family — every theme's sparks are chosen mid-deep so `--on-spark #fff` chips stay readable).
- **AA is pre-verified, machine-enforced:** all four checks per theme (light `--accent-text` vs paper · `--on-accent` vs `--accent` · dark `--accent-text` vs dark paper · dark `--on-accent` vs dark `--accent`) are ≥ 4.5:1. `scripts/audit.py` gate 9 recomputes them from this file — never hand-edit a value below threshold.
- **Single-weight display exception:** `Pacifico`, `Anton`, `Abril Fatface` ship only weight 400 — that 400 IS their display weight (swap-checklist weight law relaxes for them). `Pacifico` is additionally a **script face**: large sizes only — logo words, hero accent words, short headings; never long headlines, never tight tracking.
- **Body may stay Inter** when the brief demands maximum neutrality (allowed variant of any theme; keep the theme's display + accent family).
- **Font delivery law unchanged** (rule #30): CDN links below are for demos/prototypes; apps self-host (`@fontsource-variable/*`) or inline base64 woff2 on slow links.

## The registry

### T00 · system — the exemplar
**Tone** Modern-tech — dev tools, infrastructure, the preview's own voice.
**Pairing** display `Space Grotesk` 500/600/700 · body `Inter` 400/500/600.
**Load** `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap`

Light (`:root`):
```css
--f-display: "Space Grotesk", system-ui, sans-serif;
--f-body: "Inter", system-ui, -apple-system, sans-serif;
--accent: #2f6ce4; --accent-text: #1557b0; --on-accent: #ffffff;
--spark-blue: #2f6ce4; --spark-purple: #9b72cb; --spark-coral: #d96570; --spark-pink: #ff8bcb;
```
Dark (`[data-theme="dark"]`):
```css
--accent: #a8c7fa; --accent-text: #8ab4f8; --on-accent: #102c56;
```

### T01 · mono-editorial
**Tone** Modern & Clean — portfolios, agencies, photography, monochrome editorial. Grayscale accent by design (ink is the color).
**Pairing** display `Playfair Display` 600/700 · body `Montserrat` 400/500/600.
**Load** `https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Montserrat:wght@400;500;600&display=swap`

Light:
```css
--f-display: "Playfair Display", Georgia, serif;
--f-body: "Montserrat", system-ui, sans-serif;
--accent: #333333; --accent-text: #333333; --on-accent: #ffffff;
--spark-blue: #4a4a4a; --spark-purple: #737373; --spark-coral: #9a9a9a; --spark-pink: #c0c0c0;
```
Dark:
```css
--accent: #d6d6d6; --accent-text: #e5e5e5; --on-accent: #1c1c1c;
```

### T02 · navy-bold
**Tone** Bold & Minimal — corporate, SaaS, fintech, logistics.
**Pairing** display `Montserrat` 600/700 · body `Lato` 400/500/600.
**Load** `https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Lato:wght@400;500;600&display=swap`

Light:
```css
--f-display: "Montserrat", system-ui, sans-serif;
--f-body: "Lato", system-ui, sans-serif;
--accent: #1d63d8; --accent-text: #1749a3; --on-accent: #ffffff;
--spark-blue: #173f8e; --spark-purple: #2f80ed; --spark-coral: #3aa5d8; --spark-pink: #6ea8f5;
```
Dark:
```css
--accent: #7ea6f4; --accent-text: #a9c8fa; --on-accent: #0b2447;
```

### T03 · violet-classic
**Tone** Elegant & Classic — law, finance, insurance, fashion commerce.
**Pairing** display `Bodoni Moda` 600/700 · body `Poppins` 400/500/600.
**Load** `https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@600;700&family=Poppins:wght@400;500;600&display=swap`

Light:
```css
--f-display: "Bodoni Moda", Georgia, serif;
--f-body: "Poppins", system-ui, sans-serif;
--accent: #2d2db8; --accent-text: #23239c; --on-accent: #ffffff;
--spark-blue: #3333b8; --spark-purple: #5a45d8; --spark-coral: #8f6bd8; --spark-pink: #c86bd8;
```
Dark:
```css
--accent: #8f8ff2; --accent-text: #b8b8f7; --on-accent: #14143d;
```

### T04 · coral-creative
**Tone** Creative & Stylish — events, food & beverage, creative studios, playful brands.
**Pairing** display `Pacifico` 400 (**script law**: logo/hero accent words + short headings only, normal tracking) · body `Montserrat` 400/500/600.
**Load** `https://fonts.googleapis.com/css2?family=Pacifico&family=Montserrat:wght@400;500;600&display=swap`

Light:
```css
--f-display: "Pacifico", cursive;
--f-body: "Montserrat", system-ui, sans-serif;
--accent: #d92e55; --accent-text: #b32546; --on-accent: #ffffff;
--spark-blue: #d9314f; --spark-purple: #f4557a; --spark-coral: #ff9e5e; --spark-pink: #e86a4a;
```
Dark:
```css
--accent: #f4879f; --accent-text: #f9b3c2; --on-accent: #3d0f1e;
```

### T05 · forest-strong
**Tone** Strong & Modern — outdoor, sustainability, health, agriculture.
**Pairing** display `Lora` 600/700 · body `Open Sans` 400/500/600.
**Load** `https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Open+Sans:wght@400;500;600&display=swap`

Light:
```css
--f-display: "Lora", Georgia, serif;
--f-body: "Open Sans", system-ui, sans-serif;
--accent: #0e6b4f; --accent-text: #0b5a42; --on-accent: #ffffff;
--spark-blue: #0f5c46; --spark-purple: #17877b; --spark-coral: #4caf8d; --spark-pink: #3e8e68;
```
Dark:
```css
--accent: #6fd0ab; --accent-text: #a5e8cd; --on-accent: #052e20;
```

### T06 · swiss-system — zero-webfont
**Tone** Minimal & Stylish — tools, docs, internal apps, offline-first PWA. No font request at all (the fastest theme); the weight contrast IS the voice. Grayscale accent.
**Pairing** display `system-ui` 700 tight-tracked · body `system-ui` 400/500.

Light:
```css
--f-display: system-ui, -apple-system, "Segoe UI", sans-serif;
--f-body: system-ui, -apple-system, "Segoe UI", sans-serif;
--accent: #1a1a1a; --accent-text: #1a1a1a; --on-accent: #ffffff;
--spark-blue: #2e2e2e; --spark-purple: #5c5c5c; --spark-coral: #8a8a8a; --spark-pink: #b5b5b5;
```
Dark:
```css
--accent: #d9d9d9; --accent-text: #d4d4d4; --on-accent: #111111;
```

### T07 · heritage-vintage
**Tone** Vintage & Classic — heritage brands, coffee, artisan, archives.
**Pairing** display `Abril Fatface` 400 (single-weight display) · body `Raleway` 400/500/600.
**Load** `https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Raleway:wght@400;500;600&display=swap`

Light:
```css
--f-display: "Abril Fatface", Georgia, serif;
--f-body: "Raleway", system-ui, sans-serif;
--accent: #7b4a2d; --accent-text: #6b3f26; --on-accent: #ffffff;
--spark-blue: #6e4a2f; --spark-purple: #8a5a33; --spark-coral: #a9852f; --spark-pink: #b08350;
```
Dark:
```css
--accent: #c9a17e; --accent-text: #e0c8ae; --on-accent: #2b180c;
```

### T08 · tech-neon
**Tone** Tech & Modern — dev tools, crypto, gaming, robotics.
**Pairing** display `Rajdhani` 600/700 · body `Roboto` 400/500/600.
**Load** `https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Roboto:wght@400;500;600&display=swap`

Light:
```css
--f-display: "Rajdhani", system-ui, sans-serif;
--f-body: "Roboto", system-ui, sans-serif;
--accent: #6c3df4; --accent-text: #5527d8; --on-accent: #ffffff;
--spark-blue: #5a2fd8; --spark-purple: #6c3df4; --spark-coral: #3d8bfd; --spark-pink: #29c6db;
```
Dark:
```css
--accent: #9f7bff; --accent-text: #c3b2ff; --on-accent: #1c1040;
```

### T09 · aqua-friendly
**Tone** Soft & Friendly — education, wellness, community, non-profit.
**Pairing** display `Quicksand` 600/700 · body `Nunito` 400/500/600.
**Load** `https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&family=Nunito:wght@400;500;600&display=swap`

Light:
```css
--f-display: "Quicksand", system-ui, sans-serif;
--f-body: "Nunito", system-ui, sans-serif;
--accent: #0f7a6e; --accent-text: #0b6156; --on-accent: #ffffff;
--spark-blue: #0f7a6e; --spark-purple: #17877b; --spark-coral: #45b8ac; --spark-pink: #2f9ac0;
```
Dark:
```css
--accent: #5fc6b8; --accent-text: #a5e7e0; --on-accent: #04302b;
```

### T10 · gold-lux
**Tone** Luxury & Premium — jewelry, hotels, premium real-estate, fine dining.
**Pairing** display `Cormorant Garamond` 600/700 · body `Lato` 400/500/600.
**Load** `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Lato:wght@400;500;600&display=swap`

Light:
```css
--f-display: "Cormorant Garamond", Georgia, serif;
--f-body: "Lato", system-ui, sans-serif;
--accent: #8a6a1f; --accent-text: #7a5c1c; --on-accent: #ffffff;
--spark-blue: #8a6a1f; --spark-purple: #a9852f; --spark-coral: #c08a3e; --spark-pink: #6e5b2a;
```
Dark:
```css
--accent: #d6c38c; --accent-text: #e8dcb8; --on-accent: #241c08;
```

### T11 · red-edgy
**Tone** Edgy & Bold — campaigns, sports, music, launches.
**Pairing** display `Anton` 400 (single-weight display; slight positive tracking suits caps) · body `Mulish` 400/500/600.
**Load** `https://fonts.googleapis.com/css2?family=Anton&family=Mulish:wght@400;500;600&display=swap`

Light:
```css
--f-display: "Anton", "Arial Narrow", system-ui, sans-serif;
--f-body: "Mulish", system-ui, sans-serif;
--accent: #d32f2f; --accent-text: #b71c1c; --on-accent: #ffffff;
--spark-blue: #b71c1c; --spark-purple: #d32f2f; --spark-coral: #e8590c; --spark-pink: #f2765f;
```
Dark:
```css
--accent: #ef8a84; --accent-text: #f5b0ab; --on-accent: #3a0d0a;
```

### T12 · sage-fresh
**Tone** Fresh & Modern — organic goods, gardening, eco packaging, publications.
**Pairing** display `Fraunces` 600/700 · body `Inter` 400/500/600.
**Load** `https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Inter:wght@400;500;600&display=swap`

Light:
```css
--f-display: "Fraunces", Georgia, serif;
--f-body: "Inter", system-ui, -apple-system, sans-serif;
--accent: #4a6b3a; --accent-text: #3d5a2f; --on-accent: #ffffff;
--spark-blue: #4a6b3a; --spark-purple: #5e8a5a; --spark-coral: #7a9a63; --spark-pink: #9db380;
```
Dark:
```css
--accent: #a9c28f; --accent-text: #cfe0bd; --on-accent: #1a2612;
```

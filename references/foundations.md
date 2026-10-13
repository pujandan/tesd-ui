# Foundations — the token block

The complete `:root` block, verbatim from the living preview. Copy it as the base of every project; adjust only the accent pair per project brand.

```css
:root {
  /* color — paper & ink */
  --paper: #fafaf9;
  --surface: #ffffff;
  --ink: #111113;
  --ink-2: #3d3d42;
  --muted: #6b6b72;
  --placeholder: #9c9ca3;
  --line: rgba(17, 17, 19, 0.12);
  --line-strong: rgba(17, 17, 19, 0.24);

  /* color — one accent (switchable at runtime; pairs = accent / darker text pair) */
  --accent: #4285f4;
  --accent-text: #1557b0;
  --accent-soft: color-mix(in srgb, var(--accent) 12%, transparent);
  --on-accent: #ffffff;
  --on-error: #ffffff;             /* text on filled error surfaces (saturated in light) */

  /* color — semantic */
  --success: #188038;
  --success-soft: rgba(24, 128, 56, 0.12);
  --warning: #a8630a;
  --warning-soft: rgba(196, 124, 20, 0.14);
  --error: #d93025;
  --error-strong: #b3261e;
  --error-soft: rgba(217, 48, 37, 0.1);
  --wash-hover: color-mix(in srgb, var(--ink) 5%, transparent);
  --fill-disabled: color-mix(in srgb, var(--ink) 4%, transparent);
  --nav-bg: rgba(250, 250, 249, 0.82);
  --scrim: rgba(17, 17, 19, 0.4);
  --ink-hover: #2a2a2e;
  --success-on-ink: #7ee2a8;
  --info-on-ink: #9db9ff;

  /* gradients — soft by contract: wash stops ≤ 0.14 alpha · display-size text only
     spark family = Gemini-style flow: blue → purple → coral → pink */
  --spark-blue: #4285f4; --spark-purple: #9b72cb; --spark-coral: #d96570; --spark-pink: #ff8bcb;
  --grad-accent: linear-gradient(135deg, var(--accent), var(--accent-text));
  --grad-spark: linear-gradient(104deg, var(--spark-blue) 0%, var(--spark-purple) 42%, var(--spark-coral) 74%, var(--spark-pink) 100%);
  --grad-surface: linear-gradient(180deg, var(--surface), var(--paper));
  --wash-spark:
    radial-gradient(46% 60% at 14% 6%, color-mix(in srgb, var(--spark-blue) 12%, transparent), transparent 68%),
    radial-gradient(40% 56% at 86% 2%, color-mix(in srgb, var(--spark-purple) 11%, transparent), transparent 68%),
    radial-gradient(42% 52% at 62% 100%, color-mix(in srgb, var(--spark-pink) 9%, transparent), transparent 70%);

  /* type */
  --f-display: "Space Grotesk", system-ui, sans-serif;   /* system exemplar — projects pick their own pairing (§ Font pairing contract) */
  --f-body: "Inter", system-ui, -apple-system, sans-serif;
  --f-mono: "JetBrains Mono", ui-monospace, monospace;
  --t-hero: clamp(2.6rem, 5.6vw, 4.4rem);
  --t-h1: clamp(1.7rem, 3vw, 2.3rem);
  --t-h2: 1.25rem;
  --t-body: 1rem;
  --t-sm: 0.875rem;
  --t-xs: 0.75rem;

  /* spacing — 4pt scale */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px;
  --s-5: 24px; --s-6: 32px; --s-7: 48px; --s-8: 64px; --s-9: 96px;

  /* radius — base scale + calculated control radii (r ≈ 0.3 × height) */
  --r-sm: 8px; --r-md: 12px; --r-lg: 16px;
  --r-control-sm: 10px;   /* 32–36px controls */
  --r-control: 12px;      /* 40px controls */
  --r-control-lg: 14px;   /* 48px controls */
  --r-full: 999px;        /* anatomy only — switch capsule, progress bar; never buttons */

  /* elevation — one soft family */
  --shadow-1: 0 1px 2px rgba(17, 17, 19, 0.05);
  --shadow-2: 0 2px 6px rgba(17, 17, 19, 0.06), 0 16px 40px -16px rgba(17, 17, 19, 0.14);
  --shadow-pop: 0 4px 10px rgba(17, 17, 19, 0.08), 0 24px 56px -20px rgba(17, 17, 19, 0.24);

  /* motion — locked */
  --dur-1: 120ms; --dur-2: 180ms; --dur-3: 240ms;
  --ease: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-io: cubic-bezier(0.77, 0, 0.175, 1);

  /* layout */
  --container: 1120px;
  --nav-h: 60px;

  /* focus — every control focuses the same way */
  --focus-ring: 0 0 0 3px var(--accent-soft);
}
```

## Dark mode — token inversion only

Components never carry theme branches. A single `[data-theme="dark"]` block re-defines the semantic tokens; everything built on tokens inverts for free — **zero hardcoded ink/paper rgba literals in component rules**: every alpha fill goes through `color-mix(var(--ink) N%)` / `color-mix(var(--paper) N%)` or the `--wash-hover` token, so the inversion carries it (v0.9.10 swept the last five: btn-icon hover, card-media is-purple tail, applied url chip, bulkbar button border + hover):

```css
:root { color-scheme: light; /* …light values… */ }
[data-theme="dark"] {
  color-scheme: dark;
  --paper: #131316; --surface: #1b1b1f;
  --ink: #f4f4f5; --ink-2: #c9c9cf; --muted: #8f8f97; --placeholder: #6a6a72;
  --line: rgba(244, 244, 245, 0.12); --line-strong: rgba(244, 244, 245, 0.26);
  --accent-text: #8ab4f8;                 /* text pair inverts direction: darker→lighter */
  --nav-bg: rgba(19, 19, 22, 0.8); --scrim: rgba(0, 0, 0, 0.55); --ink-hover: #e6e6ea;
  --success: #81c995; --warning: #fdd663; --error: #f28b82; --error-strong: #f6a099;
  --on-error: #241f1f;                    /* dark text: error goes pastel in dark mode */
  --success-on-ink: #1a7f37; --info-on-ink: #1a4fa0;
  --shadow-1: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-2: 0 2px 6px rgba(0, 0, 0, 0.4), 0 16px 40px -16px rgba(0, 0, 0, 0.5);
  --shadow-pop: 0 4px 10px rgba(0, 0, 0, 0.45), 0 24px 56px -20px rgba(0, 0, 0, 0.6);
}
```

**Rules that make this work:**

1. **Alpha fills are always `color-mix(in srgb, var(--ink) N%, transparent)`** — never literal `rgba(ink-rgb, N)`. Ink flips, every fill flips: hovers, badges, segmented track, switch, progress, table head/row-hovers, skeleton, spinner track, disabled fields.
2. **On-ink surfaces use `--paper` as foreground** (spinner `.on-ink`, toast body) — the pair inverts automatically.
3. New theme-bearing tokens: `--nav-bg`, `--scrim`, `--ink-hover` (primary hover).
4. **Anti-flash**: an inline `<head>` script resolves `data-theme` from `localStorage("tesd-theme")` → `prefers-color-scheme` → light, before first paint.
5. **Toggle**: a `.theme-toggle` icon button (shows the icon of the theme you'd switch TO) flips the attribute, persists, and re-applies the accent pair (each accent stores `data-accent-text` + `data-accent-text-dark`).
6. `color-scheme` is set per theme so native controls and scrollbars follow.
7. Spark gradients/washes keep their values on dark — verified legible; do not fork them per theme.

## Accent pairs (runtime-switchable options)

| Name | `--accent` | `--accent-text` |
|---|---|---|
| blue (default) | `#4285f4` | `#1557b0` |
| violet | `#7a45e0` | `#5b2bc7` |
| teal | `#0f9d8f` | `#0a7268` |
| orange | `#e8710a` | `#a8520a` |
| ink (monochrome) | `#111113` | `#111113` |

Switching = setting three properties on `document.documentElement`: `--accent`, `--accent-text`, `--accent-soft` (hex + `1f` alpha suffix).

## Typography

- **Display:** Space Grotesk 500/600/700, tracking −0.02 to −0.035em on large sizes. Headings are always roman — never italic.
- **Body/UI:** Inter 400/450/500/600 at 16px working size.
- **Mono labels:** JetBrains Mono 400/500 at `--t-xs`, uppercase, letter-spacing 0.08–0.22em — eyebrows, indexes, token names, fine print.
- **Font pairing contract (v1.2.0 — typography is per-project, aesthetics are not):** fonts are project-level tokens. The INVARIANTS that carry the tesd signature when faces change: the three-role structure (display · body · mono), the type scale, tracking (-0.01…-0.02em display), weight discipline, and the craft layer (spacing, hairlines, motion). Swap ONLY the `--f-display/--f-body/--f-mono` values — never mix a second face mid-page, never restyle per-component.
  - **Roles:** display = headings, weight 600, tight tracking, needs personality at large sizes · body = UI + reading, Inter-class neutral, excellent 16px legibility, weights 400/500/600 · mono = labels/kickers/code/numbers, 400/500.
  - **Contrast law: ONE voice per page** — the display face carries the personality; body stays neutral. Never two personality faces.
  - **Sanctioned archetypes** (pick by brief tone; body may stay Inter):
    | Archetype | Tone | Pairing |
    |---|---|---|
    | Modern-tech *(system exemplar)* | tools, dev products | Space Grotesk + Inter + JetBrains Mono |
    | Editorial-trust | publications, finance, heritage, travel | Fraunces + Inter + JetBrains Mono |
    | Warm-friendly | services, family, health | Plus Jakarta Sans (display) + Inter + JetBrains Mono |
    | Sharp-bold | campaigns, launches | Archivo (incl. Expanded) + Inter + JetBrains Mono |
    | Quiet-lux | premium, hospitality | Instrument Serif + Inter + JetBrains Mono |
  - **Swap checklist:** weights available (500/600/700 display · 400/500/600 body) · x-height compatible with control scale (verify side-by-side control parity after swap) · tabular figures where tables show numbers · fallback stack per role · declare the pairing in the layout gate line.
- **Font delivery, three tiers (flicker law):** (a) throwaway demos may use a font CDN; (b) framework projects self-host via `@fontsource-variable/*` npm packages — never a CDN in an app; (c) **apps served over slow links (relays, mobile networks, tunnels) must inline the latin variable woff2 as base64 data URIs inside the render-blocking stylesheet.** A URL-referenced font only starts downloading when first layout needs it — always *after* first paint — and `display=swap` then swaps in the real face, reflowing every text node (titles visibly re-wrap, sizes jump). Inlined bytes arrive with the CSS itself: no second request, no race, no swap. Generate the CSS with a script (keep the fontsource packages in devDependencies as provenance); `font-display: block` as belt-and-braces so a deferred decode stays invisible rather than showing fallback metrics.

## Gradients — the three sanctioned uses

| Pattern | Token | Use |
|---|---|---|
| A · Hero wash | `--wash-spark` (+ `--paper`) | Hero and section backgrounds — three radial washes |
| B · Gradient display | `--grad-spark` + `background-clip: text` | Display-size type only |
| C · Wash card | `color-mix` corner wash | One soft accent wash in a surface card corner |

Never on buttons, inputs, body text, or borders. Wash stops ≤ 0.14 alpha. Card media variants: `.is-spark` (full flow), `.is-purple`, `.is-pink` — always via classes, never inline gradients.

## i18n notes

Body line-height (1.6) already accommodates tall-ascender scripts; add a notch for Thai/Devanagari when they ship. For RTL projects, mirror with `dir="rtl"` and prefer logical properties (`margin-inline-start`, `inset-inline`) in project CSS — the system's component contracts are geometry-agnostic except drawer side and icon-chevron direction, which flip with `dir`. Never hardcode `left/right` in new patterns.

## Color token cards (documentation pattern)

Color tokens are always rendered as clickable cards: colored chip 46px (radius `--r-sm`, hairline border), mono token name, value line; hover lifts per the surface contract; click copies. The `--line` chip shows a diagonal stripe pattern (transparent value). Live tokens (`--accent*`) reference `var()` directly so they update with the accent switcher.

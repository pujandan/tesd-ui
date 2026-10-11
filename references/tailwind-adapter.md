# Tailwind Adapter

The system's source of truth is vanilla CSS custom properties. On Tailwind v4 projects, map the same tokens into the CSS-first `@theme` — one mapping, consumed by both worlds.

## v4 `@theme` mapping

```css
@import "tailwindcss";

@theme {
  /* color */
  --color-paper: #fafaf9;
  --color-surface: #ffffff;
  --color-ink: #111113;
  --color-ink-2: #3d3d42;
  --color-muted: #6b6b72;
  --color-placeholder: #9c9ca3;
  --color-line: rgba(17, 17, 19, 0.12);
  --color-line-strong: rgba(17, 17, 19, 0.24);
  --color-accent: #4285f4;
  --color-accent-text: #1557b0;
  --color-on-accent: #ffffff;
  --color-on-error: #ffffff;
  --color-success: #188038;
  --color-warning: #a8630a;
  --color-error: #d93025;
  --color-error-strong: #b3261e;
  --color-spark-blue: #4285f4;
  --color-spark-purple: #9b72cb;
  --color-spark-coral: #d96570;
  --color-spark-pink: #ff8bcb;

  /* fonts */
  --font-display: "Space Grotesk", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* radius (control scale stays hand-written classes — see below) */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  /* motion */
  --ease-fluid: cubic-bezier(0.19, 1, 0.22, 1);   /* = --ease */

  /* shadows */
  --shadow-1: 0 1px 2px rgba(17, 17, 19, 0.05);
  --shadow-2: 0 2px 6px rgba(17, 17, 19, 0.06), 0 16px 40px -16px rgba(17, 17, 19, 0.14);
  --shadow-pop: 0 4px 10px rgba(17, 17, 19, 0.08), 0 24px 56px -20px rgba(17, 17, 19, 0.24);
}
```

Usage becomes `bg-paper text-ink border-line-strong`, `font-display`, `shadow-pop`, `ease-fluid`, etc.

## Grid & breakpoints

In Tailwind projects, use the **native grid utilities** — they map 1:1 to the tesd engine. Align the screens first:

```css
@theme {
  --breakpoint-sm: 720px;  /* tesd --bp-sm */
  --breakpoint-md: 980px;  /* tesd --bp-md */
}
```

| tesd (vanilla) | Tailwind |
|---|---|
| `.grid` + `.cols-3` | `grid grid-cols-3` |
| `.sm:cols-2` / `.md:cols-4` | `sm:grid-cols-2` / `md:grid-cols-4` |
| `.span-8` (+ `md:`) | `col-span-8` (+ `md:`) |
| `.gap-3` | `gap-3` (v4 default spacing is 4pt — same scale) |
| `.auto-260` | no equivalent — copy the `.auto-*` rule, or `repeat(auto-fit, minmax(min(100%,260px),1fr))` inline |

Same laws apply ([layout.md](./layout.md)): tracks `minmax(0,1fr)`, prefixed responsive spans, no ad-hoc templates.

## What stays custom CSS (do NOT approximate with utilities)

These patterns are contracts, not styles — ship them as small component classes alongside the utilities:

1. **Control sizes + radii parity** (32/40/48 with 10/12/14 radii) — utilities tempt mismatched heights; `.btn`/`.input` classes keep the parity guaranteed.
2. **The focus ring** — one rule: `border-accent + box-shadow 0 0 0 3px accent-soft`. In Tailwind terms a `.tesd-focus` class applied with `focus-visible:tesd-focus`, never re-typed per component.
3. **Gradients** (`--grad-spark`, `--wash-spark`) — reference the CSS variables in a layered class; `bg-[image:var(--wash-spark)]` works but hides the contract — prefer named classes.
4. **Overlay choreography** — the two-direction transition blocks.
5. **The stall-safe reveal split** — GSAP + `.rv/.in` classes.

## v3 projects (if legacy)

Map tokens in `tailwind.config.theme.extend` (`colors`, `fontFamily`, `borderRadius`, `boxShadow`, `transitionTimingFunction`). The same keep-as-CSS list applies.

## Svelte 5 (TESD stack)

Wrap the component classes as runes-based components in `src/lib/components/ui/` (Button.svelte, Input.svelte, …): props → variant/size classes from this system, tokens imported once in `app.html`/`+layout.svelte` as the foundations `:root` block. Never fork token values into per-component styles.

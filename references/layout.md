# Layout — the grid engine

One responsive layout system for every tesd-ui project. Vanilla CSS classes with a
Tailwind-style API; in Tailwind projects the native grid utilities map 1:1 (see
[tailwind-adapter.md](./tailwind-adapter.md) § Grid & breakpoints).

## Breakpoints

| Token | Value | Meaning |
|---|---|---|
| `--bp-sm` | **720px** | phone → tablet: multi-column begins, control measure caps lift |
| `--bp-md` | **980px** | tablet → desktop: burger → full nav, wide grids |

Two gates only. CSS media queries hardcode the values (custom properties cannot
drive `@media`) — the tokens are the single source for JS `matchMedia` and the
Tailwind adapter; all three must stay in sync.

## API

```html
<!-- auto grid — the browser picks the column count (cards, lists) -->
<div class="grid auto-260 gap-3">…</div>

<!-- explicit columns — mobile-first: unprefixed = every width -->
<div class="grid cols-1 sm:cols-2 md:cols-4 gap-4">…</div>

<!-- 12-column division with spans -->
<div class="grid md:cols-12 gap-3">
  <main class="md:span-8">…</main>
  <aside class="md:span-4">…</aside>
</div>
```

| Class | Effect |
|---|---|
| `.grid` | `display:grid`; tracks `repeat(var(--cols,1), minmax(0,1fr))`; gap `var(--gap, --s-3)`; children `min-width:0` |
| `.cols-1…12` | sets `--cols` — applies at every width |
| `.sm:cols-N` / `.md:cols-N` | overrides `--cols` from 720px / 980px up |
| `.span-1…12` (+ `sm:`/`md:`) | `grid-column: span N` on a child |
| `.gap-0…9` | `--gap` on the 4pt spacing scale |
| `.auto-240 / 260 / 280 / 300 / 320` | `repeat(auto-fit, minmax(min(100%, Npx), 1fr))` — card grids |

```css
.grid { display: grid; grid-template-columns: repeat(var(--cols, 1), minmax(0, 1fr)); gap: var(--gap, var(--s-3)); }
.grid > * { min-width: 0; }
.cols-3 { --cols: 3; }  /* …1–12, plus escaped-colon sm:/md: variants inside the two media queries */
.span-8 { grid-column: span 8; }
.auto-260 { --auto: 260px; }  /* with the shared rule on .auto-240…320 */
```

## Laws

1. **Mobile-first**: no `cols` class = 1 column (stacked). A `cols-N` without a
   prefix applies at every width — if a grid should stack on phones, put the
   column count behind `sm:`/`md:` only.
2. **Spans are breakpoint-aware or they break stacking**: `span-N` on a child of
   a 1-column grid creates implicit tracks and shatters the mobile stack —
   prefix responsive spans (`md:span-8`). Full-row cells use `md:span-12`.
3. **Tracks are `minmax(0, 1fr)`** and children get `min-width: 0` — content
   (long words, wide tables) can never force a track wider than its share.
4. **Auto grids for card/list layouts, explicit `cols` for content division.**
   Auto minimums come from the sanctioned set (240–320 in 20px steps); the
   `minmax(min(100%, Npx), 1fr)` wrapper is built in — a bare `minmax(Npx, …)`
   overflows the moment the container is narrower than N.
5. **No ad-hoc `grid-template-columns` in markup.** Component internals (table
   check columns, shell rails, hero's `1.5fr 1fr` art direction) live in component
   CSS — page-level layout goes through the engine.
6. **Gaps use `.gap-N`** (the 4pt scale), not bespoke `gap:` values.

## QA

Probe at **563 / 800 / 1024** (below-sm / sm–md / md+): each `sm:`/`md:` grid
reports the expected column count via `getComputedStyle(el).gridTemplateColumns`,
span children measure their fraction of the canvas, and the document never
overflows horizontally.

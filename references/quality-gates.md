# Quality Gates

Run every gate before reporting an artifact done. A gate that fails is fixed, not reported as a known issue.

## Token discipline

- [ ] Zero inline colors / font-families / radii / shadows / durations / easings in component CSS — everything references `var(--…)` from the foundations block
- [ ] No duplicate sources: one token per concept (spark colors exist only as `--spark-*`; washes derive via `color-mix`)
- [ ] Demo-only state forcing uses companion classes (`.is-hover`, `.is-focus`), not inline styles

## Component contracts

- [ ] 8 states per interactive component: default · hover · focus-visible · active · disabled · loading · error · success
- [ ] Focus = `outline: none; border-color: var(--accent); box-shadow: var(--focus-ring)` on every bordered control; companion shapes (checkbox/radio/switch) included; ring never animates
- [ ] Side-by-side controls measure equal height (button 40 = input 40; 48 = 48) — verify with a rect probe when in doubt
- [ ] Radius follows `r ≈ 0.3 × height`; nested = outer − padding; no `--r-full` outside anatomy
- [ ] Hover = −2px / `--line-strong` / `--shadow-1` / 180ms; `:active` resets; gated where required
- [ ] Danger: filled = confirmation, outline = row-level
- [ ] Spinner is the ring variant with size classes; no inline border overrides

## Overlays

- [ ] Animates open AND close (exit faster than enter; `visibility` delayed to exit duration)
- [ ] Close paths: explicit button + scrim/tap-outside + Escape
- [ ] Focus moves in on open, returns to trigger on close; body scroll locked while open
- [ ] ARIA: dialog roles + labels, `aria-expanded` on triggers, toasts in a live region

## Forms

- [ ] Labels tied via `<label>`; help text present where the field needs it
- [ ] Validation is live on `input`, messages in `aria-live="polite"`, submit focuses the first invalid field
- [ ] Disabled state uses `--fill-disabled`, never just opacity

## Gradients

- [ ] Only the three sanctioned patterns (hero wash / display text / wash card); stops ≤ 0.14 alpha; nothing on buttons, inputs, or body text

## Motion

- [ ] One engine: GSAP 3.13 + its plugins own ALL animation (v0.19.0 GSAP-first). No second animation library, ever. Only CSS keyframes left: status loaders (`.spinner`, `.skeleton`)
- [ ] UI states on CSS transitions < 300ms; only `transform`/`opacity` (+ CSS vars feeding transform)
- [ ] No-JS / no-GSAP / reduced-motion render every widget complete — "before" states only under `html.tm-ready`
- [ ] Stall guard active (entrances forced to end on hide/pagehide/bfcache restore); loops pause off-screen
- [ ] `prefers-reduced-motion` handled; `prefers-reduced-transparency` where frosted surfaces exist

## Tier 3 — shells

- [ ] Overlay open functions call `closeOverlays()` BEFORE toggling their own class (reentrancy)
- [ ] `.rv.in` resolves to `transform: none` — an identity transform still creates a containing block that breaks fixed sheets
- [ ] Anchored popovers live inside their positioned trigger wrapper (`offsetParent` check) — no page-level floats
- [ ] Above-the-fold entrances use GSAP timeline with stall guard watchdog + bfcache flush (stall-proof; static default fallback)
- [ ] Shell choice stated in the preview block; composition respects the shell's grid + responsive collapse

## Overlays & interactive data (Tier 2)

- [ ] Overlays are exclusive — never stacked scrims; dropdown closes on outside-click; palette answers ⌘K/Ctrl+K
- [ ] Table: `aria-sort` + keyboard sort, master checkbox `indeterminate`, skeleton with `aria-busy`, all four stateful renders exist
- [ ] Affix/counter/upload follow the form contracts (one ring, native label behavior, no double dialogs)

## A11y & keyboard

- [ ] Tabs: roving tabindex + arrows/Home/End; modal & menu: Tab trapped, Escape closes, focus returns to trigger
- [ ] Switch `role="switch"`, segmented `aria-pressed`, toasts in live region, table `th[scope]`, labels bound, icons per icons.md
- [ ] Full Tab-walk loses nothing; skip link present; contrast pairs per a11y.md

## Icons

- [ ] All UI icons from Lucide (or documented Tabler fallback) — zero hand-drawn/AI-generated UI icons; brand marks excepted
- [ ] Sizes on scale (12 / 14–16 / 19–20), stroke at library default, color via `currentColor`
- [ ] Decorative icons `aria-hidden`; solo icons on labeled buttons; deprecated packages (`lucide-svelte`, `@tabler/icons-svelte`) never installed

## Dark mode

- [ ] Both themes render correctly (force each via `data-theme` when testing) — zero hardcoded `rgba(ink-rgb…)` fills; all alpha fills via `color-mix(var(--ink))`
- [ ] On-ink surfaces (toast, spinner on primary) use `--paper` foreground; accent text-pair re-applies per theme
- [ ] `color-scheme` set per theme; anti-flash script present; toggle persists

## Responsive

- [ ] Gates pass at 320/375/414/768/980/1440 — run the offender probe; zero horizontal overflow, zero outside-viewport elements
- [ ] Nav two-tier collapse (979/720); footer single-alignment collapse; tables scroll inside their wrapper only

## Content

- [ ] English-only artifacts (identifiers, comments, copy)
- [ ] No invented metrics/testimonials — placeholders or real data only
- [ ] Mono labels uppercase with tracking; headings roman (never italic)

## System hygiene (when the task touched the design system)

- [ ] Preview (`index.html`) AND the matching reference doc updated in the same change
- [ ] Reverted decisions recorded as final in the docs (e.g., ring spinner) — never reintroduced
- [ ] `version` bumped in SKILL.md frontmatter

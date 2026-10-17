---
name: tesd-ui
description: Design system and UI coding standard for all projects — the personal signature language of tesd. Invoke when building, styling, reviewing, or updating any user interface: landing pages, app shells, components, forms, overlays, or design tokens — in any stack (vanilla HTML, SvelteKit, React, Astro). Enforces locked design tokens, an 8-state component contract, uniform interaction patterns, GSAP-only motion, and responsive gates at 320–1440. Also invoke for "add/update a pattern" requests against this system, and for generating tesd-ui components into SvelteKit/TESD projects (see svelte.md — seeds, never a shared library).
version: 1.7.2
---

# tesd/ui — Design System & UI Standard

**The system:** one signature language — paper & ink, hairline structure, a single live-switchable accent, spark gradients (Gemini-style blue→purple→pink), Space Grotesk + Inter + JetBrains Mono, motion that answers in under 300ms. Clean by default, interactive by design.

**Source of truth:** [`index.html`](./index.html) — the living preview. Every token, component, and pattern in this skill is rendered there and verified. When this guide and the preview disagree, the preview wins; fix the guide.

This skill is fully standalone and can be used on ANY project or stack (vanilla HTML, SvelteKit, React, Astro, Vue). While it serves as the design sibling of `tesd-stack`, neither skill depends on the other — developers can freely choose either skill independently or pair them together. All code artifacts it produces are English-only, token-driven. The motion engine is **GSAP 3.13+** (100% free since the Webflow acquisition, May 2025 — all formerly premium plugins included at no cost). **Projects consuming this skill should install GSAP via npm and bundle it** (`npm i gsap` then `import { gsap } from 'gsap'; import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'`) — CDN is only acceptable for the skill's own preview pages.

## When to Apply

Apply to ANY task that produces or touches UI: new pages, components, redesigns, audits, token changes — in any framework. The CSS patterns are vanilla by design; consume them directly, or through the [Tailwind adapter](./references/tailwind-adapter.md) on Tailwind projects, or wrapped in Svelte 5 components under `src/lib/components/ui/` on TESD projects.

## The Ten Non-Negotiables

1. **Locked tokens — no mid-render improvisation.** Every color, font, radius, shadow, duration, and easing references a named custom property from [foundations.md](./references/foundations.md). A value that doesn't exist as a token gets lifted into the token block first. Inline hex/rgba in component CSS is a violation (the only sanctioned inline values live in the `:root` block and demo markup).
2. **Soft borders — never solid ink dividers.** Section rules and footer borders use `--line-strong` (rgba .24) or `--line` (.12). Solid `--ink` borders are reserved for component fills (buttons), never for dividers.
3. **Radius is calculated, not guessed: `r ≈ 0.3 × control height`.** Tokens `--r-control-sm` 10px (32–36px controls) · `--r-control` 12px (40px) · `--r-control-lg` 14px (48px); nested radius = outer − padding. `--r-full` is **anatomy-only** (switch capsule, progress bar) — never buttons, segmented controls, or badges. Avatars and radio dots stay circular (person/choice anatomy).
4. **One focus style for every bordered control:** `outline: none; border-color: var(--accent); box-shadow: var(--focus-ring)` — inputs, buttons, selects, chips, color cards, swatches, pagination, and checkbox/radio/switch companions. The global 2px `:focus-visible` outline remains only for borderless elements (links, nav). The ring never animates.
5. **Control size parity — buttons and inputs share one scale: 32 / 40 / 48.** A side-by-side input+button pair must measure equal height with aligned top and bottom edges (`.btn` + `.input` = 40px; `.btn-lg` + `.input-lg` = 48px). Label row is 20px line-height + 6px gap → adjacent button `margin-top: 26px`.
6. **One interactive-surface hover:** lift `translateY(-2px)` · border `--line-strong` · shadow `--shadow-1` · duration `--dur-2` (180ms) · `:active` resets to `translateY(0)`. Never mix lift distances or shadow tiers across components. Card hovers are gated behind `(hover: hover) and (pointer: fine)`.
7. **Danger hierarchy:** destructive **confirmation** actions (modal "Delete") use filled danger — `.btn-danger` = `var(--error)` fill, white text, hover `--error-strong`. The outline flavor `.btn-danger-outline` is for row-level secondary contexts.
8. **Soft gradients — three sanctioned uses only** ([foundations.md](./references/foundations.md) § Gradients): Pattern A hero/section wash (`--wash-spark`), Pattern B gradient display text (`--grad-spark` clipped to text, display size only), Pattern C wash card. Wash stops ≤ 0.14 alpha. Gradients never appear on buttons, inputs, or body text. The spark quartet is single-sourced via `--spark-*` tokens + `color-mix()`.
9. **The overlay animation contract — every overlay animates BOTH directions:** enter slower and staggered (menu links rise 460ms + 40ms steps; CTA +320ms), exit faster and un-staggered (links/CTA 180ms, container fade 260ms) with `visibility` delayed to the exit duration so nothing clips. Enter transitions live on the open-state rule, exit transitions on the base rule. The delete-confirm modal is the reference implementation.
10. **Spinner is a ring** (user's final choice — blades were tried and reverted): border-based circle, dark arc via `border-top-color`, 700ms linear; sizes `.s-14/.s-24/.s-30` (default 18); `.on-ink` variant on dark fills.

## Rules at a Glance

| # | Area | Rule | Reference |
|---|------|------|-----------|
| 1 | Tokens | All values via named custom properties | [foundations.md](./references/foundations.md) |
| 2 | Type | **Per-project pairing, contracted freedom** — the three-role structure is the signature (display 600 tight-tracked · body Inter-class 400–600 · mono labels); pick from the sanctioned archetypes in foundations § Font pairing; only `--f-*` tokens change. Preview's Space Grotesk + Inter + JetBrains Mono is the system exemplar, not a mandate | foundations |
| 3 | States | Every interactive component ships 8 states: default · hover · focus-visible · active · disabled · loading · error · success | [components/](./references/components/) |
| 4 | Motion engine | **GSAP-first (v0.19.0)** — GSAP 3.13 + its plugins own ALL animation (entrances, choreography, loops, text/SVG/Flip); one engine, never a second library; only exception: status loaders stay CSS | [motion.md](./references/motion.md) |
| 5 | Motion split | CSS transitions own UI states (hover/focus/open-close); GSAP owns every animation via `tesd-motion.js`; guarantees: no-JS/RM fully rendered (hidden states only under `html.tm-ready`), stall guard, loops pause off-screen | motion.md § Guarantees |
| 6 | UI-state speed | < 300ms, `transform`/`opacity` only, custom easings from tokens | motion.md |
| 7 | Reduced motion | `prefers-reduced-motion` → cross-fades, 1ms transitions, libraries skipped | motion.md |
| 8 | Responsive gates | Verified at 320 · 375 · 414 · 768 · 980 · 1440 — zero horizontal overflow | [responsive.md](./references/responsive.md) |
| 9 | Grids | Layout engine `.grid` + `cols-N` (`sm:`/`md:` prefixes, 720/980) + `span-N` + `gap-N` + `auto-N` card grids; tracks `minmax(0,1fr)`; responsive spans must be prefixed or they break the mobile stack; no ad-hoc `grid-template-columns` in markup | [layout.md](./references/layout.md) |
| 10 | Nav | Links collapse ≤979px (burger appears) · CTA collapses ≤720px | responsive.md |
| 11 | Footer | Wordmark + links row, note as fine-print below; ≤979 collapses to one left alignment | responsive.md |
| 12 | Overlays | Full family — modal · drawer→bottom-sheet · dropdown · ⌘K palette; dual-direction animation per contract #9; **exclusive** (opening one closes the rest) | [components/overlays.md](./references/components/overlays.md) |
| 13 | Danger | Filled = confirm · outline = secondary | components/buttons.md |
| 14 | Language | All code artifacts in English | (tesd-stack family rule) |
| 15 | Preview | The living `index.html` is the visual source of truth | — |
| 16 | Svelte | Components are seeds generated into `src/lib/components/ui/` (project-owned); tokens global in `app.css`; Svelte transitions mount/unmount only | [svelte.md](./references/svelte.md) |
| 20 | Shells | Five page shells (App/Docs/Dashboard/Auth/**Landing**) — the composition layer where projects differ; Landing ships 3 hero variants + section recipes + booking flow | [shells.md](./references/shells.md) |
| 21 | Export | Projects consume `tokens.css` (generated from the preview); settled systems lock into a project `design.md` | [export.md](./references/export.md) |
| 22 | Width law | Controls are `width:100%`; wrappers (`.field`/`.search`/`.input-affix`/`.dropzone`) cap at 380px, `.alert` at 480px — desktop only, all caps lift ≤720px so everything fills its container; no inline `max-width` overrides | [components/forms.md](./references/components/forms.md) § Control width law |
| 23 | Content widgets | Slide/post payload patterns (`.codewin`, `.statcard`, …) — **fluid by law**: canvas size (4:5/1:1/landscape) is a project decision, widgets are `width:100%` + `clamp()`; deltas reuse `.badge`, tints use semantic tokens. **External embeds are no exception** — third-party widgets carrying inline pixel widths (GIS button, players, maps) get a wrapper net (`> div { max-width:100% }`) and numeric-width APIs derive from the container (`min(400, max(200, w))`) | [content-widgets.md](./references/content-widgets.md) |
| 24 | Animation layer | 3 tiers — primitives (`.anim-pulse/float`, `.glass`, `.text-reveal`, `.grad-shift`) · widget opt-in states (`.anim-typing`, `.anim-count` — static export stays correct without them) · deck view = PROJECT (skill ships `.frag` contract only). GSAP-first migration in progress → [GSAP-MIGRATION.md](./GSAP-MIGRATION.md). Gates-last: reduced-motion blocks END the stylesheet | [motion.md](./references/motion.md) § Ambient |
| 25 | No AI-slop tells | **Never a colored side border on a rounded card** (`border-left: accent` on `.quote`-style cards is the classic generated-design tell). Insight/quote cards use full uniform borders in a semantic tint family (like `.alert`) or washes; side hairlines are neutral 1px separators only (affix, pane dividers) | [content-widgets.md](./references/content-widgets.md) |
| 27 | Locked vs free | **Locked (the signature):** token architecture, the three-role TYPE STRUCTURE + scale (faces are free — see rule #2 pairing contract), component look, 8-state/motion/focus/hover/danger contracts, gradients law, craft layer. **Free (the project's identity):** page anatomy (shell, hero variant, section order, nav placement, density), the accent pair, the font pairing. **NEVER reproduce index.html's section skeleton** — it is ONE composition (the system preview), not THE composition; two different briefs must never yield the same skeleton | [shells.md](./references/shells.md) |
| 28 | Scope boundary | Scoped CSS never reaches child-component DOM or `{@html}` output (no scope hash) — use the global stylesheet or `:global()` anchored on owned elements; a fresh selector flagged "unused" is the tell | [svelte.md](./references/svelte.md) § Wiring rules |
| 29 | Runes discipline | `$effect` loaders that read+write the same state run `untrack()`ed and never auto-retry errors — otherwise every fetch retriggers the effect (runaway refetch loops) | [svelte.md](./references/svelte.md) § Wiring rules |
| 30 | Font delivery | Apps never load fonts from a CDN; on slow links inline latin variable woff2 as base64 in the render-blocking CSS — URL fonts start downloading after first paint and `display=swap` reflows text (titles re-wrap) | [foundations.md](./references/foundations.md) § Typography |
| 31 | Svelte hygiene | Navigation rows are real <a> (never div/li role=link); stopPropagation on the action button; components >700 lines split by phase seams into orchestrator + phase components + shared pure helpers | [svelte.md](./references/svelte.md) § Wiring rules |
| 26 | Grid purity | A layout `.grid` contains **only its cells** — captions (`.w-cap`), follow-up grids, and standalone cards are top-level siblings placed AFTER the grid's closing tag. A caption left inside becomes a grid item: at multi-column widths it occupies a whole cell (orphan text, blank column) and a nested grid squeezes into one cell's width. After editing near a grid, verify with a child-count + column-position probe, not just div balance | [content-widgets.md](./references/content-widgets.md) |
| 19 | A11y | Per-component ARIA + keyboard contract (a11y.md): roving tabindex tabs, trapped modal/menu, focus in/out, aria-pressed, role=switch, live regions | [a11y.md](./references/a11y.md) |
| 18 | Icons | Lucide only (`@lucide/svelte`, ISC) — no AI-generated UI icons; Tabler runes package as fallback; brand marks are the sole custom SVGs | [icons.md](./references/icons.md) |
| 17 | Dark mode | One `[data-theme="dark"]` token-inversion block; alpha fills via `color-mix(var(--ink))`; on-ink surfaces use `--paper`; anti-flash head script + toggle | [foundations.md](./references/foundations.md) § Dark mode |

## AI Agent Workflow

1. **Pre-flight.** Read the target project for existing tokens, fonts, framework, and motion stance. Preserve established systems; introduce tesd/ui only where absent. Never clobber an entry stylesheet — append.
2. **Context gate.** For page-level work, ask (once): audience · use case · tone (pick an extreme — "clean and modern" is not a tone). If the user waves it through, infer and state the inferences in one sentence.
3. **Layout gate.** Before any code, DECLARE the page's identity in one line: shell choice from [shells.md](./references/shells.md) (or a section plan composed with the grid engine) + hero variant for landing-type pages + accent theme + font-pairing archetype — e.g. *"Landing shell, hero variant B (center-stage), accent teal, pairing editorial-trust (Fraunces/Inter), flow: features → pricing → FAQ → booking"*. `index.html` is the system PREVIEW — one composition and one pairing (the exemplar), never a template to reproduce; if the brief differs, skeleton AND pairing must differ (rules #2, #27).
4. **Preview first.** Emit a short preview block: **anatomy (from the layout gate)**, sections, token deltas, component inventory, motion list. Wait for approval when the user asked to review; proceed on "go ahead".
5. **Build from references.** Copy COMPONENT patterns verbatim from [references/](./references/) — their contracts and internals are the tested implementations. Layout is never copied: compose sections with the grid engine per your declared anatomy. When copying `tesd.css`/`tokens.css` whole, **re-theme is mandatory** (project accent in both themes + font archetype per the pairing contract) — the shipped values are system defaults, not project identity (export.md § Re-theme on consume). All components carry the 8-state contract.
6. **Self-check.** Run the [quality-gates.md](./references/quality-gates.md) checklist. Fix every violation before reporting done.
7. **Verify responsive** when automation is available (headless probes — see responsive.md § QA). Manual fallback: resize through the six gates.
8. **Update the system** when the task adds or changes a pattern — see below.

## Update Protocol (adding / changing patterns)

Any addition or change to the design system is **one change in two places**:

1. **The living preview** — implement it in `index.html` first, verify it (render + probes; on-device via the Tailscale test server when relevant).
2. **The reference doc** — update the matching `references/` file in the same pass. A new non-negotiable also updates the table above and `version` (minor bump).

A change that touches only the preview or only the docs is incomplete. User feedback that reverses a decision (e.g., spinner style) gets recorded in the reference doc as the final choice with a note — future runs must not reintroduce the reverted option.

## Pre-Completion Checklist

- [ ] Every value references a token; no inline colors/fonts/radii/durations in component CSS
- [ ] Every interactive element has all 8 states implemented and visible in context
- [ ] Focus follows contract #4 on every bordered control
- [ ] Side-by-side controls measure equal height (contract #5)
- [ ] Hover follows contract #6; gated for fine pointers where the pattern requires
- [ ] Overlays animate open AND close per contract #9
- [ ] Gradients only in the three sanctioned patterns, stops ≤ 0.14 alpha
- [ ] Responsive gates pass: no horizontal overflow at 320/375/414/768/980/1440
- [ ] `prefers-reduced-motion` (and `prefers-reduced-transparency` where materials are used) handled
- [ ] Motion: GSAP owns all animation (loaders excepted); UI states on CSS transitions; no-JS/RM fully rendered; stall guard; loops pause off-screen
- [ ] All identifiers, comments, and copy in English
- [ ] If the system changed: preview AND references updated together; version bumped

## Reference Files

- [foundations.md](./references/foundations.md) — complete token block, gradients contract, type scale, spacing, radius formula
- [layout.md](./references/layout.md) — grid engine: breakpoints (720/980), cols/span/gap/auto API, mobile-first laws
- [components/buttons.md](./references/components/buttons.md) — variants, sizes, danger hierarchy, 8 states, spinner
- [components/forms.md](./references/components/forms.md) — inputs, selects, checks/radios/switches, validation, inline-form
- [components/feedback.md](./references/components/feedback.md) — alerts, toasts, tooltip, progress, skeleton
- [components/data.md](./references/components/data.md) — table, badges, avatars (spark quartet), cards, empty state
- [components/navigation.md](./references/components/navigation.md) — nav + burger + full-screen menu, tabs, segmented, breadcrumb, pagination
- [components/overlays.md](./references/components/overlays.md) — modal, scrim, overlay animation contract
- [motion.md](./references/motion.md) — GSAP-first architecture, guarantees, runtime, choreography recipes
- [GSAP-MIGRATION.md](./GSAP-MIGRATION.md) — resumable migration plan + log (completed v0.20.0)
- [ROADMAP.md](./ROADMAP.md) — production roadmap & resumable execution ledger (active work)
- [responsive.md](./references/responsive.md) — gates, breakpoints, collapse rules, headless QA probes, on-device testing
- [quality-gates.md](./references/quality-gates.md) — the pre-emit checklist expanded
- [tailwind-adapter.md](./references/tailwind-adapter.md) — token → Tailwind v4 `@theme` mapping
- [shells.md](./references/shells.md) — five page shells incl. Landing (hero variants, section recipes, booking flow) — the composition layer (token-scale wireframes)
- [export.md](./references/export.md) — tokens.css generation + design.md lock, tesd.css runtime
- [content-widgets.md](./references/content-widgets.md) — slide/post widgets: code window, stat card, fluid-canvas law
- [a11y.md](./references/a11y.md) — component ARIA/keyboard contracts, trap helper, verification recipe
- [icons.md](./references/icons.md) — Lucide standard + Tabler fallback, sizes, naming, a11y
- [svelte.md](./references/svelte.md) — Svelte 5 seeds (Button, Field, Switch, Modal, Toaster), wiring rules, transition policy

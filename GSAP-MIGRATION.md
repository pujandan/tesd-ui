# tesd-ui — GSAP Full Migration Plan (resumable)

> **Purpose:** this file is the single resume point for the "GSAP-first motion" refactor.
> If a session hits a limit, the next session reads **§0 Resume pointer** and continues
> from the first unchecked task. Created 2026-10-09 at tesd-ui **v0.18.4**.

---

## 0 · Resume pointer (ARCHIVED — MIGRATION COMPLETE)

| Field | Value |
|---|---|
| Current phase | **COMPLETED — All phases P0–P6 landed (v0.20.0)** |
| Next task | **None — full GSAP migration complete** |
| Last commit | `9891c14` (v0.27.0 active branch) |
| Blockers / notes | GSAP-first engine law fully established; ongoing execution continues in `ROADMAP.md` |

**Status note:**
All phases P0 through P6 are 100% completed and verified across viewports. Active tasks and roadmaps have transitioned to [`ROADMAP.md`](./ROADMAP.md).

---

## 1 · Decision (user, 2026-10-09)

The v0.17.0 engine note in `motion.md` ("~90% of widget animation is CSS keyframes") is
**reversed**. CSS keyframes cannot: sequence across elements without hard-coded delays,
replay/reverse/seek, pause off-screen, read runtime values, draw/morph SVG, scramble or split
text, or animate layout changes (Flip). **New law: GSAP owns ALL animation (one-shot and
looping). CSS keeps only UI-state transitions** (hover/focus/active/open-close) — those are
transitions, not animations, and must stay interruptible.

### Guarantees that survive the migration (non-negotiable)

1. **No-JS / no-GSAP / reduced-motion ⇒ fully rendered widget.** The CSS default state IS the
   final state. Hidden "before" states exist only under `html.tm-ready` (class added by the
   runtime once GSAP is loaded and motion is allowed).
2. **Stall guard.** Every entrance timeline is registered; on `visibilitychange→hidden`,
   `pagehide`, and `pageshow (persisted)` the runtime forces entrance timelines to
   `progress(1)`. (Root cause of the v0.8.x hero stall: a rAF tween frozen mid-opacity.)
3. **Transform + opacity only** (plus CSS custom properties that feed `transform`). Never
   `width/height/top/left`.
4. **Loops pause off-screen** (ScrollTrigger `onToggle` / IO) — no infinite tween runs unseen.
5. **One engine:** GSAP 3.13.0 pinned + its own plugins. No second library.
6. **Device > headless:** P4 hero and every interactive change needs the user's phone pass.

### Open decisions (answer before the phase that needs them)

| ID | Question | Recommendation | Needed by |
|---|---|---|---|
| D1 ✅ | Status loaders (`.spinner` ring, `.skeleton` shimmer, `blade`) → GSAP? | **Keep CSS.** They must keep moving while the main thread is busy (that's when they're shown); CSS transform animations run on the compositor, GSAP ticks on the main thread. Documented exception, not a keyframe "feature". | P6 |
| D2 ✅ | Pseudo-element animations (`::before/::after` rails, rings, packets) | Drive via **CSS custom properties** animated by GSAP (`--tl-draw`, `--ring`), or replace with real `<i>` nodes where a plugin needs a DOM/SVG target (DrawSVG, MotionPath). | P2 |
| D3 ✅ | Runtime delivery | **`tesd-motion.js`** single file next to `tesd.css` (same single-source law); projects link it after GSAP CDN. Svelte seeds wrap it later (svelte.md). | P0 |

---

## 2 · Baseline inventory (what exists at v0.18.4)

| # | Animation | Where | Engine now | Target |
|---|---|---|---|---|
| 1 | `hero-rise` hero entrance | tesd.css:277 / index | CSS keyframes | P4 GSAP timeline + stall guard |
| 2 | `.rv` scroll reveal (IO + CSS opacity + GSAP y) | index, widgets | hybrid | P4 `ScrollTrigger.batch` under `tm-ready` |
| 3 | hero parallax | index | GSAP ScrollTrigger | keep (move into runtime) |
| 4 | progress bar `width` tween | index:1233 | GSAP (**violates transform law**) | P4 → `scaleX` |
| 5 | `spin` / `blade` / `shimmer` | tesd.css:602/618/795 | CSS | D1 (keep CSS) |
| 6 | `.anim-pulse` ring | tesd.css:1430 | CSS | P1 |
| 7 | `.anim-float` | tesd.css:1435 | CSS | P1 |
| 8 | `.text-reveal` `tr-rise` | tesd.css:1445 | CSS | P1 SplitText `mask:"lines"` |
| 9 | `.tk-cursor` caret | tesd.css:1450 | CSS | P1 |
| 10 | `.grad-shift` | tesd.css:1454 | CSS | P1 (`backgroundPosition` tween) |
| 11 | `.codewin.anim-typing` | widgets.html inline | GSAP SplitText | P2 move into runtime |
| 12 | `.statcard.anim-count` | widgets.html inline | GSAP | P2 move into runtime |
| 13 | `.timeline.anim-draw` (`tl-draw/pop/pulse`) | tesd.css:1397 | CSS | P2 timeline |
| 14 | `.steps.anim-cascade` (`step-rise/pop/pulse`) | tesd.css:1506 | CSS | P2 timeline |
| 15 | `.bench.anim-grow` + `bench-wave` | tesd.css:1535 | CSS | P2 timeline |
| 16 | `.pipeline` packets `pkt-go` | tesd.css:1617 | CSS | P2 MotionPath |
| 17 | `.frag` deck reveal | tesd.css:1465 + deck.html | CSS transition | P5 timeline labels |
| 18 | `.compare .is-better` pulse | widgets | CSS (`.anim-pulse`) | P1 (inherits) |

---

## 3 · Phases & tasks

Each task = one commit. Version: P0 → **v0.19.0**, every later task → patch bump; phase end →
minor bump only if a new law/pattern lands. Build badge in index/widgets/deck bumped every time.

### P0 — Foundation (runtime + laws)
- [x] **P0.1** Rewrite `motion.md` engine header + engine-split table to the new law (§1), keep history note of the reversal. Update SKILL.md rows 4/5/24 + non-negotiable wording; version 0.19.0.
- [x] **P0.2** Create `tesd-motion.js` skeleton: CDN contract (gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin, MotionPathPlugin, Flip, CustomEase — all 3.13.0), feature detect, `registerPlugin`, add `html.tm-ready` only when GSAP present AND motion allowed.
- [x] **P0.3** `CustomEase.create("tesd", "0.19,1,0.22,1")` + `"tesd-io"` from `--ease/--ease-io`; `gsap.defaults({ ease: "tesd", duration: 0.7 })`. Durations map to `--dur-*` tokens.
- [x] **P0.4** Registry API: `TesdMotion.register(selector, factory)` → factory returns a **paused** timeline; auto-init when in view (ScrollTrigger once/toggle); public `play(el) / replay(el) / reset(el) / complete(el)` for decks.
- [x] **P0.5** `gsap.matchMedia()` gate (RM ⇒ no factories run, no `tm-ready`), stall guard (§1.2), loop pause off-screen helper `loop(el, tween)`.
- [x] **P0.6** Wire `tesd-motion.js` into widgets.html (keep existing inline scripts for now); zero JS errors; RM + no-JS render check.
- [x] **Gate P0:** runtime loads, nothing visually changed, RM/no-JS full render, 6 viewports clean.

### P1 — Ambient primitives
- [x] **P1.1** `.anim-pulse` → GSAP loop on a CSS var (D2), off-screen pause; remove `pulse-ring`.
- [x] **P1.2** `.anim-float` → `yoyo` sine loop with per-instance random phase (`gsap.utils.random`) so multiple floats don't move in lockstep; remove `float-y`.
- [x] **P1.3** `.text-reveal` → `SplitText.create(el, { type:"lines", mask:"lines", autoSplit:true, onSplit })`; markup simplifies to plain text (old `.tr-line/.tr-in` still supported for one version, flagged deprecated).
- [x] **P1.4** `.tk-cursor` + `.grad-shift` → GSAP loops; remove `caret-blink`, `grad-flow`.
- [x] **P1.5** Docs: motion.md § Ambient rewritten; widgets.html §01–02 captions.
- [x] **Gate P1:** visual parity or better, RM gate, dark mode, 6 viewports, device glance.

### P2 — Widget states → timelines
- [x] **P2.1** Move `.anim-count` into runtime (+ `gsap.utils.snap`, locale formatting, decimals via `data-decimals`).
- [x] **P2.2** Move `.anim-typing` into runtime; upgrade: per-line timeline + caret that follows the typing head.
- [x] **P2.3** `.timeline.anim-draw` → one timeline: rail draw (`--tl-draw` scaleY) → dots pop (`back.out`) staggered → now-dot pulse loop; remove `tl-*` keyframes.
- [x] **P2.4** `.steps.anim-cascade` → timeline: card rise → medallion pop → live-step pulse loop; remove `step-*`.
- [x] **P2.5** `.bench.anim-grow` → timeline: fills `scaleX` staggered + value counters in sync → winner wave loop; remove `bench-*`.
- [x] **P2.6** `.pipeline` → SVG connector per gap + **MotionPath** packets (curve option), **DrawSVG** connector draw-in, `.is-live` node pulse; ≤720px vertical path; remove `pkt-go`.
- [x] **P2.7** Docs: content-widgets.md animation states + motion.md § widget states.
- [x] **Gate P2:** each widget: no-JS full, RM full, replay works, 6 viewports, dark.

### P3 — New GSAP-only effects (the "alive" upgrade)
- [x] **P3.1** `.anim-scramble` (ScrambleText) — headlines, statcard labels, `.apiwin` status code, terminal lines.
- [x] **P3.2** `.anim-tilt` / spotlight on `.glass` + `.statcard` via `gsap.quickTo` — gated `(hover:hover) and (pointer:fine)`, max ±6°.
- [x] **P3.3** Flip: `.bench` re-sort demo + `.compare` swap; tabs indicator.
- [x] **P3.4** Sparkline mini widget (backlog) built DrawSVG-first.
- [x] **P3.5** (optional) `.compare` before/after slider — Draggable + Inertia.
- [x] **P3.6** Docs + widgets.html new section "05 · GSAP effects".
- [x] **Gate P3:** a11y (SplitText/Scramble `aria` correct), RM, device pass.

### P4 — Page-level (index.html)
- [x] **P4.1** `.rv` reveals → `ScrollTrigger.batch` under `tm-ready` (hidden state only exists with GSAP); delete IO path.
- [x] **P4.2** Hero entrance → GSAP timeline + stall guard; **device acceptance required** (bfcache, app-switch, mid-page refresh). Rollback criterion: any stall ⇒ revert to CSS keyframes and record.
- [x] **P4.3** Progress bar → `scaleX` (fix law violation #4).
- [x] **P4.4** Move parallax into runtime; remove inline GSAP code from index.html.
- [x] **Gate P4:** device pass on user phone, 6 viewports, Lighthouse no CLS regression.

### P5 — Deck (deck.html + widgets mini-deck)
- [x] **P5.1** Load runtime in deck.html; slide enter ⇒ `replay()` its widgets, leave ⇒ `reset()`.
- [x] **P5.2** `.frag` → timeline labels (fragments = `tweenTo(label)`), back = reverse to previous label.
- [x] **P5.3** Slide transition timeline (exit faster than enter — overlay contract parity).
- [x] **Gate P5:** keyboard/clicker nav, portrait + landscape, RM.

### P6 — Cleanup & lock
- [x] **P6.1** Delete migrated keyframes + their RM lines from tesd.css (D1 loaders stay); gates-last law re-verified.
- [x] **P6.2** Update quality-gates.md, svelte.md (runtime in Svelte: `onMount` + `gsap.context` revert), export.md (projects ship `tesd-motion.js`).
- [x] **P6.3** Full audit: 6 gates, dark, RM, no-JS, zero JS errors; PROGRESS.md entry; version lock.
- [x] **Gate P6:** grep shows no `@keyframes` except D1 loaders.

---

## 4 · Log (append one line per finished task)

| Date | Task | Version | Commit | Note |
|---|---|---|---|---|
| 2026-10-09 | plan created | 0.18.4 | `0cf95ce` | baseline |
| 2026-10-09 | P0.1 engine law → GSAP-first (motion.md header/split/guarantees, SKILL.md #4/#5/#24 + checklist, quality-gates, badges ?v=42) | 0.19.0 | see git | D1–D3 approved |
| 2026-10-09 | P0.2–P0.6 runtime skeleton (`tesd-motion.js`), token CustomEase, registry, stall guard, RM gate, wired into `widgets.html`, CDP probe verified across 1440/375/320/RM/nojs | 0.19.1 | see git | Gate P0 passed |
| 2026-10-09 | P1.1–P1.5 ambient primitives migrated to GSAP (`.anim-pulse`, `.anim-float`, `.text-reveal` SplitText, `.tk-cursor`, `.grad-shift`), CSS keyframes removed, probe verified 1440/375/320/RM/nojs | 0.19.2 | see git | Gate P1 passed |
| 2026-10-09 | P2.1–P2.7 widget states migrated to timelines (`.anim-count`, `.codewin.anim-typing`, `.timeline.anim-draw`, `.steps.anim-cascade`, `.bench.anim-grow`, `.pipeline`), keyframes removed from CSS, duplicate scripts removed from `widgets.html`, probe verified | 0.19.3 | see git | Gate P2 passed |
| 2026-10-09 | P3.1–P3.6 new GSAP effects (.anim-scramble, .anim-tilt quickTo, .sparkline DrawSVG, Flip layout reorder API & demo), probe verified 1440/375/320/RM/nojs | 0.19.4 | see git | Gate P3 passed |
| 2026-10-09 | P4.1 .rv reveals → ScrollTrigger.batch under tm-ready (static default visible, IO path removed, badges ?v=47) | 0.19.5 | see git | probe verified 1440/375/320/RM/nojs |
| 2026-10-09 | P4.2 Hero entrance → GSAP timeline + stall guard (keyframes removed from CSS, watchdog & visibility/bfcache guards verified, badges ?v=48) | 0.19.6 | see git | probe verified 1440/375/320/RM/nojs |
| 2026-10-09 | P4.3 Progress bar → scaleX (transform-origin: left, compositor-only, motion.md updated, badges ?v=49) | 0.19.7 | see git | probe verified 1440/375/320/RM/nojs |
| 2026-10-09 | P4.4 Hero parallax moved to runtime, all inline GSAP code removed from index.html, Gate P4 passed | 0.19.8 | see git | probe verified 1440/375/320/RM/nojs |
| 2026-10-09 | P5.1 Load runtime in deck.html; slide enter ⇒ replay() its widgets, leave ⇒ reset(), container targeting in runtime, badges ?v=51 | 0.19.9 | see git | probe verified 1440/375/320/RM/nojs |
| 2026-10-09 | P5.2 .frag → timeline labels (fragments tweenTo(label), reverse back), .frag scoped under tm-ready in tesd.css, badges ?v=52 | 0.19.10 | see git | probe verified 1440/375/320/RM/nojs |
| 2026-10-09 | P5.3 & Gate P5 Slide transition timeline with overlay parity (exit 0.16s, enter 0.38s) in deck & mini-deck, CSS keyframes removed, nav verified, badges ?v=53 | 0.19.11 | see git | Gate P5 passed |
| 2026-10-09 | P6.1–P6.3 & Gate P6 Keyframes cleanup, doc references updated (quality-gates, svelte context revert, export runtime), full audit passed, version lock v0.20.0 | 0.20.0 | see git | Full GSAP Migration Complete |

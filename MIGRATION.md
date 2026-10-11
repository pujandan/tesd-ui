# GSAP Full-Migration Ledger — tesd-ui v0.18.4 → v0.19.x

> **Resumable plan.** One agent executes at a time — mark your phase `IN PROGRESS`
> (with name + timestamp) before starting, `DONE` + commit hash when finished.
> Every phase = own commit + version bump (protocol). Laws below are NON-NEGOTIABLE.

## Decision (user, 2026-10-10)

FULL MIGRATION to GSAP (not hybrid) — CSS keyframes' limits are the bottleneck;
GSAP timelines give replay/reverse/orchestration for content-post decks.

**Standing laws (unchanged by this migration):**
1. `.from()`-pattern ONLY — GSAP animates from offset to natural state; no-JS / RM / CDN-fail ⇒ widget fully rendered. Never `.to()` into a hidden state.
2. Transform + opacity only (the progress-width bug is exactly this law).
3. Above-the-fold entrances stay CSS keyframes (stall-proof law — index hero-rise stays).
4. One engine: GSAP 3.13 + free plugins. No other library.
5. `prefers-reduced-motion` via `gsap.matchMedia()` for migrated animations; CSS gates remain for whatever CSS animations remain (gates-last).
6. Every phase: preview + docs (motion.md/SKILL.md as touched) + version bump + commit, same pass.
7. Element sizing verified via `getBoundingClientRect`; animations verified animation-name/tween active + RM-none.

## Phases

### P0 — Bug fixes (pre-migration, tiny) — status: TODO
- [ ] index progress demo: `gsap.to` width → `scaleX` (transform-origin left). File: index.html (~progress JS), motion.md row.
- [ ] motion.md recipe table: counter row "rAF (no lib)" → GSAP tween (stale since v0.18.0).
- Verify: probe tween target property is transform; docs grep clean. Bump v0.18.5.

### P1 — Foundation — status: TODO
- [ ] `tesd-anim.js` (NEW, served alongside): loader + helpers —
      `registerTesdMotion()`: CustomEase "tesd" from `--ease` cubic-bezier(0.19,1,0.22,1);
      `gsap.matchMedia()` RM gate helper `(prefers-reduced-motion: reduce)` → skip animations;
      IO-trigger helper `onView(el, fn, threshold)`; plugin registration (SplitText, DrawSVG, MotionPath, ScrambleText, Flip, CustomEase).
- [ ] widgets.html + index.html load plugins via CDN (gsap core + needed plugins) — deck.html gets core in P2.
- [ ] Load-guard: all GSAP usage behind `typeof window.gsap !== "undefined"` (already true for typing/count).
- Verify: `gsap.getTweensOf` + CustomEase exists; pages zero errors 563+1024. Bump v0.18.6.

### P2 — deck.html GSAP timeline — status: TODO
- [ ] Load GSAP in deck.html; slide transitions become a timeline (enter: opacity+y .from; exit quick) replacing `.sl-in` CSS.
- [ ] Fragments as timeline steps: `.frag.on` reveal via `.from()` stagger; controller calls `tl.play()/reverse()` equivalents (keep fragments-first logic).
- [ ] Keyboard: add `gsap.matchMedia` RM path (instant show).
- Verify: walk deck via synthetic keys (existing probe pattern), counter 5/5, RM instant; no-JS fallback: rename gsap script src → deck still fully readable. Bump v0.18.7.

### P3 — .pipeline DrawSVG + MotionPath — status: TODO
- [ ] Replace `.pl-gap` CSS arrows with inline SVG connectors (`<svg><path>` between nodes).
- [ ] DrawSVG: connectors draw themselves (stroke-dashoffset) staggered on view.
- [ ] MotionPath: packet dot travels the connector path (replace `pkt-go` CSS + container-query hack); loop with repeatRefresh-random timing.
- [ ] Mobile (≤720 vertical stack): connectors rotate → keep DrawSVG draw, MotionPath vertical.
- Verify: `gsap.isTweening(packet)` true at 1024; RM = connectors full + no packets; no-JS = arrows visible statically. Bump v0.18.8.

### P4 — Structured widgets to timelines — status: TODO
- [ ] `.timeline.anim-draw` → GSAP timeline: rail scaleY draw (keep transform), dots pop staggered (replace tl-draw/tl-pop CSS), now-pulse → GSAP repeat (or keep CSS pulse — decide by testing; prefer GSAP for single system).
- [ ] `.steps.anim-cascade` → timeline (rise + medallion pop stagger `--i` order).
- [ ] `.bench.anim-grow` → timeline (scaleX fills staggered + winner wave as GSAP yoyo/repeat; keep RM instant).
- Verify each: tween active on view; RM full; static export unchanged; no overflow. Bump v0.18.9.

### P5 — Text & flair plugins — status: TODO
- [ ] ScrambleText: `.apiwin` status/latency decode-in; statcard label scramble-in; terminal `done in 1.2s` scramble.
- [ ] SplitText mask-lines mode for `.text-reveal` (auto-split, no manual `.tr-line` markup) — keep class API identical, deprecate manual markup in docs.
- [ ] Flip: `.compare` A/B swap demo (optional interactive) + bench reorder (is-best to top) — demo-only, document as recipe.
- Verify: scramble completes to correct text (probe textContent), RM skips, no-JS shows final text. Bump v0.19.0 (milestone).

### P6 — Ambient loops (optional, last) — status: TODO
- [ ] float / pulse / grad-flow / glass-sheen → GSAP repeat timelines IF single-system consistency wins over zero-JS loops; otherwise document the exception. DECISION POINT at this phase.
- Bump v0.19.1 if executed.

### P7 — Docs & laws rewrite — status: TODO (parts land with each phase; final pass at end)
- [ ] motion.md: engine decision note amended (full migration replaces "~90% CSS" stance; CSS kept for above-fold + whatever P6 keeps); recipe table all-GSAP; CustomEase "tesd" documented.
- [ ] SKILL.md rule 24 rewrite (animation layer = GSAP timelines + CSS above-fold law); content-widgets.md animation sections updated.
- [ ] PROGRESS.md ledger final status. Version to v0.19.x final.

## Coordination log

| Phase | Agent | Started | Finished | Commit |
|---|---|---|---|---|
| P0 | — | — | — | — |

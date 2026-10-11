# Motion
> **Engine law — GSAP-first (v0.19.0, user decision 2026-10-09).** GSAP owns **all animation** — one-shot entrances, choreography, scroll-linked motion, AND ambient loops. CSS keeps only **UI-state transitions** (hover / focus / active / open-close), which are transitions, not animations, and must stay interruptible. Why: CSS keyframes cannot sequence across elements without hard-coded delays, replay / reverse / seek (decks), pause off-screen, read runtime values, draw or morph SVG, split or scramble text, or animate layout changes (Flip). Migration is in progress — tracked task-by-task in [`GSAP-MIGRATION.md`](../GSAP-MIGRATION.md); sections below still describing CSS keyframes are pre-migration until their phase lands.
>
> *History (superseded):* v0.17.0 recorded "stay CSS + GSAP, ~90% of widget animation is CSS keyframes". Reversed at v0.19.0 — the keyframe limits above outweigh the zero-JS benefit, and the no-JS guarantee is kept a different way (see Guarantees).
>
> **Agent knowledge (v0.17.1):** GreenSock's official `gsap-skills` (MIT) are installed in the agent environment (`~/.agents/skills/`, `~/.zcode/skills/` — gsap-core/timeline/scrolltrigger/plugins/utils/performance/frameworks incl. Svelte; gsap-react skipped, our stack is Svelte). They teach correct GSAP *authoring*; tesd-ui's own contracts (guarantees below, gates) remain the law when they differ.


## The engine split (non-negotiable #4/#5)

| Concern | Owner | Why |
|---|---|---|
| UI states (hover, active, focus, open/close, toast) | **CSS transitions** | Interruptible + retargetable; UI states fire rapidly |
| Entrances (hero, scroll reveals, widget states) | **GSAP timelines** via `tesd-motion.js` | Sequencing, replay, stall guard |
| Ambient loops (pulse, float, caret, gradient flow, packets) | **GSAP** loops, paused off-screen | Per-instance phase, pause/resume, RM gate in one place |
| Scroll-linked motion (parallax) | **GSAP ScrollTrigger scrub** | |
| Text / SVG / layout (split, scramble, draw, path, Flip) | **GSAP plugins** | Impossible in CSS |
| Status loaders (`.spinner`, `.skeleton`) | **CSS keyframes — the one exception (D1)** | Shown while the main thread is busy; compositor keeps them moving when GSAP's ticker can't |
| Anything | anime.js / Motion / second library | **Forbidden.** One engine only. |

GSAP **3.13+** — core + ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin, MotionPathPlugin, Flip, CustomEase (**all 100% free since the Webflow acquisition, May 2025** — no Club membership, no premium tier, no license key).

**Installation for projects: npm-bundled (recommended).**
```bash
npm i gsap
```
```ts
import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
gsap.registerPlugin(DrawSVGPlugin);
```
This keeps the app offline-friendly, CDN-independent, and tree-shakeable.

**CDN is acceptable ONLY for the skill's own preview pages** (`index.html`, `widgets.html`, `deck.html`). Runtime: **`tesd-motion.js`** — one file next to `tesd.css` (single-source law), linked after the GSAP scripts.

## Guarantees (survive the GSAP-first switch — non-negotiable)

1. **No-JS / no-GSAP / reduced-motion ⇒ fully rendered.** The CSS default state IS the final state. "Before" states (hidden, scaled to 0) exist only under `html.tm-ready`, which the runtime adds once GSAP is loaded AND motion is allowed.
2. **Stall guard.** Entrance timelines are registered; on `visibilitychange → hidden`, `pagehide`, and `pageshow` (persisted) they are forced to `progress(1)`. Root cause it prevents: the v0.8.x device stall (a rAF tween frozen mid-opacity left the hero faded).
3. **Transform + opacity only** — plus CSS custom properties that feed `transform` (the way GSAP reaches `::before/::after`, D2). Never `width/height/top/left`.
4. **Loops pause off-screen** — no infinite tween ticks unseen.
5. **Device > headless** for hero and interactive changes.

## Runtime — `tesd-motion.js`

The runtime is a vanilla IIFE that reads `window.gsap` (and plugin globals) **at execution time** — it attaches `window.TesdMotion`, and with no globals present it degrades to an inert no-op API. Two supported wiring paths:

**Path A — the skill's preview pages & no-build static pages (CDN script tags):**

```html
<!-- after tesd.css; GSAP 3.13.0 pinned, then only the plugins the page uses -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrambleTextPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/DrawSVGPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/MotionPathPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/Flip.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/CustomEase.min.js"></script>
<script src="tesd-motion.js"></script>  <!-- safe in <head> or end of <body>: boots on DOM ready -->
```

**Path B — bundler projects (npm, recommended):** `npm i gsap`, then expose the bundled engine as window globals **before** the runtime executes. Static ES imports evaluate in order, so the expose step must live in its own module imported before the runtime's side-effect import — that order is the contract:

```ts
// src/lib/motion/expose-gsap.ts — assign the globals the vanilla runtime reads
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { CustomEase } from 'gsap/CustomEase'

Object.assign(window, { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase })
```

```ts
// src/lib/motion/boot.ts — import order is the contract: expose first, runtime second
import './expose-gsap'
import './tesd-motion.js'   // copied from the skill next to this module
```

Import `./boot` once in `+layout.svelte` (`<script module>`). Expose only the plugins the project actually uses — the runtime registers whatever globals exist. If the bridge is missing, the runtime stays an inert no-op and every widget renders in its static final state (Guarantee 1) — a missing bridge fails visible-and-static, never broken.

| API | Contract |
|---|---|
| `TesdMotion.register(selector, factory)` | `factory(el, h)` builds and **returns a timeline** (runtime pauses it). Runs inside `gsap.context(…, el)` so `revert()` cleans tweens, SplitText and inline styles. Don't set the timeline's `onComplete` for runtime purposes — it's free for the factory. |
| `h.loop(anim)` | Registers an infinite tween/timeline: created paused, runs only while the element is visible **and** its entrance finished; pauses off-screen (guarantee 4). |
| `h.ease` / `h.easeIO` / `h.dur("--dur-2")` | Token parity: CustomEase `"tesd"` = `--ease` (expo-out family), `"tesd-io"` = `--ease-io`; `dur()` reads `--dur-*` in seconds. `gsap.defaults({ ease: "tesd", duration: 0.7 })`. |
| Trigger | One IntersectionObserver (threshold 0.2, bottom margin −8%): first enter ⇒ `play(0)`; visibility drives loops. Inside `[data-tm-manual]` (decks) nothing auto-plays. |
| `play(el)` · `replay(el)` · `reset(el)` · `complete(el)` | Deck / manual control. `reset` = back to the before state, paused. |
| `finish()` | Forces every entrance to its end — use before image export. |
| `scan(root)` | Instantiate widgets added after load. |
| Gate | `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` boots (adds `html.tm-ready`); switching RM on reverts every instance to its CSS final state. |
| Stall guard | Watchdog per entrance (`duration + 1.5s`, setTimeout survives a starved rAF) + `visibilitychange→hidden` / `pagehide` / `pageshow(persisted)` force started entrances to `progress(1)`. |
| No GSAP | `TesdMotion.*` is an inert no-op API — pages may call it unconditionally. |

Factory rules: build **from** states with `fromTo` (explicit end = CSS final state); transform/opacity or CSS vars only; never hide something in CSS that only JS can reveal unless the rule is scoped under `html.tm-ready`.

## The stall-safe reveal split

Content visibility must never depend on an animation library ticking. Division of property ownership:

- **CSS owns opacity/visibility.** `.rv { opacity: 0 }` → `.rv.in { opacity: 1 }` (transition 560ms `--ease`), driven by IntersectionObserver (threshold 0.1, rootMargin −40px, unobserve after fire). If every script fails, IO+CSS still reveals everything.
- **GSAP owns the transform layer.** On IO enter, if GSAP is present, run the rise and skip the CSS transform transition:

```js
function revealBatch(els) {
  els.forEach(function (el, i) {
    el.classList.add("in");
    if (hasGsap) {
      el.classList.add("gsap-driven");            /* transition: opacity only — transform is GSAP's */
      gsap.fromTo(el, { y: 26 }, {
        y: 0, duration: 0.8, ease: "expo.out", delay: i * 0.07,
        overwrite: "auto", clearProps: "transform",
        onComplete: function () { el.classList.remove("gsap-driven"); }
      });
    }
  });
}
```

Degradation: CDN fails → instant reveal; rAF stalls → content visible, motion lost. Never invisible content.

## Hero entrance (GSAP timeline + stall guard watchdog)

The hero entrance is above-the-fold choreography built with a GSAP timeline and protected by two hard guarantees:
1. **Watchdog timer**: a 2000ms timeout forces the timeline to progress 1 and clears inline transforms/opacities (`clearProps: "transform,opacity"`).
2. **bfcache & visibility flush**: `pageshow` and `visibilitychange` listeners instantly flush any stalled state if the tab was suspended or restored from bfcache.
3. **No-JS & Reduced Motion**: elements are fully visible and untransformed by default; if GSAP is not running or reduced motion is preferred, no tweens execute and content is 100% visible immediately.

```js
var tl = gsap.timeline();
tl.fromTo(items,
  { opacity: 0, y: 22 },
  {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: TesdMotion.ease,
    stagger: 0.09,
    clearProps: "transform,opacity"
  }
);

var watchdog = setTimeout(function () {
  if (tl.progress() < 1) tl.progress(1);
  gsap.set(items, { clearProps: "transform,opacity" });
}, 2000);
tl.eventCallback("onComplete", function () { clearTimeout(watchdog); });
```


## Scroll parallax (ScrollTrigger)

```js
gsap.registerPlugin(ScrollTrigger);
gsap.to(".hero-grid", {
  y: 90, ease: "none",
  scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
});
```

**Transform-only — opacity never lives under a scrub.** A stalled rAF (throttled mobile) freezes the last rendered value: after a mid-page refresh the scrub renders the exit state once, and if the ticker never updates again the hero reads permanently faded when scrolling back up (v0.8.1 device lesson). A stalled transform at worst leaves a y-offset — content stays full ink.

## Ambient & content animations (v0.19.2 — GSAP-first)

Three tiers:
1. **Primitives** in `tesd-motion.js` (built-in registry) + `tesd.css`:
   - `.anim-pulse` — looping pulse ring via CSS custom properties (`--pulse-scale: 1.16`, `--pulse-opacity: 0`), 1.6s loop, pauses off-screen.
   - `.anim-float` — yoyo sine loop (`y: -8px`, duration 3s) with per-instance randomized phase (`gsap.utils.random(0,1)`), so adjacent floats never move in lockstep; pauses off-screen.
   - `.glass` — blur + translucent + top sheen; disabled by `prefers-reduced-transparency`.
   - `.text-reveal` — powered by **SplitText** (`mask: "lines"`, `type: "lines"`, `autoSplit: true`). Markup requires **zero wrapper spans** (bare text supported); legacy `.tr-line`/`.tr-in` wrappers remain supported for backward compatibility.
   - `.tk-cursor` — blinking caret loop via `--cursor-opacity`, 0.5s `steps(1)` yoyo.
   - `.grad-shift` — spark gradient flow via `backgroundPosition: "220% 0"` loop, 8s linear.
2. **Widget opt-in states** (`.anim-typing`, `.anim-count`, `.timeline.anim-draw`, `.steps.anim-cascade`, `.bench.anim-grow`) — see § GSAP widget states. Static export stays complete without them.
3. **Deck orchestration** — fragments and slide transitions (see deck.html recipe and P5).

Bento is a **recipe, not a class**: grid engine (`cols-*` + `span-*`) + `.glass` + spark washes.

**Value & winner concept (v0.18.2 — a content-animation law):**
1. **A VALUE animates from 0 → its number** when it enters view (`.anim-count` counters, `.bench.anim-grow` fills). Static export shows the final value.
2. **A COMPARISON animates its WINNER** with a living signal — the bench `.is-best` fill carries a light wave; a compare `.is-better` card takes the `.anim-beam` border light (v0.24.4). The accent already marks the winner statically; the animation only makes it breathe.

**GSAP widget states (v0.18.0 / v0.19.0):**
- *Counter* (`.statcard.anim-count` + `data-count` + `.cnt`): `gsap.to({v:0},{v:target,duration:1.2,ease:"power3.out",onUpdate})`, IO-triggered, RM/no-GSAP ⇒ instant target.
- *Typing* (`.codewin.anim-typing`, lines wrapped in `.ln`): **SplitText char cascade** — `new SplitText(ln,{type:"chars"})` then `gsap.from(split.chars,{opacity:0,stagger:0.016,delay:0.25+idx*0.22})`, `split.revert()` on complete. RM/no-GSAP ⇒ lines simply visible.
- Law: JS-driven states must degrade to a fully rendered widget — no-JS and reduced-motion never see a blank.

## Kinesis — self-running presentation loops (v0.22.0)

PPT/video-grade animations: they run **continuously with no user input** (interaction widgets like `.ba` are a different family). All are `h.loop` registrations — the runtime pauses them offscreen and the structural RM gate stops them cold:

- **`.wave`** — seamless SVG flow; the path's period repeats twice, the tween `xPercent: -50` loops it; layer two `.wave`s (different `--dur`) for depth.
- **`.eq`** — equalizer bars (children `i`), per-bar randomized `sine.inOut` yoyo — live/audio feel; static default `scaleY(.35)`.
- **`.marquee`** — seamless ticker: `.mq-track` content duplicated exactly twice, `-50%` loop, edge-faded via mask.
- **`.orbit`** — `.o-ring`(s) rotate forever (per-ring `--dur`), dots stay upright; center takes `.o-core`.
- **`.breathe`** — gentle scale/opacity breathing for any element (glow feel).
- **`.text-wave`** — SplitText chars bob in sequence (`stagger` with its own repeat).

## GSDevTools + the maximized plugin map (v0.21.0)

**GSDevTools — opt-in visual debugger:** add `?dev=1` to any preview URL; `tesd-motion.js` injects GSDevTools and registers it (timeline scrubber overlay). Debug only — never ship enabled.

**Actively used:** core · timeline · ScrollTrigger · SplitText · Flip (live demo) · DrawSVG · MotionPath · ScrambleText · CustomEase ("tesd") · quickTo/quickSetter · utils(random, clamp-via-bounds) · GSDevTools(?dev=1).
**Deliberately skipped:** MorphSVG (decoration risk) · ScrollSmoother (hijacks native scroll) · ScrollToPlugin (CSS smooth-scroll covers) · Observer (deck has keys+click) · EasePack (curve standardized on "tesd") · Draggable + Inertia (interaction widgets taken out v0.22.3 — the direction is self-running presentation loops, not user-input widgets).

**`.anim-beam` (v0.24.3) — soft border light:** a conic gradient revealed as a 1.5px ring (`mask-composite: exclude`), the angle driven by a GSAP-tweened `--beam-angle` CSS var (per-element speed `--beam-dur`). Soft by contract — wide low-alpha segment, never neon. No-JS/RM ⇒ the segment rests at a fixed calm position. **Role split (v0.24.4): `.anim-beam` is the CARD-level life signal** (bento, browser, apiwin, terminal, phone, compare winner, avatar halo — varied `--beam-dur`); `.anim-pulse` steps down to micro markers (dots, small indicators). Don't stack beam on cards that already carry packets/sweeps — one life signal per card.

## Living-element law (v0.24.2)

**Every gallery widget ships at least ONE continuous living element** — a data-flow dot, pulse, sweep, or shimmer, however thin — the same life signal as topology packets and chart sweeps. Static correctness is untouched: RM and no-JS show the final state (the law governs animation, not availability). The universal thin carrier is **`.live-dot`** — a 6px accent dot whose ring pulses forever (`h.loop`, offscreen-paused); sprinkle it on labels, sources, latency readouts, verdicts. Heavier carriers exist per widget: `.tk-cursor`, winner wave/pulse, kinesis family, chart sweeps/orbs.

## Data-visual recipes (v0.24.0)

Charts animate by the same laws: dashoffset draws (`getTotalLength` at runtime, markup stays final), counts run `fromTo(obj,{v:0})` with the FINAL value already in the DOM, and life loops (scanner sweep, ring orb, radar rotation, endpoint pulse) register via `h.loop` at the end of the entrance timeline — see `.areachart/.donut/.radar/.sparkline` in tesd-motion.js §D.

## Reveal laws (v0.22.5/.6 — device-caught)

1. **`once: true` on the `.rv` ScrollTrigger.batch** — without it, elements re-crossing the viewport boundary re-run the fromTo: revealed content jumps down 24px and rises again (the re-entry blip).
2. **Class-before-clearProps handoff** — when a GSAP tween ends with `clearProps` and a CSS class carries the final state (`.rv.in`), add the class AT TWEEN START, never in `onComplete`: inline tween props override the class while running, and at completion the class is already in place. Adding it late leaves a gap where the CSS `.rv:not(.in)` rule re-hides the element for frames — the down-up flash on nearly every card.

## Speed & easing law

- UI states < 300ms (`--dur-1/2/3` = 120/180/240ms). Buttons press at 120–160ms.
- Entrances may run 460–900ms (token `--ease` expo-out family = CustomEase `"tesd"`).
- Only `transform`, `opacity`, and custom properties driving them are animated. `will-change` only where motion is imminent.
- Exit is always faster than enter (overlay contract).

## Recipe catalog (parameterized)

| Recipe | Engine | Parameters | Where |
|---|---|---|---|
| Scroll reveal (stall-safe) | IO + CSS + GSAP y | rise 26px, 800ms, `expo.out`, stagger 0.07 | all sections |
| Hero entrance | GSAP timeline (`tesd-motion.js`) | 700ms `tesd`, delays 0/90/180/260ms, stall guard | page top, once |
| Parallax scrub | ScrollTrigger | y 90, scrub true, **transform-only** | hero exit |
| Counter | GSAP tween (`tesd-motion.js`) | target, 1200ms, `power3.out` | stats |
| Pulse ring | GSAP loop (`tesd-motion.js`) | `--pulse-scale: 1→1.16`, `--pulse-opacity: 0.65→0`, 1.6s | `.anim-pulse` |
| Float | GSAP loop (`tesd-motion.js`) | `y: -8px`, 3s `sine.inOut` yoyo, random phase | `.anim-float` |
| Text reveal | GSAP SplitText (`tesd-motion.js`) | line mask rise 700ms `tesd`, stagger 0.08 | `.text-reveal` |
| Caret blink | GSAP loop (`tesd-motion.js`) | `--cursor-opacity: 0`, 0.5s `steps(1)` yoyo | `.tk-cursor` |
| Gradient shift | GSAP loop (`tesd-motion.js`) | `backgroundPosition: 220% 0`, 8s linear | `.grad-shift` |
| Pipeline packet travel | GSAP loop (`tesd-motion.js`) | `--pkt-x` (desktop) / `--pkt-y` (mobile), 1.3s loop | `.pipeline` |
| Topology packet flow | GSAP MotionPath loop (`tesd-motion.js`) | MotionPath / getPointAtLength fallback, 1.8–2.4s `none` loop | `.topology` |
| Topology node inspector | GSAP state bridge (`tesd-motion.js`) | hover/focus live telemetry update + keyboard a11y | `.topo-node` |
| Overlay enter/exit | CSS transitions | enter 320/460ms + 40ms stagger · exit 180/260ms | modal, drawer, palette, menu |
| Anchored micro-pop | CSS | enter 180 / exit 140ms, `scale(0.98)` from trigger origin | dropdown |
| Bar pop (bulk bar) | CSS | 180ms, ±4px | selection feedback |

**Principle:** data changes render instantly (sorting, filtering, toggles). Motion is spent only on entrances, overlays, and spatial feedback — never on the data itself.

## Reduced motion & transparency

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .rv { opacity: 1; transform: none; transition: opacity 200ms ease; }
  .spinner, .skeleton { animation-duration: 1.6s; }   /* status keeps moving, slower */
  .btn, .tab::after, .switch, .switch::after, .seg, .modal, .scrim, .toast,
  .menu, .menu-nav a, .burger i { transition-duration: 1ms; }
}
```

JS gates: `reduceMotion` skips GSAP entirely (hero static, reveals via class). `prefers-reduced-transparency: reduce` → frosted surfaces become solid (`--paper` background, no blur).

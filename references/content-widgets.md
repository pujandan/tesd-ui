# Content widgets — slide/post payload patterns

For content posts (stack explainers, AI news, digests) delivered as **slide images**. The skill
provides **widget styles only** — canvas sizes (4:5, 1:1, landscape) are a **project decision**:
widgets are fluid (`width: 100%` of the slide container), type scales via `clamp()`, and the
[width law](./components/forms.md) applies unchanged.

Showcase: `widgets.html` — four sections matching the 3-tier layer (ambient primitives · text · widget opt-in states incl. the terminal payload variant · deck contract). Static base forms live HERE in the docs, not as separate gallery sections (v0.12.1). Widget CSS lives in `tesd.css` so projects linking the runtime stylesheet get them for free.

**One CSS, split-by-need (v0.13.0 decision):** widgets stay in the single `tesd.css` — they depend on it anyway (tokens, `.badge`, grid engine), and two hand-edited files = drift. As of v0.13.0 widgets+animations are ~10% of the file (~1.5KB gzip). **Split trigger:** when the widget section passes ~⅓ of the file or a project needs widgets without the web UI, generate `tesd-core.css` + `tesd-widgets.css` FROM the single source — never two hand-edited stylesheets.

## 01 · Code window — `.codewin`

The tech-content signature. Anatomy: bar (three dots using semantic tokens `--error/--warning/--success`
+ mono filename, optically centered) + mono body.

```html
<div class="codewin">
  <div class="codewin-bar">
    <i class="dot-r"></i><i class="dot-y"></i><i class="dot-g"></i>
    <span class="cw-title">release.ts</span>
  </div>
  <pre>…</pre>
</div>
```

- Body is `white-space: pre; overflow-x: auto` — code **scrolls**, never breaks a narrow slide.
- Syntax tints (four, no more): `.tk-kw` keywords `--accent-text` · `.tk-fn` calls spark-purple ·
  `.tk-str` strings `--success` · `.tk-cm` comments `--muted`; plain code `--ink-2`.
- Terminal flavor = same window, mono payload (`$` prompts, `▌` cursor) — no separate component.

## 02 · Stat card — `.statcard`

Big number for metrics/AI-news claims. Anatomy: mono caps label → display-font value
(`clamp(1.7rem, 4.5vw, 2.6rem)`, unit in a muted `<small>`) → delta **reusing `.badge`**
(success/warning/accent — never a new chip) → optional note. Hover follows the interactive-surface
contract; in a static slide it simply never fires.

## 03 · Browser mockup — `.browser`

Product shots inside a slide. Anatomy: bar (nav icons + URL pill — `r-full`, mono, lock icon in `--success`, ellipsized) + body slot (`--wash-spark` default) that **hosts any other widget** (statcard glass, codewin, compare…). Identity split from `.codewin`: traffic dots = code, URL bar = web.

## 04 · Compare — `.compare` (A vs B)

`grid-template-columns: 1fr auto 1fr` — two `.cmp-card`s (checklist rows: `li.yes`/`li.no` tint Lucide icons `--success`/`--error`) around a `.cmp-vs` medallion (ink circle, display font). `.is-better` rings the winning card in a success mix. Collapses to one column ≤720px (VS centers) — the width law, not a special case.

## 05 · Composition widgets (v0.14.0)

- **`.phone`** — phone mockup: `notch` + `screen` slot hosting any widget (same hosting law as `.browser`); caps at 280px, centers itself.
- **`.steps`** — numbered flow: `.step` (`.step-no` ink medallion + display title + note) on an auto-fit grid; order is carried by the numbers, not connector lines (cleaner at every width). **`.anim-cascade` state (v0.19.3 GSAP):** cards rise in staggered, medallions pop (`back.out`), and active step (`.is-live`) carries a live pulse ring loop via `tesd-motion.js` timeline.
- **`.layers`** — stack diagram: `.layer` rows (display name + mono tech label right), `.is-acc` rings one layer in the accent — "where does it run".
- **`.timeline`** — chronology: vertical hairline + `.tl-item` dots, `.tl-date` mono, `.is-now` = accent ring; for news/history posts. **`.anim-draw` state (v0.19.3 GSAP):** rail draws top-down (`--tl-draw`), dots pop staggered (`--tl-dot-scale`), and now-dot pulses in a loop via `tesd-motion.js` timeline. Fully rendered statically without GSAP/JS.
- **`.checklist` (v0.26.0)** — standalone task list: `.cl-head` (mono `.cl-label` + `.badge` progress) over `.cl-list` rows; each row = `.cl-box` (18px rounded tick box) + `.cl-text`. States: `.is-done` (success-tinted box + CSS checkmark, text muted) · `.is-cur` (accent border, text 500 — the current task) · plain (todo). Motion: done checks pop in sequence on reveal, `.is-cur`'s box breathes forever; static and fully readable without JS.
- **`.quote`** — pull-quote: uniform card (editorial identity comes from the display type at `clamp()`, not decoration), `.q-by` (avatar + name + role). No colored side borders — SKILL.md #25.

## 06d · Data visuals (v0.24.0) — living charts, topology-grade

Same contract as `.topology`: token-pure SVG, **static default = final state** (values and dasharrays live in the markup; JS animates FROM drawn-out/zero — RM & no-JS show the finished chart), loops via `h.loop` (offscreen-paused).

- **`.areachart`** — `.ac-grid` hairlines + `.ac-area` wash + `.ac-line` (draws via dashoffset) + `.ac-dot` (pops, then pulses) + `.ac-sweep` (scanner line travels the width forever) + `.ac-cap` footer.
- **`.donut`** — `.dn-track` ring + `.dn-seg` segments (markup carries FINAL `stroke-dasharray="len rest"` and offsets; C = 2πr; runtime grows them from 0) + `.dn-orb` (travels the ring) + `.dn-val` (`data-val`; markup text = FINAL value — the count starts at 0 only while animating) + `.dn-legend`.
- **`.radar`** — `.rd-ring`/`.rd-axis`/`.rd-label` + `.rd-poly` (grows from center `svgOrigin`, one per series) + `.rd-dot` pops + `.rd-sweep` (rotates forever).
- **`.sparkline`** — micro trend that slots inside `.statcard`: `.sp-line` quick draw + `.sp-dot` pulse.

## 06c · Kinesis family (v0.22.0) — presentation loops

`.wave` · `.eq` · `.marquee` · `.orbit` (+`.o-core`/`.o-ring`) · `.breathe` · `.text-wave` — self-running loops for PPT/video content (no user input; that's what separates them from interaction widgets like `.ba`). Specs + laws in [motion.md](./motion.md) § Kinesis.

**`.wavecard` (v0.25.7) — statcard variant with a living aurora wash at its foot** (Gemini-style gradient silk). Compose `class="statcard wavecard"`; the wash is `.wc-wash` (absolute, bottom, 58% height) holding 2–3 `.wc-wave` svgs — each an SVG wave whose path period repeats twice across the viewBox (seamless ±50% loop), filled via `color-mix(spark-token 55–62%, transparent)`, blurred (24–40px per layer). Content sits in `.wc-body` (grid — re-stacks the statcard spans above the wash). K4 registration runs the layers at parallax speeds in TWO directions (`0→-50`, `-50→0` mirrored) so they cross instead of marching in step; offscreen-paused, RM/no-JS = the blurred wash stays as static beauty. `min-height: 220px` + `align-content: start` give the wash room while content stays top. **Standalone reuse (v0.26.0):** the K4 registration targets `.wc-wash` itself — drop a bare `.wc-wash` anywhere (deck backgrounds, section footers) with explicit `height` and lighter fills (28–34% mixes) and the parallax loops run; `.wavecard` is now purely the statcard styling.

## 06 · Panels & flow (v0.15.0 — completes the 15-pattern catalog at CSS level)

- **`.takeaway`** — the closing-insight strip (full accent-tint border + `--accent-soft` wash + mono label); reused by quad/step/bench/matrix slides.
- **`.codewin.is-del` / `.is-add`** + **`.ln.is-hl`** — diff sides (error/success washes on the bar + border) and highlighted lines (accent-soft). **Diff is a recipe**: grid engine + two tinted codewins + a takeaway — no new wrapper class.
- **`.cmp-card.is-do` / `.is-dont`** — full panel tints for do/don't and flaw/impact pairs (on `.compare`).
- **`.statcard.is-acc`** — the bento hero treatment (accent gradient wash).
- **`.step-head`** — title + status badge row in `.step`; statuses REUSE `.badge` (success done · accent active · default pending).
- **`.bench`** — horizontal comparison bars: `.bench-row` (label · track · value), fill width via `--w`, `.is-best` takes the accent. **`.anim-grow` state (v0.19.3 GSAP):** fills rise from zero to their value via `scaleX` staggered; winner row (`.is-best`) carries a living sweep wave loop via `tesd-motion.js` timeline (replays cleanly on deck slide enters).
- **`.cmp-table`** — decision matrix on `.compare` semantics: criteria rows + `.adv.is-a` / `.adv.is-b` advantage pills (accent vs success); wrap in `.table-scroll` on narrow canvases.
- **`.apiwin`** — request/response inspector (codewin family): head (method `.badge` + `.api-ep` ellipsized + status badge + `.api-lat`) over `.api-pane`s that split side-by-side ≥721px.
- **`.fig`** — image viewport: `.fig-media` (spark wash slot, `img` capped by `--mh`, tag via `.badge`) + `.fig-cap` with `.fig-src` attribution.
- **`.pipeline`** (v0.24.1 topology-grade) — wrap in **`.pl-frame`** (shares the `.topology` card) with the shared telemetry chrome: `.topo-bar` (mono label + badge), `.hud` strip (`.hud-cell` supports `<small>` subtitles), **`.topo-inspector`** — nodes carry `data-topo-title/tech/role` + `tabindex`; hover/focus/Enter/Space inspect, Escape resets, `.is-inspected` highlights — and `.topo-foot`. Nodes `.pl-node` (`.is-live` accent ring) + `.pl-gap` arrows with the packet travel loop (`--pkt-x` desktop / `--pkt-y` mobile, offscreen-paused; ≤720px stacks with rotated arrows).
- **`.diagram`** — frame for external renderer output (mermaid & co. load per project): bordered scrollable panel; theme recipe = map the renderer's theme variables to tesd tokens (`--paper/--ink/--line-strong/--accent`). Life signal (v0.25.4): connectors may carry `.dg-flow` — dash pattern in CSS (`stroke-dasharray: 5 7`), motion.js flows the offset (looping, offscreen-paused, RM/no-JS = static dashes).
- **`.diagram` live mermaid recipe (v0.25.6)** — payload in `<pre class="dg-src">` (readable source = the no-JS/CDN fallback; `.dg-meta` row carries the renderer label + `.live-dot`), then dynamic-import mermaid 11 ESM and render with `theme: 'base'` + `themeVariables` read from tesd tokens at render time: `primaryColor ← --surface`, `primaryBorderColor/lineColor ← --line-strong`, `primaryTextColor/textColor ← --ink`, `classText ← --ink-2`, `edgeLabelBackground ← --surface`, `fontFamily ← --f-body`, `fontSize` goes in **themeVariables** (initialize.fontSize is ignored). Re-render on theme flip: MutationObserver on `data-theme` calls render again — tokens are re-read each time, so dark/light stay exact. Renderer output is static by law; the frame carries the life signal.
- **`.topology`** (v0.23.0) — 2D system architecture blueprint: `.topo-bar` (mono kicker + `.badge`) over responsive SVG canvas (`.topo-canvas`, `viewBox="0 0 460 230"`) with multi-tier service nodes (`.topo-node`), directional paths (`.topo-path`), and GSAP-driven luminous packet flow (`.topo-packet`). Includes docked interactive telemetry inspector (`.topo-inspector`) updating title/tech/role on node hover/focus, and operational reliability footer (`.topo-foot`). Fully accessible via keyboard (`tabindex="0"`, Escape reset) and screen readers (`aria-live="polite"`). Works 100% statically without JS or under `prefers-reduced-motion`.

## Example deck — `deck.html` (v0.16.0)

A complete 5-slide content post (*"Kenapa Design Tokens?"*) composing the widgets end-to-end: text-reveal cover → diff window → layers + animated pipeline → bench + statcard grid → quote + takeaway. It is the tier-3 recipe in practice — a PROJECT-level deck view: links only `tesd.css`, drives `.frag` with the fragments-first controller (keyboard ←/→, click halves), and adapts to portrait or landscape (canvas law). Copy it as the starting point for real posts.

**Ambient chrome (v0.26.0)** — the deck carries a full-bleed living background at z 0 (rows above at z 1): `.amb-meteor` (a `.meteor` de-carded by page CSS — no border/bg/radius — with exactly 4 guide lines hugging the EDGES — 2 `mt-v` at `--x` 12/88%, 2 `mt-h` at `--y` 16/84% (center stays clear for content) — streaks slowed via `data-dur="13–18"`; the `.meteor` registration honors per-line `data-dur`, `.amb-wash` (a **boxless** corner gradient — NOT `.anim-aurora`, whose overflow-box crops blobs at its edges; plain stacked `radial-gradient`s whose fades complete well INSIDE the element make a crop edge impossible, plus a slow RM-gated `backgroundPosition` drift), and `.amb-wave` (a bare `.wc-wash` at 84px with 28–34% fills — thin professional foot). Position indicator: the deck-dots were replaced by a **compact `.slidebar`** (`.deck .sb-track { flex: 0 0 168px }`, translucent bg) wired both ways; the foot wave runs faster via `.wc-wash[data-durs="9,15,7"]` (K4 honors per-layer overrides — thin low-fill footers need more speed for the motion to read) — `show()` calls `bar.slidebar.set(cur, true)`, `slidebar:change` calls `show(i)`. GOTCHA burned in: `.amb` must be a REAL class on the element (`class="meteor amb amb-meteor"`) — `amb-meteor` alone never matches `.amb`; class selectors are exact tokens, not prefixes.

**Placement law (v0.15.1 device lesson)**: `.frag` is a DECK contract — it hides content until a step reveals it. Wrapping static page content in `.frag` renders it invisible on devices (headless only survived because its reduced-motion gate shows frags). Static pages use the `.rv` scroll-reveal system instead; `.frag` lives only inside deck views.

**Naming law**: widget names live in OUR system (`-win` family, `.is-*` modifiers, child prefixes like `.pl-/.api-/.fig-`); external catalog slugs are context, never class names. **Reuse before new** — diff and bento are recipes over existing parts.

## Animation states (v0.19.3 — GSAP timelines via tesd-motion.js)

All widget animation states are registered timelines in `tesd-motion.js`:
- `.anim-count` — counter tween with decimal/snap formatting;
- `.codewin.anim-typing` — SplitText char cascade with clean revert;
- `.timeline.anim-draw` — rail scaleY draw + dot pop + living pulse;
- `.steps.anim-cascade` — step rise + badge pop + active ring pulse;
- `.bench.anim-grow` — fill scaleX stagger + winner wave sweep loop;
- `.pipeline` — bidirectional packet flow loop;
- `.topology` — multi-tier SVG packet flow loop + interactive node inspector.
Without JS or under reduced-motion, every widget renders complete statically. Recipes in [motion.md](./motion.md).

**`.sparkline.sparkmini` (v0.26.0)** — inline standalone sparkline: same element, second class. `display:inline-flex` + `svg { width:96px; height:22px }`, optional `.spm-val` mono value beside it. Zero new runtime — it reuses the `.sparkline` registration (DrawSVG draw + endpoint dot pulse), usable mid-sentence or beside labels without a host card.

## `.slidebar` — slide position indicator (v0.25.0)

N segments (`.sb-seg` + `.sb-fill`); the ACTIVE segment grows its fill (bench language), carries `.anim-beam`, and the mono counter scrambles on change. Click to jump; `data-auto="3200"` cycles for presentation mode; `el.slidebar.set(i)` + `slidebar:change` event wire it to any deck controller. **Adopts only existing animations — nothing invented.** Static degrade: markup ships slide 1 active (RM/no-JS show position 1 filled; count written directly before the scramble garnish).

## Life signals (v0.24.2–.5)

Every widget carries ≥1 continuous living element ([motion.md](./motion.md) law). The two widget-facing carriers:

- **`.meteor`** (v0.24.10) — each streak owns its **soft guide line** (a permanent faded hairline via `::before`) and rides it **slowly, beam-soft** (6–10s per pass, `sine.inOut`, optional `data-dur`): `i.mt-v` (vertical, accent, `--x`) and `i.mt-h` (horizontal, purple, `--y`). Static/no-JS = the calm lines alone.
- **`.anim-aurora`** — living wash behind glass: a slow-orbiting spark-blob layer (`--aurora-dur`); glass cards above it blur the motion. Carriers: wash-bg, `.phone-screen`, `.browser-body`, `.fig-media` — anywhere glass sits on a gradient.
- **`.anim-beam`** — soft conic light circling a card's border ring (GSAP `--beam-angle`, per-card speed `--beam-dur` 6–11s, RM-gated). THE card-tier signal: bento trio, attention statcard, compare winner, avatar halo, browser, apiwin, terminal, phone. One life signal per card — never stack on packets/sweeps carriers.
- **`.live-dot`** — 6px accent dot with pulsing ring; the thin micro signal for labels, readouts, sources, verdicts (browser URL, layers tech, statcard label, apiwin latency, fig source, cmp-table verdict).
- **`.tk-cursor`** — blinking caret for code/terminal endings.

`.anim-pulse` remains a documented primitive for micro markers but owns no card tier anymore.

## Laws

1. **Fluid by law** — no widget carries a width; the slide container decides.
2. **Reuse before new** — deltas reuse `.badge`, layout reuses the grid engine, washes reuse spark.
3. **Token tints only** — syntax colors are semantic tokens, never literal hexes (dark mode carries them).
4. One canonical form per widget; variations (terminal flavor) are payload, not CSS forks.
5. **Grid purity (v0.25.4)** — a layout `.grid` holds only its cells; captions (`.w-cap`), follow-up grids, and standalone cards are top-level siblings after the grid closes. A caption inside a grid becomes a cell (orphan text + blank column at multi-column widths); a nested grid squeezes to one cell's width. After editing near a grid, probe child count + column positions, not just div balance.
6. **External embeds obey the fluid law (v1.2.0)** — third-party widgets that ship their own pixel widths (Google Identity button, embedded players, maps, payment buttons) get NO exemption from Law 1. The wrapper owns the width: the vendor never does. A fixed-width embed dropped into a `.card` or narrow column overflows at 320px — always net it (validated in production: the GIS button inside an Auth-shell card).

### External embed wrapper (v1.2.0)

The canonical three-part net for any inline-width third-party widget:

```css
/* 1. The wrapper derives its width from the container — never from the vendor */
.embed-holder {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  min-height: 44px;            /* reserves paint space; prevents layout shift while the script loads */
}

/* 2. The safety net: the vendor's inline pixel width can never exceed the wrapper */
.embed-holder > div {
  max-width: 100%;
}
```

```ts
// 3. When the vendor API takes a NUMERIC width (e.g. GIS renderButton), derive it
// from the container with a clamp — GIS minimum is 200px, comfortable max 400px:
const buttonWidth = Math.min(400, Math.max(200, holderEl.clientWidth || 320))
idApi.renderButton(holderEl, { width: buttonWidth, /* …vendor options */ })
```

Rules of thumb: re-derive on resize when the vendor won't re-render; load the vendor script lazily only when its config (client ID, key) exists; show a configuration alert instead of a broken widget when it doesn't; keep the widget inside the card grid — the card's padding defines the usable width, and `min-height` reserves space so the button's late paint never jumps the layout.

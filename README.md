# tesd/ui — Design System & UI Coding Standard

> **Paper & ink · hairline structure · one live-switchable accent · spark gradients · GSAP motion under 300ms**

A standalone, framework-agnostic design system and UI coding standard — the personal signature language of tesd. Vanilla CSS at the core, GSAP for all motion, Svelte 5 seeds for TESD projects. Usable on **any stack**: vanilla HTML, SvelteKit, React, Astro, Vue.

---

## 🎨 What is tesd-ui?

Three layers, one language:

- **Design tokens + components (pure CSS)** — `tesd.css` + generated `tokens.css`. Paper `#fafaf9` / ink `#111113`, a single live-switchable accent, semantic colors, 4pt spacing, Space Grotesk (display) / Inter (body) / JetBrains Mono (labels), calculated radii, one shadow family. Every component family — buttons, forms, feedback, navigation, data, overlays — ships a full 8-state contract.
- **Motion runtime (`tesd-motion.js`)** — one vanilla JS file driving all animation on **GSAP 3.13+** (100% free since the Webflow acquisition, May 2025): entrances, choreography, loops, text/SVG/Flip effects, with stall guards, off-screen loop pausing, and a no-JS/reduced-motion static guarantee.
- **Svelte 5 seeds** — 10 ready components (`Button`, `Field`, `Switch`, `Combobox`, `DatePicker`, `Accordion`, `Slider`, `Modal`, `Tree`, `toast`) generated into your project as **project-owned code** (`src/lib/components/ui/`), never a shared library.

The living preview — [`index.html`](./index.html) (+ [`widgets.html`](./widgets.html), [`deck.html`](./deck.html)) — is the source of truth: every token, component, and pattern is rendered and verified there at six responsive gates (320–1440, zero horizontal overflow).

tesd/ui is the design sibling of [tesd-stack](https://github.com/pujandan/tesd-stack); neither depends on the other — use either independently or pair them.

---

## 🔒 The Ten Non-Negotiables

1. **Locked tokens** — every value is a named custom property; no inline hex/rgba outside the `:root` blocks.
2. **Soft borders** — dividers use `--line` / `--line-strong`; solid ink borders are reserved for component fills.
3. **Calculated radius** — `r ≈ 0.3 × control height` (10/12/14px); `--r-full` is anatomy-only.
4. **One focus style** — border-color + `--focus-ring` on every bordered control; the ring never animates.
5. **Control parity** — buttons and inputs share one scale (32/40/48); side-by-side pairs measure equal height.
6. **One interactive hover** — lift `translateY(-2px)` + `--shadow-1` + 180ms, gated behind `hover: hover`.
7. **Danger hierarchy** — filled danger for confirmations, outline for row-level secondary actions.
8. **Three sanctioned gradient uses** — hero wash, gradient display text, wash card; never on buttons/inputs/body text.
9. **Overlays animate both directions** — slower staggered enter, faster un-staggered exit, visibility delayed so nothing clips.
10. **Spinner is a ring** — border-based, 700ms linear, `.on-ink` variant.

Plus the core laws: 8-state contract on every interactive component · responsive gates at 320 · 375 · 414 · 768 · 980 · 1440 · single dark-mode inversion block · control width law (capped 380px, caps lift ≤720px) · **fluid law** (widgets and external embeds derive width from the container, never the vendor) · grid purity · no AI-slop tells (never a colored side border on a rounded card) · **locked vs free** composition (the system locks tokens and contracts; page anatomy is the project's identity — two briefs never share one skeleton).

---

## 📦 What's Inside

| Path | Contents |
|---|---|
| [`SKILL.md`](./SKILL.md) | Agent skill entry point — principles, 27-row rule table, workflow, checklists |
| [`tesd.css`](./tesd.css) / [`tokens.css`](./tokens.css) | The full system (single source) + generated token export |
| [`tesd-motion.js`](./tesd-motion.js) | GSAP motion runtime (registers widget timelines, guards, loops) |
| [`index.html`](./index.html) · [`widgets.html`](./widgets.html) · [`deck.html`](./deck.html) | Living previews — the visual source of truth |
| [`references/`](./references/) | Per-topic documentation (see table below) |
| [`scripts/audit.py`](./scripts/audit.py) | 8-gate quality audit (braces, token sync, hex discipline, version sync, CDN pinning, seeds, docs coverage, JS syntax) |
| [`scripts/scaffold.py`](./scripts/scaffold.py) | One-command scaffolder: tokens + utilities + Svelte 5 seeds into any project |

---

## 🚀 How to Consume

**1. Direct CSS (any stack)** — copy `tesd.css` (or just `tokens.css` for a tokens-only adoption) plus `tesd-motion.js` into your project.

**2. SvelteKit / TESD projects (recommended)** — use the scaffolder:

```bash
python3 scripts/scaffold.py /path/to/project --with-runtime --with-seeds
```

Generates tokens, `$lib/utils/id.ts`, and the Svelte 5 seeds under `src/lib/components/ui/`; `--with-runtime` also ships `tesd.css` + `tesd-motion.js` (static-friendly).

**3. Tailwind projects** — map the tokens through the [Tailwind adapter](./references/tailwind-adapter.md).

**Motion wiring (GSAP):** install and bundle GSAP in the app — `npm i gsap` — then expose the engine to the runtime through the bundler bridge (`expose-gsap.ts` → `boot.ts`; import order is the contract, see [motion.md § Runtime](./references/motion.md#runtime--tesd-motionjs)). CDN script tags remain acceptable only for no-build static pages and this skill's own previews. If GSAP is absent, every widget renders in its static final state — motion is progressive enhancement, never a dependency.

---

## 🤖 Installing as an AI Agent Skill

This repository is packaged as an AI Agent Skill conforming to the Agent Skills standard and Antigravity specification.

### 1. Antigravity (`agy` CLI / Antigravity IDE)
Clone or copy this folder into your workspace's skill directory:
```bash
# In your project root:
mkdir -p .agents/skills
cp -r /path/to/tesd-ui .agents/skills/tesd-ui
```

### 2. Cursor
Place a reference in `.cursorrules` or create `.cursor/rules/tesd-ui.mdc`:
```markdown
Read and apply the design standards in `.agents/skills/tesd-ui/SKILL.md` whenever building or reviewing any UI — tokens, components, layout, motion, or responsive behavior.
```

### 3. Claude Code
Reference `SKILL.md` inside your project's `CLAUDE.md`:
```markdown
For all UI work — pages, components, tokens, motion — strictly follow the rules in `.agents/skills/tesd-ui/SKILL.md`.
```

### 4. Windsurf / Cascade
Add the path to `.windsurfrules`:
```markdown
Follow the design-system standards specified in `.agents/skills/tesd-ui/SKILL.md`.
```

---

## 📚 Reference Documentation

| Document | Description |
|---|---|
| [**`SKILL.md`**](./SKILL.md) | Main agent skill entry point: principles, rule table, workflow, checklists |
| [**`foundations.md`**](./references/foundations.md) | Tokens, type scale, gradients, dark mode inversion |
| [**`components/buttons.md`**](./references/components/buttons.md) | Button family: variants, sizes, danger hierarchy |
| [**`components/forms.md`**](./references/components/forms.md) | Inputs, selects, switch, combobox, datepicker, slider, control width law |
| [**`components/feedback.md`**](./references/components/feedback.md) | Alerts, toasts (4 kinds), spinners, skeletons |
| [**`components/navigation.md`**](./references/components/navigation.md) | Nav, tabs, segmented, pagination, breadcrumbs |
| [**`components/data.md`**](./references/components/data.md) | Tables (4-state machine), badges, avatars, cards, accordion, tree |
| [**`components/overlays.md`**](./references/components/overlays.md) | Modal, drawer→bottom-sheet, dropdown, ⌘K palette (exclusive family) |
| [**`layout.md`**](./references/layout.md) | Grid engine: `cols-N`/`span-N`/`gap-N`/`auto-N`, responsive prefixes |
| [**`responsive.md`**](./references/responsive.md) | Six gates (320–1440), overflow QA probes |
| [**`a11y.md`**](./references/a11y.md) | ARIA + keyboard contracts per component (roving tabindex, focus trap) |
| [**`motion.md`**](./references/motion.md) | GSAP-first architecture, runtime API, npm bundler bridge vs CDN paths |
| [**`content-widgets.md`**](./references/content-widgets.md) | Slide/post widgets (codewin, statcard, topology, charts) + laws (fluid, grid purity, external embeds) |
| [**`shells.md`**](./references/shells.md) | Five page shells (App/Docs/Dashboard/Auth/Landing), hero variants, booking flow |
| [**`svelte.md`**](./references/svelte.md) | Svelte 5 seeds — 10 components, runes patterns, GSAP in Svelte |
| [**`export.md`**](./references/export.md) | Token generation, shipping tesd.css + runtime into projects |
| [**`tailwind-adapter.md`**](./references/tailwind-adapter.md) | Token mapping for Tailwind projects |
| [**`icons.md`**](./references/icons.md) | Lucide-only icon law, CDN pinning |
| [**`quality-gates.md`**](./references/quality-gates.md) | Pre-completion checklist (audit, device gates, dark mode, a11y) |

---

## 🛠 Verifying Skill Integrity

To run the 8-gate quality audit (CSS braces, token sync, hex discipline, version sync, CDN pinning, seed inventory, docs coverage, JS syntax):

```bash
python3 scripts/audit.py
```

---

## 👨‍💻 Author

<a href="https://github.com/pujandan">
  <img src="https://github.com/pujandan.png" width="80" height="80" alt="Pujan (@pujandan)" style="border-radius: 50%;" />
</a>

**Pujan** ([@pujandan](https://github.com/pujandan))

---

## 📄 License

[MIT](./LICENSE) © 2026 [Pujan](https://github.com/pujandan)

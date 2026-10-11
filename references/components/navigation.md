# Navigation

## Top nav — frosted, scroll-aware

```css
.nav {
  position: fixed; inset: 0 0 auto 0; height: var(--nav-h); z-index: 80;
  background: rgba(250, 250, 249, 0.82);
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: border-color var(--dur-3) ease;
}
.nav.is-scrolled { border-bottom-color: var(--line); }
.nav-in { display: flex; align-items: center; gap: var(--s-5); height: 100%; }
.nav-links { display: flex; gap: 2px; margin: 0 auto; list-style: none; }
.nav-links a {
  display: block; padding: 7px 12px; border-radius: var(--r-sm);
  font-size: var(--t-sm); font-weight: 500; color: var(--muted); text-decoration: none;
  transition: color var(--dur-1) ease, background-color var(--dur-1) ease;
.nav-links a:hover { color: var(--ink); background: var(--wash-hover); }

/* compact nav — 9 links + wordmark + CTA squeeze into the 980–1140 tier
   without dropping any link (values stay on the token scales) */
@media (min-width: 980px) and (max-width: 1140px) {
  .nav-in { gap: var(--s-2); }
  .nav-links { gap: 0; }
  .nav-links a { padding: 4px 8px; font-size: var(--t-xs); }
}
```

Wordmark: display font + 26px ink glyph tile (7px radius). Scroll-spy marks the active link `.is-active`.

## Collapse breakpoints (two tiers — tested, do not merge)

```css
@media (max-width: 979px) { .nav-links { display: none; } .burger { display: block; } }
@media (max-width: 720px) { .nav-in > .btn { display: none; } }
```

980–1440: full nav. 721–979: wordmark + CTA + burger. ≤720: wordmark + burger.

## Burger trigger

```css
.burger {
  display: none; margin-left: auto; width: 40px; height: 40px; padding: 0;
  border: 1px solid var(--line-strong); border-radius: var(--r-control);
  background: transparent; cursor: pointer; position: relative;
}
.burger:focus-visible { outline: none; border-color: var(--accent); box-shadow: var(--focus-ring); }
.burger i { position: absolute; left: 11px; right: 11px; height: 1.6px;
  background: var(--ink); border-radius: 2px;
  transition: transform var(--dur-2) var(--ease), top var(--dur-2) var(--ease); }
.burger i:first-child { top: 16px; }
.burger i:last-child { top: 22px; }
.burger.is-open i:first-child { top: 19px; transform: rotate(45deg); }
.burger.is-open i:last-child { top: 19px; transform: rotate(-45deg); }
```

## Full-screen menu sheet (z-index below nav — burger stays clickable and morphs to X)

```css
.menu {
  position: fixed; inset: 0; z-index: 70;
  background: var(--paper);
  display: flex; flex-direction: column; justify-content: center; gap: var(--s-6);
  padding: var(--nav-h) var(--s-6) var(--s-7);
  opacity: 0; visibility: hidden;
  /* exit: fade 260ms, then hide */
  transition: opacity 260ms var(--ease), visibility 0s 260ms;
}
.menu.is-open { opacity: 1; visibility: visible; transition: opacity 320ms var(--ease); }
.menu-nav { display: grid; }
.menu-nav a {
  font-family: var(--f-display); font-weight: 600; letter-spacing: -0.02em;
  font-size: clamp(1.8rem, 7vw, 2.5rem); line-height: 1.1;
  color: var(--ink); text-decoration: none;
  padding: 13px 0; border-bottom: 1px solid var(--line);
  transform: translateY(12px); opacity: 0;
  /* exit: fast, un-staggered */
  transition: transform 180ms var(--ease), opacity 180ms var(--ease), color var(--dur-1) ease;
}
.menu-nav a:hover { color: var(--accent); }
.menu.is-open .menu-nav a {
  transform: translateY(0); opacity: 1;
  /* entrance: slower, staggered below */
  transition: transform 460ms var(--ease), opacity 460ms var(--ease), color var(--dur-1) ease;
}
.menu.is-open .menu-nav a:nth-child(1) { transition-delay: 40ms; }
/* … +40ms per child up to 7 */
.menu > .btn { justify-self: start; transform: translateY(12px); opacity: 0;
  transition: transform 180ms var(--ease), opacity 180ms var(--ease); }
.menu.is-open > .btn { transform: translateY(0); opacity: 1;
  transition: transform 460ms var(--ease), opacity 460ms var(--ease); transition-delay: 320ms; }
```

JS: toggle `is-open` on both menu and burger; keep `aria-expanded`/`aria-label` in sync; lock `body` overflow while open; close on link click and on Escape.

## Tabs

```css
.tabs {
  display: flex; gap: 2px; border-bottom: 1px solid var(--line);
  overflow-x: auto; scrollbar-width: none;
}
.tabs::-webkit-scrollbar { display: none; }
.tab {
  flex: none;
  position: relative; background: none; border: none; cursor: pointer;
  font: 500 var(--t-sm)/1 var(--f-body); color: var(--muted); padding: 12px 16px;
  transition: color var(--dur-1) ease;
}
.tab::after {
  content: ""; position: absolute; left: 12px; right: 12px; bottom: -1px;
  height: 2px; background: var(--ink); border-radius: 2px;
  transform: scaleX(0); transition: transform var(--dur-3) var(--ease);
}
.tab.is-active { color: var(--ink); }
.tab.is-active::after { transform: scaleX(1); }
.tab-panel[hidden] { display: none; }
```

Full `role="tablist"/"tab"/"tabpanel"` + `aria-selected` wiring; panels toggle `hidden`. Tabs carry `overflow-x: auto; scrollbar-width: none` with `flex: none` items so narrow screens (≤375px) scroll cleanly without push-overflow. **Disabled tab**: `aria-disabled="true"` (stays in the a11y tree) → placeholder color, no pointer, underline suppressed (`.tab[aria-disabled="true"]::after { display: none }`), **and the JS makes it truly inert** — `selectTab()` refuses it and Arrow/Home/End navigation walks past it (v0.9.6 device lesson: aria-disabled without a JS guard still activates on click — looks disabled, behaves enabled). Text controls signal disabled by muting, not dimming — filled controls (buttons, page buttons) dim; native-`disabled` controls (`.seg`, `.page-btn`) are inert for free.

## Segmented control — nested radius = outer − padding (12 − 4 = 8)

```css
.segmented {
  display: inline-flex; max-width: 100%; overflow-x: auto; scrollbar-width: none;
  padding: 4px; gap: 2px;
  background: color-mix(in srgb, var(--ink) 6%, transparent); border-radius: var(--r-control);
}
.segmented::-webkit-scrollbar { display: none; }
.seg {
  flex: none;
  border: none; background: none; cursor: pointer;
  font: 500 var(--t-xs)/1 var(--f-body); color: var(--muted);
  padding: 8px 14px; border-radius: var(--r-sm);
  transition: background-color var(--dur-2) ease, color var(--dur-2) ease, box-shadow var(--dur-2) ease;
}
.seg.is-active { background: var(--surface); color: var(--ink); box-shadow: var(--shadow-1); }
```

## Breadcrumb · Pagination

```css
.breadcrumb { display: flex; align-items: center; gap: 8px; font-size: var(--t-sm); flex-wrap: wrap; }
.breadcrumb a { color: var(--muted); text-decoration: none; }
.breadcrumb a:hover { color: var(--ink); }
.breadcrumb .sep { color: var(--line-strong); }
.breadcrumb .cur { color: var(--ink); font-weight: 500; }

.pagination { display: flex; flex-wrap: wrap; gap: 6px; }
.page-btn {
  min-width: 36px; height: 36px; padding: 0 8px; display: grid; place-items: center;
  border: 1px solid var(--line); background: var(--surface); color: var(--ink-2);
  border-radius: var(--r-control-sm); cursor: pointer; font: 500 var(--t-sm)/1 var(--f-body);
  transition: border-color var(--dur-1) ease, background-color var(--dur-1) ease,
              color var(--dur-1) ease, transform var(--dur-1) var(--ease);
}
.page-btn:hover { border-color: var(--ink-2); color: var(--ink); }
.page-btn:active { transform: scale(0.94); }
.page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.page-btn[aria-current="page"] { background: var(--ink); border-color: var(--ink); color: var(--paper); }
```

Current page uses `aria-current="page"` — one source of truth, no duplicate `.is-current` class.

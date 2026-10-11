# Responsive

## Gates

Every output is verified at **320 · 375 · 414 · 768 · 980 · 1440**. The bar: zero horizontal overflow AND zero elements outside the viewport (elements inside sanctioned scroll containers like `.table-scroll`, `.codewin pre`, `.tabs`, `.segmented` don't count).

## Hard rules

- `html, body { overflow-x: clip; }` — `clip`, never `hidden`.
- `html { -webkit-tap-highlight-color: transparent; }` — kill the native mobile tap blip (blue rect that ignores border-radius); interactive controls carry `user-select: none` + `-webkit-touch-callout: none` so long-press never triggers the native green selection square. Content text stays selectable (accent `::selection`).
- Page-level grids go through the **layout engine** (`.grid` + `cols-N`/`auto-N`, [layout.md](./layout.md)) — never ad-hoc inline `grid-template-columns`. Auto grids always wrap their minimum as `minmax(min(100%, Npx), 1fr)` — a bare `minmax(Npx, 1fr)` overflows the moment the container is narrower than N.
- Display text wraps inside long words: `overflow-wrap: anywhere` where URLs/slugs can appear; `min-width: 0` on grid children.
- Clickable text never wraps to two lines (buttons, nav links, CTAs).
- Tooltips wrap: `max-width: 200px; white-space: normal` — an unwrapped tooltip WILL leave the screen near edges.
- `.pagination`, `.footer-links`, `.swatches`, `.demo-row`: `flex-wrap: wrap`.
- Image-bearing grid tracks use `minmax(0, 1fr)`.

## Breakpoint map

The two gates are tokenized: `--bp-sm: 720px`, `--bp-md: 980px` (media queries hardcode the values; tokens feed JS `matchMedia` + the Tailwind `screens`).

| Range | Nav | Footer | Notes |
|---|---|---|---|
| ≥980 | full links + CTA — **compact tier 980–1140** (gap 0 · padding 4/8 · `--t-xs` links; all 9 links stay) | wordmark + links right, note below | |
| 721–979 | links hidden, **burger appears**, CTA stays | links drop `margin-left: auto`, wrap below wordmark | two-tier collapse — do NOT merge |
| ≤720 | wordmark + burger only | same | CTA lives in the menu sheet · **form control measure caps lift** — `.field`/`.search`/`.input-affix`/`.dropzone` fill their container (control width law, forms.md) |

Footer structure is one row (wordmark + links) + fine-print note beneath, at every width — mobile collapses to a single left alignment, never mixed left/right.

## QA — headless probe recipes

Chrome headless clamps window width to a 500px floor — test 320/375/414 through an iframe wrapper with `--allow-file-access-from-files`:

```html
<iframe src="file:///path/probe.html" style="width:320px;height:3400px;border:0"></iframe>
```

**Overflow + offender probe** (inject before `</body>`, dump with `--virtual-time-budget=5000 --dump-dom`, grep `data-probe`):

```js
setTimeout(function () {
  var winW = window.innerWidth;
  var offenders = [];
  document.querySelectorAll('body *').forEach(function (el) {
    var r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0) return;
    if (el.closest('.toasts') || el.closest('.scrim') || el.closest('.table-scroll') || el.closest('.codewin pre') || el.closest('.tabs') || el.closest('.segmented')) return;
    if (r.right > winW + 1 || r.left < -1)
      offenders.push(el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0] + ' R' + Math.round(r.right));
  });
  document.body.setAttribute('data-probe',
    'docW=' + document.documentElement.scrollWidth + ' off=' + (offenders.length ? offenders.join(' | ') : 'none'));
}, 600);
```

**Runtime-error probe** — always run after touching script:

```js
window.__errs = [];
window.addEventListener('error', function (e) { window.__errs.push(e.message); });
/* …later: document.body.setAttribute('data-probe', 'errors=' + JSON.stringify(window.__errs)); */
```

**Known harness limits:** CSS transitions don't advance in `--dump-dom` (no frames — read classes, not computed opacity); infinite rAF loops hang `--virtual-time-budget` (cap or disable canvas loops in probes). For layout shots use `--force-prefers-reduced-motion` (libraries skip, everything renders statically).

## On-device testing (Tailscale)

```bash
python3 -m http.server 4173 --bind 0.0.0.0 --directory <skill-or-project-dir>
```

Phone (Tailscale on) opens `http://<mac-tailscale-ip>:4173/`. The server reads from disk — every edit is one refresh away. Check: touch targets ≥40px, `:active` scale feedback (no hover on touch), menu open/close ergonomics, fixed-nav blur over scrolling content, footer in portrait and landscape. If the phone can't connect, the macOS firewall dialog needs "Allow" for incoming Python connections.

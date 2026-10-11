# Data — table · badges · avatars · cards · empty

## Table

Sanctioned horizontal-scroll on narrow screens: the wrapper scrolls, the page never does.

```html
<div class="table-wrap">          <!-- border + radius + overflow hidden -->
  <div class="table-scroll">      <!-- overflow-x: auto -->
    <table>…</table>
  </div>
</div>
```

```css
.table-wrap { border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); overflow: hidden; }
.table-scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: var(--t-sm); min-width: 560px; }
thead th {
  text-align: left; font-family: var(--f-mono); font-size: var(--t-xs);
  text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); font-weight: 500;
  padding: 12px 18px; border-bottom: 1px solid var(--line);
  background: rgba(17, 17, 19, 0.02); white-space: nowrap;
}
tbody td { padding: 13px 18px; border-bottom: 1px solid var(--line); color: var(--ink-2); white-space: nowrap; }
tbody tr:last-child td { border-bottom: none; }
tbody tr { transition: background-color var(--dur-1) ease; }
tbody tr:hover { background: rgba(17, 17, 19, 0.025); }
.cell-title { color: var(--ink); font-weight: 500; }
.cell-sub { display: block; font-size: var(--t-xs); color: var(--muted); margin-top: 1px; }
```

Two-line cells: `.cell-title` + `.cell-sub` (title / path pattern).

## Interactive table (sort · select · skeleton)

**Sorting** — sortable headers are `tabindex="0"` with `aria-sort="ascending" | "descending" | "none"` and an icon (`chevrons-up-down` neutral, `chevron-up/down` active). Click or Enter/Space toggles direction; rows re-append sorted by `data-*` attributes. Sorting is a data change — it renders **instantly**, no animation.

**Selection** — checkbox column; the header checkbox is the master (`checked` / `indeterminate`). A bulk bar (ink surface, shadow-2) pops in when n > 0 with the count and actions (Archive / Export / Clear) — fast in, fast out.

**The stateful-data contract** — every data component ships four renders: **resting**, **loading**, **empty**, **error**. The demo table runs them through one state machine (`setTableState`, radio-like toggles):

- *loading*: skeleton rows (`.skeleton` bars per cell, checkbox cell included) + `aria-busy="true"` on the wrapper; never animate row swaps. Use while fetching.
- *empty*: a single `colspan` row — soft icon circle, display-font title, one-line hint; no CTA unless the context demands action.
- *error*: `is-error` alert row + **Retry** that re-enters loading then restores — never a dead screen. State rows carry `white-space: normal` — `tbody td` sets `nowrap` for data cells and would cage the alert/hint text outside its box.
- *resting*: restored from a backup string; row listeners rebind, selection clears on every state change, and **sorting is inert off-data** (`sortTable` early-returns) or it re-appends detached rows over the skeleton.

## Badges

```css
.badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: var(--t-xs); font-weight: 550; line-height: 1;
  padding: 5px 10px; border-radius: var(--r-sm);
  background: rgba(17, 17, 19, 0.06); color: var(--ink-2);
}
.badge i { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
.badge.accent  { background: var(--accent-soft); color: var(--accent-text); }
.badge.success { background: var(--success-soft); color: var(--success); }
.badge.warning { background: var(--warning-soft); color: var(--warning); }
.badge.error   { background: var(--error-soft); color: var(--error); }
```

## Avatars — spark quartet palette

Person identity colors come from the spark family, as classes (never inline):

```css
.avatar { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center;
  font-size: var(--t-xs); font-weight: 600; color: var(--paper); background: var(--ink); flex: none; }
.avatar-sm { width: 24px; height: 24px; font-size: 10px; }
.a-blue { background: var(--spark-blue); }  .a-purple { background: var(--spark-purple); }
.a-coral { background: var(--spark-coral); } .a-pink { background: var(--spark-pink); }
.avatar-stack { display: flex; }
.avatar-stack .avatar { border: 2px solid var(--paper); margin-left: -9px; }
.avatar-stack .avatar:first-child { margin-left: 0; }
.avatar-stack .more { background: rgba(17,17,19,0.1); color: var(--ink-2); }
```

A person keeps the same color across the whole page (name → color mapping).

## Cards

```css
.card {
  background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--r-lg); overflow: hidden;
  transition: transform var(--dur-2) var(--ease), box-shadow var(--dur-2) ease, border-color var(--dur-2) ease;
}
.card-media { height: 120px; background: linear-gradient(135deg, rgba(17,17,19,0.05), rgba(17,17,19,0.12)); }
.card-media.is-spark  { background: linear-gradient(135deg, color-mix(in srgb, var(--spark-blue) 12%, transparent), color-mix(in srgb, var(--spark-purple) 12%, transparent) 52%, color-mix(in srgb, var(--spark-pink) 12%, transparent)); }
.card-media.is-purple { background: linear-gradient(135deg, color-mix(in srgb, var(--spark-purple) 13%, transparent), rgba(17,17,19,0.08)); }
.card-media.is-pink   { background: linear-gradient(135deg, color-mix(in srgb, var(--spark-pink) 13%, transparent), color-mix(in srgb, var(--spark-coral) 9%, transparent)); }
.card-body { padding: var(--s-4); display: grid; gap: 8px; }
.card-foot { display: flex; align-items: center; justify-content: space-between;
  padding: var(--s-3) var(--s-4); border-top: 1px solid var(--line); }

@media (hover: hover) and (pointer: fine) {
  .card-link:hover .card { transform: translateY(-2px); box-shadow: var(--shadow-1); border-color: var(--line-strong); }
}
.card-link:active .card { transform: translateY(0); }
```

Hover = the interactive-surface contract (#6): −2px / `--shadow-1` / 180ms. Colored media only via the spark classes above.

## Empty state

```css
.empty {
  border: 1px dashed var(--line-strong); border-radius: var(--r-lg);
  padding: var(--s-7) var(--s-5); text-align: center;
  display: grid; gap: var(--s-2); justify-items: center; color: var(--muted);
}
.empty .e-icon { width: 44px; height: 44px; border-radius: var(--r-control);
  background: color-mix(in srgb, var(--ink) 5%, transparent); display: grid; place-items: center; color: var(--ink-2); }
.empty b { color: var(--ink); font-weight: 600; font-family: var(--f-display); }
.empty p { font-size: var(--t-sm); max-width: 40ch; }
```

Anatomy: icon tile (44px, `--r-control`) → bold statement ("No pages yet") → one helpful sentence → one primary action. Never an illustration.

## Accordion · Disclosure

Native HTML5 `<details class="accordion">` + `<summary class="acc-summary">` + `.acc-content`:

```html
<div class="accordion-group">
  <details class="accordion" open>
    <summary class="acc-summary">
      <span>What are design tokens?</span>
      <i data-lucide="chevron-down" class="acc-chevron" aria-hidden="true"></i>
    </summary>
    <div class="acc-content">
      <p>Named entities that store visual attributes (colors, fonts, radii, spacing).</p>
    </div>
  </details>
  <details class="accordion">
    <summary class="acc-summary">
      <span>Why is GSAP the single motion engine?</span>
      <i data-lucide="chevron-down" class="acc-chevron" aria-hidden="true"></i>
    </summary>
    <div class="acc-content">
      <p>GSAP allows choreography, reverse/seek timelines, and stall-guard watchdog protection.</p>
    </div>
  </details>
</div>
```

- **Semantics**: Native `<details>` & `<summary>` provide keyboard interaction (Enter / Space to toggle) and accessible states (`open` attribute) automatically.
- **Surface**: `--surface` fill, 1px solid `--line` border, `--r-md` (12px) radius. On `:hover` border deepens to `--line-strong`.
- **Open state**: `details[open]` elevates with `--shadow-1` and rotates `.acc-chevron` by 180° (`transition: transform var(--dur-2) var(--ease)`).
- **Mutual exclusivity**: Adding native HTML `name="group-name"` to `<details>` elements groups them so opening one closes the other in modern browsers without custom JS.
- **Dual-direction animation**:
  - *Pure modern CSS*: `@supports (interpolate-size: allow-keywords)` animates `::details-content` (`transition: height var(--dur-3) var(--ease), opacity var(--dur-2) ease`).
  - *Progressive enhancement (WAAPI)*: In vanilla environments, a lightweight controller intercepts clicks to animate height from natural to `0px` before toggling `open`, and from `0px` to natural on open (260ms open / 200ms close). `.accordion.is-closing` keeps border and chevron state fluid during collapse. Gated by `prefers-reduced-motion`.

## Tree View · Hierarchy

Recursive tree representation with hairline indentation guides, mono depth markers, and accessible treeitem keyboard contracts:

```html
<div class="tree" role="tree" aria-label="Concept Map">
  <div class="tree-node" role="treeitem" aria-expanded="true">
    <div class="tree-row">
      <button class="tree-toggle" aria-label="Toggle node">
        <i data-lucide="chevron-down" class="tree-chevron" aria-hidden="true"></i>
      </button>
      <span class="tree-badge">M1</span>
      <span class="tree-title">Konsep Dasar Sistem Informasi</span>
      <div class="tree-actions">
        <button class="tree-chip">+ KB</button>
      </div>
    </div>
    <div class="tree-children" role="group">
      <div class="tree-node" role="treeitem">
        <div class="tree-row">
          <span class="tree-guide" aria-hidden="true"></span>
          <span class="tree-badge">KB1</span>
          <span class="tree-title">Definisi dan Karakteristik Sistem</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

```css
.tree { display: grid; gap: 2px; font-size: var(--t-sm); }
.tree-node { display: grid; }
.tree-row {
  display: inline-flex; align-items: center; gap: var(--s-2);
  padding: 6px 10px; border-radius: var(--r-sm);
  transition: background-color var(--dur-1) ease, transform var(--dur-1) ease;
  cursor: pointer; user-select: none;
}
.tree-row:hover { background: var(--wash-hover); transform: translateY(-1px); }
.tree-row:focus-visible { outline: none; border-color: var(--accent); box-shadow: var(--focus-ring); }
.tree-toggle {
  background: none; border: none; padding: 0; width: 18px; height: 18px;
  display: grid; place-items: center; cursor: pointer; color: var(--muted);
}
.tree-chevron { transition: transform var(--dur-2) var(--ease); }
.tree-node[aria-expanded="false"] .tree-chevron { transform: rotate(-90deg); }
.tree-badge {
  font-family: var(--f-mono); font-size: var(--t-xs); font-weight: 600;
  padding: 2px 6px; border-radius: var(--r-sm);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent-text); line-height: 1;
}
.tree-title { color: var(--ink); font-weight: 500; }
.tree-actions { margin-left: auto; display: flex; gap: 4px; opacity: 0; transition: opacity var(--dur-1) ease; }
.tree-row:hover .tree-actions { opacity: 1; }
.tree-chip {
  background: var(--surface); border: 1px solid var(--line);
  padding: 2px 8px; border-radius: var(--r-sm); font-size: var(--t-xs);
  color: var(--muted); cursor: pointer;
}
.tree-chip:hover { border-color: var(--line-strong); color: var(--ink); }
.tree-children {
  margin-left: 20px; padding-left: 10px;
  border-left: 1px solid var(--line);
  display: grid; gap: 2px;
}
.tree-node[aria-expanded="false"] > .tree-children { display: none; }
```



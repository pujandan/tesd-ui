# Icons — Lucide (standard), Tabler (alternative)

**No AI-generated or hand-drawn UI icons, ever.** Icons come from a maintained library so stroke weight, cap style, and optical sizing stay consistent. Brand/logo marks (wordmark glyphs) are the only custom SVGs allowed.

## The choice

| | Package (Svelte 5) | License | When |
|---|---|---|---|
| **Standard — Lucide** | `@lucide/svelte` | ISC (free, permissive) | Default. Feather-heritage 2px stroke on a 24px grid — matches the system aesthetic |
| Alternative — Tabler | `@tabler/icons-svelte-runes` | MIT (free) | When Lucide lacks a glyph (5,000+ set) |

Notes:
- The old `lucide-svelte` (Svelte 4) and `@tabler/icons-svelte` (Svelte 3/4) packages are **deprecated** — never install them on TESD projects.
- Pin exact versions in `package.json`.
- Vanilla/no-build pages (like this skill's preview) pin the Lucide UMD via CDN (currently `https://cdn.jsdelivr.net/npm/lucide@1.54.0/dist/umd/lucide.min.js` — never unpinned `@latest` in production) with `<i data-lucide="arrow-right"></i>` placeholders + `lucide.createIcons()`.

## Usage — Svelte 5

```svelte
<script lang="ts">
  import ArrowRight from '@lucide/svelte/icons/arrow-right';
  import CircleAlert from '@lucide/svelte/icons/circle-alert';
</script>

<button class="btn btn-primary">Start free <ArrowRight size={15} aria-hidden="true" /></button>
<span class="field-msg is-error"><CircleAlert size={12} aria-hidden="true" /> Enter a valid email.</span>
```

Tree-shaken per-icon imports; `size` prop sets width/height; color inherits `currentColor` — icons sit on the text color of their context and theme-invert for free.

## Sizes & stroke

| Token context | Size | Use |
|---|---|---|
| `--t-xs` contexts (field messages, cites) | 12 | inline feedback icons |
| buttons, inputs, badges | 14–16 | default inline |
| tiles, empty-state icon, nav actions | 19–20 | feature spots |

Stroke width stays the library default (2 at 24 grid). Never restyle individual icons — consistency is the point.

## Naming (current Lucide)

Renamed glyphs use the **object-first** names: `circle-alert` (not alert-circle), `triangle-alert` (not alert-triangle), `circle-x`. When an icon 404s, check the current name in the Lucide docs.

## Accessibility

- Decorative icons (paired with text): `aria-hidden="true"`.
- Solo icons (icon-only buttons): the BUTTON carries `aria-label`; the icon stays hidden.
- Never convey state by icon alone — pair with text or color+shape.

## CSS exceptions (documented, intentional)

Two icons live as CSS `background-image` data-URIs where an element can't host a child: the select's chevron and positioned decorations. These are the only sanctioned inline SVG-in-CSS spots; everything else is library icons.

## Update protocol for icons

Adding an icon = check Lucide first, Tabler second, and **never** generate one. If both lack it, discuss before drawing — the answer is usually "reword the UI so the icon isn't needed."

# Export & Lock — tokens.css · design.md

## tokens.css (always)

Every project consumes the system through `tokens.css` — generated verbatim from `tesd.css`'s `:root` + `[data-theme="dark"]` blocks (the single source of truth; the file at this skill's root is the reference copy). Regenerate after any foundation change:

```bash
python3 - <<'PY'
import re
src = open('tesd.css').read()
root = re.search(r'(:root \{.*?\n\})', src, re.S).group(1)
dark = re.search(r'(\[data-theme="dark"\] \{.*?\n\})', src, re.S).group(1)
header = "/* tesd/ui tokens — generated from tesd.css; SYSTEM DEFAULTS.\n   PROJECT BUILD STEPS: re-theme the accent (both themes) + pick a font archetype\n   (foundations § Font pairing) before shipping — see export.md § Re-theme on consume */\n\n"
open('tokens.css', 'w').write(header + root + "\n\n" + dark + "\n")
print("tokens.css regenerated successfully.")
PY
```

Import once, globally (SvelteKit: `src/app.css` imported by `+layout.svelte`; static: `<link>`). Projects never retype token values.

## design.md (opt-in lock)

When a project's system is settled, lock it: a `design.md` at the project root recording tokens, principles, and overrides. Subsequent runs defer to it (inverted diversification — pages share the system). Template:

```markdown
# design.md — <project>
Accent: <hex pair, light+dark> · Shell: <App|Docs|Dashboard|Auth>
Tokens: imported from tesd-ui tokens.css @ <version>
Overrides: <project-specific values with reasons>
Motion: <any GSAP recipes used, or "UI states only">
```

## Versioning

Skill versions: minor bump for additions, patch for doc/rename propagation (see SKILL.md Update Protocol). Project design.md records the skill version it consumed.

## Runtime stylesheet — `tesd.css`

Single source for tokens + web UI + content widgets + animations. Section banners keep it subsettable by AI agents; a core/widgets split is generated only at the documented trigger ([content-widgets.md](./components/../content-widgets.md) § One CSS, split-by-need) — never hand-edited apart.

Since v0.10.0 the preview's full token+component CSS lives in `tesd.css` (linked by `index.html` and the gallery pages — one source, zero drift). Projects that want the whole system in one link consume `tesd.css`; token-only integrations still take `tokens.css` and rebuild components per the references.

## Runtime motion script — `tesd-motion.js`

Since v0.19.0 (GSAP-first architecture), rich widget entrances, timelines, and scroll-linked motion live in `tesd-motion.js`.
- **How to ship**: `npm i gsap` and bundle it — GSAP 3.13+ is 100% free since the Webflow acquisition (May 2025), all formerly premium plugins included. Wire it through the bundler bridge in [motion.md § Runtime](./motion.md#runtime--tesd-motionjs) (expose window globals before the runtime's side-effect import); CDN script tags remain acceptable only for no-build static pages and the skill's own preview pages. `tesd-motion.js` ships alongside `tesd.css`.
- **Static guarantee**: Projects that omit `tesd-motion.js` (or in No-JS / Reduced Motion environments) render every widget 100% complete statically via `tesd.css`. Motion is progressive enhancement.

## Scaffolding CLI — `scripts/scaffold.py`

Generate tokens and Svelte 5 component seeds into any project in one command:

```bash
# Full scaffold into your project (app.css, tokens.css, $lib/utils/id.ts, and all Svelte seeds)
python3 scripts/scaffold.py ../my-svelte-app

# Dry-run preview
python3 scripts/scaffold.py ../my-svelte-app --dry-run

# Include standalone tesd.css and tesd-motion.js in static/
python3 scripts/scaffold.py ../my-svelte-app --with-runtime

# Force overwrite existing files
python3 scripts/scaffold.py ../my-svelte-app --force
```

## Quality Gate Audit CLI — `scripts/audit.py`

Run automated 7-gate quality check across the entire design system:

```bash
# Run full audit (CSS braces, token sync, hex discipline, versions, CDNs, seeds, docs)
python3 scripts/audit.py

# Auto-heal tokens drift
python3 scripts/audit.py --fix
```



## Font pairing — per-project tokens (v1.5.0)

`tokens.css` ships the system exemplar pairing (Space Grotesk / Inter / JetBrains Mono). When locking a project, regenerate `--f-display/--f-body/--f-mono` from the chosen archetype (foundations.md § Font pairing contract) and record the choice in the project `design.md`. Faces are project identity; the three-role structure, scale, and weight discipline are not negotiable.

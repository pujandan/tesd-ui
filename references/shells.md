# Page Shells — the composition layer

Tokens, components, and contracts are identical everywhere; **shells are where projects differ**. Five sanctioned starting structures — specified at token scale in the preview's section 09. Shell choice is a per-project brief decision (the context gate + layout gate), never a default.

| Shell | Structure | Grid | Use |
|---|---|---|---|
| **App** | 44px icon rail + content header + card grid | `grid-template-columns: 44px 1fr` | Tools, editors, inboxes — navigation-persistent UIs |
| **Docs** | 96–240px section nav + single article column | `grid-template-columns: 240px minmax(0, 72ch)` | Documentation, knowledge bases, long reading |
| **Dashboard** | top bar + KPI row (4) + chart + table list | `grid-template-rows: auto auto 1fr` | Analytics, overviews, monitoring |
| **Auth** | centered single card | place-items: center | Sign-in / sign-up — one job per screen |
| **Landing** | hero (3 variants) + free section flow + CTA band | section stack via the grid engine | Marketing, product pages, campaigns, booking |

## Rules

- The rail/nav collapses per the responsive map (nav two-tier 979/720; rails become overlays or top rows).
- Section rhythm stays tokenized: `section.block` padding `clamp(64px, 9vw, 112px)`; `sec-head` hairline + mono index pattern.
- A shell is a STARTING structure — projects extend and rearrange within it; that variation is by design (the sameness policy lives in tokens/components, not here).
- Charts inside Dashboard: spark-family washes only (Pattern A/C); data ink uses `--ink` and `--spark-*`.
- **Anti-clone law (rule #27):** `index.html`'s hero is variant A of the SYSTEM PREVIEW, not a default. Pick the variant the brief demands; two different briefs must never produce the same skeleton.

## Landing shell — anatomy (v1.1.0)

The marketing composition layer. Anatomy = **hero variant → section flow (free order) → final CTA band**. Declare both in the layout gate before coding.

### Hero variants (pick ONE per brief — never default)

- **A — Split-media.** Two-column grid (`grid sm:cols-2`, collapses ≤720): text stack (eyebrow · display heading with at most ONE gradient word · sub ≤ 46ch · CTA pair `.btn-lg` · trust row with `live-dot`s) beside a media block (`.fig`, `.browser`, or `.wavecard` — the system preview uses this variant, which is exactly why agents over-clone it).
- **B — Center-stage.** Single centered column `max-width: ~62ch`, display heading · sub · CTA pair · social-proof row (avatars + stat). Background: Pattern A wash. Best for launch/announcement pages.
- **C — Full-bleed.** Edge-to-edge media (`.fig` landscape or ambient `.wc-wash`/meteor layer) with an overlay text block anchored to one side, single CTA. The page's one dramatic moment — use for portfolio/campaign one-pagers.

### Section flow — compose per brief, ORDER IS FREE

- **Features** — `grid auto-260/300` card row; each card = Lucide icon + title + ≤2 lines. 3–6 cards.
- **Packages / pricing** — 3-column cards (`card` + `card-media is-spark` wash + `.badge` delta + feature list + CTA); the recommended tier gets `is-best` ring or `.anim-beam`. Collapses to a stack ≤720.
- **Proof** — `.bench.anim-grow` (comparison), `.quote` (testimonial), or `.statcard.anim-count` trio. Pick ONE, not all.
- **How it works** — `.steps.anim-cascade`, 3–4 steps.
- **FAQ** — `.accordion` list, 4–6 items.
- **Booking / contact** — the booking flow below.
- **Final CTA band** — one full-width wash card, one job: heading + single CTA. Never more than one CTA band per page.

### Booking flow recipe (packages, reservations, consultations)

`.steps` progress (1 package → 2 details → 3 confirm) over a form composed per [forms.md](./components/forms.md): `.field` grid `sm:cols-2` · `.combo` for choice lists · `.datepicker` (native-companion) for departure dates · inline validation with `.field-msg` · a `.checklist` of what's included (`is-cur` on the next actionable step) · `.takeaway` stating what happens after submit · submit → success `.toast`. Cap the form column at 560–720px; never full-width on desktop.

## Wireframe specs

The preview renders each shell as a token-scale wireframe (ink bars, hairlines, one accent item per surface — the active rail icon, the current doc link, the hero CTA). Wireframes are aria-hidden; they are specs, not content.

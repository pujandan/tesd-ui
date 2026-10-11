# Overlays — modal + the animation contract

## The contract (non-negotiable #9)

Every overlay — modal, menu sheet, toast, popover — animates **both directions**:

- **Enter:** slower, staggered. Content rises ~12–14px + fades over ~460ms with 40ms stagger steps; container fades ~320ms.
- **Exit:** faster, un-staggered. Content exits ~180ms; container fades ~260ms; `visibility` is transition-delayed to the exit duration so nothing is clipped mid-flight.
- Enter transitions live on the open-state rule (`.is-open`, `.on`); exit transitions live on the base rule. CSS takes transition values from the **destination** state — that is what makes the two directions differ.
- Dimming scrims: separate `opacity` transition, same token easing.

```css
/* the shape of every overlay */
.overlay {
  opacity: 0; visibility: hidden;
  transition: opacity 260ms var(--ease), visibility 0s 260ms;   /* exit */
}
.overlay.is-open {
  opacity: 1; visibility: visible;
  transition: opacity 320ms var(--ease);                          /* enter */
}
.overlay .overlay-card {
  opacity: 0; transform: translateY(14px) scale(0.97);
  transition: opacity 180ms var(--ease), transform 180ms var(--ease);  /* exit */
}
.overlay.is-open .overlay-card {
  opacity: 1; transform: translateY(0) scale(1);
  transition: opacity 460ms var(--ease), transform 460ms var(--ease);  /* enter (+ stagger delays) */
}
```

## Modal (reference implementation — the delete confirmation)

```css
.scrim {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(17, 17, 19, 0.4);
  -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
  display: grid; place-items: center; padding: var(--s-4);
  opacity: 0; visibility: hidden;
  transition: opacity var(--dur-3) var(--ease), visibility 0s var(--dur-3);
}
.scrim.is-open { opacity: 1; visibility: visible; transition: opacity var(--dur-3) var(--ease); }
.modal {
  width: min(440px, 100%);
  background: var(--surface); border-radius: var(--r-lg);
  box-shadow: var(--shadow-pop); padding: var(--s-6); display: grid; gap: var(--s-3);
  opacity: 0; transform: translateY(14px) scale(0.97);
  transition: opacity var(--dur-3) var(--ease), transform var(--dur-3) var(--ease);
}
.scrim.is-open .modal { opacity: 1; transform: translateY(0) scale(1); }
.modal-foot { display: flex; justify-content: flex-end; gap: var(--s-2); margin-top: var(--s-2); }
```

**Behavior (JS), all mandatory:**

- Open: add `.is-open`, lock `body` overflow, move focus to the first control (~120ms after, so it lands post-animation), remember the trigger.
- Close (three ways): the Cancel/confirm buttons, scrim click (`e.target === scrim`), Escape key. On close: remove class, unlock scroll, **return focus to the trigger**.
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby` on the scrim; title in an `h3`.
- Destructive confirmation footer = ghost Cancel + **filled danger** confirm (contract #7), with consequence copy ("will move to trash… restore for 30 days").

## Menu sheet

See [navigation.md](./navigation.md) — same contract, full-screen variant: container fade 320/260ms, links rise 460ms + 40ms stagger, exit 180ms flat, CTA enters last (+320ms delay). Sheet sits at z-index **below** the nav so the burger stays clickable and morphs into the close X.

## Toasts

See [feedback.md](./feedback.md) — transition-based enter/exit on `.on` (never keyframes; toasts are added rapidly and must retarget mid-flight).

## Drawer — one component, two geometries

Side sheet on desktop (`width: min(400px, 92vw)`, `translateX(100%)` → 0), **bottom sheet on mobile** (≤720px: full width, `max-height: 82vh`, `translateY(100%)`, top-only radius, grab handle). Anatomy: header (title + icon close) → scrollable body → footer (ghost Cancel + primary Apply). Same machinery as the modal: scrim click, Escape, focus in/out, scroll lock, trap.

```css
.drawer { transform: translateX(100%); opacity: 0.6;
  transition: transform 260ms var(--ease), opacity 260ms var(--ease); }        /* exit */
.scrim.is-open .drawer { transform: none; opacity: 1;
  transition: transform 320ms var(--ease), opacity 320ms var(--ease); }        /* enter */
@media (max-width: 720px) {
  .drawer { transform: translateY(100%); }
  .scrim.is-open .drawer { transform: translateY(0); }
}
```

## Dropdown — anchored, trigger-origin

Non-modal (no scrim), z-90. Scales **from its trigger** (`transform-origin: top left`), micro-timings: enter 180ms, exit 140ms. Semantics: trigger `aria-haspopup` + `aria-expanded`; menu `role="menu"`, items `role="menuitem"`, separator `role="separator"`. Keyboard: ArrowUp/Down cycle items, Escape closes and returns focus to the trigger, Enter selects natively. Click-outside closes (document listener). Danger item last, below a separator.

## Command palette — ⌘K

Opens from anywhere (`⌘K`/`Ctrl+K`, toggleable) or a labeled button. Semantics: `role="combobox"` input (`aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant`) over a `role="listbox"` of `role="option"` items with `aria-selected` (roving). Filter as you type (`li.hidden` + "No matches" state), ↑↓ move the active option, ↵ runs it, Esc closes. Items are links (scroll to section) or actions (`data-action` — theme toggle, copy token, toast, open dialog). Focus in on open, returns to trigger on close; Tab trapped.

## Overlay mechanics (rules)

**Overlay open functions must call `closeOverlays()` BEFORE toggling their own class** — it re-enters their close path, and a toggle-first order re-closes what it just opened (reentrancy bug, device-caught).

**Fixed sheets need a transform-free ancestor chain** — any ancestor with a computed transform (even `translateY(0)` identity, or a mid-flight reveal) becomes the containing block and pins the "fixed" sheet inside its card. Guard: `.rv.in` resolves to `transform: none` (never `translateY(0)`).

## Popover anchoring (rule)

Every anchored popover (dropdown menu) must live **inside** its `position: relative` trigger wrapper — never a sibling of it. An unanchored pop resolves to the page-level containing block: it floats to a wrong position, gets covered by unrelated layers (making items unclickable), and reads as broken on device. Verify with `pop.offsetParent === triggerWrapper`.

## Overlay exclusivity (rule)

Opening any overlay **closes the others** — scrims never stack, Escape never cascades. One `closeOverlays()` helper is called at the top of every open function; it closes menu, dropdown, modal, drawer, and palette.

## Layer map

| Layer | z-index | Notes |
|---|---|---|
| Page content | 1 | |
| Nav | 80 | stays above sheets |
| Menu sheet | 70 | under nav — burger morphs |
| Scrim + modal | 100 | |
| Toasts | 110 | above everything |
| Layer | z-index | Notes |
|---|---|---|
| Page content | 1 | |
| Nav | 80 | stays above sheets |
| Menu sheet | 70 | under nav — burger morphs |
| Dropdown | 90 | non-modal, anchored |
| Scrim overlays (modal · drawer · palette) | 100 | exclusive — never stacked |
| Toasts | 110 | above everything |

Reduced motion: all overlay transitions collapse to 1ms (they're listed in the reduced-motion block) — state changes stay instant and readable.

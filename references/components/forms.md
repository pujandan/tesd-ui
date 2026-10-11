# Forms

Inputs share the control scale with buttons (parity contract #5): `.input` = 40px, `.input-lg` = 48px.

## Field anatomy

```html
<label class="field">
  <span class="field-label">Work email <span class="opt">required</span></span>
  <input class="input" type="email" placeholder="you@studio.com" />
  <span class="field-help">Visible to everyone in the workspace.</span>
</label>
```

```css
.field { display: grid; gap: 6px; max-width: 380px; }
.field-label {
  font-size: var(--t-sm); font-weight: 500; color: var(--ink);
  line-height: 20px; /* label 20 + gap 6 = 26 → adjacent button margin-top 26px */
  display: flex; justify-content: space-between; gap: var(--s-3);
}
.field-label .opt { color: var(--muted); font-weight: 400; }
.field-help { font-size: var(--t-xs); color: var(--muted); }
```

## Inputs · selects · textareas

```css
.input, .textarea, .select {
  font-family: var(--f-body); font-size: var(--t-sm); color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line-strong);
  border-radius: var(--r-md);
  padding: 0 14px; height: 40px; width: 100%;
  transition: border-color var(--dur-2) ease, box-shadow var(--dur-2) ease, background-color var(--dur-2) ease;
}
.input-sm, .select-sm { height: 32px; padding: 0 10px; font-size: var(--t-xs); border-radius: var(--r-control-sm); }
.input-lg, .select-lg { height: 48px; border-radius: var(--r-control-lg); font-size: var(--t-body); }

**Control width law** — controls are `width: 100%` of their field container; the container (never the control's neighbors) carries the measure cap. Every form control wrapper (`.field`, `.search`, `.input-affix`, `.dropzone`) caps at **380px on desktop**; alerts cap at 480px; all caps **lift at ≤720px** where controls fill their container — one uniform width per viewport, no ragged right edges (v0.8.2 device lesson: inline `max-width` overrides on individual fields created mixed widths at 563px). Inline forms (input + button row) share the row by flex — that is layout, not a cap.
.textarea { padding: 11px 14px; height: auto; min-height: 96px; resize: vertical; }
.input::placeholder, .textarea::placeholder { color: var(--placeholder); }

.input:hover, .textarea:hover, .select:hover { border-color: var(--ink-2); }
.input:focus-visible, .textarea:focus-visible, .select:focus-visible {
  outline: none; border-color: var(--accent); box-shadow: var(--focus-ring);
}
.input:disabled, .textarea:disabled, .select:disabled {
  background: var(--fill-disabled); color: var(--muted); cursor: not-allowed; border-color: var(--line);
}

/* error / success */
.field.is-error .input, .input.is-error { border-color: var(--error); }
.field.is-error .input:focus { box-shadow: 0 0 0 3px var(--error-soft); }
.field.is-success .input, .input.is-success { border-color: var(--success); }
.field.is-success .input:focus { box-shadow: 0 0 0 3px var(--success-soft); }
```

Native select styled with an inline SVG chevron at `right 14px center`, `padding-right: 38px`, `cursor: pointer`. Search input: leading icon absolutely positioned, `padding-left: 40px`.

## Field messages

```html
<span class="field-msg is-error"><svg …/><span>Enter a valid email address.</span></span>
```

```css
.field-msg { display: flex; align-items: center; gap: 6px; font-size: var(--t-xs); font-weight: 500; }
.field-msg.is-error { color: var(--error); }
.field-msg.is-success { color: var(--success); }
.field-msg svg { width: 12px; height: 12px; flex: none; }
```

**Validation is inline and live** — validate on `input`, never surprise on submit; submit only focuses the first invalid field. Messages sit in an `aria-live="polite"` region.

## Checkbox · radio · switch

Visual companions to hidden native inputs — native semantics and focus stay intact.

```css
.check-row { display: flex; align-items: center; gap: 10px; font-size: var(--t-sm); cursor: pointer; user-select: none; }
.check-row input { position: absolute; opacity: 0; pointer-events: none; }
.check-row .box {
  width: 19px; height: 19px; border-radius: 5px;
  border: 1.5px solid var(--line-strong); background: var(--surface);
  display: grid; place-items: center;
  transition: background-color var(--dur-1) ease, border-color var(--dur-1) ease;
}
.check-row .box svg { width: 11px; height: 11px; color: var(--paper); opacity: 0; transform: scale(0.6);
  transition: opacity var(--dur-1) ease, transform var(--dur-2) var(--ease); }
.check-row input:checked + .box { background: var(--ink); border-color: var(--ink); }
.check-row input:checked + .box svg { opacity: 1; transform: scale(1); }
.check-row input:focus-visible + .box,
.check-row input:focus-visible + .radio-dot,
.switch-row input:focus-visible + .switch {
  outline: none; border-color: var(--accent); box-shadow: var(--focus-ring);
}
```

Radio: same row, `.radio-dot` circle with `::after` dot scaling in on `:checked`. Switch: 40×24 capsule (`--r-full` — anatomy), knob translates 16px on `:checked`, both on `--dur-2 var(--ease)`; reflect an on/off mono state label via JS on `change`.

## Range slider

Native `<input type="range" class="range" />` with token-pure track and thumb styling:

```html
<label class="field">
  <span class="field-label field-aux">Volume <span class="range-val" id="rangeVal" aria-live="polite">50%</span></span>
  <input type="range" class="range" id="rangeInput" min="0" max="100" value="50" />
  <span class="field-help">Custom track + thumb, live token fill</span>
</label>
```

- **Track**: 6px height, `--r-full` anatomy capsule, progressive fill via `linear-gradient(to right, var(--accent) var(--val, 50%), var(--line-strong) var(--val, 50%))`.
- **Thumb**: 20px circle, `--surface` fill with 2px `--ink` border (swaps to `--accent` on hover/active/focus), `--shadow-1`.
- **Focus**: follows Contract #4 (`box-shadow: var(--focus-ring)`).
- **Disabled**: `opacity: 0.4; cursor: not-allowed`.
- **Live sync**: listen to `input` event and update `--val` custom property + value chip text.

## Combobox · Autocomplete

Mobile-safe inline architecture. The suggestions listbox is anchored directly within the `.combo` field wrapper — **zero DOM detachment, zero `layoutPops` floating coordinate scripts, zero mobile geometry splitting**.

```html
<label class="field">
  <span class="field-label">Deploy platform <span class="opt">combobox</span></span>
  <div class="combo" id="comboDemo">
    <div class="combo-control">
      <i data-lucide="search" class="combo-icon" aria-hidden="true"></i>
      <input type="text"
             class="combo-input"
             id="comboInput"
             role="combobox"
             autocomplete="off"
             spellcheck="false"
             aria-autocomplete="list"
             aria-expanded="false"
             aria-controls="comboList"
             placeholder="Search platform…" />
      <button type="button" class="combo-btn combo-clear" id="comboClear" aria-label="Clear selection" tabindex="-1" hidden>
        <i data-lucide="x" aria-hidden="true"></i>
      </button>
      <button type="button" class="combo-btn combo-toggle" id="comboToggle" aria-label="Toggle platform list" tabindex="-1">
        <i data-lucide="chevron-down" class="combo-chevron" aria-hidden="true"></i>
      </button>
    </div>
    <ul class="combo-listbox" id="comboList" role="listbox" aria-label="Deploy platform">
      <li role="option" id="cb-opt-1" class="combo-opt" data-value="cloudflare" aria-selected="false">
        <span class="combo-opt-text">Cloudflare Pages</span>
        <span class="combo-opt-meta">Edge</span>
        <i data-lucide="check" class="combo-opt-check" aria-hidden="true"></i>
      </li>
      <li role="option" id="cb-opt-2" class="combo-opt" data-value="vercel" aria-selected="false">
        <span class="combo-opt-text">Vercel</span>
        <span class="combo-opt-meta">Serverless</span>
        <i data-lucide="check" class="combo-opt-check" aria-hidden="true"></i>
      </li>
      <li class="combo-empty" hidden>No matching platforms</li>
    </ul>
  </div>
  <span class="field-help">Filter-as-you-type, arrow navigation, escape/click-outside dismiss.</span>
</label>
```

- **Control Height & Focus**: 40px height (`.combo-sm` 32px, `.combo-lg` 48px). `:focus-within` and `.combo.is-open` project `var(--focus-ring)` and `--accent` border.
- **Pure CSS Anchoring**: `.combo-listbox` sits at `top: calc(100% + 4px); left: 0; right: 0;` inside `.combo`. It will never drift or detach during virtual keyboard display or momentum scrolling.
- **Mobile Width Law**: Desktop max-width 380px lifts cleanly on `≤720px` to fill container (`max-width: none`).
- **Touch & Scroll Containment**: `overscroll-behavior: contain` and `-webkit-overflow-scrolling: touch` isolate list scrolling from the document body.
- **Keyboard APG Contract**:
  - `ArrowDown` / `ArrowUp`: cycles roving focus through visible items, updates `aria-activedescendant` and `.is-active`, auto-scrolls into view.
  - `Enter`: selects active item, updates input value, sets `aria-selected="true"`, closes listbox.
  - `Escape`: closes listbox and returns focus.
  - Typing: filters items live, opens listbox, clears active index.

## Datepicker · Native Companion & Calendar

Dual-mode mobile-safe architecture. On desktop, provides an anchored token-pure calendar dropdown. On mobile (`≤720px`), delegates seamlessly to the operating system's native date sheet/wheel (`showPicker()`) — **zero geometry splitting, zero coordinate drift, zero virtual keyboard collisions**.

```html
<label class="field">
  <span class="field-label">Scheduled launch <span class="opt">datepicker</span></span>
  <div class="datepicker" id="datepickerDemo">
    <div class="date-control">
      <i data-lucide="calendar" class="date-icon" aria-hidden="true"></i>
      <input type="text"
             class="date-input"
             id="dateInput"
             value="2026-10-15"
             placeholder="YYYY-MM-DD"
             autocomplete="off"
             spellcheck="false"
             aria-haspopup="dialog"
             aria-expanded="false"
             aria-controls="dateCalendar" />
      <input type="date" class="date-native" id="dateNative" value="2026-10-15" aria-hidden="true" tabindex="-1" />
      <button type="button" class="date-btn date-clear" id="dateClear" aria-label="Clear date" tabindex="-1">
        <i data-lucide="x" aria-hidden="true"></i>
      </button>
      <button type="button" class="date-btn date-toggle" id="dateToggle" aria-label="Toggle calendar" tabindex="-1">
        <i data-lucide="calendar" aria-hidden="true"></i>
      </button>
    </div>
    <div class="calendar datepicker-pop" id="dateCalendar" role="dialog" aria-modal="false" aria-label="Choose launch date">
      <div class="cal-head">
        <button type="button" class="cal-nav" aria-label="Previous month"><i data-lucide="chevron-left" aria-hidden="true"></i></button>
        <div class="cal-title">October 2026</div>
        <button type="button" class="cal-nav" aria-label="Next month"><i data-lucide="chevron-right" aria-hidden="true"></i></button>
      </div>
      <div class="cal-weekdays">
        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
      </div>
      <div class="cal-grid" role="grid"></div>
      <div class="cal-foot">
        <button type="button" class="btn btn-ghost btn-sm" id="calTodayBtn">Today</button>
        <button type="button" class="btn btn-ghost btn-sm" id="calClearBtn">Clear</button>
      </div>
    </div>
  </div>
  <span class="field-help">Native OS sheet on mobile; anchored calendar on desktop.</span>
</label>
```

- **Dual-Mode Mechanics**:
  - **Desktop (>720px)**: Inline anchored `.calendar` popover (`top: calc(100% + 4px); left: 0;`), pure CSS relative positioning, month navigation with arrow buttons, day click selection, "Today" quick select, and direct keyboard ISO date typing.
  - **Mobile (≤720px)**: Tapping triggers `.date-native.showPicker()`. The device displays its native Cupertino date wheel (iOS) or Material date dialog (Android), completely bypassing floating geometry bugs.
- **Standalone Calendar Widget**: `.calendar` can also be rendered standalone inside dashboards, drawer sidebars, or modals without the input wrapper.
- **Tokens & Sizing**: Control height 40px (`.datepicker-sm` 32px, `.datepicker-lg` 48px). Day cells 32×32px (`--r-control-sm`), `.is-today` highlighted with `--accent` border, `.is-selected` filled with `--accent` and `--paper` text.
- **Native `<input type="date">` Styling**: Standalone native inputs inherit `.input` token styling with WebKit calendar picker indicator opacity transitions and automatic dark mode adaptation via `color-scheme: dark`.

## Advanced patterns

**Affix (prefix/suffix)** — affixes live inside the control: one border, one height, one focus ring (`:focus-within` carries the ring contract):

```css
.input-affix { display: flex; align-items: stretch; height: 40px; border: 1px solid var(--line-strong);
  border-radius: var(--r-md); background: var(--surface); }
.input-affix .affix { padding: 0 12px; font-family: var(--f-mono); font-size: var(--t-xs); color: var(--muted);
  background: color-mix(in srgb, var(--ink) 3%, transparent); border-right: 1px solid var(--line); }
.input-affix .affix.suffix { border-right: none; border-left: 1px solid var(--line); }
.input-affix input { flex: 1; border: none; background: none; outline: none; min-width: 0; }
.input-affix:focus-within { border-color: var(--accent); box-shadow: var(--focus-ring); }
```

**Character counter** — mono `n / max` on the label row; warns at ≥ 90% (`--warning`), errors at the cap (`--error`); the cap enforces via `maxlength`.

**File upload** — dashed dropzone label (tabbable, `:focus-visible` ring, Enter/Space opens the picker; the native label-click works — never also call `.click()`, it double-opens the dialog). Drag-over highlights (`is-drag`). Chosen files render as removable chips (name · size, X button). Cap the list.

**Error summary** — on failed submit, focus an `is-error` alert listing each invalid field as an anchor link; links jump to the field. Inline live validation stays primary; the summary is the aggregate.

## Inline form (input + button row)

```css
.inline-form { display: flex; gap: var(--s-2); flex-wrap: wrap; align-items: flex-start; }
.inline-form .btn { margin-top: 26px; /* = field-label 20px line + 6px field gap */ }
.inline-form .field { flex: 1; min-width: 260px; }
```

Never magic-number the offset inline — the class owns the label math.

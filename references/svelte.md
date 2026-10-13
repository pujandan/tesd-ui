# Svelte 5 Implementation (TESD stack)

How tesd-ui lands in a SvelteKit project — conforming to both this system and `tesd-stack`'s code-quality rules (English-only, runes, typed Props, PascalCase components, a11y as code quality).

## Model: seeds, not a library

Components are **generated into the project** at `src/lib/components/ui/` from these seeds. The project owns them and may extend them; tokens and behavioral contracts (focus, sizes, overlay animation, 8 states) never fork. Never publish these as a shared npm package — that would create a second source of truth next to the skill.

### Instant Scaffolding

Scaffold tokens (`src/app.css`), utilities (`$lib/utils/id.ts`), and all Svelte 5 seeds directly into your project in one command:

```bash
python3 scripts/scaffold.py ../my-svelte-app
```

## Wiring rules

1. **Tokens live globally, once.** The foundations `:root` block goes into `src/app.css` (imported by `+layout.svelte`), NOT inside scoped component styles. Components reference `var(--…)` freely.
2. **Component styles are scoped** (Svelte default) — no `:global()` except for the toast portal root if used.
3. **Svelte transitions are mount/unmount only.** `transition:fade|fly` is allowed for components entering/leaving the DOM (CSS transitions can't do that), always parameterized with system tokens (`duration: 180`, `easing` from tokens). UI states stay on CSS transitions; choreography stays on GSAP. A `tweened/spring` store for UI state is a violation.
4. **Props are the API.** Typed `interface Props`, sane defaults, callback props (`onConfirm?`) — no `createEventDispatcher` (legacy).
5. **A11y warnings are fixed, never muted** (tesd-stack rule). Labels bound by `id`/`for`, roles wired, focus visible.
6. **Scoped CSS stops at the component boundary.** Elements the template does not own — child-component internals (a Lucide `<svg>`, a wrapper component's `<details>/<summary>`), `{@html}` output — carry no scope hash, so scoped selectors on them silently never match (and Svelte prunes them as "unused"). Style those through the global stylesheet or `:global(...)` anchored on template-owned elements. Diagnostic tell: svelte-check reports *Unused CSS selector* on a selector you just wrote, or the rule simply has no visual effect (case: a scoped chevron rotation on a Lucide icon inside a `<summary>` never fired; the identical rule as `:global` worked).
8. **Navigational rows are real anchors, actions are real buttons.** Never `<div>`/`<li>` with `role="link"` + manual keydown (found: three persistent a11y warnings on a book list). `stopPropagation` belongs on the action button itself, never on a wrapper span around the actions. Components past ~700 lines split along phase seams into orchestrator + phase components + `*-shared.ts` pure helpers.
7. **Runes effects must not chase their own tail.** A `$effect` that calls an async loader reading and writing the same `$state` records those reads as dependencies unless the call is wrapped in `untrack()` — every fetch completion then retriggers the effect, and an error-retry path escalates it into an unbounded refetch storm (observed in production dev logs: 197K requests / 429 wall). Rules: derive the inputs first (`const ids = list.map(...)`), run the loader inside `untrack()`, and never auto-retry failures from a reactive effect — retry only on explicit user action (a button, a force flag).

## Seed — Button.svelte

```svelte
<script lang="ts">
  type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'danger-outline';
  type Size = 'sm' | 'md' | 'lg';

  interface Props {
    variant?: Variant;
    size?: Size;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
    title?: string;
    class?: string;
    onclick?: (e: MouseEvent) => void;
    children?: import('svelte').Snippet;
  }

  let {
    variant = 'primary', size = 'md', type = 'button',
    disabled = false, loading = false, title, class: className = '',
    onclick, children,
  }: Props = $props();

  const variantClass = $derived(`btn-${variant}`);
  const sizeClass = $derived(size === 'md' ? '' : `btn-${size}`);
</script>

<button
  {type}
  class="btn {variantClass} {sizeClass} {className}".trim()
  {title}
  disabled={disabled || loading}
  {onclick}
>
  {#if loading}<span class="spinner s-14 on-ink" aria-hidden="true"></span>{/if}
  {@render children?.()}
</button>

<style>
  /* The Button contract from components/buttons.md — pasted verbatim:
     .btn base, variant/size rules, focus ring, :active scale, :disabled.
     Scoped here; tokens (var(--ink) etc.) resolve from global app.css. */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: var(--s-2);
    font-family: var(--f-body); font-size: var(--t-sm); font-weight: 500; line-height: 1;
    text-decoration: none;
    border-radius: var(--r-control); border: 1px solid transparent;
    padding: 0 20px; height: 40px; cursor: pointer; white-space: nowrap;
    transition: transform var(--dur-1) var(--ease), background-color var(--dur-2) ease,
      border-color var(--dur-2) ease, color var(--dur-2) ease, box-shadow var(--dur-2) ease,
      opacity var(--dur-2) ease;
  }
  .btn:active { transform: scale(0.97); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .btn:focus-visible { outline: none; border-color: var(--accent); box-shadow: var(--focus-ring); }
  .btn-sm { height: 32px; padding: 0 14px; font-size: var(--t-xs); border-radius: var(--r-control-sm); }
  .btn-lg { height: 48px; padding: 0 28px; font-size: var(--t-body); border-radius: var(--r-control-lg); }
  .btn-primary { background: var(--ink); color: var(--paper); }
  .btn-primary:hover { background: var(--ink-hover); }
  .btn-accent { background: var(--accent); color: var(--on-accent); }
  .btn-accent:hover { filter: brightness(1.08); }
  .btn-secondary { background: transparent; color: var(--ink); border-color: var(--line-strong); }
  .btn-secondary:hover { border-color: var(--ink); background: var(--wash-hover); }
  .btn-ghost { background: transparent; color: var(--ink-2); }
  .btn-ghost:hover { background: var(--wash-hover); color: var(--ink); }
  .btn-danger { background: var(--error); color: var(--on-error); }
  .btn-danger:hover { background: var(--error-strong); }
  .btn-danger-outline { background: transparent; color: var(--error); border-color: color-mix(in srgb, var(--error) 35%, transparent); }
  .btn-danger-outline:hover { background: var(--error-soft); border-color: var(--error); }
  .spinner {
    width: 14px; height: 14px; flex: none; border-radius: 50%;
    border: 2px solid rgba(17, 17, 19, 0.15); border-top-color: var(--ink);
    animation: spin 700ms linear infinite;
  }
  .spinner.on-ink { border-color: rgba(255, 255, 255, 0.25); border-top-color: var(--on-accent); }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
```

## Seed — Field.svelte (label + input + help + message)

```svelte
<script lang="ts">
  import { generateId } from '$lib/utils/id'; // kebab-case util file per tesd-stack

  interface Props {
    label: string;
    value?: string;
    placeholder?: string;
    type?: string;
    required?: boolean;
    opt?: string;
    error?: string;
    success?: string;
    help?: string;
    disabled?: boolean;
    onInput?: (value: string) => void;
    children?: import('svelte').Snippet<[{ id: string }]>;
  }

  let {
    label, value = '', placeholder = '', type = 'text', required = false, opt,
    error = '', success = '', help = '', disabled = false, onInput, children,
  }: Props = $props();

  const id = `field-${generateId()}`;
  const stateClass = $derived(error ? 'is-error' : success ? 'is-success' : '');
</script>

<div class="field {stateClass}">
  <label class="field-label" for={id}>
    <span>
      {label}
      {#if required}
        <span class="opt">required</span>
      {:else if opt}
        <span class="opt">{opt}</span>
      {/if}
    </span>
  </label>
  {#if children}
    {@render children({ id })}
  {:else}
    <input {id} {type} class="input" {placeholder} {disabled} {value}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error || success || help ? `${id}-msg` : undefined}
      oninput={(e) => onInput?.(e.currentTarget.value)} />
  {/if}
  {#if error}
    <span class="field-msg is-error" id="{id}-msg" aria-live="polite">{error}</span>
  {:else if success}
    <span class="field-msg is-success" id="{id}-msg" aria-live="polite">{success}</span>
  {:else if help}
    <span class="field-help" id="{id}-msg">{help}</span>
  {/if}
</div>
```

Validation is live on `input` in the page (`onInput`), never a submit surprise — the component only renders state.

## Seed — Switch.svelte (companion pattern)

```svelte
<script lang="ts">
  import { generateId } from '$lib/utils/id';

  interface Props { label: string; checked?: boolean; disabled?: boolean; onChange?: (v: boolean) => void }
  let { label, checked = false, disabled = false, onChange }: Props = $props();
  const id = `sw-${generateId()}`;
</script>

<label class="switch-row" for={id}>
  <input {id} type="checkbox" class="sr-input" {checked} {disabled}
    onchange={(e) => onChange?.(e.currentTarget.checked)} />
  <span class="switch" aria-hidden="true"></span>
  <span>{label}</span>
</label>
```

The hidden-input + visual-companion CSS comes verbatim from `components/forms.md` (focus ring lands on the companion via `:focus-visible + .switch`).

## Seed — Slider.svelte (range input with live fill)

```svelte
<script lang="ts">
  import { generateId } from '$lib/utils/id';

  interface Props {
    label?: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    formatValue?: (v: number) => string;
    onChange?: (v: number) => void;
  }

  let {
    label, value = 50, min = 0, max = 100, step = 1,
    disabled = false, formatValue = (v) => `${v}%`, onChange,
  }: Props = $props();

  const id = `range-${generateId()}`;
  const pct = $derived(Math.round(((value - min) / (max - min)) * 100));
</script>

<div class="field">
  {#if label}
    <div class="field-label-row">
      <label class="field-label" for={id}>{label}</label>
      <span class="range-val" aria-live="polite">{formatValue(value)}</span>
    </div>
  {/if}
  <input
    {id}
    type="range"
    class="range"
    {min}
    {max}
    {step}
    {disabled}
    {value}
    style="--val: {pct}%;"
    oninput={(e) => {
      const v = Number(e.currentTarget.value);
      onChange?.(v);
    }}
  />
</div>
```

## Seed — Accordion.svelte (disclosure with mutual exclusivity)

```svelte
<script lang="ts">
  import ChevronDown from '@lucide/svelte/icons/chevron-down';

  interface Props {
    title: string;
    open?: boolean;
    name?: string; // HTML name attribute for mutually exclusive groups
    children?: import('svelte').Snippet;
  }

  let { title, open = false, name, children }: Props = $props();
</script>

<details class="accordion" {open} {name}>
  <summary class="acc-summary">
    <span>{title}</span>
    <ChevronDown size={16} class="acc-chevron" aria-hidden="true" />
  </summary>
  <div class="acc-content">
    {@render children?.()}
  </div>
</details>
```

## Seed — Combobox.svelte (autocomplete with Svelte 5 Runes)

```svelte
<script lang="ts">
  import Search from '@lucide/svelte/icons/search';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import Check from '@lucide/svelte/icons/check';
  import X from '@lucide/svelte/icons/x';

  export interface ComboItem {
    value: string;
    label: string;
    meta?: string;
  }

  interface Props {
    items: ComboItem[];
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    onchange?: (value: string) => void;
  }

  let {
    items,
    value = $bindable(''),
    placeholder = 'Search...',
    disabled = false,
    onchange
  }: Props = $props();

  let open = $state(false);
  let query = $state('');
  let activeIdx = $state(-1);
  let container: HTMLDivElement | undefined = $state();
  let inputEl: HTMLInputElement | undefined = $state();

  let selectedItem = $derived(items.find((it) => it.value === value));

  let filteredItems = $derived(
    query.trim() === ''
      ? items
      : items.filter((it) =>
          it.label.toLowerCase().includes(query.toLowerCase()) ||
          (it.meta && it.meta.toLowerCase().includes(query.toLowerCase()))
        )
  );

  let activeItem = $derived(activeIdx >= 0 && activeIdx < filteredItems.length ? filteredItems[activeIdx] : undefined);

  function select(item: ComboItem) {
    value = item.value;
    query = '';
    open = false;
    activeIdx = -1;
    onchange?.(item.value);
    inputEl?.focus();
  }

  function clear() {
    value = '';
    query = '';
    activeIdx = -1;
    onchange?.('');
    inputEl?.focus();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        open = true;
        activeIdx = 0;
      } else {
        activeIdx = (activeIdx + 1) % Math.max(1, filteredItems.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        open = true;
        activeIdx = filteredItems.length - 1;
      } else {
        activeIdx = (activeIdx - 1 + filteredItems.length) % Math.max(1, filteredItems.length);
      }
    } else if (e.key === 'Enter') {
      if (open && activeItem) {
        e.preventDefault();
        select(activeItem);
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        open = false;
      }
    }
  }

  function handleWindowClick(e: MouseEvent) {
    if (container && !container.contains(e.target as Node)) {
      open = false;
    }
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div bind:this={container} class="combo" class:is-open={open} class:is-disabled={disabled}>
  <div class="combo-control">
    <Search size={15} class="combo-icon" aria-hidden="true" />
    <input
      bind:this={inputEl}
      type="text"
      class="combo-input"
      role="combobox"
      autocomplete="off"
      spellcheck="false"
      aria-autocomplete="list"
      aria-expanded={open}
      aria-controls="combo-options"
      aria-activedescendant={activeItem ? `opt-${activeItem.value}` : undefined}
      {placeholder}
      {disabled}
      value={open ? query : (selectedItem?.label ?? query)}
      oninput={(e) => {
        query = e.currentTarget.value;
        open = true;
        activeIdx = 0;
      }}
      onfocus={() => {
        if (!disabled) open = true;
      }}
      onkeydown={onKeyDown}
    />
    {#if value || query}
      <button type="button" class="combo-btn combo-clear" aria-label="Clear selection" onclick={clear} tabindex="-1">
        <X size={13} aria-hidden="true" />
      </button>
    {/if}
    <button
      type="button"
      class="combo-btn combo-toggle"
      aria-label="Toggle suggestions"
      tabindex="-1"
      onclick={() => {
        if (!disabled) {
          open = !open;
          inputEl?.focus();
        }
      }}
    >
      <ChevronDown size={15} class="combo-chevron" aria-hidden="true" />
    </button>
  </div>

  <ul id="combo-options" class="combo-listbox" role="listbox" aria-label={placeholder}>
    {#each filteredItems as item, idx (item.value)}
      <li
        id={`opt-${item.value}`}
        role="option"
        class="combo-opt"
        class:is-active={idx === activeIdx}
        aria-selected={item.value === value}
        onclick={() => select(item)}
      >
        <span class="combo-opt-text">{item.label}</span>
        {#if item.meta}
          <span class="combo-opt-meta">{item.meta}</span>
        {/if}
        <Check size={14} class="combo-opt-check" aria-hidden="true" />
      </li>
    {:else}
      <li class="combo-empty">No results found</li>
    {/each}
  </ul>
</div>
```

## Seed — DatePicker.svelte (native companion with Svelte 5 Runes)

```svelte
<script lang="ts">
  import Calendar from '@lucide/svelte/icons/calendar';
  import ChevronLeft from '@lucide/svelte/icons/chevron-left';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import X from '@lucide/svelte/icons/x';

  interface Props {
    value?: string; // ISO format: YYYY-MM-DD
    placeholder?: string;
    disabled?: boolean;
    min?: string;
    max?: string;
    onchange?: (value: string) => void;
  }

  let {
    value = $bindable(''),
    placeholder = 'YYYY-MM-DD',
    disabled = false,
    min,
    max,
    onchange
  }: Props = $props();

  let open = $state(false);
  let container: HTMLDivElement | undefined = $state();
  let nativeInputEl: HTMLInputElement | undefined = $state();
  let inputEl: HTMLInputElement | undefined = $state();

  const now = new Date();
  const initParts = value ? value.split('-') : [];
  const initYear = initParts[0] ? parseInt(initParts[0], 10) : NaN;
  const initMonth = initParts[1] ? parseInt(initParts[1], 10) - 1 : NaN;

  let viewYear = $state(!isNaN(initYear) ? initYear : now.getFullYear());
  let viewMonth = $state(!isNaN(initMonth) && initMonth >= 0 && initMonth <= 11 ? initMonth : now.getMonth());

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ] as const;

  let monthLabel = $derived(`${MONTH_NAMES[viewMonth] ?? ''} ${viewYear}`);

  let todayStr = $derived.by(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  });

  interface CalCell {
    day: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
  }

  let cells = $derived.by(() => {
    const res: CalCell[] = [];
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevDays = new Date(viewYear, viewMonth, 0).getDate();
    const curToday = todayStr;

    for (let p = firstDay - 1; p >= 0; p--) {
      const d = prevDays - p;
      res.push({
        day: d,
        dateStr: '',
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      res.push({
        day: d,
        dateStr: dStr,
        isCurrentMonth: true,
        isToday: dStr === curToday,
        isSelected: dStr === value
      });
    }

    const total = res.length;
    const target = total <= 35 ? 35 : 42;
    for (let n = 1; n <= target - total; n++) {
      res.push({
        day: n,
        dateStr: '',
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    return res;
  });

  function selectDate(dateStr: string) {
    if (!dateStr) return;
    value = dateStr;
    open = false;
    onchange?.(dateStr);
    inputEl?.focus();
  }

  function clearDate() {
    value = '';
    onchange?.('');
    inputEl?.focus();
  }

  function prevMonth() {
    viewMonth--;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear--;
    }
  }

  function nextMonth() {
    viewMonth++;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear++;
    }
  }

  function triggerPicker() {
    if (disabled) return;
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches;
    if (isMobile && nativeInputEl && typeof nativeInputEl.showPicker === 'function') {
      try {
        nativeInputEl.showPicker();
        return;
      } catch {
        // Fallback to inline popover
      }
    }
    open = !open;
  }

  function handleWindowClick(e: MouseEvent) {
    if (container && !container.contains(e.target as Node)) {
      open = false;
    }
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div bind:this={container} class="datepicker" class:is-open={open} class:is-disabled={disabled}>
  <div class="date-control">
    <Calendar size={15} class="date-icon" aria-hidden="true" />
    <input
      bind:this={inputEl}
      type="text"
      class="date-input"
      {placeholder}
      {disabled}
      value={value}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls="datepicker-cal"
      onclick={triggerPicker}
      oninput={(e) => {
        const v = e.currentTarget.value;
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
          value = v;
          onchange?.(v);
        }
      }}
      onkeydown={(e) => {
        if (e.key === 'Escape' && open) {
          e.preventDefault();
          open = false;
        }
      }}
    />
    <input
      bind:this={nativeInputEl}
      type="date"
      class="date-native"
      tabindex="-1"
      aria-hidden="true"
      {min}
      {max}
      value={value}
      onchange={(e) => selectDate(e.currentTarget.value)}
    />
    {#if value}
      <button type="button" class="date-btn date-clear" aria-label="Clear date" onclick={clearDate} tabindex="-1">
        <X size={13} aria-hidden="true" />
      </button>
    {/if}
    <button type="button" class="date-btn date-toggle" aria-label="Toggle calendar" tabindex="-1" onclick={triggerPicker}>
      <Calendar size={15} aria-hidden="true" />
    </button>
  </div>

  <div id="datepicker-cal" class="calendar datepicker-pop" role="dialog" aria-modal="false" aria-label="Calendar">
    <div class="cal-head">
      <button type="button" class="cal-nav" aria-label="Previous month" onclick={prevMonth}>
        <ChevronLeft size={14} aria-hidden="true" />
      </button>
      <div class="cal-title">{monthLabel}</div>
      <button type="button" class="cal-nav" aria-label="Next month" onclick={nextMonth}>
        <ChevronRight size={14} aria-hidden="true" />
      </button>
    </div>
    <div class="cal-weekdays">
      <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
    </div>
    <div class="cal-grid" role="grid">
      {#each cells as cell}
        <button
          type="button"
          class="cal-day"
          class:is-outside={!cell.isCurrentMonth}
          class:is-today={cell.isToday}
          class:is-selected={cell.isSelected}
          disabled={!cell.isCurrentMonth}
          aria-selected={cell.isSelected}
          onclick={() => selectDate(cell.dateStr)}
        >
          {cell.day}
        </button>
      {/each}
    </div>
    <div class="cal-foot">
      <button type="button" class="btn btn-ghost btn-sm" onclick={() => selectDate(todayStr)}>Today</button>
      <button type="button" class="btn btn-ghost btn-sm" onclick={clearDate}>Clear</button>
    </div>
  </div>
</div>
```

## Seed — Modal.svelte (behavior fully encapsulated)

```svelte
<script lang="ts">
  interface Props {
    open: boolean;
    title: string;
    onclose?: () => void; // standard Svelte 5 callback
    on_close?: () => void; // backwards-compatible alias
    children?: import('svelte').Snippet;
    footer?: import('svelte').Snippet;
  }
  let { open, title, onclose, on_close, children, footer }: Props = $props();

  function handleClose() {
    onclose?.();
    on_close?.();
  }

  let panel: HTMLElement | undefined = $state();
  let lastFocus: HTMLElement | null = $state(null);

  $effect(() => {
    if (!open) return;
    lastFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => panel?.querySelector<HTMLElement>('button')?.focus(), 120);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = '';
      lastFocus?.focus();
    };
  });
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape' && open) handleClose(); }} />

{#if open}
  <div class="scrim is-open" role="dialog" aria-modal="true" aria-labelledby="modal-title"
    onclick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
    <div class="modal" bind:this={panel}>
      <h3 id="modal-title">{title}</h3>
      {@render children?.()}
      <div class="modal-foot">{@render footer?.()}</div>
    </div>
  </div>
{/if}
```

Destructive confirmations pass a `footer` snippet with `ghost Cancel + filled danger` buttons. The scrim/modal CSS (both-direction animation, `visibility` delayed on exit) is pasted verbatim from `components/overlays.md`. Because the whole element mounts/unmounts with `{#if}`, the enter animation runs via the `.is-open` class at mount; if an unmount fade is wanted, wrap in `transition:fade={{ duration: 180 }}` per the transition policy.

## Seed — Toaster (toast state in a runes module)

`src/lib/components/ui/toast.svelte.ts` (kebab-case, non-component module):

```ts
export interface Toast { id: number; message: string; kind: 'ok' | 'info' }

let toasts = $state<Toast[]>([]);
let nextId = 0;

export function getToasts() { return toasts; }

export function toast(message: string, kind: Toast['kind'] = 'ok') {
  const id = ++nextId;
  toasts.push({ id, message, kind });
  if (toasts.length > 3) toasts.shift();
  setTimeout(() => { toasts = toasts.filter((t) => t.id !== id); }, 2600);
}
```

`Toaster.svelte` renders the `.toasts` region (`aria-live="polite"`) with each item transitioning in via `transition:fly={{ y: 12, duration: 180 }}`; exit fade handled by the same transition policy. Mounted once in `+layout.svelte`; `toast()` imported anywhere — no stores, no context.

## Seed — Tree.svelte (hierarchical recursive tree with runes)

```svelte
<script lang="ts">
  import ChevronDown from '@lucide/svelte/icons/chevron-down';

  export interface TreeNodeItem {
    id: string;
    label: string;
    badge?: string;
    depth?: number;
    children?: TreeNodeItem[];
    data?: unknown;
  }

  interface Props {
    items: TreeNodeItem[];
    selectedId?: string;
    onselect?: (item: TreeNodeItem) => void;
    onaction?: (action: string, item: TreeNodeItem) => void;
  }

  let { items, selectedId = $bindable(''), onselect, onaction }: Props = $props();

  let expandedMap = $state<Record<string, boolean>>({});

  function isExpanded(id: string): boolean {
    return expandedMap[id] ?? true;
  }

  function toggleExpand(id: string, e: MouseEvent) {
    e.stopPropagation();
    expandedMap[id] = !isExpanded(id);
  }

  function handleSelect(item: TreeNodeItem) {
    selectedId = item.id;
    onselect?.(item);
  }
</script>

{#snippet renderNode(item: TreeNodeItem)}
  {@const hasChildren = Boolean(item.children && item.children.length > 0)}
  {@const expanded = isExpanded(item.id)}
  {@const isSelected = item.id === selectedId}

  <div
    class="tree-node"
    role="treeitem"
    aria-expanded={hasChildren ? expanded : undefined}
    aria-selected={isSelected}
  >
    <div
      class="tree-row"
      class:is-selected={isSelected}
      tabindex="0"
      onclick={() => handleSelect(item)}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect(item);
        }
      }}
    >
      {#if hasChildren}
        <button
          type="button"
          class="tree-toggle"
          aria-label="Toggle node"
          onclick={(e) => toggleExpand(item.id, e)}
        >
          <ChevronDown size={14} class="tree-chevron" aria-hidden="true" />
        </button>
      {:else}
        <span class="tree-toggle-spacer" aria-hidden="true"></span>
      {/if}

      {#if item.badge}
        <span class="tree-badge">{item.badge}</span>
      {/if}

      <span class="tree-title">{item.label}</span>

      <div class="tree-actions">
        <button
          type="button"
          class="tree-chip"
          onclick={(e) => {
            e.stopPropagation();
            onaction?.('add', item);
          }}
        >
          + Sub
        </button>
      </div>
    </div>

    {#if hasChildren && expanded}
      <div class="tree-children" role="group">
        {#each item.children! as child (child.id)}
          {@render renderNode(child)}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<div class="tree" role="tree" aria-label="Hierarchy Tree">
  {#each items as rootItem (rootItem.id)}
    {@render renderNode(rootItem)}
  {/each}
</div>

<style>
  .tree-toggle-spacer { width: 18px; height: 18px; flex: none; }
  .tree-row.is-selected {
    background: var(--accent-soft);
  }
</style>
```

## GSAP Motion in Svelte (onMount + gsap.context revert)

Choreography and widget animations in Svelte components use `gsap.context()` inside `onMount`. This scopes all selector queries to the component root and ensures complete cleanup on unmount (`ctx.revert()` kills tweens, ScrollTriggers, and clears inline styles):

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';

  let container: HTMLElement | undefined = $state();

  onMount(() => {
    if (!container) return;

    // Scope GSAP tweens and ScrollTriggers to this component DOM subtree
    const ctx = gsap.context(() => {
      // 1. Scan and activate tesd-motion.js runtime widgets if present:
      if (typeof window !== 'undefined' && (window as any).TesdMotion) {
        (window as any).TesdMotion.scan(container);
      }

      // 2. Or bespoke component-level GSAP timelines:
      gsap.from('.anim-item', {
        opacity: 0,
        y: 16,
        duration: 0.7,
        ease: 'tesd',
        stagger: 0.08,
        clearProps: 'transform,opacity'
      });
    }, container);

    // Clean up on component unmount to prevent leaks and reset DOM
    return () => ctx.revert();
  });
</script>

<div bind:this={container} class="widget-wrapper">
  <div class="anim-item">...</div>
</div>
```

Rule: **Always return `ctx.revert()` from `onMount`.** Never attach global un-scoped tweens or orphaned ScrollTriggers inside components.

## Generation checklist (per project)

- [ ] Foundations `:root` pasted verbatim into `src/app.css`; fonts loaded in `app.html`
- [ ] Seeds generated into `src/lib/components/ui/` (PascalCase), CSS contracts pasted verbatim from the matching reference — then left project-owned
- [ ] No component redefines token values; no `:global()` escapes beyond the toast portal
- [ ] Svelte transitions only at mount/unmount, token-parameterized
- [ ] All Props typed, callbacks as function props, English-only identifiers
- [ ] Quality gates (quality-gates.md) run on the generated set

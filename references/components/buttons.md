# Buttons

One family, five variants, three sizes, eight states. Heights share the control scale with inputs (32/40/48 — parity contract).

## Base + sizes

```css
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--s-2);
  font-family: var(--f-body); font-size: var(--t-sm); font-weight: 500; line-height: 1;
  text-decoration: none;
  border-radius: var(--r-control); border: 1px solid transparent;
  padding: 0 20px; height: 40px; width: fit-content;
  cursor: pointer; white-space: nowrap;
  transition:
    transform var(--dur-1) var(--ease),
    background-color var(--dur-2) ease,
    border-color var(--dur-2) ease,
    color var(--dur-2) ease,
    box-shadow var(--dur-2) ease,
    opacity var(--dur-2) ease;
}
.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

.btn-sm  { height: 32px; padding: 0 14px; font-size: var(--t-xs); border-radius: var(--r-control-sm); }
.btn-lg  { height: 48px; padding: 0 28px; font-size: var(--t-body); border-radius: var(--r-control-lg); }
.btn-icon { width: 40px; height: 40px; padding: 0; border-radius: var(--r-control); }
.btn-block { width: 100%; display: flex; }
```

## Variants

```css
.btn-primary { background: var(--ink); color: var(--paper); }
.btn-primary:hover { background: var(--ink-hover); }

.btn-accent { background: var(--accent); color: var(--on-accent); }
.btn-accent:hover { filter: brightness(1.08); }

.btn-secondary { background: transparent; color: var(--ink); border-color: var(--line-strong); }
.btn-secondary:hover { border-color: var(--ink); background: var(--wash-hover); }

.btn-ghost { background: transparent; color: var(--ink-2); }
.btn-ghost:hover { background: var(--wash-hover); color: var(--ink); }

/* Danger — contract #7: filled for confirmations, outline for row-level */
.btn-danger { background: var(--error); color: var(--on-error); }
.btn-danger:hover { background: var(--error-strong); }
.btn-danger-outline { background: transparent; color: var(--error); border-color: color-mix(in srgb, var(--error) 35%, transparent); }
.btn-danger-outline:hover { background: var(--error-soft); border-color: var(--error); }
```

## Focus (contract #4)

```css
.btn:focus-visible {
  outline: none;
  border-color: var(--accent);
  box-shadow: var(--focus-ring);
}
```

## The 8-state contract

Every variant ships: **default · hover · focus-visible · active · disabled · loading · error · success**. Demo/showcase pages force states with companion classes (`.is-hover`, `.is-focus`, `.is-error`) that duplicate the pseudo-class selectors so all states render at once:

```css
.btn-secondary:hover, .btn-secondary.is-hover { border-color: var(--ink); background: var(--wash-hover); }
.btn:focus-visible, .btn.is-focus { outline: none; border-color: var(--accent); box-shadow: var(--focus-ring); }
.btn.is-error { border-color: var(--error); color: var(--error); }
.btn-primary.is-error { background: var(--error); color: var(--on-error); border-color: transparent; }
```

Loading pairs the button with the spinner + present-tense label ("Saving…"); error pairs with an alert icon + failure label ("Failed"); success swaps to a check icon + past-tense label ("Saved") and fires a quiet toast.

## Spinner — ring style (final; blades were reverted, do not reintroduce)

```css
.spinner {
  width: 18px; height: 18px; flex: none;
  border-radius: 50%;
  border: 2px solid rgba(17, 17, 19, 0.15);
  border-top-color: var(--ink);
  animation: spin 700ms linear infinite;
}
.spinner.on-ink { border-color: rgba(255, 255, 255, 0.25); border-top-color: var(--on-accent); }
.spinner.s-14 { width: 14px; height: 14px; }
.spinner.s-24 { width: 24px; height: 24px; }
.spinner.s-30 { width: 30px; height: 30px; border-width: 3px; }
@keyframes spin { to { transform: rotate(360deg); } }
```

In buttons: `<span class="spinner s-14 on-ink" aria-hidden="true"></span>Saving…` — classes only, never inline border overrides. Reduced motion slows the spin to 1.6s (status indicators keep animating, slower).

# Feedback

Quiet by default — noise is a bug. Feedback comes in four kinds: status (progress/spinner/skeleton), completion (toast, success states), warning (staleness, review-due), error (sync/validation failures).

## Alerts

```css
.alert {
  display: flex; gap: var(--s-3); align-items: flex-start;
  border: 1px solid var(--line); border-radius: var(--r-md);
  background: var(--surface); padding: var(--s-3) var(--s-4);
  font-size: var(--t-sm); color: var(--ink-2); max-width: 480px;
}
.alert b { color: var(--ink); font-weight: 600; }
.alert svg { width: 16px; height: 16px; flex: none; margin-top: 2px; }
.alert.is-info    { border-color: color-mix(in srgb, var(--accent) 35%, transparent); }  /* icon: var(--accent-text) */
.alert.is-success { border-color: color-mix(in srgb, var(--success) 35%, transparent); background: var(--success-soft); }
.alert.is-warning { border-color: color-mix(in srgb, var(--warning) 35%, transparent); background: var(--warning-soft); }
.alert.is-error   { border-color: color-mix(in srgb, var(--error) 35%, transparent); background: var(--error-soft); }
```

The `max-width: 480px` is the banner readability measure — it applies on desktop and **lifts at ≤720px** where alerts fill their container (width law, [forms.md](./forms.md) § Control width law / SKILL.md #22).

Copy shape: bold lead ("Heads up." / "Deployed." / "Stale page." / "Sync failed.") + one sentence with the next step or the auto-recovery behavior.

## Toasts

Fixed bottom-right (full-width on mobile), stacking, auto-dismiss 2.6s, capped at 3 visible. **Four kinds** — `ok` (check, `--success-on-ink`) · `info` (info, `--info-on-ink`) · `warning` (triangle-alert, `--warning-on-ink`) · `error` (x, `--error-on-ink`); `toast(msg, kind)` maps kind → icon + class, unknown kinds fall back to info, and trigger buttons pass `data-toast-kind` straight through. **CSS transitions own enter/exit** (interruptible — rapidly added toasts retarget smoothly, keyframes would restart).

```css
.toasts { position: fixed; right: var(--s-5); bottom: var(--s-5); z-index: 110; display: grid; gap: var(--s-2); }
.toast {
  display: flex; align-items: center; gap: 10px;
  background: var(--ink); color: var(--paper);
  font-size: var(--t-sm); font-weight: 450; padding: 12px 16px;
  border-radius: var(--r-md); box-shadow: var(--shadow-pop); max-width: 340px;
  opacity: 0; transform: translateY(12px) scale(0.98);
  transition: opacity var(--dur-3) var(--ease), transform var(--dur-3) var(--ease);
}
.toast.on { opacity: 1; transform: translateY(0) scale(1); }
.toast .t-ok { color: var(--success-on-ink); }
.toast .t-info { color: var(--info-on-ink); }
```

JS pattern: append → double `requestAnimationFrame` → add `.on`; dismiss = remove `.on`, remove node after 260ms. Container is `aria-live="polite"`. Two flavors only: ok, info.

## Tooltip

```css
.tooltip-host { position: relative; display: inline-flex; }
.tooltip {
  position: absolute; bottom: calc(100% + 10px); left: 50%;
  transform: translateX(-50%) translateY(4px);
  background: var(--ink); color: var(--paper);
  font-size: var(--t-xs); font-weight: 500;
  max-width: 200px; white-space: normal; text-align: center;  /* wraps — never off-screen */
  padding: 6px 11px; border-radius: var(--r-sm);
  opacity: 0; pointer-events: none;
  transition: opacity var(--dur-2) ease, transform var(--dur-2) var(--ease);
}
.tooltip-host:hover .tooltip, .tooltip-host:focus-within .tooltip {
  opacity: 1; transform: translateX(-50%) translateY(0);
}
```

## Progress · skeleton

```css
.progress { width: 100%; height: 6px; background: rgba(17, 17, 19, 0.08);
  border-radius: var(--r-full); overflow: hidden; }  /* bar — anatomy capsule */
.progress i { display: block; height: 100%; width: 64%; background: var(--accent);
  border-radius: var(--r-full); transition: width var(--dur-3) var(--ease); }
```

Tween width changes with GSAP when available (`gsap.to(bar, { width: pct + "%", duration: 0.5, ease: "power2.out" })`); label text updates in the same step.

```css
.skeleton {
  border-radius: var(--r-md);
  background: linear-gradient(100deg, rgba(17,17,19,0.06) 40%, rgba(17,17,19,0.11) 50%, rgba(17,17,19,0.06) 60%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}
@keyframes shimmer { to { background-position: -200% 0; } }
```

Reduced motion: shimmer and spinner slow to 1.6–2.4s rather than stopping (they carry status information).

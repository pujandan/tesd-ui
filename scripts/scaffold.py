#!/usr/bin/env python3
"""
tesd-ui Svelte 5 Seed Scaffolder
Extracts design tokens, utilities, and production-tested Svelte 5 seeds from
the tesd-ui design system into an existing or new project directory.

Usage:
  python3 scripts/scaffold.py <target_directory> [options]

Examples:
  python3 scripts/scaffold.py ./my-app
  python3 scripts/scaffold.py ./my-app --tokens-only
  python3 scripts/scaffold.py ./my-app --seeds-only
  python3 scripts/scaffold.py ./my-app --with-runtime --force
  python3 scripts/scaffold.py ./my-app --dry-run
"""

import sys
import os
import re
import argparse
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
SVELTE_MD = SKILL_DIR / "references" / "svelte.md"
TOKENS_CSS = SKILL_DIR / "tokens.css"
TESD_CSS = SKILL_DIR / "tesd.css"
TESD_MOTION_JS = SKILL_DIR / "tesd-motion.js"

COLORS = {
    "GREEN": "\033[92m",
    "CYAN": "\033[96m",
    "YELLOW": "\033[93m",
    "RED": "\033[91m",
    "RESET": "\033[0m",
    "BOLD": "\033[1m",
    "DIM": "\033[2m",
}

ID_UTIL_SOURCE = """// $lib/utils/id.ts — Fast, zero-dependency monotonic ID generator for form controls
let counter = 0;

export function generateId(prefix = ''): string {
  counter = (counter + 1) & 0xfffffff;
  const rand = Math.random().toString(36).substring(2, 7);
  return prefix ? `${prefix}-${rand}-${counter}` : `${rand}-${counter}`;
}
"""

TOASTER_SVELTE_SOURCE = """<!-- $lib/components/ui/Toaster.svelte — Accessible live toast region with Svelte 5 fly transitions -->
<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { getToasts } from './toast.svelte';

  const toasts = getToasts();
</script>

<div class="toasts" aria-live="polite" role="region" aria-label="Notifications">
  {#each toasts as t (t.id)}
    <div
      class="toast {t.kind === 'info' ? 'toast-info' : ''}"
      in:fly={{ y: 12, duration: 180 }}
      out:fade={{ duration: 140 }}
    >
      <span class="live-dot" aria-hidden="true"></span>
      <span class="toast-msg">{t.message}</span>
    </div>
  {/each}
</div>

<style>
  .toasts {
    position: fixed;
    bottom: var(--s-6, 24px);
    right: var(--s-6, 24px);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: var(--s-2, 8px);
    pointer-events: none;
    max-width: 380px;
    width: calc(100vw - 32px);
  }
  .toast {
    pointer-events: auto;
    display: inline-flex;
    align-items: center;
    gap: var(--s-3, 12px);
    padding: 10px 16px;
    background: var(--surface, #ffffff);
    color: var(--ink, #111113);
    border: 1px solid var(--line, rgba(17, 17, 19, 0.12));
    border-radius: var(--r-control, 8px);
    box-shadow: var(--shadow-pop, 0 4px 10px rgba(0, 0, 0, 0.1));
    font-family: var(--f-body, system-ui, sans-serif);
    font-size: var(--t-sm, 0.875rem);
    line-height: 1.4;
  }
  .toast-info {
    border-color: var(--accent, #4285f4);
  }
  .toast-msg {
    flex: 1;
  }
  :global([data-theme="dark"]) .toast {
    background: var(--surface, #1b1b1f);
    color: var(--ink, #f4f4f5);
    border-color: var(--line, rgba(244, 244, 245, 0.12));
  }
</style>
"""

def extract_seeds_from_markdown(md_path: Path):
    if not md_path.exists():
        raise FileNotFoundError(f"Missing {md_path}")
    
    content = md_path.read_text(encoding="utf-8")
    pattern = re.compile(r"## Seed — ([^\n]+)\n+(.*?)(?=## |\Z)", re.S)
    
    seeds = {}
    for match in pattern.finditer(content):
        header = match.group(1).strip()
        body = match.group(2)
        code_match = re.search(r"```(?:svelte|ts)\n(.*?)```", body, re.S)
        if not code_match:
            continue
        code = code_match.group(1).strip() + "\n"
        
        # Determine target file name
        if "Button.svelte" in header:
            seeds["Button.svelte"] = code
        elif "Field.svelte" in header:
            seeds["Field.svelte"] = code
        elif "Switch.svelte" in header:
            seeds["Switch.svelte"] = code
        elif "Slider.svelte" in header:
            seeds["Slider.svelte"] = code
        elif "Accordion.svelte" in header:
            seeds["Accordion.svelte"] = code
        elif "Combobox.svelte" in header:
            seeds["Combobox.svelte"] = code
        elif "DatePicker.svelte" in header:
            seeds["DatePicker.svelte"] = code
        elif "Modal.svelte" in header:
            seeds["Modal.svelte"] = code
        elif "Tree.svelte" in header:
            seeds["Tree.svelte"] = code
        elif "Toaster" in header or "toast.svelte.ts" in header:
            seeds["toast.svelte.ts"] = code
            
    # Add companion Toaster.svelte component
    seeds["Toaster.svelte"] = TOASTER_SVELTE_SOURCE
    return seeds

def scaffold(target_dir: Path, tokens_only=False, seeds_only=False, with_runtime=False, force=False, dry_run=False):
    print(f"\n{COLORS['BOLD']}tesd-ui Scaffolding Generator{COLORS['RESET']}")
    print(f"{COLORS['DIM']}Source skill: {SKILL_DIR}{COLORS['RESET']}")
    print(f"Target directory: {COLORS['CYAN']}{target_dir.resolve()}{COLORS['RESET']}\n")
    
    written = []
    skipped = []
    
    def write_file(dest: Path, content: str):
        if dest.exists() and not force:
            skipped.append(dest)
            print(f"  {COLORS['YELLOW']}[SKIP]{COLORS['RESET']} {dest.relative_to(target_dir)} (file exists, use --force to overwrite)")
            return
        if not dry_run:
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(content, encoding="utf-8")
        written.append(dest)
        status = "[DRY-RUN]" if dry_run else "[WRITE]"
        print(f"  {COLORS['GREEN']}{status}{COLORS['RESET']} {dest.relative_to(target_dir)}")

    # 1. Tokens and CSS Foundations
    if not seeds_only:
        tokens_content = TOKENS_CSS.read_text(encoding="utf-8")
        full_css = TESD_CSS.read_text(encoding="utf-8")
        # Standard SvelteKit layout puts styles into src/app.css
        # (full tokens + foundation + components by default, or tokens-only if flagged)
        app_css = target_dir / "src" / "app.css"
        write_file(app_css, tokens_content if tokens_only else full_css)
        
        # Also provide standalone tokens.css
        tokens_dest = target_dir / "src" / "tokens.css"
        write_file(tokens_dest, tokens_content)

        if with_runtime:
            runtime_css = target_dir / "static" / "tesd.css"
            write_file(runtime_css, TESD_CSS.read_text(encoding="utf-8"))
            runtime_js = target_dir / "static" / "tesd-motion.js"
            write_file(runtime_js, TESD_MOTION_JS.read_text(encoding="utf-8"))

            # Exclude static/ from tsconfig.json so browser JS runtime isn't typechecked by TS
            tsconfig_file = target_dir / "tsconfig.json"
            if tsconfig_file.exists() and not dry_run:
                try:
                    import json
                    ts_content = tsconfig_file.read_text(encoding="utf-8")
                    ts_data = json.loads(ts_content)
                    exclude_items = ts_data.get("exclude", [])
                    if "static" not in exclude_items:
                        exclude_items.append("static")
                        ts_data["exclude"] = exclude_items
                        tsconfig_file.write_text(json.dumps(ts_data, indent=2) + "\n", encoding="utf-8")
                        print(f"  {COLORS['GREEN']}[UPDATE]{COLORS['RESET']} tsconfig.json (excluded 'static' from typecheck)")
                except Exception as e:
                    print(f"  {COLORS['YELLOW']}[WARN]{COLORS['RESET']} Could not update tsconfig.json: {e}")

    # 2. Svelte 5 Seeds & Utilities
    if not tokens_only:
        seeds = extract_seeds_from_markdown(SVELTE_MD)
        ui_dir = target_dir / "src" / "lib" / "components" / "ui"
        utils_dir = target_dir / "src" / "lib" / "utils"
        
        # Write id utility
        id_util_path = utils_dir / "id.ts"
        write_file(id_util_path, ID_UTIL_SOURCE)
        
        # Write Svelte components
        for filename, code in sorted(seeds.items()):
            file_path = ui_dir / filename
            write_file(file_path, code)

    print(f"\n{COLORS['BOLD']}Summary:{COLORS['RESET']}")
    print(f"  Files created/updated: {len(written)}")
    if skipped:
        print(f"  Files skipped (existed): {len(skipped)}")
    
    if not dry_run:
        print(f"\n{COLORS['GREEN']}✓ Scaffolding complete!{COLORS['RESET']}")
        print(f"\n{COLORS['BOLD']}Next Steps for SvelteKit:{COLORS['RESET']}")
        print(f"  1. Ensure `import '../app.css';` is in `src/routes/+layout.svelte`")
        print(f"  2. Add fonts to `src/app.html` (Space Grotesk, Inter, JetBrains Mono)")
        print(f"  3. Mount `<Toaster />` inside `src/routes/+layout.svelte` if using notifications")
        print(f"  4. Import components in your routes: `import Button from '$lib/components/ui/Button.svelte';`")
        print(f"  5. Install icon dependency: `npm install -D @lucide/svelte`")
        print(f"  6. Install motion engine: `npm i gsap` (100% free since the Webflow acquisition) — wire via the bundler bridge in references/motion.md § Runtime (expose window globals before tesd-motion.js)")
        print(f"\n{COLORS['YELLOW']}⚠️  Note: Svelte 5 seed components (Combobox, DatePicker, Accordion, Tree) require @lucide/svelte. Run: npm install -D @lucide/svelte{COLORS['RESET']}")

def main():
    parser = argparse.ArgumentParser(description="Scaffold tesd-ui tokens and Svelte 5 seeds into a project")
    parser.add_argument("target", nargs="?", default=".", help="Target project directory (default: current directory)")
    parser.add_argument("--tokens-only", action="store_true", help="Only scaffold tokens.css and src/app.css")
    parser.add_argument("--seeds-only", action="store_true", help="Only scaffold Svelte 5 seeds and utils")
    parser.add_argument("--with-runtime", action="store_true", help="Also scaffold full tesd.css and tesd-motion.js into static/")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    parser.add_argument("--dry-run", action="store_true", help="Preview file generation without writing")
    
    args = parser.parse_args()
    target_path = Path(args.target).resolve()
    
    try:
        scaffold(
            target_dir=target_path,
            tokens_only=args.tokens_only,
            seeds_only=args.seeds_only,
            with_runtime=args.with_runtime,
            force=args.force,
            dry_run=args.dry_run
        )
    except Exception as e:
        print(f"\n{COLORS['RED']}Error during scaffolding:{COLORS['RESET']} {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

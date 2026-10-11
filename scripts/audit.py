#!/usr/bin/env python3
"""
scripts/audit.py — tesd-ui Automated Quality Gate & Drift Audit Script

Verifies:
1. CSS Braces & Syntax in tesd.css
2. Token Sync between tesd.css and tokens.css
3. Hex Color Discipline (no rogue hex in component rules)
4. Version Synchronization across SKILL.md, HTML preview badges, tesd-motion.js, ROADMAP.md, PROGRESS.md
5. CDN Pinning (Lucide pinned, no @latest)
6. Svelte 5 Seed Inventory in references/svelte.md
7. Reference Documentation Coverage
"""

import sys
import re
import os
from pathlib import Path

# Paths
ROOT = Path(__file__).resolve().parent.parent
TESD_CSS = ROOT / "tesd.css"
TOKENS_CSS = ROOT / "tokens.css"
SKILL_MD = ROOT / "SKILL.md"
INDEX_HTML = ROOT / "index.html"
WIDGETS_HTML = ROOT / "widgets.html"
DECK_HTML = ROOT / "deck.html"
TESD_MOTION_JS = ROOT / "tesd-motion.js"
ROADMAP_MD = ROOT / "ROADMAP.md"
PROGRESS_MD = ROOT / "PROGRESS.md"
SVELTE_MD = ROOT / "references" / "svelte.md"
FORMS_MD = ROOT / "references" / "components" / "forms.md"
DATA_MD = ROOT / "references" / "components" / "data.md"

COLORS = {
    "GREEN": "\033[92m",
    "RED": "\033[91m",
    "YELLOW": "\033[93m",
    "BLUE": "\033[94m",
    "RESET": "\033[0m",
    "BOLD": "\033[1m"
}

def log_pass(msg):
    print(f"  {COLORS['GREEN']}✓ PASS{COLORS['RESET']} {msg}")

def log_fail(msg):
    print(f"  {COLORS['RED']}✗ FAIL{COLORS['RESET']} {msg}")

def log_warn(msg):
    print(f"  {COLORS['YELLOW']}! WARN{COLORS['RESET']} {msg}")

def audit_css_braces():
    print(f"\n{COLORS['BOLD']}[1/8] CSS Braces & Syntax Check{COLORS['RESET']}")
    if not TESD_CSS.exists():
        log_fail("tesd.css does not exist")
        return False
    
    content = TESD_CSS.read_text(encoding="utf-8")
    opens = content.count("{")
    closes = content.count("}")
    
    if opens == closes:
        log_pass(f"tesd.css braces balanced ({opens} opens, {closes} closes)")
        return True
    else:
        log_fail(f"tesd.css brace mismatch: {opens} opens vs {closes} closes (delta: {opens - closes})")
        return False

def audit_token_sync(fix=False):
    print(f"\n{COLORS['BOLD']}[2/8] Token Sync (tesd.css <-> tokens.css){COLORS['RESET']}")
    if not TESD_CSS.exists() or not TOKENS_CSS.exists():
        log_fail("tesd.css or tokens.css missing")
        return False
    
    css_src = TESD_CSS.read_text(encoding="utf-8")
    tokens_src = TOKENS_CSS.read_text(encoding="utf-8")
    
    root_match = re.search(r'(:root \{.*?\n\})', css_src, re.S)
    dark_match = re.search(r'(\[data-theme="dark"\] \{.*?\n\})', css_src, re.S)
    
    if not root_match or not dark_match:
        log_fail("Could not locate :root or [data-theme='dark'] in tesd.css")
        return False
    
    css_root = root_match.group(1).strip()
    css_dark = dark_match.group(1).strip()
    
    tok_root_match = re.search(r'(:root \{.*?\n\})', tokens_src, re.S)
    tok_dark_match = re.search(r'(\[data-theme="dark"\] \{.*?\n\})', tokens_src, re.S)
    
    expected_header = "/* tesd/ui tokens — generated from tesd.css (the single source of truth) */\n\n"
    canonical_tokens = expected_header + root_match.group(1) + "\n\n" + dark_match.group(1) + "\n"

    if tok_root_match and tok_dark_match:
        tok_root = tok_root_match.group(1).strip()
        tok_dark = tok_dark_match.group(1).strip()
        if css_root == tok_root and css_dark == tok_dark:
            log_pass("tokens.css is 100% synchronized with tesd.css tokens")
            return True
            
    if fix:
        TOKENS_CSS.write_text(canonical_tokens, encoding="utf-8")
        log_pass("tokens.css was regenerated and synchronized successfully (--fix)")
        return True
    else:
        log_fail("tokens.css has drifted from tesd.css. Run with --fix or python3 scripts/audit.py --fix")
        return False

def audit_hex_discipline():
    print(f"\n{COLORS['BOLD']}[3/8] Hex Color Discipline in Component CSS{COLORS['RESET']}")
    content = TESD_CSS.read_text(encoding="utf-8")
    
    # Strip the token blocks (:root and [data-theme="dark"])
    css_without_tokens = re.sub(r':root\s*\{.*?\n\}', '', content, flags=re.S)
    css_without_tokens = re.sub(r'\[data-theme="dark"\]\s*\{.*?\n\}', '', css_without_tokens, flags=re.S)
    
    # Look for hex color literals: #abc, #aabbcc, etc.
    hex_pattern = re.compile(r'#[0-9a-fA-F]{3,8}\b')
    
    lines = css_without_tokens.split("\n")
    violations = []
    
    for i, line in enumerate(lines, start=1):
        # Ignore comments
        clean_line = re.sub(r'/\*.*?\*/', '', line)
        matches = hex_pattern.findall(clean_line)
        for m in matches:
            # Allow documented exceptions:
            # 1. url(data:...) SVG data
            # 2. CSS mask/mask-image gradients where black (#000) specifies pure opaque alpha
            # 3. Explicitly documented knob white (#fff) for invariant physical toggle switch
            if "data:image" in line or "url(" in line:
                continue
            if "mask" in line:
                continue
            if m.lower() in ("#fff", "#ffffff") and ("knob" in line or "iOS-like" in line):
                continue
            violations.append((i, m, line.strip()))
    
    if not violations:
        log_pass("Zero unauthorized raw hex colors found in component CSS")
        return True
    else:
        for line_num, color, context in violations[:5]:
            log_fail(f"Line {line_num}: Raw hex '{color}' in: {context[:60]}...")
        if len(violations) > 5:
            log_fail(f"... and {len(violations) - 5} more violations.")
        return False

def audit_version_sync():
    print(f"\n{COLORS['BOLD']}[4/8] Version Synchronization Across Codebase{COLORS['RESET']}")
    
    # Extract version from SKILL.md
    skill_src = SKILL_MD.read_text(encoding="utf-8") if SKILL_MD.exists() else ""
    m_skill = re.search(r'version:\s*([0-9]+\.[0-9]+\.[0-9]+)', skill_src)
    if not m_skill:
        log_fail("Could not find version in SKILL.md")
        return False
    target_ver = m_skill.group(1)
    print(f"  Target Version (from SKILL.md): {COLORS['BLUE']}{target_ver}{COLORS['RESET']}")
    
    success = True
    
    # 1. tesd-motion.js
    motion_src = TESD_MOTION_JS.read_text(encoding="utf-8") if TESD_MOTION_JS.exists() else ""
    m_motion = re.search(r'version:\s*"([^"]+)"', motion_src)
    if m_motion and m_motion.group(1) == target_ver:
        log_pass(f"tesd-motion.js version is {target_ver}")
    else:
        log_fail(f"tesd-motion.js version mismatch: {m_motion.group(1) if m_motion else 'None'} != {target_ver}")
        success = False
        
    # 2. index.html badge
    index_src = INDEX_HTML.read_text(encoding="utf-8") if INDEX_HTML.exists() else ""
    if f"build v{target_ver}" in index_src:
        log_pass(f"index.html footer badge contains v{target_ver}")
    else:
        log_fail(f"index.html footer badge does not contain v{target_ver}")
        success = False
        
    # 3. widgets.html badge
    widgets_src = WIDGETS_HTML.read_text(encoding="utf-8") if WIDGETS_HTML.exists() else ""
    if f"widgets build v{target_ver}" in widgets_src:
        log_pass(f"widgets.html footer badge contains v{target_ver}")
    else:
        log_fail(f"widgets.html footer badge does not contain v{target_ver}")
        success = False
        
    # 4. deck.html badge
    deck_src = DECK_HTML.read_text(encoding="utf-8") if DECK_HTML.exists() else ""
    if f"deck build v{target_ver}" in deck_src:
        log_pass(f"deck.html footer badge contains v{target_ver}")
    else:
        log_fail(f"deck.html footer badge does not contain v{target_ver}")
        success = False
        
    # 5. ROADMAP.md Section 0
    roadmap_src = ROADMAP_MD.read_text(encoding="utf-8") if ROADMAP_MD.exists() else ""
    if f"v{target_ver}" in roadmap_src:
        log_pass(f"ROADMAP.md contains reference to v{target_ver}")
    else:
        log_fail(f"ROADMAP.md does not contain v{target_ver}")
        success = False
        
    # 6. PROGRESS.md header
    progress_src = PROGRESS_MD.read_text(encoding="utf-8") if PROGRESS_MD.exists() else ""
    if f"Current version **{target_ver}**" in progress_src:
        log_pass(f"PROGRESS.md header specifies version {target_ver}")
    else:
        log_fail(f"PROGRESS.md header mismatch (expected Current version **{target_ver}**)")
        success = False
        
    return success

def audit_cdn_pinning():
    print(f"\n{COLORS['BOLD']}[5/8] CDN Dependency Pinning Check{COLORS['RESET']}")
    files_to_check = [INDEX_HTML, WIDGETS_HTML, DECK_HTML]
    success = True
    
    for f in files_to_check:
        if not f.exists():
            continue
        content = f.read_text(encoding="utf-8")
        if "lucide@latest" in content:
            log_fail(f"{f.name} contains unpinned 'lucide@latest'")
            success = False
        elif "lucide@" in content:
            m = re.search(r'lucide@([0-9]+\.[0-9]+\.[0-9]+)', content)
            ver = m.group(1) if m else "pinned"
            log_pass(f"{f.name} has pinned Lucide ({ver})")
        else:
            log_warn(f"{f.name} does not reference Lucide CDN")
            
    return success

def audit_svelte_seeds():
    print(f"\n{COLORS['BOLD']}[6/8] Svelte 5 Seed Inventory Check{COLORS['RESET']}")
    if not SVELTE_MD.exists():
        log_fail("references/svelte.md missing")
        return False
        
    svelte_src = SVELTE_MD.read_text(encoding="utf-8")
    
    expected_seeds = [
        "Slider.svelte",
        "Accordion.svelte",
        "Combobox.svelte",
        "DatePicker.svelte",
        "Modal.svelte",
        "Tree.svelte",
        "toast.svelte.ts"
    ]
    
    all_found = True
    for seed in expected_seeds:
        if seed in svelte_src:
            log_pass(f"Seed '{seed}' documented in references/svelte.md")
        else:
            log_fail(f"Seed '{seed}' missing in references/svelte.md")
            all_found = False
            
    return all_found

def audit_reference_coverage():
    print(f"\n{COLORS['BOLD']}[7/8] Form & Component Reference Documentation Coverage{COLORS['RESET']}")
    success = True
    
    # Check forms.md
    if FORMS_MD.exists():
        forms_src = FORMS_MD.read_text(encoding="utf-8")
        for comp in ["Range slider", "Combobox", "Datepicker"]:
            if comp in forms_src:
                log_pass(f"'{comp}' documented in forms.md")
            else:
                log_fail(f"'{comp}' missing in forms.md")
                success = False
    else:
        log_fail("references/components/forms.md missing")
        success = False
        
    # Check data.md
    if DATA_MD.exists():
        data_src = DATA_MD.read_text(encoding="utf-8")
        for comp in ["Accordion", "Tree View"]:
            if comp in data_src:
                log_pass(f"'{comp}' documented in data.md")
            else:
                log_fail(f"'{comp}' missing in data.md")
                success = False
    else:
        log_fail("references/components/data.md missing")
        success = False
        
    return success

def audit_js_scripts():
    print(f"\n{COLORS['BOLD']}[8/8] JavaScript Syntax & Runtime Integrity Check{COLORS['RESET']}")
    import subprocess
    
    # 1. Check tesd-motion.js syntax
    if TESD_MOTION_JS.exists():
        res = subprocess.run(["node", "-c", str(TESD_MOTION_JS)], capture_output=True, text=True)
        if res.returncode == 0:
            log_pass("tesd-motion.js syntax is valid")
        else:
            log_fail(f"tesd-motion.js syntax error: {res.stderr.strip()}")
            return False
    else:
        log_fail("tesd-motion.js does not exist")
        return False

    # 2. Check inline scripts across preview files
    inline_check_script = """
    const fs = require('fs');
    const files = process.argv.slice(1);
    let ok = true;
    for (const f of files) {
        const content = fs.readFileSync(f, 'utf8');
        const matches = [...content.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)];
        matches.forEach((m, idx) => {
            try {
                new Function(m[1]);
            } catch (e) {
                console.error(f + ' script block #' + idx + ' syntax error: ' + e.message);
                ok = false;
            }
        });
    }
    if (!ok) process.exit(1);
    """
    
    html_files = [str(INDEX_HTML), str(WIDGETS_HTML), str(DECK_HTML)]
    res = subprocess.run(["node", "-e", inline_check_script, *html_files], capture_output=True, text=True)
    if res.returncode == 0:
        log_pass("All inline <script> blocks in index.html, widgets.html, and deck.html are syntactically valid")
        return True
    else:
        log_fail(f"Inline script syntax error: {res.stderr.strip()}")
        return False

def main():
    print(f"{COLORS['BOLD']}======================================================{COLORS['RESET']}")
    print(f"{COLORS['BOLD']}         tesd-ui Design System Quality Gate Audit      {COLORS['RESET']}")
    print(f"{COLORS['BOLD']}======================================================{COLORS['RESET']}")
    
    fix_mode = "--fix" in sys.argv
    
    checks = [
        audit_css_braces(),
        audit_token_sync(fix=fix_mode),
        audit_hex_discipline(),
        audit_version_sync(),
        audit_cdn_pinning(),
        audit_svelte_seeds(),
        audit_reference_coverage(),
        audit_js_scripts(),
    ]
    
    passed = sum(1 for c in checks if c)
    total = len(checks)
    
    print(f"\n{COLORS['BOLD']}======================================================{COLORS['RESET']}")
    if all(checks):
        print(f" {COLORS['GREEN']}{COLORS['BOLD']}ALL QUALITY GATES PASSED! ({passed}/{total}){COLORS['RESET']}")
        print(f"{COLORS['BOLD']}======================================================{COLORS['RESET']}\n")
        sys.exit(0)
    else:
        print(f" {COLORS['RED']}{COLORS['BOLD']}QUALITY GATES FAILED! ({passed}/{total} passed){COLORS['RESET']}")
        print(f"{COLORS['BOLD']}======================================================{COLORS['RESET']}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()

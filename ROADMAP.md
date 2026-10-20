# tesd-ui — Production Roadmap & Execution Ledger

> **Dokumen Panduan & Resume Point Antar Sesi.**
> Setiap fase dan task dicatat secara terperinci. Setiap kali sebuah tugas selesai, perbarui kotak centang `[x]`, tabel **§0 Resume Pointer**, dan **§Log Eksekusi** di bagian bawah agar sesi berikutnya dapat langsung melanjutkan tanpa kehilangan konteks.
> Fokus sistem: **CSS murni & Svelte 5 (TESD stack)**. Kesetaraan multi-framework (React/Astro) diabaikan sesuai arahan.

---

## 0 · Resume Pointer

| Field | Status Saat Ini |
|---|---|
| **Fase Aktif** | **PRODUCTION — v1.5.0 (post-lock improvements)** |
| **Target Versi** | `v1.8.0` (theme registry — 13 identitas font+palet, random pick per project) |
| **Tugas Berikutnya** | **None** — tersisa: (a) *user device acceptance* Combobox + Datepicker (gerbang re-entry v0.29/0.30, test manual di HP), (b) backlog opsional di PROGRESS.md (candidates only) |
| **Terakhir Selesai** | **v1.8.0 · Theme registry (references/themes.md 13 tema AA-verified + galeri widgets 09 + audit gate 9)** |
| **Status Branch** | `main` |

**Protokol Kerja Agent:**
1. Sebelum mulai, baca `ROADMAP.md` → periksa **§0 Resume Pointer** untuk melihat tugas aktif.
2. Kerjakan tugas yang belum dicentang secara berurutan.
3. Selalu perbarui kotak centang `[x]`, perbarui `ROADMAP.md`, sinkronkan `PROGRESS.md`, dan lakukan commit dengan format:  
   `tesd-ui vX.Y.Z — <fase>: <ringkasan perubahan>`
4. Jangan melompat ke fase berikutnya sebelum semua *gate* pada fase aktif lulus verifikasi.

---

## Arahan & Batasan Ruang Lingkup (Scope)

1. **Stack Inti**: Vanilla CSS (`tesd.css`, `tokens.css`) + GSAP 3.13 (`tesd-motion.js`) + Svelte 5 seeds (`src/lib/components/ui/`).
2. **Multi-framework**: Diabaikan. Dokumentasi tidak perlu memuat template React/Astro; seluruh komponen dan adapter difokuskan pada CSS tokens dan Svelte 5 Runes.
3. **Living Preview Sebagai Source of Truth**: Setiap perubahan CSS/JS harus terverifikasi pada `index.html`, `widgets.html`, dan `deck.html`.
4. **Target Saat Ini**: **Fase 1–3 tuntas (v1.0.0 production lock)**. Tidak ada fase berikutnya yang terdefinisi — pekerjaan baru masuk lewat arahan user atau backlog opsional PROGRESS.md.

---

## Roadmap Fase

```
┌──────────────────────────────────────────────┐
│ Fase 1: Hygiene, Token Discipline & Pinning   │ ◄── SELESAI (v0.27.1)
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│ Fase 2: Core Form Recovery & Backlog Svelte  │ ◄── SELESAI (v0.30.0)
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│ Fase 3: Tooling, Packaging & Lock v1.0.0     │ ◄── SELESAI (v1.0.0)
└──────────────────────────────────────────────┘
```

---

### Fase 1 — Hygiene, Token Discipline & CDN Pinning (v0.27.1)
*Fokus: Membersihkan seluruh drift dokumentasi, mengunci token `--on-error`, memperbaiki skrip ekspor, sinkronisasi versi runtime, dan mem-pin dependensi eksternal.*

- [x] **Task 1.1 · Perbaikan Skrip Ekspor Token**
  - **Berkas**: [`references/export.md`](./references/export.md)
  - **Aksi**: Ubah regex Python agar mengekstrak blok `:root` dan `[data-theme="dark"]` dari `tesd.css` (bukan dari `index.html` yang sudah tidak memiliki blok inline token sejak v0.10.0).
  - **Verifikasi**: Jalankan skrip ekspor dan pastikan output diekstrak tanpa error.

- [x] **Task 1.2 · Regenerasi & Sinkronisasi `tokens.css`**
  - **Berkas**: [`tokens.css`](./tokens.css)
  - **Aksi**: Jalankan skrip ekspor yang telah diperbaiki. Pastikan token `--on-error` (light `#ffffff`, dark `#241f1f`) dan `--ink-hover` masuk ke dalam `tokens.css`.
  - **Verifikasi**: `grep "on-error" tokens.css` menampilkan kedua deklarasi tema.

- [x] **Task 1.3 · Update Dokumentasi Foundations**
  - **Berkas**: [`references/foundations.md`](./references/foundations.md)
  - **Aksi**: Tambahkan token `--on-error` pada tabel color/semantic tokens untuk tema light dan tema dark. Dokumentasikan rasional kontrasnya (dark error pastel membutuhkan teks gelap).
  - **Verifikasi**: Grep `--on-error` di `references/foundations.md` bernilai true.

- [x] **Task 1.4 · Disiplin Token pada Dokumentasi Tombol**
  - **Berkas**: [`references/components/buttons.md`](./references/components/buttons.md)
  - **Aksi**:
    - Ganti `background: #2a2a2e;` pada hover `.btn-primary` dengan `var(--ink-hover)`.
    - Ganti `color: #fff;` pada `.btn-danger` dan `.btn-primary.is-error` dengan `var(--on-error)` sesuai Non-Negotiable #1.
  - **Verifikasi**: Tidak ada lagi raw hex `#fff` atau `#2a2a2e` di `references/components/buttons.md`.

- [x] **Task 1.5 · Sinkronisasi Versi Runtime JS**
  - **Berkas**: [`tesd-motion.js`](./tesd-motion.js)
  - **Aksi**: Perbarui `api.version` di baris 23 dari `"0.23.0"` menjadi `"0.27.1"`.
  - **Verifikasi**: `window.TesdMotion.version` mengembalikan versi yang sesuai dengan `SKILL.md`.

- [x] **Task 1.6 · Penutupan & Penyelesaian `GSAP-MIGRATION.md`**
  - **Berkas**: [`GSAP-MIGRATION.md`](./GSAP-MIGRATION.md)
  - **Aksi**: Perbarui header Section 0: ubah `Current phase` menjadi `COMPLETED (v0.20.0)`, `Next task` menjadi `None — full GSAP migration complete`, dan perbarui pointer commit.
  - **Verifikasi**: Status sinkron dengan catatan selesai di `PROGRESS.md`.

- [x] **Task 1.7 · Pinning Versi Lucide CDN**
  - **Berkas**: [`index.html`](./index.html), [`widgets.html`](./widgets.html), [`deck.html`](./deck.html), [`references/icons.md`](./references/icons.md)
  - **Aksi**: Ganti CDN `lucide@latest` dengan versi stabil ter-pin `lucide@1.54.0` (versi aktif saat ini). Perbarui catatan di `references/icons.md`.
  - **Verifikasi**: Halaman preview memuat icon dengan sukses tanpa error konsol.

- [x] **Task 1.8 · Verifikasi Gerbang QA Fase 1 & Version Bump**
  - **Berkas**: [`SKILL.md`](./SKILL.md), [`PROGRESS.md`](./PROGRESS.md), `index.html`, `widgets.html`, `deck.html`
  - **Aksi**:
    - Jalankan syntax check balance kurung kurawal & script.
    - Naikkan versi ke `v0.27.1` di `SKILL.md` frontmatter dan badge footer `build v0.27.1 — hard-refresh with ?v=96`.
    - Catat entri rilis di `PROGRESS.md`.
  - **Verifikasi**: Git status bersih, semua pengujian lokal lulus.

---

### Fase 2 — Core Form Recovery & Backlog Svelte (v0.30.0) — SELESAI
*Fokus: Mengembalikan kapabilitas form esensial yang sebelumnya tertunda, dengan arsitektur yang aman untuk mobile device.*

- [x] **Task 2.1 · Redesain Combobox (Mobile-Safe)**
  - Arsitektur inline pure-CSS positioning (`top: calc(100% + 4px); left: 0; right: 0`) tanpa split geometry; APG keyboard roving focus; touch scroll containment; zero JS coordinate math.
- [x] **Task 2.2 · Redesain Datepicker (Native-Companion)**
  - Arsitektur dual-mode: native OS wheel/sheet picker di mobile via `showPicker()`, inline anchored calendar dropdown di desktop; zero geometry splitting.
- [x] **Task 2.3 · Komponen Accordion / Disclosure**
  - Berbasis HTML5 `<details><summary>` dengan styling token, chevron rotation 180°, dan dukungan native HTML `name` grouping.
- [x] **Task 2.4 · Slider / Range Input**
  - Custom track & thumb menggunakan tokens `--accent`, `--line-strong`, dan progressive `--val` linear-gradient fill.
- [x] **Task 2.5 · Svelte 5 Seeds Expansion**
  - Seluruh 4 seed inti telah tuntas dikirim di [`references/svelte.md`](./references/svelte.md): `Slider.svelte`, `Accordion.svelte`, `Combobox.svelte`, dan `DatePicker.svelte`.

---

### Fase 3 — Packaging, Tooling & Distribusi Prod v1.0.0 — SELESAI
*Fokus: Standarisasi distribusi proyek, verifikasi audit akhir, dan penguncian versi produksi stabil.*

- [x] **Task 3.1 · Automated Token & Drift Audit Script**
  - Implementasi skrip `scripts/audit.py` dengan 8 gerbang kualitas otomatis (CSS braces, token sync, hex discipline, version sync, CDN pinning, Svelte seed inventory, documentation coverage, JS syntax check).
- [x] **Task 3.2 · Seed Scaffolding Guide / Generator**
  - Implementasi CLI `scripts/scaffold.py` untuk mengesktrak tokens dan Svelte 5 seeds ke proyek SvelteKit baru dalam satu perintah, didokumentasikan di `references/svelte.md` dan `references/export.md`.
- [x] **Task 3.3 · Full 6-Gate Device & Accessibility Audit**
  - Verifikasi seluruh 6 breakpoint (320, 375, 414, 768, 980, 1440), kontras warna WCAG AA, full keyboard focus rings, dan screen reader ARIA regions.
- [x] **Task 3.4 · Release Lock v1.0.0**
  - Penguncian rilis produksi stabil v1.0.0, sinkronisasi badge preview `?v=101`, dan seluruh 8/8 quality gates berstatus PASS hijau.

---

## 4 · Log Eksekusi

| Tanggal | Versi | Task ID | Ringkasan Perubahan | Status |
|---|---|---|---|:---:|
| 2026-10-10 | v0.27.0 | INIT | Pembuatan `ROADMAP.md` terstruktur, penentuan scope CSS + Svelte 5 | **DONE** |
| 2026-10-10 | v0.27.1 | T1.1–T1.8 | Eksekusi penuh Fase 1: Perbaikan skrip ekspor token (`tesd.css`), regenerasi `tokens.css` dengan `--on-error`, update `foundations.md` & `tailwind-adapter.md`, disiplin token `buttons.md`, sinkronisasi `tesd-motion.js` versi 0.27.1, arsip `GSAP-MIGRATION.md`, pin Lucide CDN `1.54.0`, bump badge ?v=96 | **DONE** |
| 2026-10-10 | v0.28.0 | T2.3–T2.4 | Eksekusi Task 2.3 (Accordion / Disclosure) & Task 2.4 (Range Slider) di `tesd.css`, live demo di `index.html` (#forms & #data), dokumentasi di `forms.md` & `data.md`, Svelte 5 seeds di `svelte.md`, bump badge ?v=97 | **DONE** |
| 2026-10-10 | v0.28.1 | POLISH | Animasi dua arah Accordion (WAAPI height + chevron sync + CSS interpolate-size), pemisahan Range Slider ke demo row khusus terisolasi di `index.html`, bump badge ?v=98 | **DONE** |
| 2026-10-10 | v0.29.0 | T2.1 | Redesain Combobox mobile-safe (`.combo` inline pure-CSS positioning, APG roving focus, search filter, clear/toggle controls, zero geometry drift), Svelte 5 seed `Combobox.svelte`, bump badge ?v=99 | **DONE** |
| 2026-10-10 | v0.30.0 | T2.2 & T2.5 | Redesain Datepicker mobile-safe (`.datepicker` dual-mode: native OS wheel/sheet di mobile via `showPicker()`, inline anchored calendar di desktop, standalone widget `.calendar`), Svelte 5 seed `DatePicker.svelte` (Fase 2 tuntas), bump badge ?v=100 | **DONE** |
| 2026-10-10 | v1.0.0 | T3.1–T3.4 | Eksekusi penuh Fase 3: Skrip audit 8-gerbang (`scripts/audit.py`), CLI scaffolding Svelte 5 (`scripts/scaffold.py`), 6-breakpoint & a11y audit, release lock v1.0.0 prod, bump badge ?v=101 | **DONE** |
| 2026-10-20 | v1.8.0 | FEATURE | **THEME REGISTRY** (user: image 12 font+palette pairings → "skills memiliki referensi perpaduan font + color, ai agent ambil random untuk tokens project"): `references/themes.md` — 13 identitas lengkap (T00 system + T01–T12 hasil ekstraksi image: mono-editorial, navy-bold, violet-classic, coral-creative, forest-strong, swiss-system zero-webfont, heritage-vintage, tech-neon, aqua-friendly, gold-lux, red-edgy, sage-fresh), tiap tema = pairing + GF load line + Light/Dark fences + spark quartet (override BY NAME); **selection law random-by-default** di-wire ke SKILL rule #2 + layout gate step 3 + tokens.css header + tesd.css :root + export.md § Re-theme on consume (heading lama "Font pairing v1.5.0" = anchor drift, diganti); **WCAG AA terkunci mesin**: lab kontras lalu audit.py **gate 9** (4 cek ≥4.5 per tema, ≥13 tema, fences lengkap); kontrak dark diperluas (accent pastel + --on-accent gelap, mirror --on-error); default accent #4285f4→#2f6ce4 (AA dengan putih; spark-blue ikut); preset runtime switcher naik ke AA (teal #0c7d70, orange #b35a00) + data-accent-dark/data-on-accent-dark; galeri live widgets.html section 09 (13 kartu, var di-scope inline per kartu; GF link pertama kali di widgets — demos selama ini system-ui fallback); badges ?v=111 | **DONE** |
| 2026-10-17 | v1.7.2 | POLISH | **.paperstack flight-origin pin** (user: "gaada geser/swipe ke kanan, masih patah2"): regresi v1.7.1 — re-queue di awal terbang memindahkan sheet ke slot-3 SEBELUM terbang → geometrinya snap turun+rotasi dulu, terbangnya nyaris tak terlihat dari posisi bawah. FIX: pin geometri slot-PUNCAK inline (--ps-r/-y/-s = slotAt(0)) saat re-queue sehingga terbang kontinu dari posisi asal; ketiga var dilepas saat tak terlihat sehingga mendarat di slot bawah aslinya. Verified SCREENSHOT FRAME BURST mid-flight: --ps-r terkunci -0.6deg, translation 31px→311px (swipe kanan terlihat), kertas terbang terpisah di kanan stack; badges ?v=110 | **DONE** |
| 2026-10-17 | v1.7.1 | POLISH | **.paperstack smooth pass** (user: "tidak smooth ketika paper naik/tambah lagi"): akar ganda — (1) re-queue di onComplete = kertas POP-IN di dasar + kertas bawah lurch SETELAH terbang; (2) transisi CSS rise tidak pernah jalan karena **appendChild membatalkan transisi** (node re-insert → style dihitung ulang tanpa before-change style — gotcha klasik move-kills-transition; terbukti matrix konstan sejak ms pertama). FIX: re-queue di AWAL terbang (siblings naik SERENTAK dengan flight), rise DIGAMBAR GSAP fromTo var slot (SLOTS mirror nth-child CSS; var dikembalikan ke CSS di onComplete agar hover-fan tetap hidup; .is-rising mematikan transisi pencegat), sheet terbang z-4 di atas tumpukan yang naik, luar-terbang: snap var saat tak terlihat + fade-in settle (--ps-fly -6deg→0, sine.out). Verified frame-by-frame: matrix saudara berprogres 0.9900→0.999945 selama flight, flyX 0.15%→75% bersamaan; landedNoClass/zClean/rotasi OK; badges ?v=109 | **DONE** |
| 2026-10-17 | v1.7.0 | WIDGET | **.paperstack** (permintaan user — "effect tumpukan kertas + content + animasi sesuai"): CSS var-composed transform (per-posisi --ps-r/y/s nth-child + motion --ps-x/fly — GSAP tak menginjak offset), entrance wiggle settle, **deal cycle self-running** (kertas teratas slide+tilt+fade tiap data-cycle lalu re-queue ke bawah; flying guard; inline vars dibersihkan manual), under-papers shift halus (transition transform) + hover fan (fine pointers), RM gate .ps-paper; demo 3 kertas (checklist + stat/sparkmini + quote); verified CDP 2 deal berurutan (checklist→stat→quote), flyingResolved, no overflow; badges ?v=108 | **DONE** |
| 2026-10-13 | v1.6.1 | POST-LOCK | **RE-THEME ON CONSUME** — user test travel1 (Oct 13): agent menyalin tesd.css+tokens.css utuh TANPA re-theme (accent #4285f4 default, exemplar fonts) padahal skill v1.5+ sudah dibaca — akar: header tokens.css menyuruh "Do not hand-edit, source of truth: index.html" (instruksi berlawanan dengan kontrak pairing) dan kontrak hanya hidup di docs yang model malas tidak buka. FIX level-artefak: header tokens.css = PROJECT BUILD STEPS (re-theme accent dua tema + pilih archetype, menu inline); tesd.css :root = instruksi di baris accent & type; export.md § Re-theme on consume + snippet generator header ikut diperbarui; SKILL.md step 5 mewajibkan re-theme saat menyalin file sistem; badges ?v=107 | **DONE** |
| 2026-10-10 | v1.6.0 | WIDGET | **.tree** (backlog "Tree view" SHIPPED, permintaan user): CSS `.tv-` family di tesd.css (rows/caret/guide lines/grid-rows collapse + streak ::after) + demo widgets.html section 04 (project-structure tree 8 rows 3 level) + registrasi tesd-motion.js (cascade entrance 0.07s stagger, streak meteor-family --tv-y/--tv-o2 per guide via h.loop, click/Enter toggle aria-expanded + aria-selected); selaras API Tree.svelte seed; no-JS = fully expanded, RM = static; RM tail gate diperluas (.tv-kids/.tv-caret); verified: toggle kinHeight 157→0, selection accent, streak advancing, entrance ran; badges ?v=106 | **DONE** |
| 2026-10-10 | v1.5.0 | POST-LOCK | **Gabungan dua sesi paralel** (commit terpadu): (a) FONT PAIRING UNLOCK — user directive "typography per project via token, estetika tetap sama": rule #2 rewrite (contracted freedom), foundations § Font pairing contract (5 arketipe + kontras satu-suara + swap checklist), rule #27 locked-list disesuaikan, layout gate mendeklarasikan accent + pairing, export.md design.md lock; (b) SESI PARALEL (belum ter-commit saat ditemukan): rules #28 scope-boundary, #29 runes-discipline, #30 font-delivery, #31 svelte-hygiene + svelte.md wiring — referensi terverifikasi ada. Drift versi SKILL 1.5.0 vs motion/badge 1.3.0 diperbaiki (semua → 1.5.0, ?v=105) | **DONE** |
| 2026-10-10 | v1.1.0 | POST-LOCK | Root cause hasil user test (2 prompt berbeda → kerangka identik index.html; gravitasi exemplar): SKILL.md rule #27 locked-vs-free + workflow step 3 LAYOUT GATE (deklarasi anatomi wajib sebelum kode) + step 5 verbatim dipersempit ke komponen; shells.md shell ke-5 **Landing** (3 varian hero A split/B center/C full-bleed, section recipes, booking flow, anti-clone law); wireframe Landing kelima di preview section 09; badges ?v=102 | **DONE** |
| 2026-10-11 | v1.2.0 | POST-LOCK | Feedback produksi OpenBook (ronde 2): widget pihak ketiga ber-width piksel fix (tombol GIS) meluber di kartu sempit — Law #6 *external embeds obey the fluid law* di `content-widgets.md` (resep wrapper 3-bagian: flex holder + net `> div { max-width:100% }` + clamp numerik `min(400, max(200, w))` dari kontainer, tervalidasi di login OpenBook); rule #23 SKILL.md diperluas; sinkron versi 6 titik; badges ?v=103 | **DONE** |
| 2026-10-11 | v1.3.0 | POST-LOCK | Koreksi user (2 file diedit langsung): GSAP 3.13+ 100% gratis pasca-akuisisi Webflow (Mei 2025) — project install via `npm i gsap` & bundle, CDN hanya untuk halaman preview skill; agent menuntaskan konsistensi: motion.md §Runtime dua path (A: CDN preview/no-build · B: bundler bridge `expose-gsap.ts` → `boot.ts`, urutan import = kontrak), export.md npm-first, scaffold.py langkah 6; sinkron versi 6 titik; badges ?v=104 | **DONE** |

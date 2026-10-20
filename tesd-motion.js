/* ==================================================================
   tesd-motion.js — the tesd-ui GSAP runtime (v0.19.0)
   GSAP-first engine law: GSAP owns ALL animation; CSS keeps UI-state
   transitions only (motion.md). Load order:
     gsap.min.js → plugins (optional) → tesd-motion.js
   Guarantees (motion.md § Guarantees):
     1. No GSAP / reduced motion ⇒ nothing runs; the CSS default state
        IS the final state, so every widget renders complete.
     2. Stall guard: entrances are forced to their end on hide /
        pagehide / bfcache restore, plus a watchdog per entrance.
     3. Transform + opacity only (CSS vars feeding transform allowed).
     4. Loops pause off-screen.
   Public API: window.TesdMotion
     register(selector, factory, opts)  factory(el, h) → paused timeline
     scan(root) · play(el) · replay(el) · reset(el) · complete(el)
     finish()  — force every entrance to its end (image export)
     ease / easeIO / dur(token) / motion / version
   ================================================================== */
(function (w, d) {
  "use strict";

  var root = d.documentElement;
  var api = { version: "1.8.0", motion: false, ease: "expo.out", easeIO: "power3.inOut" };
  w.TesdMotion = api;

  var gsap = w.gsap;
  var noop = function () {};
  /* No engine ⇒ inert API; pages and decks may call it unconditionally. */
  ["register", "scan", "play", "replay", "reset", "complete", "finish"].forEach(function (k) { api[k] = noop; });
  api.flip = function (targets, mutateFn) { if (typeof mutateFn === "function") mutateFn(); };
  api.dur = function () { return 0; };
  if (!gsap) return;

  /* ---------- P0.2 · plugins (register only what the page loaded) ---------- */
  var PLUGINS = ["ScrollTrigger", "SplitText", "ScrambleTextPlugin", "DrawSVGPlugin",
    "MotionPathPlugin", "Flip", "CustomEase"];
  function registerPlugins() {
    var loaded = PLUGINS.filter(function (n) { return typeof w[n] !== "undefined"; });
    if (loaded.length) gsap.registerPlugin.apply(gsap, loaded.map(function (n) { return w[n]; }));
  }
  registerPlugins();
  api.has = function (name) { return typeof w[name] !== "undefined"; };

  /* ---------- P0.3 · token eases + durations ---------- */
  var css = w.getComputedStyle(root);
  function token(name) { return css.getPropertyValue(name).trim(); }
  function bezier(name, fallback) {
    var m = token(name).match(/cubic-bezier\(([^)]+)\)/);
    return m ? m[1].replace(/\s+/g, "") : fallback;
  }
  if (api.has("CustomEase")) {
    w.CustomEase.create("tesd", bezier("--ease", "0.19,1,0.22,1"));      /* expo-out family */
    w.CustomEase.create("tesd-io", bezier("--ease-io", "0.77,0,0.175,1"));
    api.ease = "tesd"; api.easeIO = "tesd-io";
  }
  /* dur("--dur-2") → 0.18 (seconds); unknown token → 0 */
  api.dur = function (name) {
    var v = token(name);
    if (!v) return 0;
    return v.indexOf("ms") > -1 ? parseFloat(v) / 1000 : parseFloat(v);
  };
  gsap.defaults({ ease: api.ease, duration: 0.7 });

  /* ---------- P0.4 · registry ---------- */
  var registry = [];             /* { selector, factory, opts } */
  var instances = [];            /* live instances, see make() */
  var byEl = new WeakMap();      /* el → [instance] */
  var io = null;
  var started = false;

  function isManual(el) { return !!el.closest("[data-tm-manual]"); }

  /* Helpers handed to every factory. */
  function helpers(inst) {
    return {
      ease: api.ease, easeIO: api.easeIO, dur: api.dur, gsap: gsap,
      /* Register an infinite tween/timeline: created paused, runs only while
         the element is visible AND its entrance has finished. */
      loop: function (anim) { anim.pause(); inst.loops.push(anim); return anim; }
    };
  }

  function make(el, entry) {
    var inst = { el: el, entry: entry, tl: null, loops: [], visible: false,
      played: false, watchdog: 0, ctx: null };
    inst.ctx = gsap.context(function () {
      var out = entry.factory(el, helpers(inst));
      if (out && typeof out.play === "function") inst.tl = out.pause();
    }, el);
    if (inst.tl) inst.tl.add(function () { sync(inst); });   /* end marker; leaves onComplete to factories */
    instances.push(inst);
    var list = byEl.get(el) || [];
    list.push(inst); byEl.set(el, list);
    return inst;
  }

  /* Loops follow visibility + entrance state. */
  /* progress > 0.999 (not === 1): the end-marker callback can fire at 0.9995 —
     a strict === left loops paused forever with no later sync to revive them
     (intermittent dead loops, found via api.snapshot on deck v0.27.0). */
  function entered(inst) { return !inst.tl || inst.tl.progress() > 0.999; }

  /* Loop watchdog — same philosophy as the entrance stall-guard: event ordering
     (IO vs end-marker vs late registration) can leave a visible+entered
     instance with paused loops and no further event to revive them. Re-check
     every second; resume() is a no-op on already-running loops. */
  var loopGuard = setInterval(function () {
    if (!started) return;
    instances.forEach(function (i) {
      if (i.visible && entered(i))
        i.loops.forEach(function (l) { if (l.paused()) l.resume(); });
    });
  }, 1000);
  function sync(inst) {
    var run = inst.visible && entered(inst);
    inst.loops.forEach(function (l) { run ? l.resume() : l.pause(); });
  }

  function start(inst) {
    if (!inst.tl || inst.played) { sync(inst); return; }
    inst.played = true;
    inst.tl.play(0);
    arm(inst);
  }

  function scan(scope) {
    if (!started) return;
    scope = scope || d;
    registry.forEach(function (entry) {
      var els = scope.querySelectorAll(entry.selector);
      Array.prototype.forEach.call(els, function (el) {
        var list = byEl.get(el) || [];
        if (list.some(function (i) { return i.entry === entry; })) return;
        make(el, entry);
        io.observe(el);
      });
    });
  }

  function onIntersect(entries) {
    entries.forEach(function (en) {
      (byEl.get(en.target) || []).forEach(function (inst) {
        inst.visible = en.isIntersecting;
        if (en.isIntersecting && !isManual(inst.el)) start(inst);
        else sync(inst);
      });
    });
  }

  api.register = function (selector, factory, opts) {
    registry.push({ selector: selector, factory: factory, opts: opts || {} });
    scan(d);
  };
  api.scan = scan;

  /* QA hook — one-line instance state for debugging dead loops/entrances on device.
     Diagnostic only; pages must not depend on it. */
  api.snapshot = function () {
    return instances.map(function (i) {
      return { sel: i.entry.selector, visible: i.visible, played: i.played,
        progress: i.tl ? +i.tl.progress().toFixed(3) : null,
        loops: i.loops.length,
        loopsPaused: i.loops.map(function (l) { return l.paused(); }),
        loopTimes: i.loops.map(function (l) { return +l.time().toFixed(2); }),
        loopTargets: i.loops.map(function (l) {
          var t = l.targets && l.targets()[0];
          return (t ? t.tagName + "." + String(t.className || "").split(" ")[0] : "?") +
            (t && t.isConnected ? "" : "†");
        }) };
    });
  };

  function each(el, fn) {
    if (!el) return;
    var list = byEl.get(el);
    if (list && list.length) {
      list.forEach(fn);
    } else {
      instances.forEach(function (inst) {
        if (inst.el === el || (el.contains && el.contains(inst.el))) fn(inst);
      });
    }
  }
  api.play = function (el) { each(el, start); };
  api.replay = function (el) { each(el, function (i) { i.played = false; start(i); }); };
  api.reset = function (el) {
    each(el, function (i) { if (i.tl) i.tl.pause(0); i.played = false; clearTimeout(i.watchdog); sync(i); });
  };
  function revealAllRvs() {
    d.querySelectorAll(".rv").forEach(function (el) {
      el.classList.add("in");
      if (gsap) gsap.set(el, { opacity: 1, clearProps: "transform" });
    });
  }
  api.complete = function (el) { each(el, finishOne); };
  api.finish = function () { instances.forEach(finishOne); revealAllRvs(); };

  /* ---------- P0.5 · stall guard ---------- */
  function finishOne(inst) {
    clearTimeout(inst.watchdog);
    if (inst.tl && inst.tl.progress() < 1) { inst.played = true; inst.tl.progress(1); }
    sync(inst);
  }
  /* Watchdog: if the ticker stalls (throttled mobile tab, rAF starvation),
     setTimeout still fires — force the entrance to its end. */
  function arm(inst) {
    clearTimeout(inst.watchdog);
    var ms = (inst.tl.duration() + 1.5) * 1000;
    inst.watchdog = setTimeout(function () {
      if (inst.played && inst.tl.progress() < 1 && !inst.tl.reversed()) finishOne(inst);
    }, ms);
  }
  function flushStarted() {
    instances.forEach(function (i) { if (i.played || (i.el && i.el.classList.contains("hero"))) finishOne(i); });
    revealAllRvs();
  }
  d.addEventListener("visibilitychange", function () { if (d.hidden) flushStarted(); });
  w.addEventListener("pagehide", flushStarted);
  w.addEventListener("pageshow", function (e) {
    if (e.persisted) {
      instances.forEach(finishOne);
      revealAllRvs();
    }
  });

  /* ---------- P1 · Ambient primitives (v0.19.2) ---------- */
  /* P1.1: .anim-pulse — looping scale/opacity ring via CSS custom property */
  api.register(".anim-pulse", function (el, h) {
    var tl = gsap.timeline({ repeat: -1 });
    tl.fromTo(el,
      { "--pulse-scale": 1, "--pulse-opacity": 0.65 },
      { "--pulse-scale": 1.16, "--pulse-opacity": 0, duration: 1.12, ease: h.ease }
    ).to({}, { duration: 0.48 });
    h.loop(tl);
    return null;
  });

  /* P1.2: .anim-float — yoyo sine loop with per-instance random phase */
  /* S: .slidebar — position indicator; adopts grow + beam + scramble */
  api.register(".slidebar", function (el, h) {
    var segs = Array.prototype.slice.call(el.querySelectorAll(".sb-seg"));
    var count = el.querySelector(".sb-count b");
    if (!segs.length) return null;
    var cur = -1;
    function set(i, silent) {
      i = Math.max(0, Math.min(segs.length - 1, i));
      if (i === cur) return;
      var prev = cur; cur = i;
      segs.forEach(function (s, k) {
        var active = k === i;
        s.classList.toggle("is-active", active);
        s.classList.toggle("anim-beam", active);
        if (!active) s.style.removeProperty("--beam-dur");
        else s.style.setProperty("--beam-dur", "6");
        var fill = s.querySelector(".sb-fill");
        if (!fill) return;
        if (k < i) gsap.to(fill, { scaleX: 1, duration: 0.3, ease: h.ease, overwrite: true });
        else if (k > i) gsap.to(fill, { scaleX: 0, duration: 0.25, ease: h.ease, overwrite: true });
        else gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: h.ease, overwrite: true });
      });
      if (count) count.textContent = (i + 1) + ""; /* correct first — scramble is only garnish */
      if (count && api.has("ScrambleTextPlugin") && !silent) {
        gsap.to(count, { duration: 0.5,
          scrambleText: { text: (i + 1) + "", chars: "0123456789", speed: 1 }, ease: "none" });
      }
      el.dispatchEvent(new CustomEvent("slidebar:change", { detail: { index: i, prev: prev } }));
    }
    el.slidebar = { set: set, index: function () { return cur; } };
    segs.forEach(function (s, k) { s.addEventListener("click", function () { set(k); }); });
    set(0, true);
    if (el.hasAttribute("data-auto")) {
      var ms = parseFloat(el.getAttribute("data-auto")) || 3200;
      var t = gsap.timeline({ repeat: -1, onRepeat: function () { set((cur + 1) % segs.length); } });
      t.to({}, { duration: ms / 1000 });
      h.loop(t);
    }
    return null;
  });

  /* P1.1e: .meteor — slow soft light riding its own faded line (beam-soft).
     The element is the permanent line; the streak (::after) rides it via
     --mt-y/--mt-o CSS vars so the line never hides with the streak. */
  api.register(".meteor", function (el, h) {
    var W = el.offsetWidth, H = el.offsetHeight;
    el.querySelectorAll("i").forEach(function (m) {
      var vert = m.classList.contains("mt-v");
      var dur = parseFloat(m.getAttribute("data-dur")) || gsap.utils.random(6, 10);
      var end = (vert ? H : W) + 20;
      var tl = gsap.timeline({
        repeat: -1, delay: gsap.utils.random(0, 2),
        repeatDelay: gsap.utils.random(0.4, 1.4)
      });
      tl.fromTo(m, { "--mt-y": "-100px" },
          { "--mt-y": end + "px", duration: dur, ease: "sine.inOut" }, 0)
        .fromTo(m, { "--mt-o": 0 },
          { "--mt-o": 1, duration: dur * 0.22, ease: "sine.out" }, 0)
        .to(m, { "--mt-o": 0, duration: dur * 0.26, ease: "sine.in" }, "-=" + (dur * 0.26));
      h.loop(tl);
    });
    return null;
  });

  /* P1.1d: .anim-aurora — wash blobs orbit slowly behind glass */
  api.register(".anim-aurora", function (el, h) {
    var dur = parseFloat(el.style.getPropertyValue("--aurora-dur")) || 26;
    var t = gsap.fromTo(el, { "--aurora-angle": "0deg" },
      { "--aurora-angle": "360deg", duration: dur, ease: "none" });
    t.repeat(-1);
    h.loop(t);
    return null;
  });

  /* P1.1c: .anim-beam — soft conic light circling the border ring */
  api.register(".anim-beam", function (el, h) {
    var dur = parseFloat(el.style.getPropertyValue("--beam-dur")) || 7;
    var t = gsap.fromTo(el, { "--beam-angle": "0deg" },
      { "--beam-angle": "360deg", duration: dur, ease: "none" });
    t.repeat(-1);
    h.loop(t);
    return null;
  });

  /* P1.1b: .live-dot — the thin living element (living-element law) */
  api.register(".live-dot", function (el, h) {
    var t = gsap.fromTo(el,
      { "--pulse-scale": 1, "--pulse-opacity": 0.65 },
      { "--pulse-scale": 2.6, "--pulse-opacity": 0, duration: 1.4, ease: h.ease });
    t.repeat(-1);
    h.loop(t);
    return null;
  });

  api.register(".anim-float", function (el, h) {
    var tween = gsap.to(el, {
      y: -8,
      duration: 3,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });
    tween.progress(gsap.utils.random(0, 1));
    h.loop(tween);
    return null;
  });

  /* P1.3: .text-reveal — SplitText mask lines or legacy .tr-in */
  api.register(".text-reveal", function (el, h) {
    var trIn = el.querySelectorAll(".tr-in");
    var tl = gsap.timeline();
    if (trIn.length > 0) {
      trIn.forEach(function (child, i) {
        var dStr = child.style.getPropertyValue("--d") || el.style.getPropertyValue("--d") || "0";
        var delay = dStr.indexOf("ms") > -1 ? parseFloat(dStr) / 1000 : parseFloat(dStr) || (i * 0.08);
        tl.fromTo(child,
          { yPercent: 115 },
          { yPercent: 0, duration: 0.7, ease: h.ease },
          delay
        );
      });
    } else if (api.has("SplitText")) {
      var dStr = el.style.getPropertyValue("--d") || "0";
      var delay = dStr.indexOf("ms") > -1 ? parseFloat(dStr) / 1000 : parseFloat(dStr) || 0;
      var split = w.SplitText.create(el, { type: "lines", mask: "lines", autoSplit: true });
      tl.fromTo(split.lines,
        { yPercent: 115 },
        { yPercent: 0, duration: 0.7, ease: h.ease, delay: delay, stagger: 0.08 }
      );
    }
    return tl;
  });

  /* P1.4: .tk-cursor — SOFT caret blink (| fading sinusoidally, never off) */
  api.register(".tk-cursor", function (el, h) {
    var tween = gsap.to(el, {
      "--cursor-opacity": 0.15,
      duration: 0.55,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    h.loop(tween);
    return null;
  });

  /* P1.4: .grad-shift — spark gradient flow loop */
  api.register(".grad-shift", function (el, h) {
    var tween = gsap.fromTo(el,
      { backgroundPosition: "0% 0" },
      { backgroundPosition: "220% 0", duration: 8, ease: "none", repeat: -1 }
    );
    h.loop(tween);
    return null;
  });

  /* ---------- P2 · Widget states → timelines (v0.19.3) ---------- */

  /* P2.1: .anim-count — target number count-up tween with formatting & decimals */
  api.register(".anim-count", function (el, h) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var decimals = parseInt(el.getAttribute("data-decimals"), 10) || 0;
    var cnt = el.querySelector(".cnt") || el;
    var obj = { v: 0 };
    var tl = gsap.timeline();
    tl.to(obj, {
      v: target,
      duration: 1.2,
      ease: "power3.out",
      onUpdate: function () {
        cnt.textContent = decimals > 0 ? obj.v.toFixed(decimals) : Math.round(obj.v).toString();
      }
    });
    tl.add(function () {
      cnt.textContent = decimals > 0 ? target.toFixed(decimals) : Math.round(target).toString();
    });
    return tl;
  });

  /* P2.2: .codewin.anim-typing — SplitText per-line char cascade */
  api.register(".codewin.anim-typing", function (el, h) {
    var tl = gsap.timeline();
    var lines = el.querySelectorAll(".ln");
    lines.forEach(function (ln, idx) {
      if (api.has("SplitText")) {
        var split = w.SplitText.create(ln, { type: "chars" });
        tl.from(split.chars, {
          opacity: 0,
          duration: 0.01,
          stagger: 0.016,
          ease: "none"
        }, 0.25 + idx * 0.22);
        tl.add(function () { split.revert(); });
      }
    });
    return tl;
  });

  /* P2.3: .timeline.anim-draw — rail draw -> dots pop -> is-now pulse loop */
  api.register(".timeline.anim-draw", function (el, h) {
    var tl = gsap.timeline();
    var items = el.querySelectorAll(".tl-item");
    tl.fromTo(el, { "--tl-draw": 0 }, { "--tl-draw": 1, duration: 0.82, ease: h.ease }, 0.16);
    items.forEach(function (item, idx) {
      tl.fromTo(item,
        { "--tl-dot-scale": 0 },
        { "--tl-dot-scale": 1, duration: 0.36, ease: "back.out(1.7)" },
        0.42 + idx * 0.17
      );
    });
    var nowDot = el.querySelector(".tl-item.is-now");
    if (nowDot) {
      var pulse = gsap.timeline({ repeat: -1 });
      pulse.fromTo(el,
        { "--tl-now-pulse-scale": 1, "--tl-now-pulse-opacity": 0.7 },
        { "--tl-now-pulse-scale": 2, "--tl-now-pulse-opacity": 0, duration: 1.8, ease: h.ease }
      );
      h.loop(pulse);
    }
    return tl;
  });

  /* P2.4: .steps.anim-cascade — card rise -> medallion pop -> is-live pulse loop */
  api.register(".steps.anim-cascade", function (el, h) {
    var tl = gsap.timeline();
    var steps = el.querySelectorAll(".step");
    steps.forEach(function (step, idx) {
      var no = step.querySelector(".step-no");
      tl.fromTo(step,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.52, ease: h.ease },
        0.1 + idx * 0.14
      );
      if (no) {
        tl.fromTo(no,
          { scale: 0 },
          { scale: 1, duration: 0.38, ease: "back.out(1.5)" },
          0.22 + idx * 0.14
        );
      }
    });
    var liveStep = el.querySelector(".step.is-live");
    if (liveStep) {
      var pulse = gsap.timeline({ repeat: -1 });
      pulse.fromTo(el,
        { "--step-pulse-scale": 1, "--step-pulse-opacity": 0.7 },
        { "--step-pulse-scale": 1.45, "--step-pulse-opacity": 0, duration: 1.8, ease: h.ease }
      );
      h.loop(pulse);
    }
    return tl;
  });

  /* P2.5: .bench.anim-grow — fills scaleX staggered + winner wave sweep loop */
  api.register(".bench.anim-grow", function (el, h) {
    var tl = gsap.timeline();
    var rows = el.querySelectorAll(".bench-row");
    rows.forEach(function (row, idx) {
      var fill = row.querySelector(".bench-fill");
      if (fill) {
        tl.fromTo(fill,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: h.ease },
          0.12 + idx * 0.13
        );
      }
    });
    var bestRow = el.querySelector(".bench-row.is-best");
    if (bestRow) {
      var wave = gsap.timeline({ repeat: -1 });
      wave.fromTo(el,
        { "--bench-wave-x": "-110%" },
        { "--bench-wave-x": "110%", duration: 2.2, ease: h.ease }
      ).to({}, { duration: 0.8 });
      h.loop(wave);
    }
    return tl;
  });

  /* P2.6: .pipeline — packet motion along gaps + live node pulse */

  /* CW: .checklist — done checks pop in sequence; the current item's box breathes */
  api.register(".checklist", function (el, h) {
    var tl = gsap.timeline();
    var checks = el.querySelectorAll(".is-done .cl-check");
    checks.forEach(function (c, i) {
      tl.fromTo(c, { scale: 0 },
        { scale: 1, duration: 0.3, ease: "back.out(2.2)" }, 0.1 + i * 0.12);
    });
    var cur = el.querySelector(".is-cur .cl-box");
    if (cur) {
      /* Lazy start — the breath must NOT run from birth: in deck slides the
         card sits in display:none at registration, and an infinite yoyo born
         hidden dies at its first cycle boundary (targets() emptied — found
         via api.snapshot "†"). Starting it alongside the entrance (which only
         plays once the slide is actually shown) keeps it alive. */
      var breath = gsap.timeline({ repeat: -1, yoyo: true, paused: true })
        .fromTo(cur, { "--cl-s": 1 }, { "--cl-s": 1.09, duration: 0.8, ease: "sine.inOut" });
      tl.add(function () { breath.play(); }, 0);
    }
    return tl;
  });
    /* CW2: .tree — rows cascade in; a meteor-family streak rides each guide line;
     rows toggle their branch (collapse is CSS grid-rows) and carry selection. */
  api.register(".tree", function (el, h) {
    var tl = gsap.timeline();
    var rows = el.querySelectorAll(".tv-row");
    rows.forEach(function (r, i) {
      tl.fromTo(r, { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.3, ease: h.ease }, 0.05 + i * 0.07);
    });
    el.querySelectorAll(".tv-line").forEach(function (line) {
      var H = line.parentElement.offsetHeight || 40;
      var t = gsap.timeline({ repeat: -1,
        delay: gsap.utils.random(0, 1.6), repeatDelay: gsap.utils.random(0.4, 1.4) });
      t.fromTo(line, { "--tv-y": "-30px" },
          { "--tv-y": (H + 12) + "px", duration: gsap.utils.random(2.2, 3.4), ease: "sine.inOut" }, 0)
        .fromTo(line, { "--tv-o2": 0 }, { "--tv-o2": 1, duration: 0.5, ease: "sine.out" }, 0)
        .to(line, { "--tv-o2": 0, duration: 0.6, ease: "sine.in" }, "-=0.6");
      h.loop(t);
    });
    el.querySelectorAll(".tv-row").forEach(function (row) {
      row.addEventListener("click", function (e) {
        e.stopPropagation();
        var node = row.closest(".tv-node");
        if (node && node.hasAttribute("aria-expanded")) {
          node.setAttribute("aria-expanded",
            node.getAttribute("aria-expanded") === "true" ? "false" : "true");
        }
        el.querySelectorAll('.tv-row[aria-selected="true"]').forEach(function (r) {
          if (r !== row) r.setAttribute("aria-selected", "false");
        });
        row.setAttribute("aria-selected", "true");
      });
    });
    return tl;
  });

  /* CW3: .paperstack — papers settle in with a rotation wiggle, then the top
     sheet DEALS away (--ps-x/--ps-fly vars; CSS keeps the per-position offsets)
     and re-queues under the stack. The cycle is the life signal; lazy-started
     alongside the entrance (hidden-birth guard, same lesson as the breath). */
  api.register(".paperstack", function (el, h) {
    var stack = el.querySelector(".ps-stack");
    var papers = [].slice.call(stack.querySelectorAll(".ps-paper"));
    if (papers.length < 2) return null;
    var cycleMs = parseFloat(el.getAttribute("data-cycle")) || 3800;
    var flying = false;
    var tl = gsap.timeline();
    papers.forEach(function (p, i) {
      tl.fromTo(p,
        { opacity: 0, "--ps-fly": i % 2 ? "4deg" : "-4deg" },
        { opacity: 1, "--ps-fly": "0deg", duration: 0.45, ease: "back.out(1.7)" },
        0.09 * i);
    });
    /* Slot geometry mirrors the CSS :nth-child offsets — keep in sync. */
    var SLOTS = [ { r: -0.6, y: 0, s: 1 }, { r: 1.6, y: 10, s: 0.985 }, { r: -2.2, y: 20, s: 0.97 } ];
    function slotAt(i) { return i < SLOTS.length ? SLOTS[i] : { r: 2.4, y: 28, s: 0.96 }; }
    var cycle = gsap.timeline({ repeat: -1, paused: true, onRepeat: function () {
      if (flying) return;
      flying = true;
      var top = stack.querySelector(".ps-paper:first-child");
      /* Re-queue FIRST so the sheet lands on a real slot — but siblings rise via
         GSAP, NOT the CSS transition: appendChild re-inserts nodes, which CANCELS
         running transitions (the classic move-kills-transition gotcha — the rise
         used to snap). Draw the rise explicitly, then hand the vars back to CSS. */
      top.classList.add("is-flying");
      top.style.zIndex = 4;                 /* fly over the rising stack */
      stack.appendChild(top);
      /* appendChild moved the sheet to the LAST slot — pin the TOP-slot geometry
         inline so the flight starts exactly where the sheet was (no snap-down),
         released later while invisible so it lands on its real bottom slot. */
      var s0 = slotAt(0);
      top.style.setProperty("--ps-r", s0.r + "deg");
      top.style.setProperty("--ps-y", s0.y + "px");
      top.style.setProperty("--ps-s", String(s0.s));
      [].slice.call(stack.querySelectorAll(".ps-paper"), 0, -1).forEach(function (p, i) {
        var from = slotAt(i + 1), to = slotAt(i);
        p.classList.add("is-rising");
        gsap.fromTo(p,
          { "--ps-r": from.r + "deg", "--ps-y": from.y + "px", "--ps-s": from.s },
          { "--ps-r": to.r + "deg", "--ps-y": to.y + "px", "--ps-s": to.s,
            duration: 0.5, ease: "power2.out",
            onComplete: function () {
              ["--ps-r", "--ps-y", "--ps-s"].forEach(function (v) { p.style.removeProperty(v); });
              p.classList.remove("is-rising");
            } });
      });
      gsap.timeline({ onComplete: function () {
          top.classList.remove("is-flying");
          top.style.removeProperty("z-index");
          flying = false;
        } })
        .to(top, { "--ps-x": "130%", "--ps-fly": "10deg", duration: 0.62, ease: "power2.in" }, 0)
        .to(top, { opacity: 0, duration: 0.22, ease: "power1.in" }, 0.40)
        /* invisible: snap the flight vars to the new bottom slot (no pop), then settle in */
        .call(function () {
            top.style.removeProperty("--ps-x");
            top.style.removeProperty("--ps-fly");
            top.style.removeProperty("--ps-r");
            top.style.removeProperty("--ps-y");
            top.style.removeProperty("--ps-s");
          })
        .fromTo(top,
          { opacity: 0, "--ps-fly": "-6deg" },
          { opacity: 1, "--ps-fly": "0deg", duration: 0.5, ease: "sine.out" },
          "+=0.04");
    } });
    cycle.to({}, { duration: cycleMs / 1000 });
    h.loop(cycle);
    tl.add(function () { cycle.resume(); }, 0.4);   /* lazy start with the entrance */
    return tl;
  });


  /* ---------- D · data visuals (v0.24.0) — living charts ---------- */

  /* D1: .areachart — line draws, area settles, scanner sweeps forever */
  api.register(".areachart", function (el, h) {
    var line = el.querySelector(".ac-line");
    var area = el.querySelector(".ac-area");
    var sweep = el.querySelector(".ac-sweep");
    var dot = el.querySelector(".ac-dot");
    var tl = gsap.timeline();
    if (line) {
      var len = line.getTotalLength();
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(line, { strokeDashoffset: 0, duration: 1.1, ease: h.ease }, 0.1);
    }
    if (area) tl.from(area, { opacity: 0, duration: 0.7, ease: h.ease }, 0.5);
    if (dot) {
      tl.from(dot, { scale: 0, transformOrigin: "center", duration: 0.3, ease: "back.out(2)" }, 1.05);
      tl.add(function () {
        h.loop(gsap.to(dot, { scale: 1.5, opacity: 0.5, duration: 0.8,
          yoyo: true, repeat: -1, ease: "sine.inOut" }));
      });
    }
    if (sweep) {
      var x2 = sweep.ownerSVGElement.viewBox.baseVal.width;
      tl.add(function () {
        h.loop(gsap.fromTo(sweep,
          { attr: { x1: 0, x2: 0 }, opacity: 0 },
          { attr: { x1: x2, x2: x2 }, opacity: 1, duration: 2.8, repeat: -1, ease: "none" }));
      }, 1.2);
    }
    return tl;
  });

  /* D2: .donut — segments draw to their dasharray, orb travels the ring */
  api.register(".donut", function (el, h) {
    var tl = gsap.timeline();
    var segs = el.querySelectorAll(".dn-seg");
    segs.forEach(function (seg, i) {
      var final = seg.getAttribute("stroke-dasharray");
      var parts = final.split(" ");
      tl.fromTo(seg,
        { attr: { "stroke-dasharray": "0 " + parts[1] } },
        { attr: { "stroke-dasharray": final }, duration: 0.9, ease: h.ease }, 0.12 + i * 0.16);
    });
    var val = el.querySelector(".dn-val");
    if (val) {
      var target = parseFloat(val.getAttribute("data-val")) || 0;
      var obj = { v: 0 };
      tl.fromTo(obj, { v: 0 }, { v: target, duration: 1.1, ease: "power3.out",
        onStart: function () { val.textContent = "0%"; },
        onUpdate: function () { val.textContent = Math.round(obj.v) + "%"; } }, 0.2);
    }
    var orb = el.querySelector(".dn-orb");
    if (orb) {
      tl.add(function () {
        h.loop(gsap.to(orb, { rotation: 360, svgOrigin: "74 74", duration: 6, repeat: -1, ease: "none" }));
      }, 1.1);
    }
    return tl;
  });

  /* D3: .radar — polygons grow from center, dots pop, sweep rotates */
  api.register(".radar", function (el, h) {
    var tl = gsap.timeline();
    var svg = el.querySelector("svg");
    var cx = svg ? svg.viewBox.baseVal.width / 2 : 150;
    var cy = svg ? svg.viewBox.baseVal.height / 2 : 150;
    var polys = el.querySelectorAll(".rd-poly");
    if (polys.length) tl.from(polys, { scale: 0, svgOrigin: cx + " " + cy,
      duration: 0.7, ease: "back.out(1.6)", stagger: 0.14 }, 0.15);
    var dots = el.querySelectorAll(".rd-dot");
    if (dots.length) tl.from(dots, { scale: 0, duration: 0.3, ease: "back.out(2.2)", stagger: 0.05 }, 0.55);
    var sweep = el.querySelector(".rd-sweep");
    if (sweep) {
      tl.add(function () {
        h.loop(gsap.to(sweep, { rotation: 360, svgOrigin: cx + " " + cy, duration: 4.5, repeat: -1, ease: "none" }));
      }, 0.9);
    }
    return tl;
  });

  /* D4: .sparkline — micro draw + endpoint pulse */
  api.register(".sparkline", function (el, h) {
    var line = el.querySelector(".sp-line");
    var dot = el.querySelector(".sp-dot");
    var tl = gsap.timeline();
    if (line) {
      var len = line.getTotalLength();
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(line, { strokeDashoffset: 0, duration: 0.8, ease: h.ease }, 0.1);
    }
    if (dot) {
      tl.from(dot, { scale: 0, transformOrigin: "center", duration: 0.25, ease: "back.out(2)" }, 0.75);
      tl.add(function () {
        h.loop(gsap.to(dot, { scale: 1.5, opacity: 0.5, duration: 0.7, yoyo: true, repeat: -1, ease: "sine.inOut" }));
      });
    }
    return tl;
  });

  /* D5: .diagram — connector dash-flow (renderer output stays static; the frame carries the life signal) */
  api.register(".diagram", function (el, h) {
    var flows = el.querySelectorAll(".dg-flow");
    flows.forEach(function (p) {
      h.loop(gsap.fromTo(p, { strokeDashoffset: 0 },
        { strokeDashoffset: -24, duration: 1.6, ease: "none", repeat: -1 }));
    });
    return null;
  });

  /* ---------- K · kinesis — self-running presentation loops (v0.22.0) ---------- */

  /* K1: .wave — seamless SVG flow (path period repeated twice; -50% loops) */
  api.register(".wave", function (el, h) {
    var svg = el.querySelector("svg");
    if (!svg) return null;
    var dur = parseFloat(el.style.getPropertyValue("--dur")) || 6;
    var t = gsap.to(svg, { xPercent: -50, duration: dur, ease: "none", repeat: -1 });
    h.loop(t);
    return null;
  });

  /* K2: .eq — equalizer bars, randomized phase per bar */
  api.register(".eq", function (el, h) {
    var bars = el.querySelectorAll("i");
    if (!bars.length) return null;
    bars.forEach(function (bar, i) {
      var t = gsap.fromTo(bar, { scaleY: 0.3 },
        { scaleY: 1, duration: gsap.utils.random(0.45, 0.9),
          ease: "sine.inOut", yoyo: true, repeat: -1,
          delay: gsap.utils.random(0, 0.6) });
      h.loop(t);
    });
    return null;
  });

  /* K3: .marquee — seamless ticker (track content duplicated exactly twice) */
  api.register(".marquee", function (el, h) {
    var track = el.querySelector(".mq-track");
    if (!track) return null;
    var dur = parseFloat(el.style.getPropertyValue("--dur")) || 18;
    var t = gsap.to(track, { xPercent: -50, duration: dur, ease: "none", repeat: -1 });
    h.loop(t);
    return null;
  });

  /* K4: .wc-wash — aurora wave stack (powers .wavecard's foot and standalone
     backgrounds alike): blurred spark waves flow at parallax speeds. Each svg
     carries the path period twice, so ±50% loops seamlessly; the middle layer
     runs mirrored (-50 → 0) so they cross instead of marching in step. */
  api.register(".wc-wash", function (el, h) {
    var plan = [ { from: 0, to: -50, dur: 16 },   /* w1 blue — left, steady  */
                 { from: -50, to: 0, dur: 26 },    /* w2 purple — right, slow */
                 { from: 0, to: -50, dur: 11 } ];  /* w3 pink — left, quick   */
    /* data-durs="9,15,7" — per-layer speed override (thin footers read better faster) */
    var custom = (el.getAttribute("data-durs") || "").split(",").map(parseFloat).filter(isFinite);
    if (custom.length) plan = plan.map(function (p, i) {
      return { from: p.from, to: p.to, dur: custom[i % custom.length] };
    });
    el.querySelectorAll(".wc-wave").forEach(function (svg, i) {
      var p = plan[i % plan.length];
      h.loop(gsap.fromTo(svg, { xPercent: p.from },
        { xPercent: p.to, duration: p.dur, ease: "none", repeat: -1 }));
    });
    return null;
  });

  /* K4: .orbit — ring(s) rotate forever; each .o-ring may carry --dur */
  api.register(".orbit", function (el, h) {
    var rings = el.querySelectorAll(".o-ring");
    if (!rings.length) return null;
    rings.forEach(function (ring) {
      var dur = parseFloat(ring.style.getPropertyValue("--dur")) || 12;
      var t = gsap.to(ring, { rotation: 360, duration: dur, ease: "none", repeat: -1 });
      h.loop(t);
    });
    return null;
  });

  /* K5: .breathe — gentle scale/opacity breathing (glow feel) */
  api.register(".breathe", function (el, h) {
    var dur = parseFloat(el.style.getPropertyValue("--dur")) || 3;
    var t = gsap.to(el, { scale: 1.04, opacity: 0.86, duration: dur,
      ease: "sine.inOut", yoyo: true, repeat: -1 });
    h.loop(t);
    return null;
  });

  /* K6: .text-wave — SplitText chars bob in sequence */
  api.register(".text-wave", function (el, h) {
    if (!api.has("SplitText")) return null;
    var split = w.SplitText.create(el, { type: "chars" });
    var t = gsap.to(split.chars, { yPercent: -14, duration: 0.55,
      ease: "sine.inOut", yoyo: true, repeat: -1, stagger: { each: 0.06, repeat: -1, yoyo: true } });
    h.loop(t);
    return null;
  });

  api.register(".pipeline", function (el, h) {
    var gaps = el.querySelectorAll(".pl-gap");
    var tl = gsap.timeline({ repeat: -1 });
    gaps.forEach(function (gap, i) {
      var d = i * 0.45;
      tl.fromTo(gap,
        { "--pkt-x": "-8px", "--pkt-y": "-8px", "--pkt-opacity": 0 },
        { "--pkt-x": "-2px", "--pkt-y": "-2px", "--pkt-opacity": 1, duration: 0.15, ease: "none" },
        d
      ).to(gap,
        { "--pkt-x": "34px", "--pkt-y": "30px", "--pkt-opacity": 1, duration: 1.0, ease: "power1.inOut" },
        d + 0.15
      ).to(gap,
        { "--pkt-x": "40px", "--pkt-y": "36px", "--pkt-opacity": 0, duration: 0.15, ease: "none" },
        d + 1.15
      );
    });
    h.loop(tl);

    /* v0.24.1 — topology-grade telemetry inspector (same data-topo-* contract) */
    var frame = el.closest(".pl-frame") || el;
    var inspTitle = frame.querySelector(".topo-inspector-title");
    var inspTech = frame.querySelector(".topo-inspector-tech");
    var inspRole = frame.querySelector(".topo-inspector-role");
    var nodes = el.querySelectorAll(".pl-node[data-topo-title]");
    if (!nodes.length || !inspTitle) return null;
    var dT = inspTitle.textContent, dH = inspTech ? inspTech.textContent : "", dR = inspRole ? inspRole.textContent : "";
    function setInsp(node) {
      if (!node) {
        inspTitle.textContent = dT;
        if (inspTech) inspTech.textContent = dH;
        if (inspRole) inspRole.textContent = dR;
        nodes.forEach(function (n) { n.classList.remove("is-inspected"); });
        return;
      }
      inspTitle.textContent = node.getAttribute("data-topo-title") || dT;
      if (inspTech) inspTech.textContent = node.getAttribute("data-topo-tech") || dH;
      if (inspRole) inspRole.textContent = node.getAttribute("data-topo-role") || dR;
      nodes.forEach(function (n) { n.classList.toggle("is-inspected", n === node); });
    }
    nodes.forEach(function (node) {
      node.addEventListener("mouseenter", function () { setInsp(node); });
      node.addEventListener("mouseleave", function () { setInsp(null); });
      node.addEventListener("focus", function () { setInsp(node); });
      node.addEventListener("blur", function () { setInsp(null); });
      node.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setInsp(node); }
        else if (e.key === "Escape") { setInsp(null); node.blur(); }
      });
    });
    return null;
  });

  /* P2.7: .topology — 2D system architecture blueprint with packet routing & node inspector */
  api.register(".topology", function (el, h) {
    var packets = el.querySelectorAll(".topo-packet");
    var nodes = el.querySelectorAll(".topo-node");
    var inspTitle = el.querySelector(".topo-inspector-title");
    var inspTech = el.querySelector(".topo-inspector-tech");
    var inspRole = el.querySelector(".topo-inspector-role");

    var defaultTitle = inspTitle ? inspTitle.textContent : "";
    var defaultTech = inspTech ? inspTech.textContent : "";
    var defaultRole = inspRole ? inspRole.textContent : "";

    /* 1. Packet animation along SVG paths */
    if (packets.length) {
      packets.forEach(function (pkt, idx) {
        var pathSel = pkt.getAttribute("data-path");
        var path = pathSel ? el.querySelector(pathSel) : null;
        if (!path) return;

        var dur = parseFloat(pkt.getAttribute("data-dur")) || (1.8 + (idx % 3) * 0.3);
        var delay = parseFloat(pkt.getAttribute("data-delay")) || (idx * 0.25);

        if (api.has("MotionPathPlugin")) {
          var t = gsap.to(pkt, {
            motionPath: {
              path: path,
              align: path,
              alignOrigin: [0.5, 0.5],
              autoRotate: false
            },
            duration: dur,
            repeat: -1,
            delay: delay,
            ease: "none"
          });
          h.loop(t);
        } else {
          var len = 0;
          try { len = path.getTotalLength(); } catch (e) {}
          if (len > 0) {
            var tracker = { p: 0 };
            var tFallback = gsap.to(tracker, {
              p: 1,
              duration: dur,
              repeat: -1,
              delay: delay,
              ease: "none",
              onUpdate: function () {
                var pt = path.getPointAtLength(tracker.p * len);
                pkt.setAttribute("cx", pt.x);
                pkt.setAttribute("cy", pt.y);
              }
            });
            h.loop(tFallback);
          }
        }
      });
    }

    /* 2. Interactive node inspector */
    function setInspector(node) {
      if (!node) {
        if (inspTitle) inspTitle.textContent = defaultTitle;
        if (inspTech) inspTech.textContent = defaultTech;
        if (inspRole) inspRole.textContent = defaultRole;
        nodes.forEach(function (n) { n.classList.remove("is-inspected"); });
        return;
      }
      var title = node.getAttribute("data-topo-title");
      var tech = node.getAttribute("data-topo-tech");
      var role = node.getAttribute("data-topo-role");

      if (inspTitle && title) inspTitle.textContent = title;
      if (inspTech && tech) inspTech.textContent = tech;
      if (inspRole && role) inspRole.textContent = role;

      nodes.forEach(function (n) {
        if (n === node) n.classList.add("is-inspected");
        else n.classList.remove("is-inspected");
      });
    }

    nodes.forEach(function (node) {
      node.addEventListener("mouseenter", function () { setInspector(node); });
      node.addEventListener("mouseleave", function () { setInspector(null); });
      node.addEventListener("focus", function () { setInspector(node); });
      node.addEventListener("blur", function () { setInspector(null); });
      node.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setInspector(node);
        } else if (e.key === "Escape") {
          setInspector(null);
          node.blur();
        }
      });
    });

    return null;
  });

  /* ---------- P3 · GSAP advanced effects (v0.19.4) ---------- */

  /* P3.1: .anim-scramble — ScrambleText decode effect on text */
  api.register(".anim-scramble", function (el, h) {
    var txt = el.getAttribute("data-scramble") || el.textContent;
    var dur = parseFloat(el.getAttribute("data-dur")) || 1.1;
    var charsType = el.getAttribute("data-chars") || "upper";
    var chars = charsType === "upper" ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      : (charsType === "digits" ? "0123456789" : "!<>-_\\/[]{}—=+*^?#________");
    var tl = gsap.timeline();
    if (api.has("ScrambleTextPlugin")) {
      tl.to(el, {
        duration: dur,
        scrambleText: { text: txt, chars: chars, revealDelay: 0.15 },
        ease: "none"
      });
    }
    return tl;
  });

  /* P3.2: .anim-tilt — 3D cursor & pointer tilt via gsap.quickTo */
  api.register(".anim-tilt", function (el, h) {
    gsap.set(el, { transformPerspective: 800, transformStyle: "preserve-3d" });
    var xTo = gsap.quickTo(el, "rotationY", { duration: 0.35, ease: "power2.out" });
    var yTo = gsap.quickTo(el, "rotationX", { duration: 0.35, ease: "power2.out" });
    var sTo = gsap.quickTo(el, "scale", { duration: 0.35, ease: "power2.out" });

    function onMove(e) {
      var r = el.getBoundingClientRect();
      var nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      var ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      nx = Math.max(-1, Math.min(1, nx));
      ny = Math.max(-1, Math.min(1, ny));
      xTo(nx * 12);
      yTo(-ny * 12);
      sTo(1.025);
    }
    function onLeave() {
      xTo(0);
      yTo(0);
      sTo(1);
    }
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointercancel", onLeave);
    el.addEventListener("pointerup", onLeave);
    return null;
  });

  /* P3.4: .anim-drawsvg / .sparkline — DrawSVG path line draw */
  api.register(".anim-drawsvg", function (el, h) {
    if (!api.has("DrawSVGPlugin")) return null;
    var paths = el.querySelectorAll("path, line, polyline");
    var tl = gsap.timeline();
    tl.fromTo(paths,
      { drawSVG: "0%" },
      { drawSVG: "100%", duration: 1.2, ease: h.ease, stagger: 0.12 }
    );
    return tl;
  });

  /* P3.3: Flip helper API */
  api.flip = function (targets, mutateFn, opts) {
    if (!api.has("Flip") || !api.motion) {
      if (typeof mutateFn === "function") mutateFn();
      return;
    }
    var state = w.Flip.getState(targets);
    if (typeof mutateFn === "function") mutateFn();
    w.Flip.from(state, Object.assign({ duration: 0.45, ease: api.ease }, opts || {}));
  };

  /* ---------- P4 · Page-level (v0.19.6) ---------- */
  /* P4.2: .hero entrance timeline + stall guard */
  api.register(".hero", function (el, h) {
    var kicker = el.querySelector(".kicker");
    var h1 = el.querySelector("h1");
    var sub = el.querySelector(".hero-sub");
    var side = el.querySelector(".hero-side");
    var tl = gsap.timeline();
    if (kicker) tl.fromTo(kicker, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7, ease: h.ease, clearProps: "transform" }, 0);
    if (h1) tl.fromTo(h1, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7, ease: h.ease, clearProps: "transform" }, 0.09);
    if (sub) tl.fromTo(sub, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7, ease: h.ease, clearProps: "transform" }, 0.18);
    if (side) tl.fromTo(side, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7, ease: h.ease, clearProps: "transform" }, 0.26);
    return tl;
  });

  /* P4.1: .rv scroll reveal via ScrollTrigger.batch */
  function initReveals() {
    var rvs = d.querySelectorAll(".rv");
    if (!rvs.length) return;
    if (api.has("ScrollTrigger")) {
      w.ScrollTrigger.batch(".rv", {
        interval: 0.1,
        start: "top 92%",
        once: true, /* without this, re-entering viewport re-runs fromTo: the element JUMPS down 24px and rises again — the down-up blip (v0.22.5) */
        onLeave: function (batch) {
          batch.forEach(function (el) {
            el.classList.add("in");
            gsap.set(el, { opacity: 1, clearProps: "transform" });
          });
        },
        onEnter: function (batch) {
          /* .in FIRST — inline tween styles override the class during the run,
             so adding it at START (not onComplete) closes the gap where
             clearProps strips inline styles before .in lands: that gap made
             CSS re-hide the element (down 24px + flash) for a few frames —
             the down-up blip on nearly every card (v0.22.6). */
          batch.forEach(function (el) { el.classList.add("in"); });
          gsap.fromTo(batch,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: api.ease,
              stagger: 0.07,
              overwrite: "auto",
              clearProps: "transform"
            }
          );
        }
      });
    } else {
      revealAllRvs();
    }
  }

  /* P4.4: Scroll-linked hero parallax (transform-only scrub) */
  function initParallax() {
    if (!api.has("ScrollTrigger")) return;
    var hero = d.querySelector(".hero");
    var heroGrid = d.querySelector(".hero-grid");
    if (!hero || !heroGrid) return;
    gsap.to(heroGrid, {
      y: 90,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: true,
        id: "hero-parallax"
      }
    });
  }

  /* ---------- P0.5 · reduced-motion gate (gsap.matchMedia) ---------- */
  function boot() {
    registerPlugins();
    started = true;
    api.motion = true;
    root.classList.add("tm-ready");
    io = new IntersectionObserver(onIntersect, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    scan(d);
    initReveals();
    initParallax();
  }
  function teardown() {
    /* ctx.revert() kills tweens, reverts SplitText, clears inline styles ⇒
       every widget falls back to its CSS final state. */
    if (io) io.disconnect();
    if (w.ScrollTrigger) {
      var stParallax = w.ScrollTrigger.getById("hero-parallax");
      if (stParallax) stParallax.kill();
      w.ScrollTrigger.getAll().forEach(function (st) {
        if (st.vars && (st.vars.trigger === ".rv" || (typeof st.vars.trigger === "string" && st.vars.trigger.indexOf(".rv") > -1))) {
          st.kill();
        }
      });
    }
    gsap.set(".hero-grid", { clearProps: "transform" });
    clearInterval(loopGuard);
    instances.forEach(function (i) { clearTimeout(i.watchdog); i.ctx.revert(); });
    instances = []; byEl = new WeakMap(); io = null;
    started = false; api.motion = false;
    root.classList.remove("tm-ready");
    revealAllRvs();
  }

  /* P7 · GSDevTools — opt-in visual timeline debugger (?dev=1 loads it) */
  if (w.location.search.indexOf("dev=1") > -1) {
    var s = d.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/GSDevTools.min.js";
    s.onload = function () {
      gsap.registerPlugin(w.GSDevTools);
      w.GSDevTools.create();
    };
    d.head.appendChild(s);
  }

  function arm_mm() {
    var mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", function () {
      boot();
      return teardown;
    });
  }
  /* Safe from <head> or end of <body>: boot once the DOM is parsed. */
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", arm_mm);
  else arm_mm();
})(window, document);

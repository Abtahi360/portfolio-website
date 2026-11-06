/* ── Other Projects: cinematic discovery demo ─────────────────────
   Teaches "a project card opens its details" with one short, real
   demonstration on the actual grid:

     light divider → raise a real card in 3D → pointer (or touch
     pulse) presses its "View details" cue → the real modal content
     grows out of the card as a passive preview → it folds back into
     the card → grid returns to normal → "Replay demo" stays.

   • Trigger: the first eligible Other Projects card being genuinely
     visible (IntersectionObserver), never the #projects entry.
   • Content: window.ProjectDetailsModal.preview(key) — the same
     renderer and data as a normal click; no focus change, inert,
     aria-hidden. A real click always wins.
   • Lifecycle: idle → running → completed | dismissed. One run at a
     time; every timer, listener, observer and animation of a run is
     tracked and released by cleanup().
   • Reduced motion: no autoplay; the control shows a static highlight.
   No dependencies: CSS transitions + Web Animations API (optional).
   ──────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  if (typeof window === "undefined" || typeof document === "undefined") return;

  var STORAGE_KEY = "portfolio:other-projects-discovery-demo:v1";

  /* Timeline (ms from start). Tuned in the browser; see the brief's phases. */
  var T = {
    light: 0,        /* phase 1: divider + label                         */
    rise: 380,       /* phase 2: stage on, card rises (700ms transition) */
    pointer: 1120,   /* phase 3: pointer travels to the cue              */
    press: 1780,     /*          press + ripple                          */
    reveal: 1880,    /* phase 4: preview grows out of the card           */
    close: 3820,     /* phase 6: preview folds back into the card        */
    settle: 3980,    /*          card + neighbours return                */
    exit: 4560,      /* phase 7: guide row returns to the hint           */
    unstage: 4720,   /*          perspective off after transitions end   */
    done: 5200
  };
  var POINTER_MS = 640;
  var REVEAL_MS = 460;
  var CLOSE_MS = 440;
  var STATIC_MS = 4200;

  var EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
  var EASE_INOUT = "cubic-bezier(0.65, 0, 0.35, 1)";
  var EASE_IN = "cubic-bezier(0.4, 0, 0.7, 0.2)";

  var POINTER_SVG =
    '<svg viewBox="0 0 22 26" aria-hidden="true" focusable="false">' +
    '<path class="pdemo-pointer-fill" stroke-width="1.4" stroke-linejoin="round" ' +
    'd="M2 1.6 L2 20.4 L7.1 15.9 L10.4 23.6 L13.6 22.2 L10.4 14.6 L17.4 14.4 Z"/></svg>';

  var state = "idle";          /* idle | running | completed | dismissed */
  var run = null;              /* the active run, or null */
  var runToken = 0;
  var autoplayConsumed = false;
  var autoObserver = null;
  var armTimer = null;
  var pendingReplay = null;
  var els = {};
  var initialised = false;

  /* ── Environment helpers ───────────────────────────────────── */
  function mq(query) {
    try {
      return !!(window.matchMedia && window.matchMedia(query).matches);
    } catch (e) {
      return false;
    }
  }

  function reducedMotion() {
    return mq("(prefers-reduced-motion: reduce)");
  }

  function touchMode() {
    return mq("(hover: none) and (pointer: coarse)") || (window.innerWidth || 1024) <= 720;
  }

  function storageGet() {
    try {
      return window.sessionStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function storageSet(value) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, value);
    } catch (e) { /* private mode etc.: in-memory flag still prevents repeats */ }
  }

  function modal() {
    var m = window.ProjectDetailsModal;
    return m && typeof m.preview === "function" ? m : null;
  }

  function rendered(el) {
    return !!(el && el.isConnected !== false && el.getClientRects && el.getClientRects().length);
  }

  /* ── Card selection: first card whose key has real detail data ── */
  function eligibleCards() {
    var m = modal();
    if (!els.grid || !m) return [];
    return Array.prototype.filter.call(els.grid.children, function (card) {
      if (!card.classList || !card.classList.contains("card")) return false;
      var key = card.getAttribute("data-project-key");
      return !!key && m.has(key) && rendered(card);
    });
  }

  function pickCard() {
    return eligibleCards()[0] || null;
  }

  function cueOf(card) {
    return card.querySelector(".card-details-cue") || card.querySelector(".card-title") || card;
  }

  /* motion.js reveals cards with inline opacity/transform and clears
     them ~1s later; the demo's classes must not fight those styles. */
  function settled(card) {
    return !card.style.opacity && !card.style.transform && !card.style.transition;
  }

  /* ── UI helpers ────────────────────────────────────────────── */
  function setStep(n) {
    (els.steps || []).forEach(function (li, i) {
      li.classList.toggle("is-done", i < n - 1);
      li.classList.toggle("is-active", i === n - 1);
    });
  }

  function setReplayLabel() {
    if (!els.replayLabel) return;
    var text = reducedMotion()
      ? "Show me how"
      : (state === "idle" ? "Watch demo" : "Replay demo");
    els.replayLabel.textContent = text;
  }

  function setRootState(value) {
    if (els.root) els.root.setAttribute("data-state", value);
  }

  /* ── Run bookkeeping ───────────────────────────────────────── */
  function newRun(card, kind) {
    runToken += 1;
    run = {
      token: runToken,
      kind: kind,             /* "cinematic" | "static" */
      card: card,
      key: card.getAttribute("data-project-key"),
      cue: cueOf(card),
      timers: [],
      anims: [],
      offs: [],
      layer: null,
      observer: null
    };
    return run;
  }

  function later(ms, fn) {
    var r = run;
    var id = setTimeout(function () {
      if (run !== r) return;
      try {
        fn();
      } catch (err) {
        /* A failed frame must never strand the grid in a demo state. */
        if (window.console && console.warn) console.warn("[discovery-demo]", err);
        cancel("error");
      }
    }, ms);
    r.timers.push(id);
    return id;
  }

  function listen(target, type, fn, opts) {
    if (!target || !target.addEventListener) return;
    target.addEventListener(type, fn, opts);
    run.offs.push(function () {
      target.removeEventListener(type, fn, opts);
    });
  }

  function animate(el, frames, options) {
    if (!el || typeof el.animate !== "function") return null;
    try {
      var a = el.animate(frames, options);
      if (run) run.anims.push(a);
      return a;
    } catch (e) {
      return null;
    }
  }

  function cleanup() {
    var r = run;
    if (!r) return;
    run = null;
    r.timers.forEach(clearTimeout);
    r.anims.forEach(function (a) {
      try { a.cancel(); } catch (e) { /* already gone */ }
    });
    r.offs.forEach(function (off) { off(); });
    if (r.observer) r.observer.disconnect();
    if (r.layer && r.layer.parentNode) r.layer.parentNode.removeChild(r.layer);

    if (els.grid) {
      els.grid.classList.remove("is-pdemo-stage");
      els.grid.style.removeProperty("--pdemo-origin");
      Array.prototype.forEach.call(els.grid.children, function (c) {
        c.classList.remove("is-pdemo-active", "is-pdemo-dim", "is-pdemo-static");
      });
    }
    if (r.cue && r.cue.classList) r.cue.classList.remove("is-pdemo-pressed");
    if (els.host) els.host.classList.remove("pdemo-host");
    if (els.divider) els.divider.classList.remove("is-lit");
    if (els.skip) els.skip.hidden = true;
    if (els.replay) els.replay.removeAttribute("aria-disabled");
    if (els.bar) els.bar.style.transform = "";
    setStep(0);

    var m = modal();
    if (m && m.panel && m.panel.style) {
      m.panel.style.removeProperty("--pdemo-hold");
      m.panel.style.removeProperty("--pdemo-hold-delay");
    }
    if (m && m.isPreviewing()) m.endPreview();
  }

  function finish() {
    cleanup();
    state = "completed";
    storageSet("completed");
    setRootState("completed");
    setReplayLabel();
  }

  function cancel(reason) {
    if (pendingReplay) {
      clearTimeout(pendingReplay);
      pendingReplay = null;
    }
    if (!run) return false;
    cleanup();
    state = "dismissed";
    autoplayConsumed = true;
    stopAutoplayWatch();
    storageSet("dismissed");
    setRootState("dismissed");
    setReplayLabel();
    if (els.root) els.root.setAttribute("data-last-cancel", reason || "cancel");
    return true;
  }

  /* Any genuine visitor input ends the demo immediately and lets the
     input do its normal job (the event is never prevented). */
  function bindInterruptions(r) {
    var startWidth = window.innerWidth;
    listen(document, "pointerdown", function () { cancel("pointer"); }, true);
    listen(document, "touchstart", function () { cancel("touch"); }, { capture: true, passive: true });
    listen(document, "keydown", function (e) {
      if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") return;
      cancel("key");
    }, true);
    listen(document, "visibilitychange", function () {
      if (document.hidden) cancel("hidden");
    });
    listen(window, "blur", function () { cancel("blur"); });
    listen(window, "resize", function () {
      if (Math.abs(window.innerWidth - startWidth) > 30) cancel("resize");
    });
    listen(document, "projectmodal:previewinterrupted", function () { cancel("modal"); });
    listen(document, "projectmodal:open", function () { cancel("modal"); });

    if ("IntersectionObserver" in window) {
      r.observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.12) cancel("scrolled-away");
        });
      }, { threshold: [0, 0.12, 0.3] });
      /* The first callback reports the current state; it is valid. */
      r.observer.observe(r.card);
    }
  }

  /* ── Geometry ──────────────────────────────────────────────── */
  function centre(rect) {
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function quadPoint(a, c, b, t) {
    var u = 1 - t;
    return {
      x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
      y: u * u * a.y + 2 * u * t * c.y + t * t * b.y
    };
  }

  function pointerFrames(target, hostWidth) {
    var start = {
      x: Math.min(target.x + 150, hostWidth - 30),
      y: target.y + 120
    };
    if (start.x - target.x < 60) start.x = Math.max(target.x - 150, 10);
    /* Control point bows the path so it reads as a hand movement. */
    var ctrl = { x: start.x + (target.x - start.x) * 0.15, y: target.y + 10 };
    var frames = [];
    var steps = 8;
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var p = quadPoint(start, ctrl, target, t);
      frames.push({
        offset: t,
        opacity: t === 0 ? 0 : 1,
        transform: "translate3d(" + p.x.toFixed(1) + "px," + p.y.toFixed(1) + "px,0) scale(" + (0.94 + 0.06 * t).toFixed(3) + ")"
      });
    }
    frames[1].opacity = 0.85;
    return frames;
  }

  function relativeTo(hostRect, rect) {
    var c = centre(rect);
    return { x: c.x - hostRect.left, y: c.y - hostRect.top };
  }

  /* Translate/scale that maps the centred modal panel onto the card. */
  function cardMapping(panel, card) {
    var pr = panel.getBoundingClientRect();
    var cr = card.getBoundingClientRect();
    var pc = centre(pr);
    var cc = centre(cr);
    var s = pr.width ? Math.max(0.35, Math.min(0.92, cr.width / pr.width)) * 0.9 : 0.6;
    return "translate3d(" + (cc.x - pc.x).toFixed(1) + "px," + (cc.y - pc.y).toFixed(1) + "px,0) scale(" + s.toFixed(3) + ")";
  }

  /* ── The cinematic run ─────────────────────────────────────── */
  function playCinematic(card) {
    var r = newRun(card, "cinematic");
    var m = modal();
    var touch = touchMode();
    var backdrop = m.panel && m.panel.closest ? m.panel.closest(".project-modal-backdrop") : null;

    state = "running";
    setRootState("running");
    setReplayLabel();
    if (els.instruction) {
      els.instruction.textContent = touch
        ? "Tap a project to explore its details"
        : "Click a project to explore its details";
    }
    if (els.skip) els.skip.hidden = false;
    if (els.replay) els.replay.setAttribute("aria-disabled", "true");

    /* Phase 1 — recognise the subsection */
    if (els.divider) els.divider.classList.add("is-lit");
    setStep(1);
    animate(els.bar, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: T.exit, easing: "linear", fill: "forwards" });

    later(30, function () { bindInterruptions(r); });

    /* Phase 2 — the real card rises */
    later(T.rise, function () {
      var gr = els.grid.getBoundingClientRect();
      var cc = centre(r.card.getBoundingClientRect());
      els.grid.style.setProperty("--pdemo-origin",
        Math.round(cc.x - gr.left) + "px " + Math.round(cc.y - gr.top - 120) + "px");
      els.grid.classList.add("is-pdemo-stage");
    });
    later(T.rise + 34, function () {
      Array.prototype.forEach.call(els.grid.children, function (c) {
        if (c === r.card) c.classList.add("is-pdemo-active");
        else if (c.classList.contains("card")) c.classList.add("is-pdemo-dim");
      });
    });

    /* Phase 3 — pointer (desktop) or touch pulse (mobile) */
    later(T.pointer, function () {
      setStep(2);
      els.host.classList.add("pdemo-host");
      var layer = document.createElement("div");
      layer.className = "pdemo-layer";
      layer.setAttribute("aria-hidden", "true");
      els.host.appendChild(layer);
      r.layer = layer;

      var hostRect = els.host.getBoundingClientRect();
      r.target = relativeTo(hostRect, r.cue.getBoundingClientRect());

      if (touch) return;
      var pointer = document.createElement("div");
      pointer.className = "pdemo-pointer";
      pointer.innerHTML = POINTER_SVG;
      layer.appendChild(pointer);
      r.pointer = pointer;
      /* The arrow's tip sits at (2,2) inside its 22×26 box. */
      var tip = { x: r.target.x - 2, y: r.target.y - 2 };
      r.pointerEnd = "translate3d(" + tip.x.toFixed(1) + "px," + tip.y.toFixed(1) + "px,0) scale(1)";
      animate(pointer, pointerFrames(tip, hostRect.width), {
        duration: POINTER_MS, easing: EASE_INOUT, fill: "forwards"
      });
    });

    later(T.press, function () {
      var at = "translate3d(" + r.target.x.toFixed(1) + "px," + r.target.y.toFixed(1) + "px,0)";
      if (r.cue.classList) r.cue.classList.add("is-pdemo-pressed");
      if (r.pointer) {
        animate(r.pointer, [
          { transform: r.pointerEnd },
          { transform: r.pointerEnd.replace("scale(1)", "scale(0.86)"), offset: 0.4 },
          { transform: r.pointerEnd }
        ], { duration: 220, easing: "ease-out", fill: "forwards" });
        var ripple = document.createElement("div");
        ripple.className = "pdemo-ripple";
        r.layer.appendChild(ripple);
        animate(ripple, [
          { transform: at + " scale(0.3)", opacity: 0.9 },
          { transform: at + " scale(1.7)", opacity: 0 }
        ], { duration: 560, easing: EASE_OUT, fill: "forwards" });
      } else {
        var pulse = document.createElement("div");
        pulse.className = "pdemo-touch";
        r.layer.appendChild(pulse);
        animate(pulse, [
          { transform: at + " scale(0.4)", opacity: 0 },
          { transform: at + " scale(1)", opacity: 1, offset: 0.3 },
          { transform: at + " scale(1.45)", opacity: 0 }
        ], { duration: 620, easing: EASE_OUT, fill: "forwards" });
      }
    });

    later(T.press + 170, function () {
      if (r.cue.classList) r.cue.classList.remove("is-pdemo-pressed");
    });

    /* Phase 4 — the real details grow out of the card */
    later(T.reveal, function () {
      var panel = m.preview(r.key);
      if (!panel) {
        cancel("modal-unavailable");
        return;
      }
      setStep(3);
      r.previewed = true;
      panel.style.setProperty("--pdemo-hold", (T.close - T.reveal - REVEAL_MS) + "ms");
      panel.style.setProperty("--pdemo-hold-delay", REVEAL_MS + "ms");
      animate(panel, [
        { transform: cardMapping(panel, r.card), opacity: 0 },
        { opacity: 1, offset: 0.4 },
        { transform: "none", opacity: 1 }
      ], { duration: REVEAL_MS, easing: EASE_OUT, fill: "backwards" });
      if (r.pointer) {
        animate(r.pointer, [
          { transform: r.pointerEnd, opacity: 1 },
          { transform: r.pointerEnd, opacity: 0 }
        ], { duration: 260, easing: "ease-out", fill: "forwards" });
      }
    });

    /* Phase 5 — hold (nothing moves except the drain line) */

    /* Phase 6 — fold the preview back into the card, reset the grid */
    later(T.close, function () {
      if (!m.isPreviewing()) return;
      var panel = m.panel;
      animate(panel, [
        { transform: "none", opacity: 1 },
        { transform: cardMapping(panel, r.card), opacity: 0 }
      ], { duration: CLOSE_MS, easing: EASE_IN, fill: "forwards" });
      if (backdrop) {
        animate(backdrop, [{ opacity: 1 }, { opacity: 0 }],
          { duration: CLOSE_MS, easing: "ease-in", fill: "forwards" });
      }
    });
    later(T.close + CLOSE_MS, function () {
      if (m.isPreviewing()) m.endPreview();
      /* Release the fill so the real dialog is untouched next time. */
      r.anims = r.anims.filter(function (a) {
        if (a.effect && (a.effect.target === m.panel || a.effect.target === backdrop)) {
          try { a.cancel(); } catch (e) { /* noop */ }
          return false;
        }
        return true;
      });
    });

    later(T.settle, function () {
      setStep(4);
      Array.prototype.forEach.call(els.grid.children, function (c) {
        c.classList.remove("is-pdemo-active", "is-pdemo-dim");
      });
      if (r.layer && r.layer.parentNode) r.layer.parentNode.removeChild(r.layer);
      r.layer = null;
    });

    /* Phase 7 — exit */
    later(T.exit, function () {
      setRootState("completed");
      if (els.divider) els.divider.classList.remove("is-lit");
      if (els.skip) els.skip.hidden = true;
    });
    later(T.unstage, function () {
      els.grid.classList.remove("is-pdemo-stage");
    });
    later(T.done, finish);
    return true;
  }

  /* ── Reduced motion: a still highlight, no auto-opened preview ── */
  function playStatic(card) {
    var r = newRun(card, "static");
    state = "running";
    if (els.divider) els.divider.classList.add("is-lit");
    card.classList.add("is-pdemo-static");
    if (els.replay) els.replay.setAttribute("aria-disabled", "true");
    later(30, function () { bindInterruptions(r); });
    later(STATIC_MS, finish);
    return true;
  }

  /* ── Public entry point ────────────────────────────────────── */
  function play(opts) {
    opts = opts || {};
    if (run) return false;
    var m = modal();
    if (!m || m.isOpen()) return false;
    var card = opts.card || pickCard();
    if (!card) return false;
    if (reducedMotion()) return playStatic(card);
    return playCinematic(card);
  }

  /* ── One-time autoplay at Other Projects ───────────────────── */
  function stopAutoplayWatch() {
    if (armTimer) {
      clearTimeout(armTimer);
      armTimer = null;
    }
    if (autoObserver) {
      autoObserver.disconnect();
      autoObserver = null;
    }
  }

  /* Ratio of the card that must be on screen: most of it, or as much
     as the viewport can show for very tall cards. */
  function neededRatio(card) {
    var h = card.getBoundingClientRect().height || 1;
    var vh = window.innerHeight || 800;
    return Math.max(0.2, Math.min(0.7, (vh * 0.62) / h));
  }

  function whenSettled(card, cb) {
    var waited = 0;
    (function check() {
      if (autoplayConsumed || run) return;
      if (settled(card) || waited >= 2600) {
        armTimer = null;
        cb();
        return;
      }
      waited += 100;
      armTimer = setTimeout(check, 100);
    })();
  }

  function tryAutoplay(card) {
    if (autoplayConsumed || run || storageGet() || reducedMotion()) return;
    var m = modal();
    if (!m || m.isOpen()) return;                     /* visitor is busy: stay armed */
    if (els.grid.contains(document.activeElement)) return;
    whenSettled(card, function () {
      if (autoplayConsumed || run) return;
      var rect = card.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      if (rect.bottom < vh * 0.25 || rect.top > vh * 0.75) return;  /* scrolled on meanwhile */
      autoplayConsumed = true;
      stopAutoplayWatch();
      play({ card: card, auto: true });
    });
  }

  function armAutoplay() {
    if (autoplayConsumed || storageGet() || reducedMotion()) return;
    if (!("IntersectionObserver" in window)) return;   /* static hint remains */
    var card = pickCard();
    if (!card) return;
    var thresholds = [];
    for (var i = 0; i <= 20; i++) thresholds.push(i / 20);
    autoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (autoplayConsumed || run) return;
        var ok = entry.isIntersecting && entry.intersectionRatio + 0.001 >= neededRatio(entry.target);
        if (ok && !armTimer) {
          /* Dwell briefly so a fast scroll-through does not fire it. */
          armTimer = setTimeout(function () {
            armTimer = null;
            tryAutoplay(entry.target);
          }, 420);
        } else if (!ok && armTimer) {
          clearTimeout(armTimer);
          armTimer = null;
        }
      });
    }, { threshold: thresholds, rootMargin: "-64px 0px -6% 0px" });
    autoObserver.observe(card);
  }

  /* ── Replay control ────────────────────────────────────────── */
  function onReplay() {
    if (run || pendingReplay) return;
    var card = pickCard();
    if (!card) return;
    autoplayConsumed = true;
    stopAutoplayWatch();
    var rect = card.getBoundingClientRect();
    var vh = window.innerHeight || 800;
    var visible = rect.top >= 60 && rect.top <= vh * 0.6;
    if (visible || typeof card.scrollIntoView !== "function") {
      play({ card: card });
      return;
    }
    /* Visitor asked for it: bring the card into view, then play. */
    card.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
    pendingReplay = setTimeout(function () {
      pendingReplay = null;
      play({ card: card });
    }, reducedMotion() ? 60 : 620);
  }

  /* ── Init ──────────────────────────────────────────────────── */
  function collect() {
    els.grid = document.getElementById("projects-grid");
    els.root = document.getElementById("project-discovery-demo");
    els.divider = document.getElementById("other-projects-divider");
    els.replay = document.getElementById("pdemo-replay");
    els.skip = document.getElementById("pdemo-skip");
    els.host = els.grid ? els.grid.parentNode : null;
    els.replayLabel = els.replay ? els.replay.querySelector(".pdemo-replay-label") : null;
    els.instruction = els.root ? els.root.querySelector(".pdemo-instruction") : null;
    els.bar = els.root ? els.root.querySelector(".pdemo-progress-bar") : null;
    els.steps = els.root ? Array.prototype.slice.call(els.root.querySelectorAll(".pdemo-steps li")) : [];
  }

  function init() {
    if (initialised) return true;
    collect();
    if (!els.grid || !els.root) return false;
    if (!modal() || !pickCard()) {
      /* Static hint stays; nothing to demonstrate. */
      if (els.replay) els.replay.hidden = true;
      setRootState("unavailable");
      return false;
    }
    initialised = true;
    var prior = storageGet();
    if (prior === "completed" || prior === "dismissed") {
      autoplayConsumed = true;
      state = prior;
      setRootState(prior);
    }
    if (els.replay) {
      els.replay.hidden = false;
      els.replay.addEventListener("click", function () {
        if (els.replay.getAttribute("aria-disabled") === "true") return;
        onReplay();
      });
    }
    if (els.skip) {
      els.skip.addEventListener("click", function () { cancel("skip"); });
    }
    setReplayLabel();
    try {
      var rm = window.matchMedia("(prefers-reduced-motion: reduce)");
      var onChange = function () {
        if (run) cancel("motion-preference");
        setReplayLabel();
      };
      if (rm.addEventListener) rm.addEventListener("change", onChange);
      else if (rm.addListener) rm.addListener(onChange);
    } catch (e) { /* optional */ }
    armAutoplay();
    return true;
  }

  function boot() {
    if (init()) return;
    /* The modal controller may initialise after us in unusual orders. */
    document.addEventListener("projectmodal:ready", function onReady() {
      document.removeEventListener("projectmodal:ready", onReady);
      init();
    });
  }

  window.ProjectDiscoveryDemo = {
    play: function () {
      if (pendingReplay) return false;
      var ok = play();
      if (ok) {
        autoplayConsumed = true;
        stopAutoplayWatch();
      }
      return ok;
    },
    replay: onReplay,
    cancel: cancel,
    state: function () { return state; },
    isRunning: function () { return !!run; },
    timeline: T,
    storageKey: STORAGE_KEY,
    _debug: function () {
      return {
        runToken: runToken,
        running: !!run,
        kind: run ? run.kind : null,
        key: run ? run.key : null,
        timers: run ? run.timers.length : 0,
        listeners: run ? run.offs.length : 0,
        autoplayConsumed: autoplayConsumed,
        watching: !!autoObserver
      };
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

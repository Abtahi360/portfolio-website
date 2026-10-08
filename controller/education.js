/* ── Education controller ─────────────────────────────────────
   Drives the "3D Academic Growth Path" (markup: controller/main.js,
   styles: view/css/education.css). Self-contained IIFE; touches
   nothing outside #educational-history.

     • Reveal    IntersectionObserver, once per milestone
     • Progress  scroll position -> how far the path is lit
                 (one passive listener, only while the section is
                 near the viewport; one read + one write per frame)
     • States    upcoming / past / active, set from the lit path
     • Parallax  one ambient backdrop layer, one inline transform
     • Details   accessible disclosure buttons
     • Tilt      small pointer reaction, fine pointers only

   prefers-reduced-motion: no reveal, no scroll-linked work, no tilt.
   The path is shown fully lit and the hierarchy is kept by CSS.
   ──────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var section = document.getElementById("educational-history");
  var root = document.getElementById("education-grid");
  if (!section || !root) return;

  var path = root.querySelector(".edu-path");
  var stages = Array.prototype.slice.call(root.querySelectorAll("[data-edu-stage]"));
  var bridge = root.querySelector("[data-edu-bridge]");
  var atmos = section.querySelector(".edu-atmos");
  var fillEl = path && path.querySelector(".edu-path__fill");
  var headEl = path && path.querySelector(".edu-path__head");
  var ambient = atmos && atmos.querySelector(".edu-atmos__ambient");
  if (!path || !fillEl || !headEl || !stages.length) return;

  var ACTIVE_LINE = 0.6;   /* fraction of viewport height where the path "is" */
  var EASE_RATE = 0.16;    /* per 60fps frame: how quickly the glow follows scroll */
  var TILT_MAX = 2.2;      /* degrees */

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mqFine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var mqSmall = window.matchMedia("(max-width: 720px)"); /* phones: simpler motion, no parallax */
  var reduced = mqReduce.matches;

  var geo = { nodeY: [], pathH: 0 };
  var cur = 0;             /* lit length of the path, px */
  var snap = true;         /* jump instead of ease (first frame, re-entry) */
  var live = false;        /* section near viewport */
  var ticking = false;
  var lastTs = 0;
  var last = { fill: -1, p: 9, active: -2, lit: null, head: null };

  /* Writes are inline transforms on a handful of elements: nothing here goes through
     inherited custom properties, so a scroll frame never restyles a subtree. */

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  /* Offset of el from `ancestor`, summing layout offsets (immune to transforms) */
  function offsetWithin(el, ancestor) {
    var y = 0;
    while (el && el !== ancestor) {
      y += el.offsetTop;
      el = el.offsetParent;
    }
    return y;
  }

  /* ── Measure (on size changes only, never per scroll frame) ── */
  function measure() {
    geo.nodeY = stages.map(function (stage) {
      var node = stage.querySelector(".edu-node");
      return offsetWithin(node, root) + node.offsetHeight / 2;
    });

    var mark = bridge && bridge.querySelector(".edu-bridge__mark");
    geo.pathH = mark
      ? offsetWithin(mark, root) + mark.offsetHeight / 2
      : root.offsetHeight;

    path.style.setProperty("--path-h", geo.pathH + "px");
    last.fill = -1; /* force the fill to be rewritten at the new scale */
  }

  /* ── Apply (writes only) ──────────────────────────────────── */
  function apply(px) {
    var fill = geo.pathH ? px / geo.pathH : 0;
    var fillKey = Math.round(px * 4);
    if (fillKey !== last.fill) {
      last.fill = fillKey;
      fillEl.style.transform = "scaleY(" + fill.toFixed(4) + ")";
      headEl.style.transform = "translate3d(0," + px.toFixed(1) + "px,0)";
    }

    var head = fill > 0.002 && fill < 0.995 ? "1" : "0";
    if (head !== last.head) {
      last.head = head;
      headEl.style.opacity = head;
    }

    var active = -1;
    for (var i = 0; i < geo.nodeY.length; i++) {
      if (px >= geo.nodeY[i] - 1) active = i;
    }
    if (active !== last.active) {
      last.active = active;
      stages.forEach(function (stage, idx) {
        stage.setAttribute("data-state", idx === active ? "active" : idx < active ? "past" : "upcoming");
      });
    }

    if (bridge) {
      var lit = geo.pathH > 0 && px >= geo.pathH - 2;
      if (lit !== last.lit) {
        last.lit = lit;
        if (lit) bridge.setAttribute("data-lit", "");
        else bridge.removeAttribute("data-lit");
      }
    }
  }

  function applyParallax(secRect, vh) {
    if (!atmos || mqSmall.matches) return;
    var half = secRect.height / 2 + vh / 2;
    var p = clamp((secRect.top + secRect.height / 2 - vh / 2) / half, -1, 1);
    if (Math.abs(p - last.p) > 0.004) {
      last.p = p;
      /* one moving layer (orbs + nodes); the floor grid stays put, which is the depth difference */
      if (ambient) ambient.style.transform = "translate3d(0," + (p * -34).toFixed(1) + "px,0)";
    }
  }

  /* ── One frame: read, then write ──────────────────────────── */
  function frame(ts) {
    ticking = false;
    if (reduced || !live) return;

    var vh = window.innerHeight;
    var rootRect = root.getBoundingClientRect();
    var secRect = section.getBoundingClientRect();

    var target = clamp(vh * ACTIVE_LINE - rootRect.top, 0, geo.pathH);

    if (snap) {
      cur = target;
      snap = false;
    } else {
      var dt = lastTs ? Math.min(ts - lastTs, 64) : 16.7;
      var k = 1 - Math.pow(1 - EASE_RATE, dt / 16.7);
      cur += (target - cur) * k;
      if (Math.abs(target - cur) < 0.4) cur = target;
    }
    lastTs = ts;

    apply(cur);
    applyParallax(secRect, vh);

    if (cur !== target) schedule(); /* keep easing until settled, then stop */
    else lastTs = 0;
  }

  function schedule() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(frame);
  }

  /* ── Live window: only listen to scroll near the viewport ─── */
  function setLive(on) {
    if (on === live) return;
    live = on;
    section.classList.toggle("edu-live", on);
    if (reduced) return;
    if (on) {
      snap = true;
      window.addEventListener("scroll", schedule, { passive: true });
      schedule();
    } else {
      window.removeEventListener("scroll", schedule);
    }
  }

  /* ── Reveal ───────────────────────────────────────────────── */
  var revealObs = null;
  if ("IntersectionObserver" in window) {
    revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    stages.forEach(function (stage) { revealObs.observe(stage); });
    if (bridge) revealObs.observe(bridge);
  }

  function revealAll() {
    stages.forEach(function (stage) { stage.classList.add("is-in"); });
    if (bridge) bridge.classList.add("is-in");
  }

  /* ── Motion preference ────────────────────────────────────── */
  function applyMode() {
    reduced = mqReduce.matches;
    root.classList.toggle("edu-motion", !reduced && !!revealObs);

    if (reduced || !revealObs) {
      revealAll();
    }

    if (reduced) {
      window.removeEventListener("scroll", schedule);
      stages.forEach(function (stage, i) {
        stage.setAttribute("data-state", i === stages.length - 1 ? "active" : "past");
      });
      /* CSS (reduced-motion block) shows the path fully lit and drops every transform */
      if (bridge) bridge.setAttribute("data-lit", "");
      last.active = -2; last.fill = -1; last.lit = null; last.head = null; last.p = 9;
    } else if (live) {
      snap = true;
      window.addEventListener("scroll", schedule, { passive: true });
      schedule();
    }
  }

  /* ── Details disclosure ───────────────────────────────────── */
  root.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".edu-toggle") : null;
    if (!btn || !root.contains(btn)) return;
    var open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    var label = btn.querySelector(".edu-toggle__label");
    if (label) label.textContent = open ? "Explore details" : "Hide details";
  });

  /* ── Bridge: same offset as the main navigation ───────────── */
  if (bridge) {
    bridge.addEventListener("click", function (e) {
      var target = document.getElementById("projects");
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top: window.pageYOffset + target.getBoundingClientRect().top - 82,
        behavior: reduced ? "instant" : "smooth"
      });
    });
  }

  /* ── Pointer tilt (fine pointers, motion allowed) ─────────── */
  stages.forEach(function (stage) {
    var slab = stage.querySelector(".edu-slab");
    if (!slab) return;
    var max = stage.getAttribute("data-tier") === "hero" ? TILT_MAX * 0.65 : TILT_MAX;
    var px = 0, py = 0, pending = false;

    function paint() {
      pending = false;
      var r = slab.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var nx = clamp(((px - r.left) / r.width - 0.5) * 2, -1, 1);
      var ny = clamp(((py - r.top) / r.height - 0.5) * 2, -1, 1);
      slab.style.setProperty("--edu-tx", (nx * max).toFixed(2) + "deg");
      slab.style.setProperty("--edu-ty", (-ny * max).toFixed(2) + "deg");
    }

    slab.addEventListener("pointerenter", function (e) {
      if (reduced || !mqFine.matches || e.pointerType === "touch") return;
      slab.setAttribute("data-tilt", "");
    });

    slab.addEventListener("pointermove", function (e) {
      if (reduced || !slab.hasAttribute("data-tilt")) return;
      px = e.clientX;
      py = e.clientY;
      if (!pending) {
        pending = true;
        window.requestAnimationFrame(paint);
      }
    }, { passive: true });

    slab.addEventListener("pointerleave", function () {
      slab.removeAttribute("data-tilt");
      slab.style.removeProperty("--edu-tx");
      slab.style.removeProperty("--edu-ty");
    });
  });

  /* ── Wire up ──────────────────────────────────────────────── */
  measure();
  applyMode();

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      function (entries) { setLive(entries[entries.length - 1].isIntersecting); },
      { rootMargin: "50% 0px 50% 0px" }
    ).observe(section);
  } else {
    setLive(true);
  }

  function onResize() {
    measure();
    if (!reduced) schedule();
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(onResize).observe(root); /* also fires when details open or fonts load */
  } else {
    window.addEventListener("resize", onResize);
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);

  if (mqReduce.addEventListener) mqReduce.addEventListener("change", applyMode);
  else if (mqReduce.addListener) mqReduce.addListener(applyMode);
})();

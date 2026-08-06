/* ── Motion controller ────────────────────────────────────────
   Self-contained IIFE. Adds:
     • Hero sequential entrance (left-side children, right card)
     • Section heading stagger (kicker → title → subtitle)
     • Grid card stagger (education, projects, research, skills)
     • Inline-style cleanup so CSS hover continues to work
   Uses IntersectionObserver only – no scroll listeners.
   Fully respects prefers-reduced-motion.
   ──────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  /* ── Guard: skip entirely when reduced motion is preferred ── */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* ── Constants ──────────────────────────────────────────────
     All timing in milliseconds. Keep values in the range
     suggested by the motion brief: 550–720ms duration,
     80ms stagger interval, 14px translation distance.       */
  var EASE       = "cubic-bezier(0.16, 1, 0.3, 1)";
  var STAGGER    = 80;   /* ms between successive cards/items  */
  var MAX_STAG   = 400;  /* cap: last item never feels delayed */
  var CARD_WAIT  = 120;  /* ms offset so cards start after the
                            section-level fade has settled     */

  /* ── Helpers ────────────────────────────────────────────────
     hide()  – set element to its pre-reveal state via inline
               styles. No transitionDelay is set here.
     show()  – trigger the reveal with an explicit delay and
               clean up all inline styles after completion so
               CSS hover effects (transform: translateY(-4px))
               are restored to full functionality.            */

  function hide(el, durationMs, ty) {
    el.style.opacity    = "0";
    el.style.transform  = "translateY(" + (ty || 14) + "px)";
    el.style.transition =
      "opacity "   + durationMs + "ms " + EASE + ", " +
      "transform " + durationMs + "ms " + EASE;
  }

  function show(el, delayMs, durationMs) {
    delayMs    = delayMs    || 0;
    durationMs = durationMs || 600;
    el.style.transitionDelay = delayMs + "ms";
    el.style.opacity         = "1";
    el.style.transform       = "none";
    /* Remove all inline motion styles once the animation is
       done so existing CSS hover / active states work normally. */
    setTimeout(function () {
      el.style.opacity         = "";
      el.style.transform       = "";
      el.style.transition      = "";
      el.style.transitionDelay = "";
    }, delayMs + durationMs + 60 /* small buffer */);
  }

  /* ── Hero entrance sequence ─────────────────────────────────
     Runs synchronously so children are hidden before the very
     first browser paint – no flash of visible content.       */
  (function initHero() {
    var heroLeft  = document.querySelector(".hero-left");
    var heroRight = document.querySelector(".hero-right");
    if (!heroLeft || !heroRight) return;

    /* Ordered set of left-column children to reveal in sequence */
    var items = [
      heroLeft.querySelector(".hero-meta"),
      heroLeft.querySelector(".hero-name"),
      heroLeft.querySelector(".hero-tagline"),
      heroLeft.querySelector(".hero-badges"),
      heroLeft.querySelector(".hero-actions"),
      heroLeft.querySelector(".hero-footnote")
    ].filter(Boolean);

    /* Hide everything immediately */
    items.forEach(function (el) { hide(el, 650, 16); });
    hide(heroRight, 720, 20);

    /* Reveal on the second rAF: browser has committed the
       hidden state to screen, so no flicker possible.        */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        items.forEach(function (el, i) {
          show(el, i * 85, 650);
        });
        show(heroRight, 190, 720);
      });
    });
  })();

  /* ── Section child reveals ──────────────────────────────────
     prepareSection()  – hide header children + grid cards
     revealSection()   – animate them in with stagger
     secObs            – fires when a section-inner enters view */

  /* Selectors for stagger-able grid items (direct children) */
  var CARD_SEL =
    ".cards-grid > *, " +
    ".cards-grid-two > *, " +
    ".research-grid > *, " +
    ".skills-grid > *, " +
    ".rw-grid > .rw-card";

  /* Section-header child selectors (ordered reveal) */
  var HDR_SELS = [".section-kicker", ".section-title", ".section-subtitle"];

  function prepareSection(si) {
    /* Section header children */
    var hdr = si.querySelector(".section-header");
    if (hdr) {
      HDR_SELS.forEach(function (sel) {
        var el = hdr.querySelector(sel);
        if (el) hide(el, 550, 10);
      });
    }

    /* Grid / list cards */
    si.querySelectorAll(CARD_SEL).forEach(function (card) {
      hide(card, 600, 14);
    });
  }

  function revealSection(si) {
    /* Header children: kicker → title → subtitle with 60 ms stagger */
    var hdr = si.querySelector(".section-header");
    if (hdr) {
      HDR_SELS.forEach(function (sel, i) {
        var el = hdr.querySelector(sel);
        if (el) show(el, i * 60, 550);
      });
    }

    /* Grid cards: stagger from CARD_WAIT offset, capped at MAX_STAG */
    si.querySelectorAll(CARD_SEL).forEach(function (card, i) {
      var delay = CARD_WAIT + Math.min(i * STAGGER, MAX_STAG);
      show(card, delay, 600);
    });
  }

  var secObs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        revealSection(entry.target);
        secObs.unobserve(entry.target); /* run once */
      });
    },
    {
      /* Fire when 6 % of the section is visible, with a 30 px
         bottom root-margin so reveals happen slightly before the
         element fully enters the viewport edge.                */
      threshold:  0.06,
      rootMargin: "0px 0px -30px 0px"
    }
  );

  /* ── Initialise ─────────────────────────────────────────────
     Small setTimeout(0) gives dynamic content (rendered by
     main.js / real-world-projects.js) time to populate the DOM
     before we query for grid children.                        */
  function init() {
    document.querySelectorAll(".section-inner").forEach(function (si) {
      prepareSection(si);
      secObs.observe(si);
    });
  }

  setTimeout(init, 0);
})();

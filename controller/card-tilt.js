/* ── Other Projects: pointer-driven 3D tilt ────────────────────
   Pairs with view/css/other-projects.css. CSS owns every visual
   state (hover lift, screenshot fan-out, light sheen, focus); this
   file only feeds four custom properties to the card under the
   pointer:
     --rx / --ry   rotation toward the pointer (±3.5° / ±4.5°)
     --mx / --my   pointer position, for the light sheen
   and toggles .is-tilting so the transform tracks the pointer with a
   short transition instead of the slow settle transition.

   Off when:
     • the device has no fine hover pointer (touch, pen-only)
     • prefers-reduced-motion: reduce
     • the discovery demo is staging the grid (#projects-grid.is-pdemo-stage)
     • motion.js is still revealing the card (inline transform present)
   Layout is read once per card entry (and on scroll), never per move.
   ──────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

  var grid = document.getElementById("projects-grid");
  if (!grid) return;

  var MAX_X = 3.5; /* degrees around the X axis (pointer up/down)    */
  var MAX_Y = 4.5; /* degrees around the Y axis (pointer left/right) */

  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var active = null; /* card currently tilting */
  var rect = null;   /* its cached bounding box */
  var raf = 0;
  var pending = null;

  function enabled() {
    return finePointer.matches && !reduceMotion.matches && !grid.classList.contains("is-pdemo-stage");
  }

  function cardFrom(target) {
    var card = target && target.closest ? target.closest(".card[data-project-key]") : null;
    return card && grid.contains(card) && !card.hidden ? card : null;
  }

  function reset(card) {
    card.classList.remove("is-tilting");
    card.style.removeProperty("--rx");
    card.style.removeProperty("--ry");
    card.style.removeProperty("--mx");
    card.style.removeProperty("--my");
  }

  function release() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    pending = null;
    if (active) reset(active);
    active = null;
    rect = null;
  }

  function engage(card) {
    if (active === card) return;
    release();
    /* motion.js reveals cards with inline transforms; wait for it. */
    if (card.style.transform) return;
    active = card;
    rect = card.getBoundingClientRect();
    card.classList.add("is-tilting");
  }

  function paint() {
    raf = 0;
    if (!active || !rect || !pending) return;
    var x = Math.min(Math.max((pending.x - rect.left) / rect.width, 0), 1);
    var y = Math.min(Math.max((pending.y - rect.top) / rect.height, 0), 1);
    active.style.setProperty("--rx", ((0.5 - y) * 2 * MAX_X).toFixed(2) + "deg");
    active.style.setProperty("--ry", ((x - 0.5) * 2 * MAX_Y).toFixed(2) + "deg");
    active.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
    active.style.setProperty("--my", (y * 100).toFixed(1) + "%");
  }

  grid.addEventListener("pointermove", function (event) {
    if (event.pointerType && event.pointerType !== "mouse") return;
    if (!enabled()) {
      if (active) release();
      return;
    }
    var card = cardFrom(event.target);
    if (!card) {
      if (active) release();
      return;
    }
    engage(card);
    if (!active) return;
    pending = { x: event.clientX, y: event.clientY };
    if (!raf) raf = requestAnimationFrame(paint);
  });

  grid.addEventListener("pointerleave", release);
  grid.addEventListener("pointerdown", release); /* press feedback and the modal take over */

  /* The cached box goes stale when the page scrolls under a still pointer. */
  window.addEventListener("scroll", function () {
    if (active) rect = active.getBoundingClientRect();
  }, { passive: true });

  window.addEventListener("blur", release);

  function onPreferenceChange() {
    if (!enabled()) release();
  }
  [finePointer, reduceMotion].forEach(function (mq) {
    if (typeof mq.addEventListener === "function") mq.addEventListener("change", onPreferenceChange);
    else if (typeof mq.addListener === "function") mq.addListener(onPreferenceChange);
  });

  /* Hand the grid to the discovery demo cleanly. */
  document.addEventListener("projectmodal:open", release);
  if (typeof MutationObserver === "function") {
    new MutationObserver(function () {
      if (grid.classList.contains("is-pdemo-stage")) release();
    }).observe(grid, { attributes: true, attributeFilter: ["class"] });
  }
})();

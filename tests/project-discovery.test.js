/**
 * Other Projects discovery demo + project-details modal (normal and preview modes).
 * Loads the real model/project-details.js and controller/project-discovery-demo.js
 * into jsdom with a minimal copy of the index.html markup they depend on.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DETAILS_SRC = fs.readFileSync(path.join(ROOT, "model/project-details.js"), "utf8");
const DEMO_SRC = fs.readFileSync(path.join(ROOT, "controller/project-discovery-demo.js"), "utf8");

const REAL_KEYS = ["docx-to-excel-generator", "trigram-language-model-story-generation", "spring-boot-practice"];
const STORAGE_KEY = "portfolio:other-projects-discovery-demo:v1";

/* ── Test doubles ─────────────────────────────────────────── */
let observers = [];
class FakeIO {
  constructor(cb, options) {
    this.cb = cb;
    this.options = options;
    this.targets = new Set();
    observers.push(this);
  }
  observe(t) { this.targets.add(t); }
  unobserve(t) { this.targets.delete(t); }
  disconnect() { this.targets.clear(); this.disconnected = true; }
  fire(target, ratio) {
    this.cb([{ target, isIntersecting: ratio > 0, intersectionRatio: ratio }], this);
  }
}

let reduced = false;
function installMatchMedia() {
  window.matchMedia = (q) => ({
    matches: /prefers-reduced-motion/.test(q) ? reduced : false,
    media: q,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {}
  });
}

/* Net listener count per "target:type" so leaks are visible. */
let counts = {};
function trackListeners() {
  counts = {};
  [[document, "d"], [window, "w"]].forEach(([target, tag]) => {
    if (!target.__origAdd) {
      target.__origAdd = target.addEventListener;
      target.__origRemove = target.removeEventListener;
    }
    target.addEventListener = function (type, fn, opts) {
      counts[tag + ":" + type] = (counts[tag + ":" + type] || 0) + 1;
      return target.__origAdd.call(this, type, fn, opts);
    };
    target.removeEventListener = function (type, fn, opts) {
      counts[tag + ":" + type] = (counts[tag + ":" + type] || 0) - 1;
      return target.__origRemove.call(this, type, fn, opts);
    };
  });
}

function cardHtml(key, title) {
  return (
    '<article class="card" data-project-key="' + key + '">' +
    '<div class="card-header"><div><h3 class="card-title">' + title + "</h3></div></div>" +
    '<div class="card-footer card-footer-split">' +
    '<span class="card-details-cue" aria-hidden="true">View details</span>' +
    '<a class="link-pill view-repo-btn" href="https://github.com/example/' + key + '" target="_blank">View Repository</a>' +
    '<button type="button" class="view-repo-add-dev">Add link</button>' +
    "</div></article>"
  );
}

function markup(keys, opts) {
  opts = opts || {};
  return (
    '<section id="projects"><div class="section-inner">' +
    '<div class="rw-section-divider pdemo-divider" id="other-projects-divider">' +
    '<span class="rw-divider-label">Other Projects</span><span class="rw-divider-line"></span>' +
    '<button type="button" class="pdemo-replay" id="pdemo-replay" hidden><span class="pdemo-replay-label">Replay demo</span></button>' +
    "</div>" +
    '<div class="pdemo" id="project-discovery-demo" data-state="idle">' +
    '<p class="pdemo-hint" id="pdemo-hint">Select any project card to open its full details.</p>' +
    '<div class="pdemo-run" aria-hidden="true"><span class="pdemo-instruction"></span>' +
    '<ol class="pdemo-steps"><li>Select</li><li>Click</li><li>Explore</li></ol>' +
    '<span class="pdemo-progress"><span class="pdemo-progress-bar"></span></span></div>' +
    '<button type="button" class="pdemo-skip" id="pdemo-skip" hidden>Skip demo</button>' +
    "</div>" +
    '<div class="cards-grid" id="projects-grid">' +
    keys.map((k, i) => cardHtml(k, "Project " + i)).join("") +
    "</div></div></section>" +
    (opts.noModal
      ? ""
      : '<div class="project-modal-backdrop" id="project-modal-backdrop" aria-hidden="true">' +
        '<div class="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">' +
        '<div class="project-modal-header"><h3 class="project-modal-title" id="project-modal-title"></h3>' +
        '<button type="button" class="project-modal-close" aria-label="Close project details">Close</button></div>' +
        '<div class="project-modal-body" id="project-modal-body"></div>' +
        '<div class="project-modal-footer"><button type="button" class="link-pill" id="project-modal-close-btn">Close</button></div>' +
        "</div></div>") +
    '<button id="outside">outside</button>'
  );
}

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const advance = (ms) => jest.advanceTimersByTime(ms);
const demo = () => window.ProjectDiscoveryDemo;
const modal = () => window.ProjectDetailsModal;
const dbg = () => demo()._debug();

/* The demo's own IntersectionObserver for the autoplay trigger. */
function autoObserver() {
  return observers.find((o) => o.targets.size && Array.from(o.targets).some((t) => t.classList && t.classList.contains("card")) && Array.isArray(o.options.threshold) && o.options.threshold.length > 10);
}

function arrive(ratio) {
  const io = autoObserver();
  const card = Array.from(io.targets)[0];
  io.fire(card, ratio == null ? 0.9 : ratio);
  advance(450);      // dwell
}

function setup(opts) {
  opts = opts || {};
  jest.useFakeTimers();
  observers = [];
  reduced = !!opts.reduced;
  installMatchMedia();
  window.IntersectionObserver = FakeIO;
  window.sessionStorage.clear();
  if (opts.stored) window.sessionStorage.setItem(STORAGE_KEY, opts.stored);
  delete window.ProjectDetailsModal;
  delete window.ProjectDiscoveryDemo;
  document.body.innerHTML = markup(opts.keys || REAL_KEYS, opts);
  window.innerHeight = 900;
  window.innerWidth = 1440;
  /* jsdom has no layout: give cards a plausible on-screen box. */
  Element.prototype.getClientRects = function () { return [{}]; };
  Element.prototype.getBoundingClientRect = function () {
    return { top: 200, left: 100, right: 500, bottom: 600, width: 400, height: 400, x: 100, y: 200 };
  };
  trackListeners();
  window.eval(DETAILS_SRC);
  window.eval(DEMO_SRC);
  return demo();
}

afterEach(() => {
  if (window.ProjectDiscoveryDemo) window.ProjectDiscoveryDemo.cancel("teardown");
  jest.useRealTimers();
});

/* ── Modal: normal behaviour is preserved ─────────────────── */
describe("project modal (normal mode)", () => {
  beforeEach(() => setup());

  test("clicking a card opens its real details and focuses Close", () => {
    $('[data-project-key="spring-boot-practice"]').click();
    expect($("#project-modal-backdrop").classList.contains("open")).toBe(true);
    expect($("#project-modal-backdrop").getAttribute("aria-hidden")).toBe("false");
    expect($("#project-modal-title").textContent).toMatch(/Spring Boot/);
    expect($("#project-modal-body").innerHTML.length).toBeGreaterThan(100);
    expect(document.activeElement).toBe($(".project-modal-close"));
  });

  test("Escape closes and focus returns to the card", () => {
    const card = $('[data-project-key="docx-to-excel-generator"]');
    card.focus();
    card.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    expect(modal().isOpen()).toBe(true);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(modal().isOpen()).toBe(false);
    expect($("#project-modal-backdrop").getAttribute("aria-hidden")).toBe("true");
    expect(document.activeElement).toBe(card);
  });

  test("Space opens; backdrop click and footer button close", () => {
    const card = $('[data-project-key="docx-to-excel-generator"]');
    card.focus();
    card.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }));
    expect(modal().isOpen()).toBe(true);
    $("#project-modal-backdrop").dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(modal().isOpen()).toBe(false);
    card.click();
    $("#project-modal-close-btn").click();
    expect(modal().isOpen()).toBe(false);
  });

  test("repository links and in-card buttons never open the modal", () => {
    const link = $('[data-project-key="docx-to-excel-generator"] a');
    let prevented = null;
    const spy = (e) => { prevented = e.defaultPrevented; e.preventDefault(); };
    window.addEventListener("click", spy);
    link.click();
    window.removeEventListener("click", spy);
    expect(prevented).toBe(false);
    expect(modal().isOpen()).toBe(false);
    $('[data-project-key="docx-to-excel-generator"] .view-repo-add-dev').click();
    expect(modal().isOpen()).toBe(false);
  });

  test("Enter on a focused repository link is not hijacked by the card", () => {
    const link = $('[data-project-key="docx-to-excel-generator"] a');
    link.focus();
    const ev = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    link.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
    expect(modal().isOpen()).toBe(false);
  });

  test("cards stay keyboard-focusable buttons with labels", () => {
    $$("#projects-grid .card").forEach((c) => {
      expect(c.getAttribute("tabindex")).toBe("0");
      expect(c.getAttribute("role")).toBe("button");
      expect(c.getAttribute("aria-label")).toMatch(/^View details for /);
    });
  });
});

/* ── Modal: passive preview mode ──────────────────────────── */
describe("project modal (preview mode)", () => {
  beforeEach(() => setup());

  test("preview shows real content without focus, aria or inert side effects", () => {
    const outside = $("#outside");
    outside.focus();
    const panel = modal().preview("trigram-language-model-story-generation");
    expect(panel).toBe($(".project-modal"));
    const bd = $("#project-modal-backdrop");
    expect(bd.classList.contains("open")).toBe(true);
    expect(bd.classList.contains("is-preview")).toBe(true);
    expect(bd.getAttribute("aria-hidden")).toBe("true");
    expect(bd.hasAttribute("inert")).toBe(true);
    expect($("#project-modal-title").textContent).toMatch(/Trigram/);
    expect(document.activeElement).toBe(outside);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(modal().isPreviewing()).toBe(true);           // the normal Escape handler ignores previews

    expect(modal().endPreview()).toBe(true);
    expect(bd.classList.contains("open")).toBe(false);
    expect(bd.classList.contains("is-preview")).toBe(false);
    expect(bd.hasAttribute("inert")).toBe(false);
    expect(bd.getAttribute("aria-hidden")).toBe("true");
    expect(document.activeElement).toBe(outside);
  });

  test("a real open during a preview takes over as a normal dialog", () => {
    const seen = [];
    document.addEventListener("projectmodal:previewinterrupted", () => seen.push("interrupted"));
    modal().preview("docx-to-excel-generator");
    $('[data-project-key="spring-boot-practice"]').click();
    expect(seen).toEqual(["interrupted"]);
    const bd = $("#project-modal-backdrop");
    expect(modal().isPreviewing()).toBe(false);
    expect(bd.classList.contains("is-preview")).toBe(false);
    expect(bd.hasAttribute("inert")).toBe(false);
    expect(bd.getAttribute("aria-hidden")).toBe("false");
    expect($("#project-modal-title").textContent).toMatch(/Spring Boot/);
    expect(document.activeElement).toBe($(".project-modal-close"));
  });

  test("preview refuses unknown keys and never replaces an open dialog", () => {
    expect(modal().preview("not-a-project")).toBeNull();
    $('[data-project-key="spring-boot-practice"]').click();
    expect(modal().preview("docx-to-excel-generator")).toBeNull();
    expect($("#project-modal-title").textContent).toMatch(/Spring Boot/);
  });
});

/* ── Demo: trigger ────────────────────────────────────────── */
describe("discovery demo: trigger", () => {
  test("observes the first eligible Other Projects card, not #projects", () => {
    setup({ keys: ["no-details-here", ...REAL_KEYS] });
    const io = autoObserver();
    const targets = Array.from(io.targets);
    expect(targets).toHaveLength(1);
    expect(targets[0].getAttribute("data-project-key")).toBe("docx-to-excel-generator");
    expect(observers.some((o) => o.targets.has($("#projects")))).toBe(false);
  });

  test("does not run while the card is barely visible", () => {
    setup();
    arrive(0.15);
    advance(3000);
    expect(demo().isRunning()).toBe(false);
    expect(demo().state()).toBe("idle");
  });

  test("a fast scroll-through (leaves before the dwell) does not fire", () => {
    setup();
    const io = autoObserver();
    const card = Array.from(io.targets)[0];
    io.fire(card, 0.9);
    advance(200);
    io.fire(card, 0);
    advance(2000);
    expect(demo().isRunning()).toBe(false);
  });

  test("waits for motion.js inline reveal styles before starting", () => {
    setup();
    const card = $('[data-project-key="docx-to-excel-generator"]');
    card.style.opacity = "0";
    card.style.transform = "translateY(14px)";
    arrive();
    advance(500);
    expect(demo().isRunning()).toBe(false);
    card.style.opacity = "";
    card.style.transform = "";
    advance(150);
    expect(demo().isRunning()).toBe(true);
    expect(dbg().key).toBe("docx-to-excel-generator");
  });

  test("autoplays once per session, never twice", () => {
    setup();
    arrive();
    expect(demo().isRunning()).toBe(true);
    advance(6000);
    expect(demo().state()).toBe("completed");
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBe("completed");
    expect(autoObserver()).toBeUndefined();               // watcher released
    expect(dbg().runToken).toBe(1);
  });

  test("a prior completion or dismissal in this session suppresses autoplay", () => {
    ["completed", "dismissed"].forEach((stored) => {
      setup({ stored });
      expect(autoObserver()).toBeUndefined();
      expect($(".pdemo-replay").hidden).toBe(false);
      expect($(".pdemo-replay-label").textContent).toBe("Replay demo");
    });
  });

  test("reduced motion: no autoplay watcher at all", () => {
    setup({ reduced: true });
    expect(autoObserver()).toBeUndefined();
    expect($(".pdemo-replay-label").textContent).toBe("Show me how");
  });
});

/* ── Demo: timeline ───────────────────────────────────────── */
describe("discovery demo: timeline", () => {
  test("phases play in order on the real card and clean up completely", () => {
    setup();
    const T = demo().timeline;
    const card = $('[data-project-key="docx-to-excel-generator"]');
    const others = $$("#projects-grid .card").filter((c) => c !== card);
    $("#outside").focus();
    arrive();
    const t0 = 0;
    expect($("#project-discovery-demo").getAttribute("data-state")).toBe("running");
    expect($("#other-projects-divider").classList.contains("is-lit")).toBe(true);

    advance(T.rise + 60 - t0);
    expect($("#projects-grid").classList.contains("is-pdemo-stage")).toBe(true);
    expect(card.classList.contains("is-pdemo-active")).toBe(true);
    others.forEach((c) => expect(c.classList.contains("is-pdemo-dim")).toBe(true));

    advance(T.pointer - T.rise);
    expect($(".pdemo-layer .pdemo-pointer")).not.toBeNull();   // desktop: simulated pointer

    advance(T.reveal - T.pointer + 10);
    expect(modal().isPreviewing()).toBe(true);
    expect($("#project-modal-title").textContent).toMatch(/Excel/);
    expect(document.activeElement).toBe($("#outside"));        // focus never stolen

    advance(T.close + 460 - T.reveal);
    expect(modal().isOpen()).toBe(false);

    advance(T.done - T.close);
    expect(demo().state()).toBe("completed");
    expect($("#project-discovery-demo").getAttribute("data-state")).toBe("completed");
    expect($$(".is-pdemo-active, .is-pdemo-dim, .is-pdemo-stage, .is-pdemo-static, .pdemo-layer, .is-lit")).toHaveLength(0);
    expect($("#projects-grid").getAttribute("style") || "").toBe("");
    $$("#projects-grid .card").forEach((c) => expect(c.getAttribute("style") || "").toBe(""));
    expect($("#project-modal-backdrop").hasAttribute("inert")).toBe(false);
    expect($("#project-modal-backdrop").getAttribute("aria-hidden")).toBe("true");
    expect($(".pdemo-skip").hidden).toBe(true);
    expect(document.activeElement).toBe($("#outside"));
  });

  test("the step indicator follows Select → Click → Explore", () => {
    setup();
    const T = demo().timeline;
    arrive();
    const steps = () => $$(".pdemo-steps li").map((l) => (l.classList.contains("is-active") ? "A" : l.classList.contains("is-done") ? "D" : "-")).join("");
    expect(steps()).toBe("A--");
    advance(T.pointer + 10);
    expect(steps()).toBe("DA-");
    advance(T.reveal - T.pointer);
    expect(steps()).toBe("DDA");
    advance(T.settle - T.reveal);
    expect(steps()).toBe("DDD");
  });

  test("touch / narrow screens get a touch pulse instead of a fake cursor", () => {
    setup();
    window.innerWidth = 390;
    const T = demo().timeline;
    arrive();
    advance(T.press + 20);
    expect($(".pdemo-pointer")).toBeNull();
    expect($(".pdemo-touch")).not.toBeNull();
    expect($(".pdemo-instruction").textContent).toMatch(/^Tap/);
  });
});

/* ── Demo: interruption & replay ──────────────────────────── */
describe("discovery demo: interruption and replay", () => {
  test("any real pointer input dismisses the run without blocking the input", () => {
    setup();
    arrive();
    advance(demo().timeline.reveal + 50);
    expect(modal().isPreviewing()).toBe(true);
    const ev = new Event("pointerdown", { bubbles: true, cancelable: true });
    $("#outside").dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
    expect(demo().state()).toBe("dismissed");
    expect(modal().isOpen()).toBe(false);
    expect($$(".is-pdemo-active, .is-pdemo-dim, .pdemo-layer")).toHaveLength(0);
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBe("dismissed");
    advance(10000);
    expect(dbg().runToken).toBe(1);                       // never re-opens by itself
  });

  test("a manual card click during the preview opens the real dialog", () => {
    setup();
    arrive();
    advance(demo().timeline.reveal + 50);
    $('[data-project-key="spring-boot-practice"]').click();
    expect(demo().isRunning()).toBe(false);
    expect(modal().isOpen()).toBe(true);
    expect(modal().isPreviewing()).toBe(false);
    expect($("#project-modal-title").textContent).toMatch(/Spring Boot/);
    expect($("#project-modal-backdrop").getAttribute("aria-hidden")).toBe("false");
    expect(document.activeElement).toBe($(".project-modal-close"));
    advance(10000);
    expect(modal().isOpen()).toBe(true);                  // the demo's timers did not close it
  });

  test("keyboard input and the Skip button dismiss; Escape leaves the page alone", () => {
    setup();
    arrive();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Shift", bubbles: true }));
    expect(demo().isRunning()).toBe(true);                // modifiers alone are ignored
    advance(demo().timeline.reveal + 50);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(demo().state()).toBe("dismissed");
    expect(modal().isOpen()).toBe(false);

    $("#pdemo-replay").click();
    expect(demo().isRunning()).toBe(true);
    advance(100);
    $("#pdemo-skip").click();
    expect(demo().state()).toBe("dismissed");
  });

  test("hiding the tab or resizing the width cancels safely", () => {
    setup();
    arrive();
    advance(100);
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
    delete document.hidden;
    expect(demo().state()).toBe("dismissed");

    $("#pdemo-replay").click();
    advance(100);
    window.innerWidth = 800;
    window.dispatchEvent(new Event("resize"));
    expect(demo().state()).toBe("dismissed");
    expect($$(".is-pdemo-active, .is-pdemo-stage")).toHaveLength(0);
  });

  test("repeated replay clicks start exactly one timeline", () => {
    setup({ stored: "completed" });
    const r = $("#pdemo-replay");
    r.click(); r.click(); r.click();
    expect(dbg().runToken).toBe(1);
    expect(r.getAttribute("aria-disabled")).toBe("true");
    advance(6000);
    expect(r.hasAttribute("aria-disabled")).toBe(false);
  });

  test("replay x4 leaves no listeners, timers or animations behind", () => {
    setup({ stored: "completed" });
    const baseline = { ...counts };
    for (let i = 0; i < 4; i++) {
      $("#pdemo-replay").click();
      expect(dbg().running).toBe(true);
      advance(i % 2 ? 6000 : 900);                        // alternate full runs and early cancels
      if (demo().isRunning()) demo().cancel("test");
    }
    expect(dbg().runToken).toBe(4);
    expect(dbg().timers).toBe(0);
    Object.keys(counts).forEach((k) => expect(counts[k]).toBe(baseline[k] || 0));
    expect($$(".is-pdemo-active, .is-pdemo-dim, .is-pdemo-stage, .pdemo-layer")).toHaveLength(0);
  });

  test("reduced motion replay is a still highlight: no movement, no auto-opened details", () => {
    setup({ reduced: true });
    $("#pdemo-replay").click();
    const card = $('[data-project-key="docx-to-excel-generator"]');
    expect(card.classList.contains("is-pdemo-static")).toBe(true);
    expect(card.classList.contains("is-pdemo-active")).toBe(false);
    advance(6000);
    expect(modal().isOpen()).toBe(false);
    expect($(".pdemo-pointer, .pdemo-touch")).toBeNull();
    expect(card.classList.contains("is-pdemo-static")).toBe(false);
  });
});

/* ── Demo: fallbacks ──────────────────────────────────────── */
describe("discovery demo: fallbacks", () => {
  test("no card has details: demo declines and hides replay", () => {
    setup({ keys: ["nope-1", "nope-2"] });
    expect($(".pdemo-replay").hidden).toBe(true);
    expect($("#project-discovery-demo").getAttribute("data-state")).toBe("unavailable");
    expect(demo().play()).toBe(false);
    expect($("#pdemo-hint").textContent).toMatch(/Select any project card/);
  });

  test("no cards at all: demo declines and hides replay", () => {
    setup({ keys: [] });
    expect($(".pdemo-replay").hidden).toBe(true);
    expect(demo().play()).toBe(false);
  });

  test("missing modal markup: nothing throws, static hint remains", () => {
    expect(() => setup({ noModal: true })).not.toThrow();
    expect(window.ProjectDetailsModal).toBeUndefined();
    expect(demo().play()).toBe(false);
    expect($(".pdemo-replay").hidden).toBe(true);
  });

  test("no IntersectionObserver support: no autoplay, replay still works", () => {
    setup();
    demo().cancel();
    delete window.IntersectionObserver;
    window.eval(DEMO_SRC);
    expect(demo().play()).toBe(true);
    advance(6000);
    expect(demo().state()).toBe("completed");
  });

  test("a real dialog already open blocks play()", () => {
    setup({ stored: "completed" });
    $('[data-project-key="spring-boot-practice"]').click();
    expect(demo().play()).toBe(false);
  });
});

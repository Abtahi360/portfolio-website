/* ── Gallery controller ───────────────────────────────────────
   "Visual Archive". Fetches ONE metadata document from
   /.netlify/functions/gallery (which reads a public Google Drive
   folder), then renders everything client-side.

     • Fetch      once, when the section nears the viewport; Retry on failure
     • Validate   every field from the API is treated as untrusted input
     • Masonry    row spans from each file's real aspect ratio, so nothing
                  is cropped awkwardly and nothing shifts as images load
     • Filter     type (all/photos/videos) + category, instant, client-side
     • Reveal     progressive "Load more" batches, IntersectionObserver fades
     • Lightbox   custom, accessible: focus trap, inert background, ESC,
                  arrows, swipe, scroll lock, fullscreen, video via Drive preview

   The section never touches the rest of the page: if the API fails, only
   the gallery shows an error state. No secrets exist in this file.
   ──────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var section = document.getElementById("photo-gallery");
  var root = document.getElementById("gallery");
  if (!section || !root) return;

  var grid = document.getElementById("gallery-grid");
  var skeleton = root.querySelector("[data-gal-skeleton]");
  var toolbar = document.getElementById("gallery-toolbar");
  var more = root.querySelector("[data-gal-more]");
  var moreBtn = root.querySelector("[data-gal-more-btn]");
  var moreText = root.querySelector("[data-gal-more-text]");
  var statusEl = root.querySelector("[data-gal-status]");
  var panels = {
    empty: root.querySelector('[data-panel="empty"]'),
    error: root.querySelector('[data-panel="error"]'),
    nomatch: root.querySelector('[data-panel="nomatch"]')
  };

  var cfg = (typeof portfolioData !== "undefined" && portfolioData.gallery) || {};
  var ENDPOINT = "/.netlify/functions/gallery" + (cfg.recursive === false ? "?recursive=false" : "");
  var BATCH = Math.max(6, Math.min(60, parseInt(cfg.pageSize, 10) || 24));
  var FALLBACK_FOLDER = /^[A-Za-z0-9_-]{10,100}$/.test(cfg.folderId || "")
    ? "https://drive.google.com/drive/folders/" + cfg.folderId : "";

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  var state = {
    items: [], categories: [], view: [], shown: 0,
    kind: "all", cat: "", folderUrl: FALLBACK_FOLDER,
    status: "idle", loading: false
  };
  var ui = {}; /* toolbar element references */

  /* ── Utilities ─────────────────────────────────────────────── */
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text; /* textContent only: Drive metadata is untrusted */
    return node;
  }

  /* https URLs on Google-owned hosts only */
  function safeUrl(value) {
    if (typeof value !== "string" || value.length > 2048) return "";
    try {
      var u = new URL(value);
      if (u.protocol !== "https:") return "";
      if (!/(^|\.)(google\.com|googleusercontent\.com|googleapis\.com)$/i.test(u.hostname)) return "";
      return u.href;
    } catch (_) { return ""; }
  }

  function text(value, max) {
    return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max || 160) : "";
  }

  function announce(message) {
    if (!statusEl) return;
    statusEl.textContent = "";
    window.setTimeout(function () { statusEl.textContent = message; }, 30);
  }

  function duration(ms) {
    var s = Math.round((Number(ms) || 0) / 1000);
    if (!s) return "";
    var m = Math.floor(s / 60);
    return m + ":" + (s % 60 < 10 ? "0" : "") + (s % 60);
  }

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    try { return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(d); }
    catch (_) { return d.toDateString(); }
  }

  var ICON = {
    play: '<svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>',
    chevL: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M15 18l-6-6 6-6"/></svg>',
    chevR: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 18l6-6-6-6"/></svg>',
    close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    full: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>'
  };

  /* ── Data: validate everything that arrives ────────────────── */
  function cleanItem(raw) {
    if (!raw || typeof raw !== "object") return null;
    var id = typeof raw.id === "string" && /^[A-Za-z0-9_-]{6,100}$/.test(raw.id) ? raw.id : "";
    var kind = raw.kind === "video" ? "video" : raw.kind === "image" ? "image" : "";
    if (!id || !kind) return null;

    var category = text(raw.category, 60) || "Uncategorized";
    var title = text(raw.title, 120) || (kind === "video" ? "Video" : "Photo");
    var thumb = safeUrl(raw.thumbnailUrl);
    var thumbFallback = safeUrl(raw.thumbnailFallbackUrl) ||
      "https://drive.google.com/thumbnail?id=" + encodeURIComponent(id) + "&sz=w640";

    return {
      id: id, kind: kind, title: title, category: category,
      thumbnailUrl: thumb || thumbFallback,
      thumbnailFallbackUrl: thumbFallback,
      fullUrl: safeUrl(raw.fullUrl),
      previewUrl: safeUrl(raw.previewUrl),
      viewUrl: safeUrl(raw.viewUrl) || "https://drive.google.com/file/d/" + encodeURIComponent(id) + "/view",
      width: Number(raw.width) > 0 ? Number(raw.width) : 0,
      height: Number(raw.height) > 0 ? Number(raw.height) : 0,
      durationMs: Number(raw.durationMs) > 0 ? Number(raw.durationMs) : 0,
      modifiedTime: text(raw.modifiedTime, 40)
    };
  }

  function aspectOf(item) {
    var a = item.width && item.height ? item.width / item.height : item.kind === "video" ? 16 / 9 : 4 / 3;
    return clamp(a, 0.66, 2.2); /* extremes are cropped a little rather than becoming absurdly tall or thin */
  }

  /* ── State + panels ────────────────────────────────────────── */
  function setStatus(next) {
    state.status = next;
    root.setAttribute("data-state", next);
    root.setAttribute("aria-busy", next === "loading" ? "true" : "false");
    if (skeleton) skeleton.hidden = next !== "loading";
    grid.hidden = next !== "ready";
    toolbar.hidden = next !== "ready";
    panels.empty.hidden = next !== "empty";
    panels.error.hidden = next !== "error";
    if (next !== "ready") { more.hidden = true; panels.nomatch.hidden = true; }
    if (next === "loading") announce("Loading the photo gallery.");
    if (next === "error") announce("The photo gallery could not be loaded.");
  }

  function setDriveLinks() {
    root.querySelectorAll("[data-gal-drive]").forEach(function (a) {
      var url = state.folderUrl || FALLBACK_FOLDER;
      if (url) { a.href = url; a.hidden = false; } else { a.hidden = true; }
    });
  }

  /* ── Fetch ─────────────────────────────────────────────────── */
  function load(force) {
    if (state.loading) return;
    state.loading = true;
    setStatus("loading");
    if (moreBtn) moreBtn.disabled = false;

    var ctl = "AbortController" in window ? new AbortController() : null;
    var timer = ctl ? window.setTimeout(function () { ctl.abort(); }, 15000) : 0;

    fetch(ENDPOINT, {
      headers: { accept: "application/json" },
      cache: force ? "reload" : "default",
      credentials: "same-origin",
      signal: ctl ? ctl.signal : undefined
    })
      .then(function (res) {
        return res.json().then(function (body) { return { ok: res.ok, body: body }; }, function () { return { ok: false, body: null }; });
      })
      .then(function (r) {
        if (!r.ok || !r.body || r.body.success !== true || !Array.isArray(r.body.items)) throw new Error("bad-response");
        var items = r.body.items.map(cleanItem).filter(Boolean);
        var cats = [];
        items.forEach(function (it) { if (cats.indexOf(it.category) < 0) cats.push(it.category); });
        var order = Array.isArray(r.body.categories) ? r.body.categories.map(function (c) { return text(c, 60); }) : [];
        cats.sort(function (a, b) {
          var ia = order.indexOf(a), ib = order.indexOf(b);
          return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
        });

        state.items = items;
        state.categories = cats;
        state.folderUrl = safeUrl(r.body.folderUrl) || FALLBACK_FOLDER;
        state.kind = "all";
        state.cat = "";
        setDriveLinks();

        if (!items.length) { setStatus("empty"); return; }
        buildToolbar();
        setStatus("ready");
        applyFilters();
      })
      .catch(function () { setDriveLinks(); setStatus("error"); })
      .then(function () { window.clearTimeout(timer); state.loading = false; });
  }

  /* ── Toolbar (filters) ─────────────────────────────────────── */
  function counts() {
    var c = { kind: { all: 0, image: 0, video: 0 }, cat: {} };
    state.items.forEach(function (it) {
      if (!state.cat || it.category === state.cat) { c.kind.all++; c.kind[it.kind]++; }
      if (state.kind === "all" || it.kind === state.kind) c.cat[it.category] = (c.cat[it.category] || 0) + 1;
    });
    return c;
  }

  function buildToolbar() {
    toolbar.textContent = "";
    ui = { kinds: {}, cats: {} };

    var seg = el("div", "gal-segment");
    seg.setAttribute("role", "group");
    seg.setAttribute("aria-label", "Filter by type");
    [["all", "All"], ["image", "Photos"], ["video", "Videos"]].forEach(function (pair) {
      var b = el("button", "gal-seg-btn");
      b.type = "button";
      b.setAttribute("data-kind", pair[0]);
      b.appendChild(el("span", "gal-seg-btn__l", pair[1]));
      var n = el("span", "gal-seg-btn__n", "0");
      n.setAttribute("aria-hidden", "true");
      b.appendChild(n);
      b.addEventListener("click", function () { state.kind = pair[0]; applyFilters(); });
      seg.appendChild(b);
      ui.kinds[pair[0]] = { btn: b, n: n, label: pair[1] };
    });
    toolbar.appendChild(seg);

    var realCats = state.categories.filter(function (c) { return c !== "Uncategorized"; });
    if (realCats.length) {
      var wrap = el("div", "gal-chips");
      wrap.setAttribute("role", "group");
      wrap.setAttribute("aria-label", "Filter by album");
      state.categories.forEach(function (c) {
        var b = el("button", "gal-chip", c === "Uncategorized" ? "Other" : c);
        b.type = "button";
        b.addEventListener("click", function () { state.cat = state.cat === c ? "" : c; applyFilters(); });
        wrap.appendChild(b);
        ui.cats[c] = b;
      });
      toolbar.appendChild(wrap);
    }

    ui.count = el("p", "gal-count");
    toolbar.appendChild(ui.count);
  }

  function updateToolbar() {
    var c = counts();
    Object.keys(ui.kinds).forEach(function (k) {
      var o = ui.kinds[k];
      o.n.textContent = String(c.kind[k]);
      o.btn.setAttribute("aria-pressed", String(state.kind === k));
      o.btn.disabled = c.kind[k] === 0 && state.kind !== k;
      o.btn.setAttribute("aria-label", o.label + ", " + c.kind[k] + (c.kind[k] === 1 ? " item" : " items"));
    });
    Object.keys(ui.cats).forEach(function (k) {
      var n = c.cat[k] || 0;
      ui.cats[k].setAttribute("aria-pressed", String(state.cat === k));
      ui.cats[k].disabled = n === 0 && state.cat !== k;
    });
    ui.count.textContent = "Showing " + Math.min(state.shown, state.view.length) + " of " + state.view.length;
  }

  /* ── Grid ──────────────────────────────────────────────────── */
  function applyFilters() {
    state.view = state.items.filter(function (it) {
      return (state.kind === "all" || it.kind === state.kind) && (!state.cat || it.category === state.cat);
    });
    state.shown = 0;
    grid.textContent = "";
    panels.nomatch.hidden = state.view.length > 0;
    renderMore(true);
  }

  function chain(img, urls, onFail) {
    var list = urls.filter(function (u, i, a) { return u && a.indexOf(u) === i; });
    var i = 0;
    img.addEventListener("error", function () {
      i++;
      if (i < list.length) img.src = list[i]; else if (onFail) onFail();
    });
    if (list.length) img.src = list[0]; else if (onFail) onFail();
  }

  function buildCard(item, index, batchIndex) {
    var li = el("li", "gal-item");
    li.setAttribute("data-index", String(index));
    li.style.setProperty("--gi", String(Math.min(batchIndex, 7)));

    var btn = el("button", "gal-card");
    btn.type = "button";
    btn.setAttribute("data-index", String(index));

    var img = new Image();
    img.alt = (item.kind === "video" ? "Video: " : "") + item.title;
    img.decoding = "async";
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    if (item.width && item.height) { img.width = item.width; img.height = item.height; }
    chain(img, [item.thumbnailUrl, item.thumbnailFallbackUrl], function () { btn.classList.add("is-broken"); });
    btn.appendChild(img);

    if (item.kind === "video") {
      var badge = el("span", "gal-badge");
      badge.setAttribute("aria-hidden", "true");
      var play = el("span", "gal-badge__play");
      play.innerHTML = ICON.play; /* static, trusted markup */
      badge.appendChild(play);
      badge.appendChild(el("span", "", duration(item.durationMs) || "Video"));
      btn.appendChild(badge);
    }

    var cap = el("span", "gal-cap");
    cap.setAttribute("aria-hidden", "true"); /* the img alt already names the control */
    cap.appendChild(el("span", "gal-cap__title", item.title));
    cap.appendChild(el("span", "gal-cap__meta", item.category === "Uncategorized" ? (item.kind === "video" ? "Video" : "Photo") : item.category));
    btn.appendChild(cap);

    li.appendChild(btn);
    return li;
  }

  function renderMore(reset) {
    var start = state.shown;
    var end = Math.min(start + BATCH, state.view.length);
    var frag = document.createDocumentFragment();
    var firstNew = null;
    for (var i = start; i < end; i++) {
      var card = buildCard(state.view[i], i, i - start);
      if (!firstNew) firstNew = card;
      frag.appendChild(card);
    }
    grid.appendChild(frag);
    state.shown = end;

    observeReveal();
    layout();
    updateToolbar();

    var remaining = state.view.length - state.shown;
    more.hidden = remaining <= 0;
    if (moreText) moreText.textContent = "Showing " + state.shown + " of " + state.view.length;
    if (moreBtn) moreBtn.textContent = "Load " + Math.min(BATCH, remaining) + " more";

    if (reset) announce(state.view.length ? "Showing " + state.shown + " of " + state.view.length + " items." : "No items match these filters.");
    else {
      announce("Loaded " + (end - start) + " more. Showing " + state.shown + " of " + state.view.length + ".");
      var focusTarget = firstNew && firstNew.querySelector("button");
      if (focusTarget) focusTarget.focus({ preventScroll: false });
    }
  }

  /* ── Masonry: one read, one write pass ─────────────────────── */
  var layoutQueued = false;
  function layout() {
    if (layoutQueued) return;
    layoutQueued = true;
    window.requestAnimationFrame(doLayout);
  }

  function pickFeatured() {
    if (state.view.length < 5) return -1;
    for (var i = 0; i < Math.min(8, state.view.length); i++) {
      if (aspectOf(state.view[i]) >= 1.25) return i; /* a landscape lead, not a hand-picked file */
    }
    return -1;
  }

  function doLayout() {
    layoutQueued = false;
    if (grid.hidden) return;
    var cs = window.getComputedStyle(grid);
    var cols = cs.gridTemplateColumns.split(" ").filter(Boolean).length || 1;
    var gap = parseFloat(cs.columnGap) || 16;
    var unit = parseFloat(cs.gridAutoRows) || 8;
    var width = grid.clientWidth;
    if (!width) return;

    var colW = (width - gap * (cols - 1)) / cols;
    var featured = pickFeatured();
    var nodes = grid.children;
    var plan = [];
    for (var i = 0; i < nodes.length; i++) {
      var idx = parseInt(nodes[i].getAttribute("data-index"), 10);
      var item = state.view[idx];
      if (!item) continue;
      var asp = aspectOf(item);
      var span = cols >= 2 && (idx === featured || asp >= 1.8) ? 2 : 1;
      var w = span * colW + (span - 1) * gap;
      plan.push([nodes[i], span, Math.max(4, Math.ceil((w / asp + gap) / unit))]);
    }
    plan.forEach(function (p) { /* writes only */
      p[0].style.gridColumn = "span " + p[1];
      p[0].style.gridRowEnd = "span " + p[2];
    });
  }

  if ("ResizeObserver" in window) new ResizeObserver(layout).observe(grid);
  else window.addEventListener("resize", layout);

  /* ── Reveal ────────────────────────────────────────────────── */
  var revealObs = null;
  function motionOn() { return !mqReduce.matches && "IntersectionObserver" in window; }

  function syncMotion() {
    root.classList.toggle("gal-motion", motionOn());
    if (!motionOn()) grid.querySelectorAll(".gal-item:not(.is-in)").forEach(function (n) { n.classList.add("is-in"); });
  }

  function observeReveal() {
    syncMotion();
    if (!motionOn()) return;
    if (!revealObs) {
      revealObs = new IntersectionObserver(function (list) {
        list.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          revealObs.unobserve(e.target);
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    }
    grid.querySelectorAll(".gal-item:not(.is-in)").forEach(function (n) { revealObs.observe(n); });
  }

  if (mqReduce.addEventListener) mqReduce.addEventListener("change", syncMotion);

  /* ── Lightbox ──────────────────────────────────────────────── */
  var lb = null, lbRefs = {}, lbIndex = -1, opener = null, mountToken = 0, inerted = [];

  function buildLightbox() {
    lb = el("div", "gal-lb");
    lb.hidden = true;
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Photo and video viewer");

    var backdrop = el("div", "gal-lb__backdrop");
    backdrop.addEventListener("click", closeLightbox);
    lb.appendChild(backdrop);

    var bar = el("div", "gal-lb__bar");
    lbRefs.count = el("span", "gal-lb__count");
    lbRefs.count.setAttribute("aria-live", "polite");
    bar.appendChild(lbRefs.count);
    var tools = el("div", "gal-lb__tools");

    function iconBtn(cls, label, svg) {
      var b = el("button", "gal-lb__btn " + cls);
      b.type = "button";
      b.setAttribute("aria-label", label);
      b.innerHTML = svg; /* static, trusted markup */
      return b;
    }
    lbRefs.full = iconBtn("gal-lb__full", "Enter fullscreen", ICON.full);
    lbRefs.full.hidden = !document.fullscreenEnabled;
    lbRefs.full.addEventListener("click", function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (lb.requestFullscreen) lb.requestFullscreen().catch(function () {});
    });
    lbRefs.close = iconBtn("gal-lb__close", "Close viewer", ICON.close);
    lbRefs.close.addEventListener("click", closeLightbox);
    tools.appendChild(lbRefs.full);
    tools.appendChild(lbRefs.close);
    bar.appendChild(tools);
    lb.appendChild(bar);

    lbRefs.prev = iconBtn("gal-lb__nav gal-lb__nav--prev", "Previous item", ICON.chevL);
    lbRefs.next = iconBtn("gal-lb__nav gal-lb__nav--next", "Next item", ICON.chevR);
    lbRefs.prev.addEventListener("click", function () { step(-1); });
    lbRefs.next.addEventListener("click", function () { step(1); });
    lb.appendChild(lbRefs.prev);
    lb.appendChild(lbRefs.next);

    var stage = el("figure", "gal-lb__stage");
    lbRefs.media = el("div", "gal-lb__media");
    stage.appendChild(lbRefs.media);
    lb.appendChild(stage);

    var cap = el("figcaption", "gal-lb__cap");
    lbRefs.title = el("span", "gal-lb__title");
    lbRefs.title.id = "gal-lb-title";
    lbRefs.meta = el("span", "gal-lb__meta");
    cap.appendChild(lbRefs.title);
    cap.appendChild(lbRefs.meta);
    lb.appendChild(cap);
    lb.setAttribute("aria-labelledby", "gal-lb-title");
    lb.removeAttribute("aria-label");

    /* swipe */
    var sx = 0, sy = 0, tracking = false;
    stage.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse") return;
      tracking = true; sx = e.clientX; sy = e.clientY;
    });
    stage.addEventListener("pointerup", function (e) {
      if (!tracking) return;
      tracking = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 56 && Math.abs(dy) < 44) step(dx < 0 ? 1 : -1);
    });
    stage.addEventListener("pointercancel", function () { tracking = false; });

    document.addEventListener("fullscreenchange", function () {
      if (!lbRefs.full) return;
      lbRefs.full.setAttribute("aria-label", document.fullscreenElement ? "Exit fullscreen" : "Enter fullscreen");
    });

    document.body.appendChild(lb);
  }

  function step(dir) {
    var next = lbIndex + dir;
    if (next < 0 || next >= state.view.length) return;
    show(next);
  }

  function show(i) {
    var item = state.view[i];
    if (!item) return;
    lbIndex = i;
    var token = ++mountToken;
    lbRefs.media.textContent = ""; /* also tears down any previous video iframe */

    lbRefs.count.textContent = (i + 1) + " / " + state.view.length;
    lbRefs.prev.disabled = i === 0;
    lbRefs.next.disabled = i === state.view.length - 1;
    lbRefs.title.textContent = item.title;

    lbRefs.meta.textContent = "";
    if (item.category !== "Uncategorized") lbRefs.meta.appendChild(el("span", "gal-lb__cat", item.category));
    var date = formatDate(item.modifiedTime);
    if (date) lbRefs.meta.appendChild(el("span", "gal-lb__date", date));
    var open = el("a", "", "Open in Google Drive");
    open.href = item.viewUrl;
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    lbRefs.meta.appendChild(open);

    function failure(message) {
      var box = el("p", "gal-lb__fallback");
      box.appendChild(document.createTextNode(message + " "));
      var a = el("a", "", "Open it in Google Drive");
      a.href = item.viewUrl; a.target = "_blank"; a.rel = "noopener noreferrer";
      box.appendChild(a);
      box.appendChild(document.createTextNode("."));
      lbRefs.media.textContent = "";
      lbRefs.media.appendChild(box);
    }

    if (item.kind === "video") {
      if (!item.previewUrl) { failure("This video can't be played here."); return; }
      var frame = el("iframe");
      frame.title = "Video: " + item.title;
      frame.allow = "autoplay; fullscreen; picture-in-picture";
      frame.setAttribute("allowfullscreen", "");
      frame.src = item.previewUrl; /* a viewer, never autoplayed: the user presses play */
      lbRefs.media.appendChild(frame);
    } else {
      var loading = el("div", "gal-lb__loading");
      loading.setAttribute("aria-hidden", "true");
      lbRefs.media.appendChild(loading);
      var img = new Image();
      img.alt = item.title;
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.addEventListener("load", function () {
        if (token !== mountToken) return;
        loading.remove();
        img.classList.add("is-loaded");
      });
      chain(img, [item.fullUrl, item.thumbnailUrl, item.thumbnailFallbackUrl], function () {
        if (token === mountToken) failure("This image couldn't be loaded.");
      });
      lbRefs.media.appendChild(img);
    }

    /* warm the neighbours (skipped on data-saver) */
    var conn = navigator.connection;
    if (!(conn && conn.saveData)) {
      [state.view[i + 1], state.view[i - 1]].forEach(function (n) {
        if (n && n.kind === "image" && n.fullUrl) { var p = new Image(); p.referrerPolicy = "no-referrer"; p.src = n.fullUrl; }
      });
    }
  }

  function setInert(on) {
    if (on) {
      inerted = Array.prototype.filter.call(document.body.children, function (n) {
        return n !== lb && n.tagName !== "SCRIPT" && !n.hasAttribute("inert");
      });
      inerted.forEach(function (n) { n.setAttribute("inert", ""); });
    } else {
      inerted.forEach(function (n) { n.removeAttribute("inert"); });
      inerted = [];
    }
  }

  function focusables() {
    return Array.prototype.filter.call(
      lb.querySelectorAll("button, a[href], iframe"),
      function (n) { return !n.hidden && !n.disabled && n.offsetParent !== null; }
    );
  }

  function onKey(e) {
    if (!lb || lb.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); closeLightbox(); return; }
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); return; }
    if (e.key === "Tab") {
      var f = focusables();
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1], active = document.activeElement;
      if (e.shiftKey && (active === first || !lb.contains(active))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (active === last || !lb.contains(active))) { e.preventDefault(); first.focus(); }
    }
  }

  function openLightbox(index, openerEl) {
    if (!lb) buildLightbox();
    opener = openerEl || null;
    show(index);
    lb.hidden = false;

    var sbw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.classList.add("gal-lock");
    if (sbw > 0) document.documentElement.style.paddingRight = sbw + "px";
    setInert(true);
    document.addEventListener("keydown", onKey, true);

    window.requestAnimationFrame(function () { lb.classList.add("is-open"); });
    lbRefs.close.focus();
  }

  function closeLightbox() {
    if (!lb || lb.hidden) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
    document.removeEventListener("keydown", onKey, true);
    lb.classList.remove("is-open");
    lbRefs.media.textContent = ""; /* stop any playing video immediately */
    mountToken++;

    var done = function () { lb.hidden = true; };
    if (mqReduce.matches) done(); else window.setTimeout(done, 280);

    document.documentElement.classList.remove("gal-lock");
    document.documentElement.style.paddingRight = "";
    setInert(false);

    var target = opener && document.contains(opener) ? opener : grid.querySelector(".gal-card");
    if (target) target.focus({ preventScroll: true });
    opener = null;
  }

  grid.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".gal-card") : null;
    if (!btn || !grid.contains(btn)) return;
    openLightbox(parseInt(btn.getAttribute("data-index"), 10), btn);
  });

  /* ── Controls ──────────────────────────────────────────────── */
  if (moreBtn) moreBtn.addEventListener("click", function () { renderMore(false); });

  root.querySelectorAll("[data-gal-retry]").forEach(function (b) {
    b.addEventListener("click", function () { load(true); });
  });

  root.querySelectorAll("[data-gal-reset]").forEach(function (b) {
    b.addEventListener("click", function () { state.kind = "all"; state.cat = ""; applyFilters(); });
  });

  var contact = section.querySelector("[data-gal-contact]");
  if (contact) {
    contact.addEventListener("click", function (e) {
      var target = document.getElementById("contact");
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top: window.pageYOffset + target.getBoundingClientRect().top - 82,
        behavior: mqReduce.matches ? "instant" : "smooth"
      });
    });
  }

  /* ── Start when the section approaches the viewport ────────── */
  setDriveLinks();
  var started = false;
  function start() { if (started) return; started = true; load(false); }

  if ("IntersectionObserver" in window) {
    var startObs = new IntersectionObserver(function (list) {
      if (list.some(function (e) { return e.isIntersecting; })) { startObs.disconnect(); start(); }
    }, { rootMargin: "400px 0px" });
    startObs.observe(section);
  } else {
    start();
  }
})();

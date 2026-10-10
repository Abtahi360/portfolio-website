/* ── Experience controller ────────────────────────────────────
   "Professional Career Archive". Renders portfolioData.experience
   into #experience-timeline and drives its scroll behaviour.
   Styles: view/css/experience.css. Self-contained; touches nothing
   outside #experience.

     • Render    data-driven, escaped, URLs validated
     • Reveal    IntersectionObserver, once per role
     • Progress  scroll position -> how far the path is lit (one passive
                 listener while the section is near the viewport; one
                 read + a few inline-transform writes per frame)
     • States    upcoming / past / active from the lit path
     • Details   accessible disclosure for key contributions

   prefers-reduced-motion: no reveal, no scroll-linked work. The path
   is fully lit and the newest role is emphasised by CSS alone.
   ──────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var section = document.getElementById("experience");
  var host = document.getElementById("experience-timeline");
  if (!section || !host) return;

  /* ── Rendering ─────────────────────────────────────────────── */
  var PIN =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  var CHEVRON =
    '<svg class="exp-toggle__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<path d="M6 9l6 6 6-6"/></svg>';
  var STAR =
    '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M12 1.5c.7 5.6 4.9 9.8 10.5 10.5-5.6.7-9.8 4.9-10.5 10.5-.7-5.6-4.9-9.8-10.5-10.5C7.1 11.3 11.3 7.1 12 1.5z"/></svg>';

  /* Rhythm: panel width + horizontal shift vary role to role (editorial, not a centred list) */
  var WIDTHS = [660, 600, 640, 700];
  var SHIFTS = [0, 64, 24, 0];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* Only http(s) links and local paths; never javascript:, data:, etc. */
  function safeUrl(value) {
    var url = String(value || "").trim();
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (/^(?:\.{0,2}\/)?[\w@%+.~\-\/ ]+\.(?:png|jpe?g|webp|svg|gif|avif)$/i.test(url)) return url;
    return "";
  }

  function externalUrl(value) {
    var url = safeUrl(value);
    return /^https?:\/\//i.test(url) ? url : "";
  }

  /* "[DEMO COMPANY A]" -> "CA"; "Acme Labs" -> "AL"; "Initech" -> "IN" */
  function monogram(exp) {
    var custom = String(exp.monogram || "").trim();
    if (custom) return custom.slice(0, 3).toUpperCase();
    var name = String(exp.company || "").replace(/[\[\]()]/g, " ").replace(/^\s*demo\s+/i, "").trim();
    var words = name.split(/\s+/).filter(Boolean);
    if (!words.length) return "?";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }

  function period(value) {
    return esc(String(value || "").replace(/\s*-\s*/g, "\u2009\u2013\u2009"));
  }

  function list(value) {
    return Array.isArray(value)
      ? value.map(function (v) { return String(v == null ? "" : v).trim(); }).filter(Boolean)
      : [];
  }

  function renderItem(exp, i) {
    var current = exp.current === true;
    var headId = "exp-heading-" + i;
    var detailsId = "exp-details-" + i;
    var techs = list(exp.technologies);
    var contribs = list(exp.contributions);
    var logo = safeUrl(exp.logo);
    var url = externalUrl(exp.companyUrl);
    var index = (i + 1 < 10 ? "0" : "") + (i + 1);

    var identity = logo
      ? '<img src="' + esc(logo) + '" alt="" loading="lazy" decoding="async">'
      : esc(monogram(exp));
    var company = url
      ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(exp.company) + "</a>"
      : esc(exp.company);

    var details = contribs.length
      ? '<button type="button" class="exp-toggle" aria-expanded="false" aria-controls="' + detailsId + '">' +
        '<span class="exp-toggle__label">Key contributions</span>' + CHEVRON + "</button>" +
        '<div class="exp-details" id="' + detailsId + '"><div class="exp-details__inner"><ul class="exp-contrib">' +
        contribs.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") +
        "</ul></div></div>"
      : "";

    return (
      '<li class="exp-item" data-exp-item data-state="upcoming" data-current="' + (current ? "true" : "false") + '">' +
      '<div class="exp-rail"><span class="exp-index" aria-hidden="true">' + index + "</span>" +
      '<p class="exp-period">' + period(exp.period) + "</p></div>" +
      '<span class="exp-node" aria-hidden="true"></span>' +
      '<article class="exp-panel" aria-labelledby="' + headId + '" style="--exp-w:' + WIDTHS[i % WIDTHS.length] +
      "px;--exp-shift:" + SHIFTS[i % SHIFTS.length] + 'px">' +
      '<div class="exp-stack"><div class="exp-face">' +
      '<header class="exp-head"><div class="exp-id" aria-hidden="true">' + identity + "</div>" +
      '<div class="exp-titles"><h3 class="exp-role" id="' + headId + '">' + esc(exp.role) + "</h3>" +
      '<p class="exp-company">' + company + "</p></div>" +
      (current ? '<span class="exp-badge">Current role</span>' : "") + "</header>" +
      '<ul class="exp-meta">' +
      (exp.type ? '<li class="exp-type">' + esc(exp.type) + "</li>" : "") +
      (exp.location ? '<li class="exp-loc">' + PIN + "<span>" + esc(exp.location) + "</span></li>" : "") +
      "</ul>" +
      (exp.summary ? '<p class="exp-summary">' + esc(exp.summary) + "</p>" : "") +
      (techs.length
        ? '<ul class="exp-tags" aria-label="Technologies">' + techs.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>"
        : "") +
      details +
      "</div></div></article></li>"
    );
  }

  function render(entries) {
    if (!entries.length) {
      return '<p class="exp-empty">Professional experience will appear here soon.</p>';
    }
    return (
      '<div class="exp-path" aria-hidden="true"><span class="exp-path__track"></span>' +
      '<span class="exp-path__fill"></span><span class="exp-path__head"></span></div>' +
      '<ol class="exp-list" aria-label="Professional experience, most recent first">' +
      entries.map(renderItem).join("") + "</ol>" +
      '<a class="exp-bridge" href="#educational-history" data-exp-bridge>' +
      '<span class="exp-bridge__mark">' + STAR + "</span>" +
      '<span class="exp-bridge__line" aria-hidden="true"></span>' +
      '<span class="exp-bridge__label">Academic foundation</span></a>'
    );
  }

  var entries = typeof portfolioData !== "undefined" && Array.isArray(portfolioData.experience)
    ? portfolioData.experience.filter(function (e) { return e && typeof e === "object"; })
    : [];
  host.innerHTML = render(entries);
  if (!entries.length) return;

  /* ── Behaviour ─────────────────────────────────────────────── */
  var path = host.querySelector(".exp-path");
  var fillEl = path.querySelector(".exp-path__fill");
  var headEl = path.querySelector(".exp-path__head");
  var items = Array.prototype.slice.call(host.querySelectorAll("[data-exp-item]"));
  var bridge = host.querySelector("[data-exp-bridge]");

  var ACTIVE_LINE = 0.55;  /* fraction of viewport height where the path "is" */
  var EASE_RATE = 0.16;

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = mqReduce.matches;
  var geo = { nodeY: [], pathH: 0 };
  var cur = 0, snap = true, live = false, ticking = false, lastTs = 0;
  var last = { fill: -1, active: -2, lit: null, head: null };

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function offsetWithin(el, ancestor) {
    var y = 0;
    while (el && el !== ancestor) { y += el.offsetTop; el = el.offsetParent; }
    return y;
  }

  /* Measure on size changes only, never per scroll frame */
  function measure() {
    geo.nodeY = items.map(function (item) {
      var node = item.querySelector(".exp-node");
      return offsetWithin(node, host) + node.offsetHeight / 2;
    });
    var mark = bridge && bridge.querySelector(".exp-bridge__mark");
    geo.pathH = mark ? offsetWithin(mark, host) + mark.offsetHeight / 2 : host.offsetHeight;
    path.style.setProperty("--path-h", geo.pathH + "px");
    last.fill = -1;
  }

  function apply(px) {
    var fill = geo.pathH ? px / geo.pathH : 0;
    var key = Math.round(px * 4);
    if (key !== last.fill) {
      last.fill = key;
      fillEl.style.transform = "scaleY(" + fill.toFixed(4) + ")";
      headEl.style.transform = "translate3d(0," + px.toFixed(1) + "px,0)";
    }
    var head = fill > 0.002 && fill < 0.995 ? "1" : "0";
    if (head !== last.head) { last.head = head; headEl.style.opacity = head; }

    var active = -1;
    for (var i = 0; i < geo.nodeY.length; i++) { if (px >= geo.nodeY[i] - 1) active = i; }
    if (active !== last.active) {
      last.active = active;
      items.forEach(function (item, idx) {
        item.setAttribute("data-state", idx === active ? "active" : idx < active ? "past" : "upcoming");
      });
    }

    if (bridge) {
      var lit = geo.pathH > 0 && px >= geo.pathH - 2;
      if (lit !== last.lit) {
        last.lit = lit;
        if (lit) bridge.setAttribute("data-lit", ""); else bridge.removeAttribute("data-lit");
      }
    }
  }

  function frame(ts) {
    ticking = false;
    if (reduced || !live) return;
    var rect = host.getBoundingClientRect();                         /* single read */
    var target = clamp(window.innerHeight * ACTIVE_LINE - rect.top, 0, geo.pathH);
    if (snap) { cur = target; snap = false; }
    else {
      var dt = lastTs ? Math.min(ts - lastTs, 64) : 16.7;
      cur += (target - cur) * (1 - Math.pow(1 - EASE_RATE, dt / 16.7));
      if (Math.abs(target - cur) < 0.4) cur = target;
    }
    lastTs = ts;
    apply(cur);                                                      /* then writes */
    if (cur !== target) schedule(); else lastTs = 0;
  }

  function schedule() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(frame);
  }

  function setLive(on) {
    if (on === live) return;
    live = on;
    section.classList.toggle("exp-live", on);
    if (reduced) return;
    if (on) { snap = true; window.addEventListener("scroll", schedule, { passive: true }); schedule(); }
    else window.removeEventListener("scroll", schedule);
  }

  var revealObs = null;
  if ("IntersectionObserver" in window) {
    revealObs = new IntersectionObserver(function (list) {
      list.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -10% 0px" });
    items.forEach(function (item) { revealObs.observe(item); });
    if (bridge) revealObs.observe(bridge);
  }

  function revealAll() {
    items.forEach(function (item) { item.classList.add("is-in"); });
    if (bridge) bridge.classList.add("is-in");
  }

  function applyMode() {
    reduced = mqReduce.matches;
    host.classList.toggle("exp-motion", !reduced && !!revealObs);
    if (reduced || !revealObs) revealAll();
    if (reduced) {
      window.removeEventListener("scroll", schedule);
      items.forEach(function (item, i) { item.setAttribute("data-state", i === 0 ? "active" : "past"); });
      if (bridge) bridge.setAttribute("data-lit", "");
      last.active = -2; last.fill = -1; last.lit = null; last.head = null;
    } else if (live) {
      snap = true;
      window.addEventListener("scroll", schedule, { passive: true });
      schedule();
    }
  }

  host.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".exp-toggle") : null;
    if (!btn || !host.contains(btn)) return;
    var open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    var label = btn.querySelector(".exp-toggle__label");
    if (label) label.textContent = open ? "Key contributions" : "Hide contributions";
  });

  if (bridge) {
    bridge.addEventListener("click", function (e) {
      var target = document.getElementById("educational-history");
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top: window.pageYOffset + target.getBoundingClientRect().top - 82,
        behavior: reduced ? "instant" : "smooth"
      });
    });
  }

  measure();
  applyMode();

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (list) { setLive(list[list.length - 1].isIntersecting); },
      { rootMargin: "50% 0px 50% 0px" }).observe(section);
  } else {
    setLive(true);
  }

  function onResize() { measure(); if (!reduced) schedule(); }
  if ("ResizeObserver" in window) new ResizeObserver(onResize).observe(host);
  else window.addEventListener("resize", onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);

  if (mqReduce.addEventListener) mqReduce.addEventListener("change", applyMode);
  else if (mqReduce.addListener) mqReduce.addListener(applyMode);
})();

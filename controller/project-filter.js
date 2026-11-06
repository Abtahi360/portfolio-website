/* ── Other Projects: category filter ───────────────────────────
   Builds the chip row in #project-filters from portfolioData:
     All (n) · one chip per portfolioData.projectGroups entry (n)
   Counts come from the data, so they always match the grid.

   • Chips are <button aria-pressed>; exactly one is pressed.
   • Filtered-out cards get the `hidden` attribute, so they leave the
     layout, the tab order and the accessibility tree.
   • A polite live region announces "Showing 4 of 12 projects".
   • The swap animates with the View Transitions API where available
     (and motion is allowed); otherwise the grid simply updates.
   • The discovery demo only picks rendered cards and cancels itself
     on any pointerdown / keydown, so a chip press never fights it.
   ──────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var host = document.getElementById("project-filters");
  var grid = document.getElementById("projects-grid");
  if (!host || !grid || typeof portfolioData === "undefined") return;

  var projects = portfolioData.projects || [];
  var groups = (portfolioData.projectGroups || []).filter(function (g) {
    return projects.some(function (p) { return p.group === g.id; });
  });
  if (!projects.length || groups.length < 2) {
    host.hidden = true;
    return;
  }

  var reduceMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var current = "all";

  function countFor(id) {
    if (id === "all") return projects.length;
    return projects.filter(function (p) { return p.group === id; }).length;
  }

  function chip(id, label) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "xp-filter";
    b.setAttribute("data-filter", id);
    b.setAttribute("aria-pressed", id === current ? "true" : "false");
    var text = document.createElement("span");
    text.className = "xp-filter-label";
    text.textContent = label;
    var count = document.createElement("span");
    count.className = "xp-filter-count";
    count.textContent = String(countFor(id));
    b.appendChild(text);
    b.appendChild(count);
    return b;
  }

  var row = document.createElement("div");
  row.className = "xp-filter-row";
  row.setAttribute("role", "group");
  row.setAttribute("aria-label", "Filter projects by category");
  row.appendChild(chip("all", "All"));
  groups.forEach(function (g) { row.appendChild(chip(g.id, g.label)); });

  var status = document.createElement("p");
  status.className = "xp-filter-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  host.appendChild(row);
  host.appendChild(status);

  function cards() {
    return Array.prototype.filter.call(grid.children, function (c) {
      return c.classList && c.classList.contains("card") && c.hasAttribute("data-project-key");
    });
  }

  function apply(id) {
    var shown = 0;
    cards().forEach(function (card) {
      var match = id === "all" || card.getAttribute("data-group") === id;
      card.hidden = !match;
      if (match) shown++;
    });
    Array.prototype.forEach.call(row.children, function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-filter") === id ? "true" : "false");
    });
    grid.setAttribute("data-filter", id);
    status.textContent = id === "all" ? "" : "Showing " + shown + " of " + projects.length + " projects";
  }

  function select(id) {
    if (id === current) return;
    current = id;

    var animate = typeof document.startViewTransition === "function" && !(reduceMotion && reduceMotion.matches);
    if (!animate) {
      apply(id);
      return;
    }

    /* Each card morphs to its new slot; names exist only for the transition. */
    var list = cards();
    list.forEach(function (card, i) { card.style.viewTransitionName = "xp-card-" + i; });
    var clear = function () {
      list.forEach(function (card) { card.style.viewTransitionName = ""; });
    };
    try {
      var vt = document.startViewTransition(function () { apply(id); });
      vt.finished.then(clear, clear);
    } catch (e) {
      clear();
      apply(id);
    }
  }

  row.addEventListener("click", function (event) {
    var b = event.target.closest ? event.target.closest(".xp-filter") : null;
    if (!b || !row.contains(b)) return;
    select(b.getAttribute("data-filter"));
  });

  apply(current);
})();

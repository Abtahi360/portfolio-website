/* ── Research & Publications: "Publication Record" ─────────────
   Renders portfolioData.research into #research-list (an <ol>) and a
   one-line summary into #research-summary. Styles: view/css/research.css.

   Each entry = a rail (year · type · [index]) + the record:
     title (serif) → authors (you emphasised) → venue in citation form →
     fact chips → one-line finding → methods / contribution →
     <details> abstract → keywords → DOI / ResearchGate / Cite (APA).

   Only fields present in the data are shown. "Cite (APA)" appears only
   when authors, year and venue are all known, so no citation is ever
   built from partial metadata. ScholarlyArticle JSON-LD is generated
   from the same data and contains only the fields that exist.

   Exposed for tests: window.ResearchRecord.{apa, render, jsonLd}
   ──────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var EXT_ICON =
    '<svg class="pub-ext" viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M4 4h8v8"/><path d="M12 4 4 12"/></svg>';

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function list(arr) {
    return Array.isArray(arr) ? arr.filter(function (x) { return x != null && String(x).trim() !== ""; }) : [];
  }

  function doiUrl(doi) {
    return doi ? "https://doi.org/" + doi : "";
  }

  /* APA 7 reference, or "" when any required part is unknown. */
  function apa(pub) {
    if (!pub || !pub.citationAuthors || !pub.year || !pub.title || !pub.venue) return "";
    var title = pub.citationTitle || pub.title;
    var parts = [pub.citationAuthors + " (" + pub.year + ").", title.replace(/\.$/, "") + "."];
    if (pub.type === "Journal") {
      var vol = pub.volume ? ", " + pub.volume + (pub.issue ? "(" + pub.issue + ")" : "") : "";
      var pages = pub.pages ? ", " + pub.pages : "";
      parts.push(pub.venue + vol + pages + ".");
    } else {
      parts.push("In " + pub.venue + (pub.venueDetail ? ", " + pub.venueDetail : "") + ".");
    }
    if (pub.doi) parts.push(doiUrl(pub.doi));
    return parts.join(" ");
  }

  function venueLine(pub) {
    var html = "<cite>" + esc(pub.venue) + "</cite>";
    var bits = [];
    if (pub.volume) bits.push("Vol. " + esc(pub.volume) + (pub.issue ? ", No. " + esc(pub.issue) : ""));
    if (pub.pages) bits.push("pp. " + esc(pub.pages));
    if (pub.venueDetail) bits.push(esc(pub.venueDetail));
    return html + (bits.length ? ", " + bits.join(", ") : "");
  }

  function authorsLine(pub, selfName) {
    var authors = list(pub.authors);
    if (!authors.length) return "";
    return (
      '<p class="pub-authors">' +
      authors.map(function (a) {
        return a === selfName ? '<strong class="pub-self">' + esc(a) + "</strong>" : esc(a);
      }).join(", ") +
      "</p>"
    );
  }

  function chips(items, cls) {
    items = list(items);
    if (!items.length) return "";
    return '<ul class="' + cls + '">' + items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>";
  }

  function column(label, items) {
    var c = chips(items, "pub-chips");
    return c ? '<div class="pub-col"><h4 class="pub-label">' + label + "</h4>" + c + "</div>" : "";
  }

  function actions(pub, citation) {
    var out = [];
    if (pub.doi) {
      out.push(
        '<a class="pub-btn pub-btn--primary" href="' + esc(doiUrl(pub.doi)) + '" target="_blank" rel="noopener noreferrer">' +
        '<span>DOI <span class="pub-doi">' + esc(pub.doi) + "</span></span>" + EXT_ICON +
        '<span class="visually-hidden"> (opens in a new tab)</span></a>'
      );
    }
    var rg = pub.links && pub.links.researchgate;
    if (rg) {
      out.push(
        '<a class="pub-btn' + (pub.doi ? "" : " pub-btn--primary") + '" href="' + esc(rg) + '" target="_blank" rel="noopener noreferrer">' +
        "<span>ResearchGate</span>" + EXT_ICON + '<span class="visually-hidden"> (opens in a new tab)</span></a>'
      );
    }
    var pdf = pub.links && pub.links.pdf;
    if (pdf) {
      out.push(
        '<a class="pub-btn" href="' + esc(pdf) + '" target="_blank" rel="noopener noreferrer"><span>PDF</span>' + EXT_ICON +
        '<span class="visually-hidden"> (opens in a new tab)</span></a>'
      );
    }
    if (citation) {
      out.push('<button type="button" class="pub-btn pub-cite" data-cite-key="' + esc(pub.key) + '">Cite (APA)</button>');
      out.push('<span class="pub-cite-status" role="status" aria-live="polite"></span>');
    }
    if (!out.length) return "";
    return (
      '<div class="pub-actions">' + out.join("") + "</div>" +
      (citation ? '<p class="pub-cite-text" hidden>' + esc(citation) + "</p>" : "")
    );
  }

  function renderEntry(pub, index, selfName) {
    var id = "pub-" + pub.key;
    var citation = apa(pub);
    var keywords = list(pub.keywords);
    return (
      '<li class="pub" id="' + esc(id) + '">' +
      '<div class="pub-rail">' +
      (pub.year ? '<span class="pub-year">' + esc(pub.year) + "</span>" : "") +
      '<span class="pub-type">' + esc(pub.type || "Publication") + "</span>" +
      '<span class="pub-no" aria-hidden="true">[' + pad2(index + 1) + "]</span>" +
      "</div>" +
      '<article class="pub-main" aria-labelledby="' + esc(id) + '-title">' +
      '<h3 class="pub-title" id="' + esc(id) + '-title">' + esc(pub.title) + "</h3>" +
      authorsLine(pub, selfName) +
      (pub.venue ? '<p class="pub-venue">' + venueLine(pub) + "</p>" : "") +
      chips(pub.facts, "pub-facts") +
      (pub.tldr ? '<p class="pub-tldr"><span class="visually-hidden">Key finding: </span>' + esc(pub.tldr) + "</p>" : "") +
      (function () {
        var cols = column("Methods", pub.methods) + column("My contribution", pub.contribution);
        return cols ? '<div class="pub-cols">' + cols + "</div>" : "";
      })() +
      (pub.abstract
        ? '<details class="pub-abstract"><summary><span class="pub-summary-label">Abstract</span></summary><p>' + esc(pub.abstract) + "</p></details>"
        : "") +
      (keywords.length
        ? '<p class="pub-keywords"><span class="pub-label">Keywords</span> ' + keywords.map(esc).join(", ") + "</p>"
        : "") +
      actions(pub, citation) +
      "</article></li>"
    );
  }

  function summaryText(items) {
    var byType = {};
    var order = [];
    items.forEach(function (p) {
      var t = p.type || "Publication";
      if (!byType[t]) { byType[t] = 0; order.push(t); }
      byType[t]++;
    });
    return order.map(function (t) {
      var n = byType[t];
      var label = t === "Conference" ? "conference paper" : t === "Journal" ? "journal article" : t.toLowerCase();
      return n + " " + label + (n === 1 ? "" : "s");
    }).join(" and ");
  }

  /* schema.org ScholarlyArticle, verified fields only */
  function jsonLd(items) {
    return items.map(function (pub) {
      var o = { "@context": "https://schema.org", "@type": "ScholarlyArticle", name: pub.title, headline: pub.title.slice(0, 110) };
      var authors = list(pub.authors);
      if (authors.length) o.author = authors.map(function (a) { return { "@type": "Person", name: a }; });
      if (pub.date || pub.year) o.datePublished = pub.date || String(pub.year);
      if (pub.abstract) o.abstract = pub.abstract;
      if (list(pub.keywords).length) o.keywords = list(pub.keywords).join(", ");
      if (pub.type === "Journal" && pub.venue) {
        var periodical = { "@type": "Periodical", name: pub.venue };
        if (pub.issn) periodical.issn = pub.issn;
        if (pub.publisher) periodical.publisher = { "@type": "Organization", name: pub.publisher };
        var container = periodical;
        if (pub.volume) container = { "@type": "PublicationVolume", volumeNumber: String(pub.volume), isPartOf: container };
        if (pub.issue) container = { "@type": "PublicationIssue", issueNumber: String(pub.issue), isPartOf: container };
        o.isPartOf = container;
      } else if (pub.venue) {
        o.isPartOf = { "@type": "Event", name: pub.venue + (pub.venueDetail ? ", " + pub.venueDetail : "") };
      }
      if (pub.pages) {
        var pg = String(pub.pages).split(/[–-]/);
        o.pagination = pub.pages;
        if (pg.length === 2) { o.pageStart = pg[0].trim(); o.pageEnd = pg[1].trim(); }
      }
      if (pub.doi) {
        o.identifier = { "@type": "PropertyValue", propertyID: "DOI", value: pub.doi };
        o.url = doiUrl(pub.doi);
        o.sameAs = doiUrl(pub.doi);
      } else if (pub.links && pub.links.researchgate) {
        o.url = pub.links.researchgate;
      }
      return o;
    });
  }

  function injectJsonLd(items) {
    var data = jsonLd(items);
    if (!data.length || !document.head) return;
    var old = document.getElementById("research-jsonld");
    if (old) old.remove();
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = "research-jsonld";
    s.textContent = JSON.stringify(data.length === 1 ? data[0] : data);
    document.head.appendChild(s);
  }

  /* Clipboard with a fallback for older browsers / non-secure contexts. */
  function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function" && window.isSecureContext !== false) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand && document.execCommand("copy");
        ta.remove();
        ok ? resolve() : reject(new Error("copy failed"));
      } catch (e) {
        reject(e);
      }
    });
  }

  function bindCite(listEl, items) {
    var byKey = {};
    listEl._researchItems = items;
    if (listEl._citeBound) {
      return;
    }
    listEl._citeBound = true;
    items.forEach(function (p) { byKey[p.key] = p; });
    listEl.addEventListener("click", function (event) {
      var btn = event.target.closest ? event.target.closest(".pub-cite") : null;
      if (!btn || !listEl.contains(btn)) return;
      items = listEl._researchItems || items;
      byKey = {};
      items.forEach(function (p) { byKey[p.key] = p; });
      var pub = byKey[btn.getAttribute("data-cite-key")];
      var text = apa(pub);
      if (!text) return;
      var article = btn.closest(".pub-main");
      var statusEl = article.querySelector(".pub-cite-status");
      var textEl = article.querySelector(".pub-cite-text");
      clearTimeout(btn._citeTimer);
      copyText(text).then(function () {
        btn.classList.add("is-copied");
        statusEl.textContent = "APA citation copied";
        btn._citeTimer = setTimeout(function () {
          btn.classList.remove("is-copied");
          statusEl.textContent = "";
        }, 2600);
      }, function () {
        /* Copy blocked: show the reference so it can be selected by hand. */
        statusEl.textContent = "Copy is blocked in this browser. Select the citation below.";
        if (textEl) textEl.hidden = false;
      });
    });
  }

  function render(root) {
    root = root || document;
    var listEl = root.getElementById ? root.getElementById("research-list") : document.getElementById("research-list");
    if (!listEl || typeof portfolioData === "undefined" || !Array.isArray(portfolioData.research)) return null;
    var items = portfolioData.research.filter(function (p) { return p && p.title; });
    var selfName = portfolioData.selfName || "";
    listEl.innerHTML = items.map(function (p, i) { return renderEntry(p, i, selfName); }).join("");
    var summary = document.getElementById("research-summary");
    if (summary) summary.textContent = items.length ? summaryText(items) : "";
    bindCite(listEl, items);
    injectJsonLd(items);
    return listEl;
  }

  window.ResearchRecord = { apa: apa, render: render, jsonLd: jsonLd };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { render(); });
  } else {
    render();
  }
})();

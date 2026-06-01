(function () {
  "use strict";

  function renderRealWorldProjects() {
    var grid = document.getElementById("rw-projects-grid");
    if (!grid) return;
    if (typeof realWorldProjects === "undefined" || !realWorldProjects.length) {
      grid.closest(".rw-solutions-section") &&
        (grid.closest(".rw-solutions-section").style.display = "none");
      return;
    }

    grid.innerHTML = "";

    realWorldProjects.forEach(function (project) {
      var card = document.createElement("div");
      card.className = "rw-card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", "View details for " + project.title);

      // Cover image
      var coverHtml = project.coverImage
        ? '<img src="' +
        escHtml(project.coverImage) +
        '" alt="' +
        escHtml(project.title) +
        ' preview" loading="lazy">'
        : '<div class="rw-card-cover-placeholder">🚀</div>';

      // Tags
      var tagsHtml = (project.tags || [])
        .map(function (t) {
          return '<span class="rw-tag">' + escHtml(t) + "</span>";
        })
        .join("");

      // Stat icons
      var starSvg =
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
      var forkSvg =
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M6 9v2a3 3 0 003 3h6a3 3 0 003-3V9"/></svg>';

      var statsHtml =
        '<span class="rw-card-stat">' +
        starSvg +
        " " +
        (project.stars || 0) +
        "</span>" +
        '<span class="rw-card-stat">' +
        forkSvg +
        " " +
        (project.forks || 0) +
        "</span>";

      // Action buttons (stop propagation so they don't fire card click)
      var repoBtn = project.repoUrl
        ? '<a class="rw-btn rw-btn-ghost" href="' +
        escHtml(project.repoUrl) +
        '" target="_blank" rel="noopener" onclick="event.stopPropagation()">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>' +
        " Code</a>"
        : "";

      var liveBtn =
        project.liveUrl
          ? '<a class="rw-btn rw-btn-ghost" href="' +
          escHtml(project.liveUrl) +
          '" target="_blank" rel="noopener" onclick="event.stopPropagation()">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
          " Live Demo</a>"
          : "";

      var detailBtn =
        '<button class="rw-btn rw-btn-accent rw-detail-btn" data-id="' +
        escHtml(project.id) +
        '" onclick="event.stopPropagation(); openRWDetail(\'' +
        escHtml(project.id) +
        '\')">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
        " Details</button>";

      card.innerHTML =
        '<div class="rw-card-cover">' +
        coverHtml +
        "</div>" +
        '<div class="rw-card-body">' +
        '<div class="rw-card-top">' +
        '<div class="rw-card-name">' +
        escHtml(project.title) +
        "</div>" +
        '<div class="rw-card-stats">' +
        statsHtml +
        "</div>" +
        "</div>" +
        '<p class="rw-card-desc">' +
        escHtml(project.description) +
        "</p>" +
        '<div class="rw-card-tags">' +
        tagsHtml +
        "</div>" +
        "</div>" +
        '<div class="rw-card-footer">' +
        repoBtn +
        liveBtn +
        detailBtn +
        "</div>";

      // Click on card body also opens detail
      card.addEventListener("click", function () {
        openRWDetail(project.id);
      });

      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openRWDetail(project.id);
        }
      });

      grid.appendChild(card);
    });
  }

  /**
   * Navigate to the project detail page.
   * Exposed globally so inline onclick can call it.
   */
  window.openRWDetail = function (id) {
    try {
      sessionStorage.setItem("rw_projects_cache", JSON.stringify(realWorldProjects));
    } catch (e) { }
    window.location.href = "view/pages/project-detail.html?id=" + encodeURIComponent(id);
  };

  function escHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderRealWorldProjects);
  } else {
    renderRealWorldProjects();
  }
})();

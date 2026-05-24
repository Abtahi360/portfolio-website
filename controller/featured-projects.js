function renderFeaturedProjects() {
  const grid = document.getElementById("featured-projects-grid");
  if (!grid || typeof featuredProjects === "undefined" || !featuredProjects.length) {
    const section = document.getElementById("featured-projects");
    if (section) section.style.display = "none";
    return;
  }

  grid.innerHTML = "";

  featuredProjects.forEach((proj, idx) => {
    const tags = (proj.tags || []).map(t => `<span class="fp-tag">${t}</span>`).join("");

    const coverHtml = proj.coverImage
      ? `<img src="${proj.coverImage}" alt="${proj.title}" class="fp-card-img" loading="lazy">`
      : `<div class="fp-card-img-placeholder">
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
             <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
             <polyline points="21,15 16,10 5,21"/>
           </svg>
         </div>`;

    const card = document.createElement("article");
    card.className = "fp-card fade-in";
    card.setAttribute("data-fp-id", proj.id);

    // Alternate layout for even/odd cards
    const isAlt = idx % 2 === 1;
    card.classList.toggle("fp-card-alt", isAlt);

    card.innerHTML = `
      <div class="fp-card-visual">
        <div class="fp-card-img-wrap">
          ${coverHtml}
          <div class="fp-card-badge">${proj.category || "Project"}</div>
          ${proj.status === "Completed"
            ? `<div class="fp-card-status fp-status-done">✓ Completed</div>`
            : `<div class="fp-card-status fp-status-wip">⚡ In Progress</div>`}
        </div>
      </div>

      <div class="fp-card-content">
        <div class="fp-card-meta">
          <span class="fp-card-year">${proj.year || ""}</span>
          <div class="fp-card-stats">
            <span class="fp-stat">★ ${proj.stars || 0}</span>
            <span class="fp-stat">⑂ ${proj.forks || 0}</span>
          </div>
        </div>

        <h3 class="fp-card-title">${proj.title}</h3>
        <p class="fp-card-tagline">${proj.tagline || ""}</p>

        <div class="fp-card-problem">
          <div class="fp-problem-label">Problem solved</div>
          <p class="fp-problem-text">${proj.problem || proj.solution || ""}</p>
        </div>

        <div class="fp-tags-row">${tags}</div>

        <div class="fp-card-actions">
          ${proj.repoUrl
            ? `<a href="${proj.repoUrl}" class="fp-btn fp-btn-ghost" target="_blank" rel="noopener">
                 <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                 Code
               </a>`
            : ""}
          ${proj.liveUrl
            ? `<a href="${proj.liveUrl}" class="fp-btn fp-btn-ghost" target="_blank" rel="noopener">
                 <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                 Live Demo
               </a>`
            : ""}
          <button class="fp-btn fp-btn-primary fp-details-btn" data-fp-id="${proj.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            View Details
          </button>
        </div>
      </div>`;

    grid.appendChild(card);
  });

  // Wire up "View Details" → project-detail page
  document.querySelectorAll(".fp-details-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.fpId;
      window.location.href = `view/pages/project-detail.html?id=${id}`;
    });
  });

  // Trigger fade-in observer for new cards
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); }
    });
  }, { threshold: 0.05 });
  document.querySelectorAll(".fp-card").forEach(c => observer.observe(c));
}

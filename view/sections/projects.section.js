function getProjectsSection() {
  return `
  <section class="section-shell" id="projects">
    <div class="projects-hint-overlay" id="projects-hint-overlay">
      <div class="projects-hint-content">
        <div class="projects-hint-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </div>
        <p>Click any project card to view more details.</p>
      </div>
    </div>
    <div class="section-anchor-offset" id="projects-anchor"></div>
    <div class="section-inner fade-in">
      <div class="section-header">
        <div>
          <div class="section-kicker">Projects</div>
          <h2 class="section-title">Selected work</h2>
        </div>
        <div class="section-subtitle">
          A collection of projects that highlight my skills in software development, machine learning, and data science.
        </div>
      </div>
      <div class="cards-grid" id="projects-grid">
        <!-- Rendered by controller/projects-renderer.js -->
      </div>
    </div>
  </section>

  <div class="project-modal-backdrop" id="project-modal-backdrop" aria-hidden="true">
    <div class="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
      <div class="project-modal-header">
        <h3 class="project-modal-title" id="project-modal-title"></h3>
        <button type="button" class="project-modal-close" aria-label="Close project details">Close</button>
      </div>
      <div class="project-modal-body" id="project-modal-body"></div>
      <div class="project-modal-footer">
        <button type="button" class="link-pill" id="project-modal-close-btn">Close</button>
      </div>
    </div>
  </div>`;
}

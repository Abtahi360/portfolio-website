function getFeaturedProjectsSection() {
  return `
  <section class="section-shell" id="featured-projects">
    <div class="section-anchor-offset" id="featured-anchor"></div>
    <div class="section-inner fade-in">
      <div class="section-header">
        <div>
          <div class="section-kicker featured-kicker">
            <span class="featured-star">★</span> Featured
          </div>
          <h2 class="section-title">Real-World Solutions</h2>
        </div>
        <div class="section-subtitle">
          Projects built to solve actual problems — combining ML, backend engineering, and system design.
        </div>
      </div>
      <div class="featured-projects-grid" id="featured-projects-grid">
        <!-- Rendered by controller/featured-projects.js -->
      </div>
    </div>
  </section>`;
}

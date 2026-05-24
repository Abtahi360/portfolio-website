function getCertificatesSection() {
  return `
  <section class="section-shell" id="certificates">
    <div class="section-anchor-offset" id="certificates-anchor"></div>
    <div class="section-inner fade-in">
      <div class="section-header">
        <div>
          <div class="section-kicker">Achievements</div>
          <h2 class="section-title">Certificates &amp; recognition</h2>
        </div>
        <div class="section-subtitle">
          Recognitions that represent my growth, technical expertise, and passion for continuous improvement.
        </div>
      </div>
      <div class="cert-container marquee-mode" id="cert-container">
        <div class="cert-grid" id="cert-grid">
          <!-- Rendered by controller/certificates-renderer.js -->
        </div>
      </div>
      <div class="cert-view-more-container">
        <button class="cert-view-more-btn" id="cert-view-more-btn" aria-label="Toggle certificate view mode">
          <span class="view-more-text">View all certificates</span>
          <span class="view-more-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
            </svg>
          </span>
        </button>
      </div>
    </div>
  </section>`;
}

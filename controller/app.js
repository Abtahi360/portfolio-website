
(function () {
  "use strict";

  function buildPage() {
    const main = document.getElementById("main-content");
    if (!main) return;

    main.innerHTML = [
      getHeroSection(),
      getEducationSection(),
      getFeaturedProjectsSection(),
      getProjectsSection(),
      getResearchSection(),
      getSkillsSection(),
      getCertificatesSection(),
      getContactSection()
    ].join("");

    const page = document.querySelector(".page");
    if (page) {
      page.insertAdjacentHTML("beforeend", getFooter());
    }
  }

  function initNav() {
    const navLinks  = document.querySelectorAll(".nav-link");
    const navChips  = document.querySelectorAll(".nav-link-chip");
    const navToggle = document.querySelector(".nav-toggle");
    const mobileNav = document.querySelector(".nav-links-mobile");

    const sections = {
      home:              document.getElementById("home"),
      education:         document.getElementById("educational-history"),
      "featured-projects": document.getElementById("featured-projects"),
      projects:          document.getElementById("projects"),
      research:          document.getElementById("research"),
      skills:            document.getElementById("skills"),
      certificates:      document.getElementById("certificates"),
      contact:           document.getElementById("contact")
    };

    function scrollToSection(target) {
      const el = document.getElementById(target + "-anchor") || document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function setActiveNav(key) {
      navLinks.forEach(link => {
        link.classList.toggle("active", link.dataset.target === key);
      });
      navChips.forEach(chip => {
        chip.classList.toggle("active", chip.dataset.target === key);
      });
    }

    function mobileNavOpen(open) {
      if (!mobileNav) return;
      mobileNav.classList.toggle("open", open);
      if (navToggle) navToggle.classList.toggle("open", open);
    }

    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        const target = link.dataset.target;
        if (target) {
          scrollToSection(target);
          if (window.innerWidth <= 960) mobileNavOpen(false);
        }
      });
    });

    navChips.forEach(chip => {
      chip.addEventListener("click", () => {
        const target = chip.dataset.target;
        if (target) { scrollToSection(target); mobileNavOpen(false); }
      });
    });

    if (navToggle) {
      navToggle.addEventListener("click", () => {
        mobileNavOpen(!mobileNav.classList.contains("open"));
      });
    }

    document.addEventListener("click", e => {
      if (mobileNav && mobileNav.classList.contains("open")) {
        if (!mobileNav.contains(e.target) && !navToggle.contains(e.target)) {
          mobileNavOpen(false);
        }
      }
    });

    const sectionKeys = Object.keys(sections);
    window.addEventListener("scroll", () => {
      let current = "home";
      const center = window.pageYOffset + window.innerHeight * 0.35;
      let closest  = Infinity;
      sectionKeys.forEach(key => {
        const el = sections[key];
        if (!el) return;
        const rect   = el.getBoundingClientRect();
        const mid    = window.pageYOffset + rect.top + rect.height / 2;
        const dist   = Math.abs(mid - center);
        if (dist < closest) { closest = dist; current = key; }
      });
      setActiveNav(current);
    });

    document.querySelectorAll(".clickable-stat").forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        const href = a.getAttribute("href");
        if (href && href.startsWith("#")) scrollToSection(href.slice(1));
      });
    });

    document.querySelectorAll("[data-scroll='projects']").forEach(btn => {
      btn.addEventListener("click", () => scrollToSection("projects"));
    });
  }

  function initTheme() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const next   = isDark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }

  function initFadeIn() {
    const els = document.querySelectorAll(".fade-in");
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.05 });
    els.forEach(el => obs.observe(el));
  }


  function renderEducation() {
    const grid = document.getElementById("education-grid");
    if (!grid || typeof portfolioData === "undefined") return;
    grid.innerHTML = "";
    portfolioData.education.forEach(edu => {
      const a = document.createElement("article");
      a.className = "card edu-hx-entry";
      a.setAttribute("data-edu-hx-entry", "true");
      a.innerHTML = `
        <div class="card-kicker">${edu.kicker || ""}</div>
        <h3 class="card-title">${edu.title}</h3>
        <div class="card-meta">${edu.period} · ${edu.institution}</div>
        <div class="card-meta">${edu.location}</div>
        ${edu.summary ? `<p class="edu-hx-summary">${edu.summary}</p>` : ""}
        <ul class="card-list">
          ${edu.coursework ? `<li><strong>Coursework:</strong> ${edu.coursework}</li>` : ""}
          ${edu.skills     ? `<li><strong>Skills:</strong> ${edu.skills}</li>`         : ""}
          ${edu.activities ? `<li><strong>Activities:</strong> ${edu.activities}</li>` : ""}
        </ul>`;
      grid.appendChild(a);
    });
  }


  function renderProjects() {
    const grid = document.getElementById("projects-grid");
    if (!grid || typeof portfolioData === "undefined") return;
    grid.innerHTML = "";
    portfolioData.projects.forEach(proj => {
      const card = document.createElement("article");
      card.className = "card project-card";
      card.setAttribute("data-project-key", proj.key || "");
      const img    = proj.images && proj.images[0] ? `<img src="${proj.images[0]}" alt="${proj.title}" class="project-card-img" loading="lazy">` : "";
      const tags   = (proj.tags || []).map(t => `<span class="pill-tag">${t}</span>`).join("");
      const repo   = proj.repoUrl  ? `<a href="${proj.repoUrl}"  class="link-pill" target="_blank" rel="noopener"><span class="link-icon">⌥</span> Code</a>`      : "";
      const live   = proj.liveLink ? `<a href="${proj.liveLink}" class="link-pill" target="_blank" rel="noopener"><span class="link-icon">↗</span> Live Demo</a>` : "";
      card.innerHTML = `
        <div class="project-card-img-wrap">${img}</div>
        <div class="card-kicker">${proj.kicker || ""}</div>
        <h3 class="card-title">${proj.title}</h3>
        <p class="card-desc">${proj.description}</p>
        <div class="pill-tag-row">${tags}</div>
        <div class="project-card-actions">${repo}${live}
          <button class="link-pill project-details-btn" data-project-key="${proj.key}">
            <span class="link-icon">👁</span> Details
          </button>
        </div>`;
      grid.appendChild(card);
    });
    initProjectModal();
    initProjectsHint();
  }

  function initProjectModal() {
    const backdrop = document.getElementById("project-modal-backdrop");
    const titleEl  = document.getElementById("project-modal-title");
    const bodyEl   = document.getElementById("project-modal-body");
    const closeBtn = document.querySelector(".project-modal-close");
    const closePill = document.getElementById("project-modal-close-btn");

    function openModal(key) {
      if (typeof projectDetails === "undefined") return;
      const detail = projectDetails.find(p => p.key === key);
      if (!detail || !backdrop) return;
      if (titleEl) titleEl.textContent = detail.title;
      if (bodyEl)  bodyEl.innerHTML    = detail.bodyHtml || "<p>No details available.</p>";
      backdrop.setAttribute("aria-hidden", "false");
      backdrop.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      if (!backdrop) return;
      backdrop.setAttribute("aria-hidden", "true");
      backdrop.classList.remove("open");
      document.body.style.overflow = "";
    }

    document.querySelectorAll(".project-details-btn").forEach(btn => {
      btn.addEventListener("click", () => openModal(btn.dataset.projectKey));
    });
    if (closeBtn)  closeBtn.addEventListener("click", closeModal);
    if (closePill) closePill.addEventListener("click", closeModal);
    if (backdrop)  backdrop.addEventListener("click", e => { if (e.target === backdrop) closeModal(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
  }

  function initProjectsHint() {
    const overlay = document.getElementById("projects-hint-overlay");
    if (!overlay) return;
    let shown = false;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !shown) {
          shown = true;
          overlay.classList.add("visible");
          setTimeout(() => overlay.classList.remove("visible"), 3000);
        }
      });
    }, { threshold: 0.4 });
    const section = document.getElementById("projects");
    if (section) obs.observe(section);
  }

  /* ── 8. SKILLS RENDERER ────────────────────────────────────── */
  function renderSkills() {
    const grid = document.getElementById("skills-grid");
    if (!grid || typeof skillsData === "undefined") return;
    grid.innerHTML = "";
    const levelOrder = ["Strong", "Daily use", "Intermediate", "Academic"];

    function normalize(level) {
      if (!level) return "Intermediate";
      const l = level.toLowerCase();
      if (l.startsWith("strong")) return "Strong";
      if (l.startsWith("daily"))  return "Daily use";
      if (l.startsWith("acad"))   return "Academic";
      return "Intermediate";
    }

    skillsData.forEach(cat => {
      const card = document.createElement("article");
      card.className = "skills-group-card";
      if (cat.id === "tools") card.id = "tools";

      const header = document.createElement("div");
      header.className = "skills-group-header";
      const titleEl = document.createElement("div");
      titleEl.className = "skills-group-title";
      titleEl.textContent = cat.title;
      header.appendChild(titleEl);

      const body         = document.createElement("div"); body.className = "skills-group-body";
      const visWrap      = document.createElement("div"); visWrap.className = "skills-visible";
      const extraWrap    = document.createElement("div"); extraWrap.className = "skills-extra";
      const groupsVis    = {};
      const groupsExtra  = {};

      function ensureGroup(wrap, groups, label) {
        if (groups[label]) return groups[label];
        const g   = document.createElement("div"); g.className = "skills-proficiency-group";
        const lbl = document.createElement("div"); lbl.className = "skills-proficiency-label"; lbl.textContent = label;
        const row = document.createElement("div"); row.className = "skills-chips-row";
        g.appendChild(lbl); g.appendChild(row); wrap.appendChild(g);
        groups[label] = row; return row;
      }

      function makeChip(skill) {
        const chip  = document.createElement("div"); chip.className = "skill-icon-pill"; chip.setAttribute("role","listitem");
        const name  = document.createElement("div"); name.className  = "skill-icon-label"; name.textContent = skill.name;
        const level = document.createElement("div"); level.className = "skill-icon-level"; level.textContent = normalize(skill.level);
        chip.appendChild(name); chip.appendChild(level); return chip;
      }

      const sorted = cat.skills.slice().sort((a,b) => {
        const ai = levelOrder.indexOf(normalize(a.level));
        const bi = levelOrder.indexOf(normalize(b.level));
        return ai !== bi ? ai - bi : a.name.localeCompare(b.name);
      });

      const max     = cat.maxVisible || 6;
      const visible = sorted.slice(0, max);
      const extra   = sorted.slice(max);

      visible.forEach(s => ensureGroup(visWrap, groupsVis, normalize(s.level)).appendChild(makeChip(s)));
      extra.forEach(s   => ensureGroup(extraWrap, groupsExtra, normalize(s.level)).appendChild(makeChip(s)));

      visWrap.setAttribute("role","list"); extraWrap.setAttribute("role","list");
      body.appendChild(visWrap);

      if (extra.length) {
        const eid = "skills-extra-" + cat.id;
        extraWrap.id = eid; extraWrap.setAttribute("aria-hidden","true"); extraWrap.hidden = true; extraWrap.style.maxHeight = "0px";
        body.appendChild(extraWrap);
        const foot   = document.createElement("div"); foot.className = "skills-group-footer";
        const toggle = document.createElement("button"); toggle.type = "button"; toggle.className = "skills-toggle";
        toggle.setAttribute("aria-expanded","false"); toggle.setAttribute("aria-controls", eid);
        toggle.innerHTML = '<span class="skills-toggle-label">Show more</span><span class="skills-toggle-icon">⌄</span>';
        toggle.addEventListener("click", () => {
          const open = toggle.getAttribute("aria-expanded") === "true";
          const next = !open;
          toggle.setAttribute("aria-expanded", String(next));
          extraWrap.setAttribute("aria-hidden", String(!next));
          card.classList.toggle("skills-card-expanded", next);
          const lbl = toggle.querySelector(".skills-toggle-label");
          if (next) {
            extraWrap.hidden = false;
            extraWrap.style.maxHeight = extraWrap.scrollHeight + "px";
            if (lbl) lbl.textContent = "Show less";
          } else {
            extraWrap.style.maxHeight = "0px";
            const done = () => { extraWrap.hidden = true; extraWrap.removeEventListener("transitionend", done); };
            extraWrap.addEventListener("transitionend", done);
            if (lbl) lbl.textContent = "Show more";
          }
        });
        foot.appendChild(toggle); card.appendChild(foot);
      }
      card.appendChild(header); card.appendChild(body);
      grid.appendChild(card);
    });
  }

  /* ── 9. CERTIFICATES RENDERER ──────────────────────────────── */
  function renderCertificates() {
    const certGrid = document.getElementById("cert-grid");
    const viewBtn  = document.getElementById("cert-view-more-btn");
    const container = document.getElementById("cert-container");
    if (!certGrid || typeof portfolioData === "undefined") return;

    certGrid.innerHTML = "";
    portfolioData.certificates.forEach(cert => {
      const card = document.createElement("div");
      card.className = "cert-card" + (cert.premium ? " cert-premium" : "");
      const imgSrc = cert.image || "";
      const isUrl  = imgSrc.startsWith("http");
      card.innerHTML = `
        ${isUrl
          ? `<a href="${imgSrc}" target="_blank" rel="noopener" class="cert-link" aria-label="View ${cert.title}">
               <div class="cert-img-wrap cert-link-icon-wrap">
                 <svg class="cert-ext-link-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
               </div>
             </a>`
          : `<div class="cert-img-wrap"><img src="${imgSrc}" alt="${cert.title}" class="cert-img" loading="lazy"></div>`
        }
        <div class="cert-body">
          <div class="cert-title">${cert.title}</div>
          <div class="cert-meta">${cert.meta || ""}</div>
          ${cert.skills ? `<div class="cert-skills">${cert.skills}</div>` : ""}
        </div>`;
      certGrid.appendChild(card);
    });

    if (viewBtn && container) {
      viewBtn.addEventListener("click", () => {
        const isGrid = container.classList.contains("grid-mode");
        container.classList.toggle("marquee-mode", isGrid);
        container.classList.toggle("grid-mode", !isGrid);
        const txt  = viewBtn.querySelector(".view-more-text");
        if (txt) txt.textContent = isGrid ? "View all certificates" : "Show less";
      });
    }
  }

  /* ── 10. SCROLL TO TOP ──────────────────────────────────────── */
  function initScrollToTop() {
    const btn = document.getElementById("scroll-to-top");
    if (!btn) return;
    window.addEventListener("scroll", () => {
      btn.classList.toggle("visible", window.pageYOffset > 400);
    });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ── 11. REPO MODAL ─────────────────────────────────────────── */
  function initRepoModal() {
    const modal     = document.getElementById("repoModal");
    const nameEl    = document.getElementById("modalProjectName");
    const closeBtn  = document.getElementById("closeModal");
    if (!modal) return;
    window.showRepoModal = function(projectName) {
      if (nameEl) nameEl.textContent = projectName;
      modal.style.display = "flex";
    };
    if (closeBtn) closeBtn.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
  }

  /* ── INIT ────────────────────────────────────────────────────── */
  function init() {
    buildPage();
    initNav();
    initTheme();
    initFadeIn();
    renderEducation();
    renderProjects();
    renderSkills();
    renderCertificates();
    initScrollToTop();
    initRepoModal();

    // Featured projects rendered by featured-projects.js (loaded after)
    if (typeof renderFeaturedProjects === "function") renderFeaturedProjects();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

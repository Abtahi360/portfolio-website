(function () {
  "use strict";

  /* ── Skills data ─────────────────────────────────────────── */
  var skillsData = [
    {
      id: "languages",
      title: "Programming Languages",
      highlightLevels: ["Strong"],
      maxVisible: 6,
      skills: [
        { name: "C++", level: "Strong" },
        { name: "Python", level: "Strong" },
        { name: "Java", level: "Strong" },
        { name: "C#", level: "Strong" },
        { name: "JavaScript", level: "Intermediate" },
        { name: "HTML", level: "Intermediate" }
      ]
    },
    {
      id: "frameworks",
      title: "Frameworks & Libraries",
      highlightLevels: ["Strong"],
      maxVisible: 5,
      skills: [
        { name: "Spring Boot", level: "Strong" },
        { name: "Pandas", level: "Strong" },
        { name: "Keras", level: "Intermediate" },
        { name: "TensorFlow", level: "Intermediate" },
        { name: "NumPy", level: "Intermediate" }
      ]
    },
    {
      id: "tools",
      title: "Software Tools",
      highlightLevels: ["Strong", "Daily use"],
      maxVisible: 6,
      skills: [
        { name: "Git", level: "Daily use" },
        { name: "MySQL", level: "Strong" },
        { name: "Code::Blocks", level: "Strong" },
        { name: "Jupyter Notebook", level: "Strong" },
        { name: "Anaconda", level: "Strong" },
        { name: "VS Code", level: "Daily use" },
        { name: "IntelliJ IDEA", level: "Daily use" },
        { name: "LaTeX", level: "Daily use" },
        { name: "MATLAB", level: "Academic" },
        { name: "SPSS", level: "Academic" },
        { name: "Oracle VM VirtualBox", level: "Intermediate" },
        { name: "Figma", level: "Intermediate" }
      ]
    }
  ];

  /* ── DOM refs ────────────────────────────────────────────── */
  var navLinks = document.querySelectorAll(".nav-link");
  var navChips = document.querySelectorAll(".nav-link-chip");
  var sections = {
    home: document.getElementById("home"),
    education: document.getElementById("educational-history"),
    projects: document.getElementById("projects"),
    research: document.getElementById("research"),
    skills: document.getElementById("skills"),
    tools: null,
    certificates: document.getElementById("certificates"),
    contact: document.getElementById("contact")
  };

  /* ── Skills renderer ─────────────────────────────────────── */
  function renderSkills() {
    var skillsGrid = document.getElementById("skills-grid");
    if (!skillsGrid) return;
    skillsGrid.innerHTML = "";

    var levelOrder = ["Strong", "Daily use", "Intermediate", "Academic"];

    function normalizeLevel(level) {
      if (!level) return "Intermediate";
      var lower = level.toLowerCase();
      if (lower.startsWith("strong")) return "Strong";
      if (lower.startsWith("daily")) return "Daily use";
      if (lower.startsWith("academic")) return "Academic";
      return "Intermediate";
    }

    skillsData.forEach(function (category) {
      var card = document.createElement("article");
      card.className = "skills-group-card";
      if (category.id === "tools") card.id = "tools";

      var header = document.createElement("div");
      header.className = "skills-group-header";
      var titleEl = document.createElement("div");
      titleEl.className = "skills-group-title";
      titleEl.textContent = category.title;
      header.appendChild(titleEl);

      var body = document.createElement("div");
      body.className = "skills-group-body";
      var visibleWrapper = document.createElement("div");
      visibleWrapper.className = "skills-visible";
      var extraWrapper = document.createElement("div");
      extraWrapper.className = "skills-extra";

      var levelGroupsVisible = {};
      var levelGroupsExtra = {};

      function ensureGroup(wrapper, groups, levelLabel) {
        if (groups[levelLabel]) return groups[levelLabel];
        var group = document.createElement("div");
        group.className = "skills-proficiency-group";
        var label = document.createElement("div");
        label.className = "skills-proficiency-label";
        label.textContent = levelLabel;
        group.appendChild(label);
        var row = document.createElement("div");
        row.className = "skills-chips-row";
        group.appendChild(row);
        wrapper.appendChild(group);
        groups[levelLabel] = row;
        return row;
      }

      function createChip(skill) {
        var chip = document.createElement("div");
        chip.className = "skill-icon-pill";
        chip.setAttribute("role", "listitem");
        var labelEl = document.createElement("div");
        labelEl.className = "skill-icon-label";
        labelEl.textContent = skill.name;
        var levelEl = document.createElement("div");
        levelEl.className = "skill-icon-level";
        levelEl.textContent = normalizeLevel(skill.level);
        chip.appendChild(labelEl);
        chip.appendChild(levelEl);
        return chip;
      }

      var sortedSkills = category.skills.slice().sort(function (a, b) {
        var aI = levelOrder.indexOf(normalizeLevel(a.level));
        var bI = levelOrder.indexOf(normalizeLevel(b.level));
        if (aI !== bI) return aI - bI;
        return a.name.localeCompare(b.name);
      });

      var maxVisible = category.maxVisible || 6;
      var visibleSkills = sortedSkills.slice(0, maxVisible);
      var extraSkills = sortedSkills.slice(maxVisible);

      function addSkill(skill, wrapper, groups) {
        var levelLabel = normalizeLevel(skill.level);
        var row = ensureGroup(wrapper, groups, levelLabel);
        row.appendChild(createChip(skill));
      }

      visibleSkills.forEach(function (s) { addSkill(s, visibleWrapper, levelGroupsVisible); });
      extraSkills.forEach(function (s) { addSkill(s, extraWrapper, levelGroupsExtra); });

      visibleWrapper.setAttribute("role", "list");
      extraWrapper.setAttribute("role", "list");
      body.appendChild(visibleWrapper);

      if (extraSkills.length) {
        var extraId = "skills-extra-" + category.id;
        extraWrapper.id = extraId;
        extraWrapper.setAttribute("aria-hidden", "true");
        extraWrapper.hidden = true;
        extraWrapper.style.maxHeight = "0px";
        body.appendChild(extraWrapper);

        var footer = document.createElement("div");
        footer.className = "skills-group-footer";
        var toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.className = "skills-toggle";
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.setAttribute("aria-controls", extraId);
        toggleBtn.innerHTML =
          '<span class="skills-toggle-label">Show more</span>' +
          '<span class="skills-toggle-icon">⌄</span>';

        toggleBtn.addEventListener("click", function () {
          var expanded = toggleBtn.getAttribute("aria-expanded") === "true";
          var next = !expanded;
          toggleBtn.setAttribute("aria-expanded", String(next));
          extraWrapper.setAttribute("aria-hidden", String(!next));
          card.classList.toggle("skills-card-expanded", next);
          var lbl = toggleBtn.querySelector(".skills-toggle-label");
          if (next) {
            extraWrapper.hidden = false;
            extraWrapper.style.maxHeight = extraWrapper.scrollHeight + "px";
            if (lbl) lbl.textContent = "Show less";
          } else {
            extraWrapper.style.maxHeight = "0px";
            var done = function () {
              extraWrapper.hidden = true;
              extraWrapper.removeEventListener("transitionend", done);
            };
            extraWrapper.addEventListener("transitionend", done);
            if (lbl) lbl.textContent = "Show more";
          }
        });

        footer.appendChild(toggleBtn);
        card.appendChild(footer);
      }

      card.appendChild(header);
      card.appendChild(body);
      skillsGrid.appendChild(card);
    });
  }

  /* ── Portfolio content renderer ──────────────────────────── */
  function renderPortfolioContent() {
    // Education
    var eduGrid = document.getElementById("education-grid");
    if (eduGrid && typeof portfolioData !== "undefined" && portfolioData.education) {
      portfolioData.education.forEach(function (edu) {
        var article = document.createElement("article");
        article.className = "card edu-hx-entry";
        article.setAttribute("data-edu-hx-entry", "true");

        var skillsHtml = edu.skills
          ? "<li><strong>Skills: </strong>" + edu.skills + "</li>"
          : "";
        var activitiesHtml = edu.activities
          ? "<li><strong>Activities and societies: </strong>" + edu.activities + "</li>"
          : "";
        var courseworkHtml = edu.coursework
          ? "<li><strong>Coursework: </strong>" + edu.coursework + "</li>"
          : "";
        var summaryHtml = edu.summary
          ? '<p class="edu-hx-summary">' + edu.summary + "</p>"
          : "";

        article.innerHTML =
          '<div class="card-header">' +
          "<div>" +
          '<div class="card-kicker">' + edu.kicker + "</div>" +
          '<div class="card-title">' + edu.title + "</div>" +
          "</div>" +
          '<div class="edu-hx-meta">' +
          '<span class="edu-hx-period">' + edu.period + "</span>" +
          '<span class="edu-hx-location">• ' + edu.location + "</span>" +
          "</div>" +
          "</div>" +
          '<div class="card-body">' +
          '<div class="edu-hx-institution">' + edu.institution + "</div>" +
          "<ul class=\"edu-hx-list\">" +
          skillsHtml + activitiesHtml + courseworkHtml +
          "</ul>" +
          summaryHtml +
          "</div>";
        eduGrid.appendChild(article);
      });
    }

    // Projects
    var projectsGrid = document.getElementById("projects-grid");
    if (projectsGrid && typeof portfolioData !== "undefined" && portfolioData.projects) {
      portfolioData.projects.forEach(function (project) {
        var article = document.createElement("article");
        article.className = "card";
        article.setAttribute("data-project-key", project.key);

        var tagsHtml = project.tags
          .map(function (tag, i) {
            return (
              '<span class="pill-tag ' +
              (i === 0 ? "pill-tag-strong" : "") +
              '">' +
              tag +
              "</span>"
            );
          })
          .join("");

        var imagesHtml = project.images
          .map(function (img) {
            return '<img src="' + img + '" alt="' + project.title + '" class="project-image">';
          })
          .join("");

        article.innerHTML =
          '<div class="card-header">' +
          "<div>" +
          '<div class="card-kicker">' + project.kicker + "</div>" +
          '<h3 class="card-title">' + project.title + "</h3>" +
          "</div>" +
          '<div class="pill-tag-row">' + tagsHtml + "</div>" +
          "</div>" +
          '<div class="project-images-row">' + imagesHtml + "</div>" +
          '<div class="card-body"><p>' + project.description + "</p></div>" +
          '<div class="card-footer">' +
          '<div class="view-repo-button"' +
          ' data-repo-url="' + project.repoUrl + '"' +
          ' data-live-link="' + (project.liveLink || "") + '"' +
          ' data-project-name="' + project.title + '"></div>' +
          "</div>";

        projectsGrid.appendChild(article);
      });
    }

    // Certificates
    var certGrid = document.getElementById("cert-grid");
    if (certGrid && typeof portfolioData !== "undefined" && portfolioData.certificates) {
      portfolioData.certificates.forEach(function (cert) {
        var div = document.createElement("div");
        div.className = "cert-card card" + (cert.premium ? " card-premium" : "");
        div.innerHTML =
          '<div class="cert-title">' + cert.title + "</div>" +
          '<div class="cert-meta">' + cert.meta + "</div>" +
          '<div class="cert-skills"><span>Skills:</span> ' + cert.skills + "</div>" +
          '<div class="research-actions">' +
          '<a href="' + cert.image + '" class="link-pill" target="_blank" rel="noopener">' +
          '<span class="link-icon">⬇</span> View Certificate</a>' +
          "</div>";
        certGrid.appendChild(div);
      });
    }
  }

  /* ── Navigation ──────────────────────────────────────────── */
  function scrollToSection(id) {
    var el = sections[id];
    if (!el) return;
    var rect = el.getBoundingClientRect();
    window.scrollTo({ top: window.pageYOffset + rect.top - 82, behavior: "smooth" });
  }

  function setActiveNav(id) {
    navLinks.forEach(function (link) {
      var target = link.getAttribute("data-target");
      var active = target === id;
      link.classList.toggle("active", active);
      active
        ? link.setAttribute("aria-current", "page")
        : link.removeAttribute("aria-current");
    });
    navChips.forEach(function (chip) {
      chip.classList.toggle("active", chip.getAttribute("data-target") === id);
    });
  }

  function mobileNavOpen(open) {
    var navToggle = document.querySelector(".nav-toggle");
    var navMobile = document.querySelector(".nav-links-mobile");
    if (!navToggle || !navMobile) return;
    if (open) {
      navToggle.classList.add("open");
      navMobile.style.display = "block";
    } else {
      navToggle.classList.remove("open");
      navMobile.style.display = "none";
    }
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      var target = link.getAttribute("data-target");
      setActiveNav(target);
      scrollToSection(target);
    });
  });

  navChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var target = chip.getAttribute("data-target");
      setActiveNav(target);
      scrollToSection(target);
      mobileNavOpen(false);
    });
  });

  document.querySelectorAll("[data-scroll]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      scrollToSection(btn.getAttribute("data-scroll"));
    });
  });

  var navToggleBtn = document.querySelector(".nav-toggle");
  if (navToggleBtn) {
    navToggleBtn.addEventListener("click", function () {
      mobileNavOpen(!navToggleBtn.classList.contains("open"));
    });
  }

  document.addEventListener("click", function (e) {
    var navMobile = document.querySelector(".nav-links-mobile");
    var navToggle = document.querySelector(".nav-toggle");
    if (
      navMobile &&
      navToggle &&
      !navMobile.contains(e.target) &&
      !navToggle.contains(e.target) &&
      window.innerWidth <= 960
    ) {
      mobileNavOpen(false);
    }
  });

  /* ── Scroll spy ──────────────────────────────────────────── */
  var fadeSections = document.querySelectorAll(".fade-in");
  var fadeObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05 }
  );
  fadeSections.forEach(function (s) { fadeObserver.observe(s); });

  var sectionKeys = Object.keys(sections);
  window.addEventListener("scroll", function () {
    var current = "home";
    var viewportCenter = window.pageYOffset + window.innerHeight * 0.35;
    var closest = Infinity;
    sectionKeys.forEach(function (key) {
      var el = sections[key];
      if (!el) return;
      var rect = el.getBoundingClientRect();
      var center = window.pageYOffset + rect.top + rect.height / 2;
      var dist = Math.abs(center - viewportCenter);
      if (dist < closest) { closest = dist; current = key; }
    });
    setActiveNav(current);
  });

  setActiveNav("home");

  /* ── Theme toggle ────────────────────────────────────────── */
  var themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var isDark = document.documentElement.getAttribute("data-theme") === "dark";
      var next = isDark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("portfolio-theme", next);
    });
  }

  /* ── Certificates marquee ────────────────────────────────── */
  function setupMarquee() {
    var certContainer = document.getElementById("cert-container");
    var certGrid = document.getElementById("cert-grid");
    if (certContainer && certContainer.classList.contains("marquee-mode") && certGrid) {
      var cards = Array.from(certGrid.children).filter(function (c) {
        return !c.classList.contains("cert-clone");
      });
      certGrid.querySelectorAll(".cert-clone").forEach(function (c) { c.remove(); });
      cards.forEach(function (card) {
        var clone = card.cloneNode(true);
        clone.classList.add("cert-clone");
        clone.setAttribute("aria-hidden", "true");
        certGrid.appendChild(clone);
      });
    }
  }

  var certViewMoreBtn = document.getElementById("cert-view-more-btn");
  var certContainer = document.getElementById("cert-container");
  var certGrid2 = document.getElementById("cert-grid");
  var viewMoreText = certViewMoreBtn
    ? certViewMoreBtn.querySelector(".view-more-text")
    : null;

  if (certViewMoreBtn) {
    certViewMoreBtn.addEventListener("click", function () {
      if (!certContainer) return;
      var isMarquee = certContainer.classList.contains("marquee-mode");
      if (isMarquee) {
        certContainer.classList.replace("marquee-mode", "grid-mode");
        certViewMoreBtn.classList.add("active");
        if (viewMoreText) viewMoreText.textContent = "Show less";
        if (certGrid2) certGrid2.querySelectorAll(".cert-clone").forEach(function (c) { c.remove(); });
      } else {
        certContainer.classList.replace("grid-mode", "marquee-mode");
        certViewMoreBtn.classList.remove("active");
        if (viewMoreText) viewMoreText.textContent = "View all certificates";
        setupMarquee();
      }
    });
  }

  /* ── Projects hint ───────────────────────────────────────── */
  var projectsSection = document.getElementById("projects");
  var projectsHint = document.getElementById("projects-hint-overlay");
  var hintShown = false;

  function showProjectsHint() {
    if (hintShown || sessionStorage.getItem("projectsHintShown")) {
      hintShown = true;
      return;
    }
    if (projectsHint) {
      projectsHint.classList.add("visible");
      hintShown = true;
      sessionStorage.setItem("projectsHintShown", "true");
      setTimeout(function () {
        projectsHint.style.opacity = "0";
        setTimeout(function () {
          projectsHint.classList.remove("visible");
          projectsHint.remove();
        }, 600);
      }, 4000);
    }
  }

  if (projectsSection && projectsHint) {
    var hintObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            showProjectsHint();
            hintObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    hintObserver.observe(projectsSection);
  }

  /* ── Legacy repo modal (kept for compatibility) ──────────── */
  var repoModal = document.getElementById("repoModal");
  var closeModalBtn = document.querySelector(".close-button");
  var modalProjectName = document.getElementById("modalProjectName");
  var tempRepoLink = document.getElementById("tempRepoLink");
  var openTempRepoBtn = document.getElementById("openTempRepo");

  document.querySelectorAll(".open-repo-modal").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (modalProjectName) modalProjectName.textContent = btn.getAttribute("data-project-name");
      if (repoModal) repoModal.style.display = "block";
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", function () {
      if (repoModal) repoModal.style.display = "none";
    });
  }

  if (openTempRepoBtn) {
    openTempRepoBtn.addEventListener("click", function () {
      var url = tempRepoLink ? tempRepoLink.value : "";
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        if (modalProjectName)
          localStorage.setItem("tempRepoUrl-" + modalProjectName.textContent, url);
      }
    });
  }

  window.addEventListener("click", function (e) {
    if (repoModal && e.target === repoModal) repoModal.style.display = "none";
  });

  /* ── Boot ────────────────────────────────────────────────── */
  renderSkills();
  renderPortfolioContent();

  // Re-init dynamic components
  if (typeof initViewRepoButtons === "function") initViewRepoButtons();
  setupMarquee();

  // Resolve tools section (rendered dynamically)
  sections.tools = document.getElementById("tools") || null;

})();

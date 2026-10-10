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
    experience: document.getElementById("experience"),
    education: document.getElementById("educational-history"),
    projects: document.getElementById("projects"),
    research: document.getElementById("research"),
    skills: document.getElementById("skills"),
    tools: null,
    certificates: document.getElementById("certificates"),
    "photo-gallery": document.getElementById("photo-gallery"),
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

  /* ── Education journey (markup only) ─────────────────────────
     Visuals live in view/css/education.css, scroll + motion
     behaviour in controller/education.js. Content is read from
     portfolioData.education and never altered, only arranged:
     chronological order, list splitting, typographic dash.     */
  var EDU_PIN =
    '<svg class="edu-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  var EDU_CHEVRON =
    '<svg class="edu-toggle__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<path d="M6 9l6 6 6-6"/></svg>';
  var EDU_STAR =
    '<svg class="edu-bridge__star" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M12 1.5c.7 5.6 4.9 9.8 10.5 10.5-5.6.7-9.8 4.9-10.5 10.5-.7-5.6-4.9-9.8-10.5-10.5C7.1 11.3 11.3 7.1 12 1.5z"/></svg>';

  function eduEsc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* "· A · B · C" or "A · B" -> ["A", "B", "C"] */
  function eduList(value) {
    return String(value || "")
      .split("\u00B7")
      .map(function (part) { return part.trim(); })
      .filter(Boolean);
  }

  /* Text lists that are comma separated rather than dot separated */
  function eduPlain(value) {
    return String(value || "").replace(/^[\s\u00B7]+/, "").trim();
  }

  /* "2016 - 2018" -> "2016 – 2018" (typographic only; thin spaces) */
  function eduPeriod(value) {
    return eduEsc(String(value || "").replace(/\s*-\s*/g, "\u2009\u2013\u2009"));
  }

  function eduStartYear(period) {
    var m = String(period || "").match(/\d{4}/);
    return m ? parseInt(m[0], 10) : NaN;
  }

  function eduIsCurrent(period) {
    return /ongoing|present|current/i.test(String(period || ""));
  }

  function eduChips(items, className) {
    return (
      '<ul class="edu-chips ' + (className || "") + '">' +
      items.map(function (item) { return "<li>" + eduEsc(item) + "</li>"; }).join("") +
      "</ul>"
    );
  }

  function eduOrder(entries) {
    var rows = entries.map(function (entry, i) {
      return { entry: entry, i: i, year: eduStartYear(entry.period) };
    });
    var sortable = rows.every(function (r) { return !isNaN(r.year); });
    if (sortable) {
      rows.sort(function (a, b) { return a.year - b.year || a.i - b.i; });
    } else {
      rows.reverse(); /* data is authored newest-first */
    }
    return rows.map(function (r) { return r.entry; });
  }

  function renderEducationStage(edu, index, total) {
    var tier = total === 1 ? "hero" : index === 0 ? "base" : index === total - 1 ? "hero" : "mid";
    var side = tier === "hero" ? "center" : index % 2 === 0 ? "left" : "right";
    var current = eduIsCurrent(edu.period);
    var headId = "edu-heading-" + index;
    var detailsId = "edu-details-" + index;

    var skills = eduList(edu.skills);
    var coursework = eduList(edu.coursework);
    var activities = eduPlain(edu.activities);

    /* Secondary tier: an explicit `focus` list, or a short skills list shown whole */
    var explicitFocus = Array.isArray(edu.focus) && edu.focus.length;
    var focus = explicitFocus ? edu.focus : skills.length && skills.length <= 4 ? skills : [];
    var skillsInDetails = !explicitFocus && focus.length ? [] : skills;

    var badge = current
      ? '<span class="edu-badge"><span class="edu-badge__dot" aria-hidden="true"></span>Current stage</span>'
      : "";
    var summary = edu.summary ? '<p class="edu-summary">' + eduEsc(edu.summary) + "</p>" : "";
    var focusHtml = focus.length
      ? '<div class="edu-focus"><span class="edu-focus__label">Selected focus</span>' +
        eduChips(focus, "edu-chips--focus") + "</div>"
      : "";

    var groups = "";
    if (coursework.length) {
      groups += '<section class="edu-group"><h4 class="edu-group__label">Coursework</h4>' +
        eduChips(coursework) + "</section>";
    }
    if (skillsInDetails.length) {
      groups += '<section class="edu-group"><h4 class="edu-group__label">Skills</h4>' +
        eduChips(skillsInDetails) + "</section>";
    }
    if (activities) {
      groups += '<section class="edu-group"><h4 class="edu-group__label">Activities and societies</h4>' +
        '<p class="edu-group__text">' + eduEsc(activities) + "</p></section>";
    }

    var details = groups
      ? '<button type="button" class="edu-toggle" aria-expanded="false" aria-controls="' + detailsId + '">' +
        '<span class="edu-toggle__label">Explore details</span>' + EDU_CHEVRON + "</button>" +
        '<div class="edu-details" id="' + detailsId + '"><div class="edu-details__inner">' + groups + "</div></div>"
      : "";

    return (
      '<li class="edu-stage edu-stage--' + side + '" data-tier="' + tier + '" data-state="upcoming" data-edu-stage>' +
      '<span class="edu-node" aria-hidden="true"></span>' +
      '<article class="edu-slab edu-hx-entry" data-edu-hx-entry="true" aria-labelledby="' + headId + '">' +
      '<span class="edu-slab__ground" aria-hidden="true"></span>' +
      '<div class="edu-slab__body"><div class="edu-slab__face">' +
      '<header class="edu-slab__head">' +
      '<h3 class="edu-slab__heading" id="' + headId + '">' +
      '<span class="edu-kicker">' + eduEsc(edu.kicker) + "</span>" +
      '<span class="edu-title">' + eduEsc(edu.title) + "</span></h3>" + badge +
      "</header>" +
      '<p class="edu-period">' + eduPeriod(edu.period) + "</p>" +
      '<p class="edu-inst">' + eduEsc(edu.institution) + "</p>" +
      '<p class="edu-loc">' + EDU_PIN + "<span>" + eduEsc(edu.location) + "</span></p>" +
      summary + focusHtml + details +
      "</div></div></article></li>"
    );
  }

  function renderEducationJourney(entries) {
    var ordered = eduOrder(entries);
    return (
      '<div class="edu-path" aria-hidden="true">' +
      '<span class="edu-path__track"></span><span class="edu-path__fill"></span><span class="edu-path__head"></span>' +
      "</div>" +
      '<ol class="edu-list" aria-label="Academic progression, earliest first">' +
      ordered.map(function (edu, i) { return renderEducationStage(edu, i, ordered.length); }).join("") +
      "</ol>" +
      '<a class="edu-bridge" href="#projects" data-edu-bridge>' +
      '<span class="edu-bridge__mark">' + EDU_STAR + "</span>" +
      '<span class="edu-bridge__line" aria-hidden="true"></span>' +
      '<span class="edu-bridge__label">Projects &amp; Research</span>' +
      "</a>"
    );
  }

  /* ── Portfolio content renderer ──────────────────────────── */
  function renderPortfolioContent() {
    // Education
    var eduGrid = document.getElementById("education-grid");
    if (eduGrid && typeof portfolioData !== "undefined" && portfolioData.education) {
      eduGrid.innerHTML = renderEducationJourney(portfolioData.education);
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
    var containing = null; /* section that actually holds the reference line */
    sectionKeys.forEach(function (key) {
      var el = sections[key];
      if (!el) return;
      var rect = el.getBoundingClientRect();
      var top = window.pageYOffset + rect.top;
      if (!containing && top <= viewportCenter && top + rect.height > viewportCenter) containing = key;
      var center = top + rect.height / 2;
      var dist = Math.abs(center - viewportCenter);
      if (dist < closest) { closest = dist; current = key; }
    });
    /* Nearest-centre alone misreads tall sections (Education, Projects); it stays as the fallback. */
    setActiveNav(containing || current);
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

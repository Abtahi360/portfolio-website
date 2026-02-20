// Mock IntersectionObserver for scroll-spy tests
class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.entries = new Map();
  }

  observe(target) {
    this.entries.set(target, {
      target,
      isIntersecting: false,
      intersectionRatio: 0,
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRect: new DOMRect(),
      rootBounds: document.body.getBoundingClientRect(),
      time: Date.now(),
    });
  }

  unobserve(target) {
    this.entries.delete(target);
  }
  disconnect() {
    this.entries.clear();
  }

  _triggerIntersection(target, isIntersecting, intersectionRatio = 1) {
    const entry = this.entries.get(target);
    if (entry) {
      entry.isIntersecting = isIntersecting;
      entry.intersectionRatio = intersectionRatio;
      this.callback([entry], this);
    }
  }
}
window.IntersectionObserver = IntersectionObserver;
jest.spyOn(window, 'IntersectionObserver').mockImplementation((cb, options) => new IntersectionObserver(cb, options));

describe('Toolbar Active State', () => {
  let originalWindowScrollTo;
  let observerInstance;

  beforeAll(() => {
    originalWindowScrollTo = window.scrollTo;
    window.scrollTo = jest.fn();
  });

  beforeEach(() => {
    window.scrollTo.mockClear();

    document.body.innerHTML = `
      <header class="nav-shell">
        <div class="nav">
          <nav class="nav-links" aria-label="Primary navigation">
            <a class="nav-link" data-target="home">Home</a>
            <a class="nav-link" data-target="projects">Projects</a>
            <a class="nav-link" data-target="research">Research</a>
            <a class="nav-link" data-target="skills">Skills</a>
          </nav>
        </div>
      </header>
      <main class="main">
        <section id="home"></section>
        <section id="projects"></section>
        <section id="research"></section>
        <section id="skills"></section>
      </main>
      <script>
        const navLinks = document.querySelectorAll(".nav-link");
        const sections = {
          home: document.getElementById("home"),
          projects: document.getElementById("projects"),
          research: document.getElementById("research"),
          skills: document.getElementById("skills"),
        };

        function scrollToSection(id) {
          const el = sections[id];
          if (!el) return;
          window.scrollTo({ top: el.offsetTop - 82, behavior: "smooth" });
        }

        function setActiveNav(id) {
            navLinks.forEach(link => {
                const target = link.getAttribute("data-target");
                const isActive = target === id;
                link.classList.toggle("active", isActive);
                if (isActive) {
                link.setAttribute("aria-current", "page");
                } else {
                link.removeAttribute("aria-current");
                }
            });
        }

        navLinks.forEach(link => {
          link.addEventListener("click", () => {
            const target = link.getAttribute("data-target");
            setActiveNav(target);
            scrollToSection(target);
          });
        });

        const sectionElements = document.querySelectorAll('section');
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const navTargetId = Object.keys(sections).find(key => sections[key] === entry.target);
              if (navTargetId) {
                setActiveNav(navTargetId);
              }
            }
          });
        }, { threshold: 0.2 });

        sectionElements.forEach(section => observer.observe(section));
      </script>
    `;

    // Re-evaluate the script after setting innerHTML
    const script = document.querySelector('script');
    if (script) {
      eval(script.innerHTML);
    }
    observerInstance = window.IntersectionObserver.mock.instances[0];
  });

  afterAll(() => {
    window.scrollTo = originalWindowScrollTo;
    jest.restoreAllMocks();
  });

  test('clicking "Home" applies the active class and aria-current attribute', () => {
    const homeLink = document.querySelector('.nav-link[data-target="home"]');
    homeLink.click();

    expect(homeLink.classList.contains('active')).toBe(true);
    expect(homeLink.getAttribute('aria-current')).toBe('page');
  });

  test('clicking "Projects" applies the active class and removes it from others', () => {
    const homeLink = document.querySelector('.nav-link[data-target="home"]');
    const projectsLink = document.querySelector('.nav-link[data-target="projects"]');

    // Start with Home active
    homeLink.click();
    expect(homeLink.classList.contains('active')).toBe(true);

    // Click Projects
    projectsLink.click();
    expect(projectsLink.classList.contains('active')).toBe(true);
    expect(projectsLink.getAttribute('aria-current')).toBe('page');
    expect(homeLink.classList.contains('active')).toBe(false);
    expect(homeLink.hasAttribute('aria-current')).toBe(false);
  });

  test('scrolling into "Skills" section activates Skills button', () => {
    const skillsLink = document.querySelector('.nav-link[data-target="skills"]');
    const skillsSection = document.getElementById('skills');

    // Simulate the "Skills" section intersecting
    observerInstance._triggerIntersection(skillsSection, true);

    expect(skillsLink.classList.contains('active')).toBe(true);
    expect(skillsLink.getAttribute('aria-current')).toBe('page');
  });

  test('only one navigation item has the active class at a time', () => {
    const homeLink = document.querySelector('.nav-link[data-target="home"]');
    const projectsLink = document.querySelector('.nav-link[data-target="projects"]');
    const researchLink = document.querySelector('.nav-link[data-target="research"]');
    const skillsLink = document.querySelector('.nav-link[data-target="skills"]');

    // Click projects
    projectsLink.click();

    let activeLinks = document.querySelectorAll('.nav-link.active');
    expect(activeLinks.length).toBe(1);
    expect(activeLinks[0]).toBe(projectsLink);

    // Then simulate scrolling to skills
    observerInstance._triggerIntersection(document.getElementById('skills'), true);

    activeLinks = document.querySelectorAll('.nav-link.active');
    expect(activeLinks.length).toBe(1);
    expect(activeLinks[0]).toBe(skillsLink);
  });
});
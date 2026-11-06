/**
 * Other Projects: "Gallery Exhibit" cards, category filter, tilt controller.
 *
 * Loads the real data + controller/main.js + controller/project-filter.js
 * (+ controller/card-tilt.js) into jsdom. Guards:
 *   • the hooks other modules depend on (article.card, data-project-key,
 *     .card-title, .card-details-cue, .view-repo-button, #projects-grid);
 *   • every image is a real file, 1200×750 WebP, lazy + async, with alt text;
 *   • filter counts come from the data and `hidden` is what filters;
 *   • tilt stays off where it must (touch, reduced motion, demo stage).
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const dataSrc = read("model/portfolio-data.js");
const mainSrc = read("controller/main.js");
const filterSrc = read("controller/project-filter.js");
const tiltSrc = read("controller/card-tilt.js");

const freshData = () => new Function(dataSrc + "; return portfolioData;")();
const text = (el) => el.textContent.replace(/\s+/g, " ").trim();

class IO { observe() {} unobserve() {} disconnect() {} }

function mq(matchesFor) {
  return (query) => ({
    matches: matchesFor(query),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });
}

function load({ data = freshData(), fine = true, reduce = false, withTilt = false } = {}) {
  document.body.innerHTML =
    '<section id="projects">' +
    '<div class="xp-filters" id="project-filters"></div>' +
    '<div class="cards-grid" id="projects-grid"></div>' +
    "</section>";
  window.IntersectionObserver = IO;
  window.scrollTo = () => {};
  window.matchMedia = mq((q) => (q.includes("reduced-motion") ? reduce : q.includes("pointer: fine") ? fine : false));
  delete document.startViewTransition;
  new Function("portfolioData", mainSrc)(data);
  new Function("portfolioData", filterSrc)(data);
  if (withTilt) new Function(tiltSrc)();
  return data;
}

const cards = () => Array.from(document.querySelectorAll("#projects-grid > .card"));
const chips = () => Array.from(document.querySelectorAll("#project-filters .xp-filter"));

describe("Gallery Exhibit cards", () => {
  let data;
  beforeEach(() => { data = load(); });

  test("one card per project, in data order, with the integration hooks intact", () => {
    expect(cards()).toHaveLength(data.projects.length);
    cards().forEach((card, i) => {
      const p = data.projects[i];
      expect(card.tagName).toBe("ARTICLE");
      expect(card.getAttribute("data-project-key")).toBe(p.key);
      expect(card.getAttribute("data-group")).toBe(p.group);
      expect(text(card.querySelector(".card-title"))).toBe(p.title);
      expect(card.querySelector(".card-details-cue")).not.toBeNull();
      const repo = card.querySelector(".view-repo-button");
      expect(repo.getAttribute("data-repo-url")).toBe(p.repoUrl);
      expect(repo.getAttribute("data-project-name")).toBe(p.title);
    });
  });

  test("media → body → footer, and all project text is preserved", () => {
    cards().forEach((card, i) => {
      const p = data.projects[i];
      const kids = Array.from(card.children).map((c) => c.className.split(" ").find((k) => k.startsWith("xp-")));
      expect(kids).toEqual(["xp-media", "xp-body", "xp-foot"]);
      expect(text(card.querySelector(".xp-kicker"))).toBe(p.kicker);
      expect(text(card.querySelector(".xp-desc"))).toBe(p.description);
      expect(Array.from(card.querySelectorAll(".xp-tag")).map(text)).toEqual(p.tags);
      expect(text(card.querySelector(".xp-index"))).toBe(
        String(i + 1).padStart(2, "0") + " / " + String(data.projects.length).padStart(2, "0")
      );
    });
  });

  test("images: real 1200×750 WebP files, lazy + async, front has alt, back is decorative", () => {
    cards().forEach((card, i) => {
      const media = data.projects[i].media;
      const imgs = Array.from(card.querySelectorAll(".xp-shot img"));
      expect(imgs).toHaveLength(media.length);
      imgs.forEach((img) => {
        const src = img.getAttribute("src");
        expect(src).toMatch(/^view\/assets\/Images\/projects\/[a-z0-9-]+\.webp$/);
        expect(fs.existsSync(path.join(root, src))).toBe(true);
        expect(img.getAttribute("width")).toBe("1200");
        expect(img.getAttribute("height")).toBe("750");
        expect(img.getAttribute("loading")).toBe("lazy");
        expect(img.getAttribute("decoding")).toBe("async");
      });
      const front = card.querySelector(".xp-shot--front img");
      expect(front.getAttribute("alt")).toBe(media[0].alt);
      expect(front.getAttribute("alt").length).toBeGreaterThan(10);
      if (media.length > 1) {
        expect(card.querySelector(".xp-media").classList.contains("xp-media--stack")).toBe(true);
        expect(card.querySelector(".xp-shot--back").getAttribute("aria-hidden")).toBe("true");
        expect(card.querySelector(".xp-shot--back img").getAttribute("alt")).toBe("");
      } else {
        expect(card.querySelector(".xp-shot--back")).toBeNull();
      }
    });
  });

  test("no GitHub social-preview images remain on the cards", () => {
    const srcs = cards().flatMap((c) => Array.from(c.querySelectorAll("img")).map((i) => i.getAttribute("src")));
    expect(srcs.join(" ")).not.toMatch(/docx-to-excel-generator 1|spring1/);
  });

  test("text is escaped, never injected as HTML", () => {
    const d = freshData();
    d.projects = [Object.assign({}, d.projects[0], { title: "<img src=x onerror=alert(1)>" })];
    load({ data: d });
    expect(document.querySelector("#projects-grid img[src='x']")).toBeNull();
    expect(text(document.querySelector(".card-title"))).toBe("<img src=x onerror=alert(1)>");
  });
});

describe("Category filter", () => {
  let data;
  beforeEach(() => { data = load(); });

  test("chips and counts are derived from the data", () => {
    const expected = [["All", data.projects.length]].concat(
      data.projectGroups.map((g) => [g.label, data.projects.filter((p) => p.group === g.id).length])
    );
    expect(chips().map((b) => [text(b.querySelector(".xp-filter-label")), Number(text(b.querySelector(".xp-filter-count")))])).toEqual(expected);
    expect(expected).toEqual([["All", 12], ["AI & ML", 4], ["Software & Web", 6], ["Systems & Engineering", 2]]);
  });

  test("chips are pressed-state buttons inside a labelled group", () => {
    const group = document.querySelector('#project-filters [role="group"]');
    expect(group.getAttribute("aria-label")).toBe("Filter projects by category");
    chips().forEach((b, i) => {
      expect(b.tagName).toBe("BUTTON");
      expect(b.getAttribute("type")).toBe("button");
      expect(b.getAttribute("aria-pressed")).toBe(i === 0 ? "true" : "false");
    });
  });

  test("selecting a group hides the rest with the hidden attribute and announces the result", () => {
    const ml = chips().find((b) => b.getAttribute("data-filter") === "ml");
    ml.click();
    const visible = cards().filter((c) => !c.hidden);
    expect(visible).toHaveLength(4);
    visible.forEach((c) => expect(c.getAttribute("data-group")).toBe("ml"));
    expect(cards().filter((c) => c.hidden).length).toBe(8);
    expect(ml.getAttribute("aria-pressed")).toBe("true");
    expect(chips().filter((b) => b.getAttribute("aria-pressed") === "true")).toHaveLength(1);
    expect(text(document.querySelector(".xp-filter-status"))).toBe("Showing 4 of 12 projects");

    chips()[0].click();
    expect(cards().every((c) => !c.hidden)).toBe(true);
    expect(text(document.querySelector(".xp-filter-status"))).toBe("");
  });

  test("uses the View Transitions API when available", () => {
    const start = jest.fn((cb) => { cb(); return { finished: Promise.resolve() }; });
    document.startViewTransition = start;
    chips().find((b) => b.getAttribute("data-filter") === "systems").click();
    expect(start).toHaveBeenCalledTimes(1);
    expect(cards().filter((c) => !c.hidden)).toHaveLength(2);
    delete document.startViewTransition;
  });

  test("skips the View Transition when reduced motion is preferred", () => {
    load({ reduce: true });
    const start = jest.fn((cb) => { cb(); return { finished: Promise.resolve() }; });
    document.startViewTransition = start;
    chips().find((b) => b.getAttribute("data-filter") === "software").click();
    expect(start).not.toHaveBeenCalled();
    expect(cards().filter((c) => !c.hidden)).toHaveLength(6);
    delete document.startViewTransition;
  });
});

describe("Tilt controller", () => {
  const raf = global.requestAnimationFrame;
  beforeEach(() => { global.requestAnimationFrame = (cb) => { cb(); return 1; }; });
  afterEach(() => { global.requestAnimationFrame = raf; });

  function move(card, x, y) {
    card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100 });
    const ev = new MouseEvent("pointermove", { bubbles: true, clientX: x, clientY: y });
    Object.defineProperty(ev, "pointerType", { value: "mouse" });
    card.querySelector(".xp-body").dispatchEvent(ev);
  }

  test("tilts toward the pointer within ±3.5° / ±4.5°, then resets on leave", () => {
    load({ withTilt: true });
    const card = cards()[0];
    move(card, 200, 0); /* top-right corner */
    expect(card.classList.contains("is-tilting")).toBe(true);
    expect(card.style.getPropertyValue("--rx")).toBe("3.50deg");
    expect(card.style.getPropertyValue("--ry")).toBe("4.50deg");
    document.getElementById("projects-grid").dispatchEvent(new MouseEvent("pointerleave"));
    expect(card.classList.contains("is-tilting")).toBe(false);
    expect(card.style.getPropertyValue("--rx")).toBe("");
  });

  test("stays off on touch-only devices", () => {
    load({ withTilt: true, fine: false });
    const card = cards()[0];
    move(card, 200, 0);
    expect(card.classList.contains("is-tilting")).toBe(false);
  });

  test("stays off with prefers-reduced-motion", () => {
    load({ withTilt: true, reduce: true });
    const card = cards()[0];
    move(card, 200, 0);
    expect(card.style.getPropertyValue("--rx")).toBe("");
  });

  test("stays off while the discovery demo stages the grid", () => {
    load({ withTilt: true });
    document.getElementById("projects-grid").classList.add("is-pdemo-stage");
    const card = cards()[0];
    move(card, 200, 0);
    expect(card.classList.contains("is-tilting")).toBe(false);
  });

  test("waits while motion.js is still revealing the card", () => {
    load({ withTilt: true });
    const card = cards()[0];
    card.style.transform = "translateY(14px)";
    move(card, 200, 0);
    expect(card.classList.contains("is-tilting")).toBe(false);
  });
});

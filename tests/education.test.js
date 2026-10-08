/**
 * Education journey: markup contract tests.
 *
 * Loads the real model/portfolio-data.js and controller/main.js into jsdom and
 * inspects the rendered #education-grid. Guards the rule that Education content
 * is only ever *arranged* by the renderer, never invented, rewritten or dropped.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dataSrc = fs.readFileSync(path.join(root, "model/portfolio-data.js"), "utf8");
const mainSrc = fs.readFileSync(path.join(root, "controller/main.js"), "utf8");

class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function load(dataOverride) {
  document.body.innerHTML = '<section id="educational-history"><div id="education-grid"></div></section>';
  window.IntersectionObserver = IO;
  window.scrollTo = () => {};
  const data = dataOverride || new Function(dataSrc + "; return portfolioData;")();
  new Function("portfolioData", mainSrc)(data);
  return data;
}

const text = (el) => el.textContent.replace(/\s+/g, " ").trim();
const chipsOf = (str) => str.split("\u00B7").map((s) => s.trim()).filter(Boolean);

describe("Education journey markup", () => {
  let data;
  let stages;

  beforeEach(() => {
    data = load();
    stages = Array.from(document.querySelectorAll("#education-grid [data-edu-stage]"));
  });

  test("renders one milestone per education entry", () => {
    expect(stages).toHaveLength(data.education.length);
    expect(stages).toHaveLength(3);
  });

  test("orders milestones chronologically: SSC, HSC, then B.Sc.", () => {
    const kickers = stages.map((s) => text(s.querySelector(".edu-kicker")));
    expect(kickers).toEqual([
      "Secondary School Certificate",
      "Higher Secondary Certificate",
      "Undergraduate",
    ]);
  });

  test("does not mutate the source data order", () => {
    expect(data.education[0].kicker).toBe("Undergraduate");
  });

  test("every primary field from portfolio-data.js appears unchanged", () => {
    data.education.forEach((edu) => {
      const stage = stages.find((s) => text(s.querySelector(".edu-institution, .edu-inst")) === edu.institution);
      expect(stage).toBeTruthy();
      expect(text(stage.querySelector(".edu-kicker"))).toBe(edu.kicker);
      expect(text(stage.querySelector(".edu-title"))).toBe(edu.title);
      expect(text(stage.querySelector(".edu-loc"))).toBe(edu.location);
      // period: only the dash is typographically refined; digits/words are untouched
      const period = text(stage.querySelector(".edu-period")).replace(/\s*\u2013\s*/, " - ");
      expect(period).toBe(edu.period);
    });
  });

  test("coursework, skills and activities are all still present in the details", () => {
    data.education.forEach((edu) => {
      const stage = stages.find((s) => text(s.querySelector(".edu-inst")) === edu.institution);
      const all = text(stage);
      chipsOf(edu.coursework || "").forEach((c) => expect(all).toContain(c));
      chipsOf(edu.skills || "").forEach((c) => expect(all).toContain(c));
      if (edu.activities) {
        expect(all).toContain(edu.activities.replace(/^[\s\u00B7]+/, "").trim());
      }
      if (edu.summary) expect(all).toContain(edu.summary);
    });
  });

  test("B.Sc. is the hero tier and the only 'Current stage'", () => {
    const hero = stages[stages.length - 1];
    expect(hero.dataset.tier).toBe("hero");
    expect(stages.map((s) => s.dataset.tier)).toEqual(["base", "mid", "hero"]);
    const badges = document.querySelectorAll(".edu-badge");
    expect(badges).toHaveLength(1);
    expect(hero.contains(badges[0])).toBe(true);
    expect(text(badges[0])).toBe("Current stage");
  });

  test("selected focus uses only entries that exist in the source skills", () => {
    const bsc = data.education.find((e) => e.kicker === "Undergraduate");
    const skills = chipsOf(bsc.skills);
    bsc.focus.forEach((f) => expect(skills).toContain(f));
    const shown = Array.from(stages[2].querySelectorAll(".edu-chips--focus li")).map(text);
    expect(shown).toEqual(bsc.focus);
  });

  test("semantics: ordered list, one article + h3 per milestone, headings labelled", () => {
    const list = document.querySelector("#education-grid ol.edu-list");
    expect(list).not.toBeNull();
    stages.forEach((s) => {
      const article = s.querySelector("article");
      const h3 = article.querySelector("h3");
      expect(h3).not.toBeNull();
      expect(article.getAttribute("aria-labelledby")).toBe(h3.id);
      // heading carries level + title so "Science" is never read alone
      expect(text(h3)).toContain(text(s.querySelector(".edu-kicker")));
    });
  });

  test("disclosure buttons start collapsed and point at real regions", () => {
    const buttons = document.querySelectorAll(".edu-toggle");
    expect(buttons).toHaveLength(3);
    buttons.forEach((b) => {
      expect(b.getAttribute("type")).toBe("button");
      expect(b.getAttribute("aria-expanded")).toBe("false");
      expect(document.getElementById(b.getAttribute("aria-controls"))).not.toBeNull();
    });
    const ids = Array.from(document.querySelectorAll("#education-grid [id]")).map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length); // no duplicate ids
  });

  test("decorative layers are hidden from assistive tech", () => {
    expect(document.querySelector(".edu-path").getAttribute("aria-hidden")).toBe("true");
    expect(document.querySelector(".edu-node").getAttribute("aria-hidden")).toBe("true");
    expect(document.querySelector(".edu-slab__ground").getAttribute("aria-hidden")).toBe("true");
  });

  test("container is not caught by the generic card stagger in motion.js", () => {
    const grid = document.getElementById("education-grid");
    expect(grid.classList.contains("cards-grid-two")).toBe(false);
    expect(document.querySelectorAll("#education-grid .card")).toHaveLength(0);
  });

  test("bridge links onward to Projects", () => {
    const bridge = document.querySelector("[data-edu-bridge]");
    expect(bridge.getAttribute("href")).toBe("#projects");
    expect(text(bridge)).toContain("Projects");
  });
});

describe("Education renderer robustness", () => {
  test("escapes markup in data instead of injecting it", () => {
    const base = new Function(dataSrc + "; return portfolioData;")();
    const evil = JSON.parse(JSON.stringify(base));
    evil.education[0].title = '<img src=x onerror="window.__pwned=1">';
    load(evil);
    expect(document.querySelector("#education-grid img")).toBeNull();
    expect(window.__pwned).toBeUndefined();
    expect(document.body.innerHTML).toContain("&lt;img");
  });

  test("falls back to reversing authored order when periods have no years", () => {
    const base = new Function(dataSrc + "; return portfolioData;")();
    const odd = JSON.parse(JSON.stringify(base));
    odd.education.forEach((e) => { e.period = "Various"; });
    load(odd);
    const kickers = Array.from(document.querySelectorAll(".edu-kicker")).map(text);
    expect(kickers[kickers.length - 1]).toBe("Undergraduate");
  });
});

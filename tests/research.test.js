/**
 * Research & Publications ("Publication Record") + hero counts.
 *
 * Loads the real model/portfolio-data.js and controller/research.js into
 * jsdom. Guards three rules:
 *   1. every publication field shown comes from the data, unchanged;
 *   2. nothing unverified is invented (no placeholder year / authors /
 *      citation for entries that lack them);
 *   3. the hero snapshot counts always equal their data sources.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const dataSrc = read("model/portfolio-data.js");
const researchSrc = read("controller/research.js");
const mainSrc = read("controller/main.js");
const rwSrc = read("model/real-world-projects.js");
const indexHtml = read("index.html");

const freshData = () => new Function(dataSrc + "; return portfolioData;")();
const text = (el) => el.textContent.replace(/\s+/g, " ").trim();
const flush = () => new Promise((r) => setTimeout(r, 0));

/* Unicode "Mathematical Alphanumeric Symbols" block (U+1D400–U+1D7FF) */
const MATH_ALNUM = /[\u{1D400}-\u{1D7FF}]/u;

function loadResearch(data) {
  document.head.innerHTML = "";
  document.body.innerHTML =
    '<section id="research"><p id="research-summary"></p><ol id="research-list"></ol></section>';
  new Function("portfolioData", researchSrc)(data);
  return Array.from(document.querySelectorAll("#research-list > .pub"));
}

describe("Research data", () => {
  const data = freshData();

  test("has the two publications, journal first", () => {
    expect(data.research).toHaveLength(2);
    expect(data.research.map((p) => p.type)).toEqual(["Journal", "Conference"]);
  });

  test("contains no Unicode mathematical bold/italic characters", () => {
    expect(MATH_ALNUM.test(JSON.stringify(data.research))).toBe(false);
  });

  test("index.html no longer carries the styled-Unicode venue name", () => {
    expect(MATH_ALNUM.test(indexHtml)).toBe(false);
  });

  test("contains no placeholder metadata", () => {
    const json = JSON.stringify(data.research);
    expect(json).not.toMatch(/YYYY|\bTBD\b|co-author names|"\.\.\."|…"/i);
  });

  test("the unverified conference entry carries no invented year or authors", () => {
    const conf = data.research.find((p) => p.type === "Conference");
    expect(conf.year).toBeUndefined();
    expect(conf.authors).toBeUndefined();
    expect(conf.citationAuthors).toBeUndefined();
  });
});

describe("Publication Record markup", () => {
  let data;
  let entries;

  beforeEach(() => {
    data = freshData();
    entries = loadResearch(data);
  });

  test("renders one entry per publication, in data order", () => {
    expect(entries).toHaveLength(data.research.length);
    entries.forEach((li, i) => {
      expect(text(li.querySelector(".pub-title"))).toBe(data.research[i].title);
      expect(text(li.querySelector(".pub-no"))).toBe("[0" + (i + 1) + "]");
    });
  });

  test("journal entry shows verified year, authors, venue, volume/issue/pages", () => {
    const pub = data.research[0];
    const li = entries[0];
    expect(text(li.querySelector(".pub-year"))).toBe(String(pub.year));
    expect(text(li.querySelector(".pub-type"))).toBe("Journal");
    expect(text(li.querySelector(".pub-authors"))).toBe(pub.authors.join(", "));
    expect(text(li.querySelector(".pub-self"))).toBe(data.selfName);
    expect(text(li.querySelector(".pub-venue cite"))).toBe(pub.venue);
    expect(text(li.querySelector(".pub-venue"))).toContain("Vol. 16, No. 2, pp. 924–944");
  });

  test("conference entry omits year, authors and the Cite button", () => {
    const li = entries[1];
    expect(li.querySelector(".pub-year")).toBeNull();
    expect(li.querySelector(".pub-authors")).toBeNull();
    expect(li.querySelector(".pub-cite")).toBeNull();
    expect(text(li.querySelector(".pub-type"))).toBe("Conference");
  });

  test("facts, finding, methods, contribution and keywords come from the data", () => {
    entries.forEach((li, i) => {
      const pub = data.research[i];
      expect(Array.from(li.querySelectorAll(".pub-facts li")).map(text)).toEqual(pub.facts);
      expect(text(li.querySelector(".pub-tldr"))).toBe("Key finding: " + pub.tldr);
      const cols = li.querySelectorAll(".pub-col");
      expect(Array.from(cols[0].querySelectorAll("li")).map(text)).toEqual(pub.methods);
      expect(Array.from(cols[1].querySelectorAll("li")).map(text)).toEqual(pub.contribution);
      expect(text(li.querySelector(".pub-keywords"))).toBe("Keywords " + pub.keywords.join(", "));
    });
  });

  test("abstract is a closed <details> holding the full abstract", () => {
    entries.forEach((li, i) => {
      const d = li.querySelector("details.pub-abstract");
      expect(d).not.toBeNull();
      expect(d.open).toBe(false);
      expect(text(d.querySelector("p"))).toBe(data.research[i].abstract);
    });
  });

  test("external links open safely in a new tab and are announced as such", () => {
    const doi = entries[0].querySelector('a[href^="https://doi.org/"]');
    expect(doi.getAttribute("href")).toBe("https://doi.org/" + data.research[0].doi);
    const rg = entries[1].querySelector('a[href*="researchgate.net"]');
    expect(rg.getAttribute("href")).toBe(data.research[1].links.researchgate);
    [doi, rg].forEach((a) => {
      expect(a.target).toBe("_blank");
      expect(a.rel).toContain("noopener");
      expect(text(a)).toContain("(opens in a new tab)");
    });
    expect(document.querySelector("#research-list").textContent).not.toContain("⬇");
  });

  test("summary line counts publications by type", () => {
    expect(text(document.getElementById("research-summary"))).toBe("1 journal article and 1 conference paper");
  });
});

describe("Cite (APA)", () => {
  afterEach(() => {
    delete navigator.clipboard;
  });

  test("builds an APA 7 reference only from complete metadata", () => {
    const data = freshData();
    loadResearch(data);
    const { apa } = window.ResearchRecord;
    expect(apa(data.research[0])).toBe(
      "Patwary, M. O., Islam, M. R., Islam, A., Khan, N.-e. S., Al-Jubair, M. A., Hossen, M. J., & Mridha, M. F. (2026). " +
        "The ethics of AI technology in academic work: Assessing the line between assistance and plagiarism. " +
        "International Journal of Electrical and Computer Engineering (IJECE), 16(2), 924–944. " +
        "https://doi.org/10.11591/ijece.v16i2.pp924-944"
    );
    expect(apa(data.research[1])).toBe("");
  });

  test("copies the citation and confirms in a live region", async () => {
    const writeText = jest.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const data = freshData();
    const [journal] = loadResearch(data);
    journal.querySelector(".pub-cite").click();
    await flush();
    expect(writeText).toHaveBeenCalledWith(window.ResearchRecord.apa(data.research[0]));
    const status = journal.querySelector(".pub-cite-status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(text(status)).toBe("APA citation copied");
    expect(journal.querySelector(".pub-cite").classList.contains("is-copied")).toBe(true);
  });

  test("when copying is blocked, shows the citation for manual selection", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
      configurable: true,
    });
    const data = freshData();
    const [journal] = loadResearch(data);
    const fallback = journal.querySelector(".pub-cite-text");
    expect(fallback.hidden).toBe(true);
    journal.querySelector(".pub-cite").click();
    await flush();
    expect(fallback.hidden).toBe(false);
    expect(text(fallback)).toBe(window.ResearchRecord.apa(data.research[0]));
  });

  test("re-rendering does not bind the click handler twice", async () => {
    const writeText = jest.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const data = freshData();
    loadResearch(data);
    window.ResearchRecord.render();
    document.querySelector(".pub-cite").click();
    await flush();
    expect(writeText).toHaveBeenCalledTimes(1);
  });
});

describe("ScholarlyArticle JSON-LD", () => {
  test("is injected once, valid JSON, verified fields only", () => {
    const data = freshData();
    loadResearch(data);
    window.ResearchRecord.render();
    const scripts = document.querySelectorAll('script[type="application/ld+json"]#research-jsonld');
    expect(scripts).toHaveLength(1);
    const ld = JSON.parse(scripts[0].textContent);
    expect(ld).toHaveLength(2);

    const [journal, conf] = ld;
    expect(journal["@type"]).toBe("ScholarlyArticle");
    expect(journal.name).toBe(data.research[0].title);
    expect(journal.author.map((a) => a.name)).toEqual(data.research[0].authors);
    expect(journal.datePublished).toBe("2026-04-01");
    expect(journal.identifier).toEqual({ "@type": "PropertyValue", propertyID: "DOI", value: data.research[0].doi });
    expect(journal.pageStart).toBe("924");
    expect(journal.pageEnd).toBe("944");
    expect(journal.isPartOf.issueNumber).toBe("2");
    expect(journal.isPartOf.isPartOf.volumeNumber).toBe("16");
    expect(journal.isPartOf.isPartOf.isPartOf.name).toBe(data.research[0].venue);

    expect(conf.author).toBeUndefined();
    expect(conf.datePublished).toBeUndefined();
    expect(conf.url).toBe(data.research[1].links.researchgate);
  });
});

describe("Hero snapshot counts", () => {
  class IO { observe() {} unobserve() {} disconnect() {} }

  function loadHero(data, rw) {
    document.body.innerHTML =
      '<a data-stat="projects">0</a><a data-stat="research">0</a><a data-stat="certificates">0</a>' +
      '<section id="projects"><div class="cards-grid" id="projects-grid"></div></section>';
    window.IntersectionObserver = IO;
    window.scrollTo = () => {};
    new Function("portfolioData", "realWorldProjects", mainSrc)(data, rw);
  }

  const rw = new Function(rwSrc + "; return realWorldProjects;")();

  test("equal the lengths of their data sources", () => {
    const data = freshData();
    loadHero(data, rw);
    const val = (k) => Number(text(document.querySelector('[data-stat="' + k + '"]')));
    expect(val("projects")).toBe(rw.length + data.projects.length);
    expect(val("research")).toBe(data.research.length);
    expect(val("certificates")).toBe(data.certificates.length);
  });

  test("follow the data when it changes", () => {
    const data = freshData();
    data.research = data.research.slice(0, 1);
    data.certificates = data.certificates.slice(0, 3);
    loadHero(data, rw);
    expect(text(document.querySelector('[data-stat="research"]'))).toBe("1");
    expect(text(document.querySelector('[data-stat="certificates"]'))).toBe("3");
  });

  test("index.html fallbacks already match the data", () => {
    const data = freshData();
    const fallback = (k) => Number(indexHtml.match(new RegExp('data-stat="' + k + '">(\\d+)<'))[1]);
    expect(fallback("projects")).toBe(rw.length + data.projects.length);
    expect(fallback("research")).toBe(data.research.length);
    expect(fallback("certificates")).toBe(data.certificates.length);
  });
});

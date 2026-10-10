/**
 * Experience: data-driven renderer contract. Runs the real controller in jsdom.
 */
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const src = fs.readFileSync(path.join(root, "controller/experience.js"), "utf8");
const dataSrc = fs.readFileSync(path.join(root, "model/portfolio-data.js"), "utf8");

class IO { observe() {} unobserve() {} disconnect() {} }

function mount(experience) {
  document.body.innerHTML = '<section id="experience"><div id="experience-timeline"></div></section><section id="educational-history"></section>';
  window.IntersectionObserver = IO;
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.scrollTo = () => {};
  const data = new Function(dataSrc + "; return portfolioData;")();
  if (experience !== undefined) data.experience = experience;
  new Function("portfolioData", src)(data);
  return data;
}
const txt = (el) => el.textContent.replace(/\s+/g, " ").trim();

describe("Experience renderer", () => {
  test("renders one item per entry, in data order, with zero-padded indexes", () => {
    const data = mount();
    const items = document.querySelectorAll("[data-exp-item]");
    expect(items).toHaveLength(data.experience.length);
    expect(Array.from(document.querySelectorAll(".exp-index")).map(txt)).toEqual(["01", "02", "03", "04"]);
    expect(Array.from(document.querySelectorAll(".exp-role")).map(txt)).toEqual(data.experience.map((e) => e.role));
  });

  test("ships four entries, every one clearly marked as demo content", () => {
    const data = mount();
    expect(data.experience).toHaveLength(4);
    data.experience.forEach((e) => {
      expect(e.role).toMatch(/\[DEMO/);
      expect(e.company).toMatch(/\[DEMO/);
      expect(e.summary).toMatch(/\[DEMO\]/);
    });
  });

  test("only `current: true` gets the badge and marker (no guessing from text)", () => {
    mount([
      { role: "A", company: "X", period: "2025 - Present", current: false },
      { role: "B", company: "Y", period: "2024 - 2025", current: true }
    ]);
    const marks = Array.from(document.querySelectorAll("[data-exp-item]")).map((i) => i.dataset.current);
    expect(marks).toEqual(["false", "true"]);
    expect(document.querySelectorAll(".exp-badge")).toHaveLength(1);
  });

  test("semantics: ordered list, article + h3 per role, labelled", () => {
    mount();
    expect(document.querySelector("ol.exp-list")).not.toBeNull();
    document.querySelectorAll(".exp-panel").forEach((a) => {
      expect(a.tagName).toBe("ARTICLE");
      const h = a.querySelector("h3");
      expect(a.getAttribute("aria-labelledby")).toBe(h.id);
    });
    const ids = Array.from(document.querySelectorAll("#experience-timeline [id]")).map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("monogram: derived from the company, overridable, replaceable by a logo", () => {
    mount([
      { role: "r", company: "[DEMO COMPANY A]", period: "2025" },
      { role: "r", company: "Acme Labs", period: "2024" },
      { role: "r", company: "Initech", period: "2023" },
      { role: "r", company: "Whatever", monogram: "zq", period: "2022" },
      { role: "r", company: "Logo Co", logo: "view/assets/Images/logo.png", period: "2021" }
    ]);
    const tiles = Array.from(document.querySelectorAll(".exp-id"));
    expect(tiles.slice(0, 4).map(txt)).toEqual(["CA", "AL", "IN", "ZQ"]);
    expect(tiles[4].querySelector("img").getAttribute("src")).toBe("view/assets/Images/logo.png");
    expect(tiles[4].querySelector("img").getAttribute("alt")).toBe("");
  });

  test("period: hyphen becomes a typographic dash", () => {
    mount([{ role: "r", company: "c", period: "2025 - Present" }]);
    expect(txt(document.querySelector(".exp-period"))).toBe("2025 \u2013 Present");
  });

  test("contributions sit behind an accessible disclosure; absent when empty", () => {
    mount([
      { role: "a", company: "c", period: "2025", contributions: ["one", "two"] },
      { role: "b", company: "c", period: "2024", contributions: [] }
    ]);
    const buttons = document.querySelectorAll(".exp-toggle");
    expect(buttons).toHaveLength(1);
    const b = buttons[0];
    expect(b.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById(b.getAttribute("aria-controls"))).not.toBeNull();
    b.click();
    expect(b.getAttribute("aria-expanded")).toBe("true");
    expect(txt(b)).toMatch(/Hide/);
    b.click();
    expect(b.getAttribute("aria-expanded")).toBe("false");
  });

  test("escapes all text and refuses unsafe URLs", () => {
    mount([{
      role: "<b>bold</b>", company: '<img src=x onerror="window.__p=1">', period: "2025",
      summary: "<script>window.__p=2</script>", companyUrl: "javascript:alert(1)", logo: "javascript:alert(2)",
      technologies: ["<i>x</i>"], contributions: ["<u>y</u>"], type: "<em>t</em>", location: "<s>l</s>"
    }]);
    const html = document.getElementById("experience-timeline").innerHTML;
    expect(document.querySelector("#experience-timeline img")).toBeNull();
    expect(document.querySelector("#experience-timeline script")).toBeNull();
    expect(document.querySelector("#experience-timeline b, #experience-timeline i, #experience-timeline u")).toBeNull();
    expect(window.__p).toBeUndefined();
    expect(document.querySelector(".exp-company a")).toBeNull();
    expect(html).toContain("&lt;b&gt;bold&lt;/b&gt;");
  });

  test("a valid https companyUrl becomes a safe external link", () => {
    mount([{ role: "r", company: "Acme", period: "2025", companyUrl: "https://acme.example/" }]);
    const a = document.querySelector(".exp-company a");
    expect(a.getAttribute("href")).toBe("https://acme.example/");
    expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    expect(a.getAttribute("target")).toBe("_blank");
  });

  test("empty or missing data shows a graceful message instead of an empty box", () => {
    mount([]);
    expect(txt(document.getElementById("experience-timeline"))).toMatch(/will appear here/);
    mount(undefined);
    document.body.innerHTML = "";
  });

  test("the bridge leads to Education", () => {
    mount();
    expect(document.querySelector("[data-exp-bridge]").getAttribute("href")).toBe("#educational-history");
  });
});

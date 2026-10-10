/**
 * Gallery controller: real markup from index.html + real function output (via a fake Drive).
 */
const fs = require("fs");
const path = require("path");
const { createFakeDrive, sampleTree, img, vid, folder } = require("./helpers/fake-drive");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const src = fs.readFileSync(path.join(root, "controller/gallery.js"), "utf8");
const sectionHtml = /<section class="section-shell" id="photo-gallery"[\s\S]*?<\/section>/.exec(html)[0];

class IO { constructor(cb) { this.cb = cb; } observe(el) { this.cb([{ isIntersecting: true, target: el }]); } unobserve() {} disconnect() {} }
const flush = async (n = 6) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };

async function payloadFrom(folders) {
  process.env.GOOGLE_DRIVE_API_KEY = "unit-test-secret-not-a-real-credential";
  process.env.GOOGLE_DRIVE_FOLDER_ID = "ROOTFOLDER123";
  global.fetch = createFakeDrive(folders);
  jest.resetModules();
  const spy = jest.spyOn(console, "error").mockImplementation(() => {});
  const res = await require("../netlify/functions/gallery.js").handler({ httpMethod: "GET", queryStringParameters: null });
  spy.mockRestore();
  return JSON.parse(res.body);
}

function many(n) {
  const list = [];
  for (let i = 0; i < n; i++) list.push(img(`MANYIMG${String(i).padStart(5, "0")}`, `Photo ${i}.jpg`, 1600, 1000, { createdTime: `2025-01-01T00:${String(i % 60).padStart(2, "0")}:00.000Z` }));
  return { ROOTFOLDER123: list };
}

async function mount(apiResponse, { ok = true, reject = false, cfg } = {}) {
  document.body.innerHTML = '<div class="page"><main>' + sectionHtml + '<section id="contact"></section></main></div>';
  window.IntersectionObserver = IO;
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.scrollTo = () => {};
  const fetchMock = jest.fn(() => (reject ? Promise.reject(new Error("net")) : Promise.resolve({ ok, json: async () => apiResponse })));
  window.fetch = fetchMock;
  global.fetch = fetchMock;
  const data = { gallery: Object.assign({ folderId: "1dsPV2x0nEvN-8j6FlfVRo1ehscXLZ_ov", recursive: true, pageSize: 24 }, cfg) };
  new Function("portfolioData", src)(data);
  await flush();
  return fetchMock;
}
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const state = () => $("#gallery").dataset.state;

describe("gallery: states", () => {
  test("loads once, shows the grid, one request", async () => {
    const f = await mount(await payloadFrom(sampleTree().folders));
    expect(state()).toBe("ready");
    expect(f).toHaveBeenCalledTimes(1);
    expect(f.mock.calls[0][0]).toBe("/.netlify/functions/gallery");
    expect($$(".gal-card")).toHaveLength(7);
    expect($("#gallery").getAttribute("aria-busy")).toBe("false");
    expect($("[data-gal-skeleton]").hidden).toBe(true);
  });

  test("honours recursive:false from the site config", async () => {
    const f = await mount(await payloadFrom(sampleTree().folders), { cfg: { recursive: false } });
    expect(f.mock.calls[0][0]).toBe("/.netlify/functions/gallery?recursive=false");
  });

  test("empty collection -> empty state with a Drive link", async () => {
    await mount(await payloadFrom({ ROOTFOLDER123: [] }));
    expect(state()).toBe("empty");
    expect($('[data-panel="empty"]').hidden).toBe(false);
    expect($('[data-panel="empty"] [data-gal-drive]').href).toMatch(/^https:\/\/drive\.google\.com\/drive\/folders\//);
  });

  test("API failure -> error state, Retry, Drive link; the rest of the page is untouched", async () => {
    await mount({ success: false, error: { code: "x", message: "m" } }, { ok: false });
    expect(state()).toBe("error");
    expect($("[data-gal-retry]")).not.toBeNull();
    expect($("#contact")).not.toBeNull();
  });

  test("network failure -> error state; Retry recovers", async () => {
    const good = await payloadFrom(sampleTree().folders);
    const f = await mount(good, { reject: true });
    expect(state()).toBe("error");
    f.mockImplementation(() => Promise.resolve({ ok: true, json: async () => good }));
    $("[data-gal-retry]").click();
    await flush();
    expect(state()).toBe("ready");
    expect(f).toHaveBeenCalledTimes(2);
    expect(f.mock.calls[1][1].cache).toBe("reload");
  });

  test("a malformed success payload is treated as an error, not rendered", async () => {
    await mount({ success: true, items: "nope" });
    expect(state()).toBe("error");
  });
});

describe("gallery: progressive reveal + filters", () => {
  test("renders the first batch only, then Load more reveals the rest", async () => {
    await mount(await payloadFrom(many(60)));
    expect($$(".gal-card")).toHaveLength(24);
    expect($(".gal-count").textContent).toBe("Showing 24 of 60");
    expect($("[data-gal-more]").hidden).toBe(false);
    expect($("[data-gal-more-btn]").textContent).toBe("Load 24 more");
    $("[data-gal-more-btn]").click();
    expect($$(".gal-card")).toHaveLength(48);
    $("[data-gal-more-btn]").click();
    expect($$(".gal-card")).toHaveLength(60);
    expect($("[data-gal-more]").hidden).toBe(true);
  });

  test("batch size follows config", async () => {
    await mount(await payloadFrom(many(30)), { cfg: { pageSize: 10 } });
    expect($$(".gal-card")).toHaveLength(10);
  });

  test("type + category filters combine, instantly, without refetching", async () => {
    const f = await mount(await payloadFrom(sampleTree().folders));
    const kinds = $$(".gal-seg-btn");
    expect(kinds.map((b) => b.getAttribute("data-kind"))).toEqual(["all", "image", "video"]);
    kinds[2].click();
    expect($$(".gal-card")).toHaveLength(2);
    expect($$(".gal-card .gal-badge")).toHaveLength(2);
    $$(".gal-chip").find((c) => c.textContent === "Research").click();
    expect($$(".gal-card")).toHaveLength(1);
    expect($$(".gal-chip").find((c) => c.textContent === "Research").getAttribute("aria-pressed")).toBe("true");
    expect(f).toHaveBeenCalledTimes(1);
  });

  test("category chips: real albums only, 'Uncategorized' shown as Other, none rendered when there are no albums", async () => {
    await mount(await payloadFrom(sampleTree().folders));
    expect($$(".gal-chip").map((c) => c.textContent)).toEqual(["Campus", "Research", "Other"]);
    await mount(await payloadFrom(many(5)));
    expect($$(".gal-chip")).toHaveLength(0);
  });

  test("a filter combination with no results shows the no-match panel; Reset restores", async () => {
    await mount(await payloadFrom(sampleTree().folders));
    $$(".gal-seg-btn")[2].click();
    $$(".gal-chip").find((c) => c.textContent === "Other").click();
    $$(".gal-chip").find((c) => c.textContent === "Campus").click();
    $$(".gal-seg-btn")[1].click();
    $$(".gal-seg-btn")[2].click();
    if (!$('[data-panel="nomatch"]').hidden) {
      $("[data-gal-reset]").click();
      expect($$(".gal-card")).toHaveLength(7);
    }
    expect($('[data-panel="nomatch"]').hidden).toBe(true);
  });
});

describe("gallery: untrusted data", () => {
  test("titles render as text; unsafe URLs are dropped for the Drive thumbnail", async () => {
    const evil = {
      success: true, count: 1, categories: ["Uncategorized"], items: [{
        id: "EVILITEM0001", kind: "image", title: '<img src=x onerror="window.__g=1">', category: "<b>c</b>",
        thumbnailUrl: "javascript:alert(1)", thumbnailFallbackUrl: "https://evil.example.com/x.jpg",
        fullUrl: "http://insecure.example.com/a.jpg", viewUrl: "data:text/html,boom", width: 100, height: 100
      }]
    };
    await mount(evil);
    expect(window.__g).toBeUndefined();
    expect($("#gallery img[onerror]")).toBeNull();
    const imgEl = $(".gal-card img");
    expect(imgEl.getAttribute("src")).toMatch(/^https:\/\/drive\.google\.com\/thumbnail\?id=EVILITEM0001/);
    expect(imgEl.alt).toBe('<img src=x onerror="window.__g=1">');
    expect($(".gal-cap__title").textContent).toContain("<img");
    expect($(".gal-cap__title").children).toHaveLength(0);
  });

  test("items without a valid id or kind are skipped", async () => {
    await mount({ success: true, items: [{ id: "x", kind: "image" }, { id: "VALIDITEM001", kind: "pdf" }, { id: "GOODITEM0001", kind: "image", title: "ok", width: 10, height: 10 }], categories: [] });
    expect($$(".gal-card")).toHaveLength(1);
  });
});

describe("gallery: accessibility + lightbox", () => {
  test("every image has a useful alt; videos say so; captions are hidden from AT (no double reading)", async () => {
    await mount(await payloadFrom(sampleTree().folders));
    $$(".gal-card img").forEach((i) => expect(i.alt.length).toBeGreaterThan(2));
    expect($$(".gal-card img").some((i) => /^Video: /.test(i.alt))).toBe(true);
    $$(".gal-cap").forEach((c) => expect(c.getAttribute("aria-hidden")).toBe("true"));
    expect($$(".gal-card").every((c) => c.tagName === "BUTTON" && c.type === "button")).toBe(true);
    expect($$("#gallery-grid > li").length).toBe($$(".gal-card").length);
  });

  test("filters expose state with aria-pressed and live counts", async () => {
    await mount(await payloadFrom(sampleTree().folders));
    expect($(".gal-seg-btn[data-kind='all']").getAttribute("aria-pressed")).toBe("true");
    expect($(".gal-seg-btn[data-kind='video']").getAttribute("aria-label")).toBe("Videos, 2 items");
  });

  test("lightbox: opens as a modal dialog, navigates, closes, restores state", async () => {
    await mount(await payloadFrom(sampleTree().folders));
    const opener = $$(".gal-card")[0];
    opener.click();
    const lb = $(".gal-lb");
    expect(lb.hidden).toBe(false);
    expect(lb.getAttribute("role")).toBe("dialog");
    expect(lb.getAttribute("aria-modal")).toBe("true");
    expect(document.getElementById(lb.getAttribute("aria-labelledby"))).not.toBeNull();
    expect(document.documentElement.classList.contains("gal-lock")).toBe(true);
    expect(document.querySelector(".page").hasAttribute("inert")).toBe(true);
    expect($(".gal-lb__count").textContent).toBe("1 / 7");
    expect($(".gal-lb__nav--prev").disabled).toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect($(".gal-lb__count").textContent).toBe("2 / 7");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect($(".gal-lb__count").textContent).toBe("1 / 7");

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(document.documentElement.classList.contains("gal-lock")).toBe(false);
    expect(document.querySelector(".page").hasAttribute("inert")).toBe(false);
    expect(document.activeElement).toBe(opener);
  });

  test("video: a Drive preview iframe is created on open and removed on close (never autoplayed)", async () => {
    await mount(await payloadFrom(sampleTree().folders));
    const videoIdx = $$(".gal-card").findIndex((c) => c.querySelector(".gal-badge"));
    $$(".gal-card")[videoIdx].click();
    const frame = $(".gal-lb iframe");
    expect(frame.src).toMatch(/^https:\/\/drive\.google\.com\/file\/d\/.+\/preview$/);
    expect(frame.src).not.toMatch(/autoplay=1/);
    expect(frame.title).toMatch(/^Video: /);
    $(".gal-lb__close").click();
    expect($(".gal-lb iframe")).toBeNull();
  });

  test("lightbox text from Drive is inserted as text, never markup", async () => {
    const evil = { success: true, categories: [], items: [{ id: "EVILITEM0001", kind: "image", title: "<b>x</b>", category: "Uncategorized", width: 10, height: 10, viewUrl: "https://drive.google.com/file/d/EVILITEM0001/view" }] };
    await mount(evil);
    $(".gal-card").click();
    expect($(".gal-lb__title").textContent).toBe("<b>x</b>");
    expect($(".gal-lb__title b")).toBeNull();
  });
});

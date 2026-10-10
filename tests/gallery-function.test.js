/**
 * Netlify Function: gallery. Runs against an in-memory fake of the Drive API.
 */
const { createFakeDrive, sampleTree, img, folder } = require("./helpers/fake-drive");

const API_KEY = "unit-test-secret-not-a-real-credential";

function load() {
  jest.resetModules();
  return require("../netlify/functions/gallery.js");
}

function setEnv(extra = {}) {
  process.env.GOOGLE_DRIVE_API_KEY = API_KEY;
  process.env.GOOGLE_DRIVE_FOLDER_ID = "ROOTFOLDER123";
  delete process.env.GALLERY_RECURSIVE;
  delete process.env.GALLERY_DEBUG;
  delete process.env.NETLIFY_DEV;
  Object.assign(process.env, extra);
}

const get = (mod, event = {}) => mod.handler(Object.assign({ httpMethod: "GET", queryStringParameters: null }, event));
const json = (res) => JSON.parse(res.body);

let errorSpy;
beforeEach(() => {
  setEnv();
  errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  errorSpy.mockRestore();
  delete global.fetch;
});

describe("configuration + request validation", () => {
  test("missing API key or folder id -> 500 not_configured, with no variable names or secrets", async () => {
    delete process.env.GOOGLE_DRIVE_API_KEY;
    const res = await get(load());
    expect(res.statusCode).toBe(500);
    expect(json(res).error.code).toBe("not_configured");
    expect(res.body).not.toMatch(/GOOGLE_DRIVE|API_KEY|FOLDER_ID/);
    expect(res.headers["Cache-Control"]).toBe("no-store");
  });

  test("developer hint appears only when GALLERY_DEBUG is on", async () => {
    delete process.env.GOOGLE_DRIVE_FOLDER_ID;
    expect(json(await get(load())).debug).toBeUndefined();
    process.env.GALLERY_DEBUG = "1";
    expect(json(await get(load())).debug.hint).toMatch(/Netlify/);
  });

  test("malformed folder id is rejected before any Drive call", async () => {
    process.env.GOOGLE_DRIVE_FOLDER_ID = "x' or '1'='1";
    global.fetch = jest.fn();
    const res = await get(load());
    expect(res.statusCode).toBe(500);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("POST -> 405 with Allow header", async () => {
    const res = await get(load(), { httpMethod: "POST" });
    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe("GET, HEAD");
  });

  test("unknown query parameters -> 400 (prevents cache-busting the Drive quota)", async () => {
    global.fetch = jest.fn();
    const res = await get(load(), { queryStringParameters: { x: "1" } });
    expect(res.statusCode).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("recursive accepts only true|false", async () => {
    global.fetch = jest.fn();
    expect((await get(load(), { queryStringParameters: { recursive: "maybe" } })).statusCode).toBe(400);
    expect((await get(load(), { queryStringParameters: { recursive: "false", extra: "1" } })).statusCode).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("?recursive=false scans the root only, and does not poison the cache for the default request", async () => {
    global.fetch = createFakeDrive(sampleTree().folders);
    const mod = load();
    expect(json(await get(mod, { queryStringParameters: { recursive: "false" } })).count).toBe(2);
    expect(json(await get(mod)).count).toBe(7);
  });

  test("GALLERY_RECURSIVE=false on the server overrides the request", async () => {
    process.env.GALLERY_RECURSIVE = "false";
    global.fetch = createFakeDrive(sampleTree().folders);
    expect(json(await get(load(), { queryStringParameters: { recursive: "true" } })).count).toBe(2);
  });
});

describe("discovery", () => {
  test("lists root files and sub-folders recursively, with categories in folder order", async () => {
    const { root, folders } = sampleTree();
    global.fetch = createFakeDrive(folders);
    const res = await get(load());
    const body = json(res);

    expect(res.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.count).toBe(body.items.length);
    expect(body.count).toBe(7); // 2 root + 2 campus + 1 trip + 2 research
    expect(body.categories).toEqual(["Campus", "Research", "Uncategorized"]);
    expect(body.kinds).toEqual({ image: 5, video: 2 });
    expect(body.folderUrl).toBe(`https://drive.google.com/drive/folders/${root}`);

    const trip = body.items.find((i) => i.name === "Group_photo.png");
    expect(trip.category).toBe("Campus");
    expect(trip.folderPath).toBe("01-Campus/Trip");
    const rootImg = body.items.find((i) => i.name === "IMG_2041.jpg");
    expect(rootImg.category).toBe("Uncategorized");
    expect(rootImg.folderPath).toBe("");
  });

  test("excludes unsupported types (pdf, txt, heic) without failing", async () => {
    global.fetch = createFakeDrive(sampleTree().folders);
    const names = json(await get(load())).items.map((i) => i.name);
    ["notes.pdf", "readme.txt", "photo.heic"].forEach((n) => expect(names).not.toContain(n));
  });

  test("newest upload first", async () => {
    global.fetch = createFakeDrive(sampleTree().folders);
    const times = json(await get(load())).items.map((i) => i.createdTime);
    expect(times).toEqual([...times].sort().reverse());
  });

  test("follows nextPageToken until every file is retrieved", async () => {
    const many = Array.from({ length: 23 }, (_, i) => img(`PAGEIMG${String(i).padStart(5, "0")}`, `photo-${i}.jpg`, 800, 600));
    const fake = createFakeDrive({ ROOTFOLDER123: many }, { maxPage: 5 });
    global.fetch = fake;
    const body = json(await get(load()));
    expect(body.count).toBe(23);
    expect(fake.calls.length).toBe(5); // ceil(23 / 5)
  });

  test("GALLERY_RECURSIVE=false scans the root only", async () => {
    process.env.GALLERY_RECURSIVE = "false";
    global.fetch = createFakeDrive(sampleTree().folders);
    const body = json(await get(load()));
    expect(body.count).toBe(2);
    expect(body.categories).toEqual(["Uncategorized"]);
  });

  test("stops at the item limit and reports truncated", async () => {
    const mod = load();
    const fake = createFakeDrive(sampleTree().folders);
    global.fetch = fake;
    const { items, state } = await mod._internals.collect("ROOTFOLDER123", API_KEY, { recursive: true, maxItems: 3 }, Date.now() + 5000);
    expect(items).toHaveLength(3);
    expect(state.truncated).toBe(true);
  });

  test("a failing sub-folder marks the result partial instead of failing the gallery", async () => {
    const fake = createFakeDrive(sampleTree().folders, { fail: (n, u) => (/FOLDERCAMPUS/.test(u.searchParams.get("q")) ? { status: 500 } : null) });
    global.fetch = fake;
    const body = json(await get(load()));
    expect(body.success).toBe(true);
    expect(body.partial).toBe(true);
    expect(body.items.some((i) => i.category === "Research")).toBe(true);
  });
});

describe("normalized item shape", () => {
  test("has stable fields, swaps dimensions for rotated images, never exposes raw Drive structure", async () => {
    global.fetch = createFakeDrive(sampleTree().folders);
    const items = json(await get(load())).items;
    const lib = items.find((i) => i.name === "library-evening.JPG");
    expect([lib.width, lib.height]).toEqual([4000, 6000]); // rotation 1 = quarter turn
    expect(lib.thumbnailUrl).toBe("https://lh3.googleusercontent.com/CAMPUSIMG002=w640");
    expect(lib.fullUrl).toContain("drive.google.com/thumbnail?id=CAMPUSIMG002&sz=w2000");
    expect(lib.title).toBe("library evening");
    const video = items.find((i) => i.kind === "video");
    expect(video.previewUrl).toMatch(/^https:\/\/drive\.google\.com\/file\/d\/.+\/preview$/);
    expect(video.durationMs).toBe(42000);
    items.forEach((i) => {
      ["id", "name", "title", "kind", "category", "folderPath", "thumbnailUrl", "viewUrl", "downloadUrl", "modifiedTime"].forEach((k) => expect(i).toHaveProperty(k));
      expect(i).not.toHaveProperty("parents");
    });
  });

  test("camera-style names get a neutral readable title", () => {
    const { humanizeTitle, categoryLabel } = load()._internals;
    expect(humanizeTitle("IMG_2041.jpg", "Campus", "image")).toBe("Photo from Campus");
    expect(humanizeTitle("PXL_20240101_123456789.mp4", "Uncategorized", "video")).toBe("Video");
    expect(humanizeTitle("Meeting_with_Prof_Rahman.jpg", "Campus", "image")).toBe("Meeting with Prof Rahman");
    expect(humanizeTitle("2024-05-01 Robotics trip.jpg", "Campus", "image")).toBe("2024-05-01 Robotics trip");
    expect(humanizeTitle("Team - Demo Day.png", "Events", "image")).toBe("Team - Demo Day");
    expect(categoryLabel("03_Industry_Visits")).toBe("Industry Visits");
    expect(categoryLabel("2024")).toBe("2024");
  });

  test("control and bidi-override characters are stripped from names", () => {
    const { normalizeFile } = load()._internals;
    const out = normalizeFile({ id: "ABCDEFGHIJ1", name: "ev\u202eil\u0000.jpg", mimeType: "image/jpeg" }, [], "image");
    expect(out.name).toBe("evil.jpg");
  });

  test("untrusted thumbnail hosts are ignored in favour of the Drive endpoint", () => {
    const { sizedThumb } = load()._internals;
    expect(sizedThumb("https://evil.example.com/x=s220", 640)).toBe("");
    expect(sizedThumb("http://lh3.googleusercontent.com/x=s220", 640)).toBe("");
    expect(sizedThumb("https://lh3.googleusercontent.com/abc=s220", 640)).toBe("https://lh3.googleusercontent.com/abc=w640");
  });
});

describe("security", () => {
  test("API key travels in a header, never in the URL, and never appears in the response", async () => {
    const fake = createFakeDrive(sampleTree().folders);
    global.fetch = fake;
    const res = await get(load());
    fake.calls.forEach((c) => {
      expect(c.headers["x-goog-api-key"]).toBe(API_KEY);
      expect(c.url).not.toContain(API_KEY);
      expect(c.url).not.toMatch(/[?&]key=/);
    });
    expect(JSON.stringify(res)).not.toContain(API_KEY);
  });

  test("nothing in the error response or logs contains the key", async () => {
    global.fetch = createFakeDrive({}, { fail: () => ({ status: 403, body: { error: { message: `bad key ${API_KEY}`, status: "PERMISSION_DENIED", errors: [{ reason: "accessNotConfigured" }] } } }) });
    const res = await get(load());
    expect(JSON.stringify(res)).not.toContain(API_KEY);
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain(API_KEY);
  });
});

describe("error contract", () => {
  const cases = [
    [403, "accessNotConfigured", 500, "drive_forbidden"],
    [401, "authError", 500, "drive_forbidden"],
    [404, "notFound", 500, "drive_not_found"],
    [400, "keyInvalid", 500, "drive_error"],
    [403, "rateLimitExceeded", 503, "drive_rate_limited"],
    [429, "rateLimitExceeded", 503, "drive_rate_limited"],
    [500, "backendError", 503, "drive_unavailable"],
    [503, "backendError", 503, "drive_unavailable"]
  ];
  test.each(cases)("Drive %i (%s) -> HTTP %i %s, safe message", async (status, reason, http, code) => {
    global.fetch = createFakeDrive({ ROOTFOLDER123: [] }, { fail: () => ({ status, reason }) });
    const res = await get(load());
    const body = json(res);
    expect(res.statusCode).toBe(http);
    expect(body.error.code).toBe(code);
    expect([
      "The gallery is not available right now.",
      "The gallery is busy. Please try again shortly.",
      "The gallery is temporarily unavailable. Please try again shortly."
    ]).toContain(body.error.message);
    expect(res.body).not.toMatch(/googleapis|PERMISSION|reason|stack/i);
  });

  test("network failure -> 503", async () => {
    global.fetch = createFakeDrive({}, { networkError: true });
    const res = await get(load());
    expect(res.statusCode).toBe(503);
    expect(json(res).error.code).toBe("drive_unavailable");
  });

  test("a good response is cached for the CDN with stale-while-revalidate", async () => {
    global.fetch = createFakeDrive(sampleTree().folders);
    const res = await get(load());
    expect(res.headers["Cache-Control"]).toMatch(/max-age=60.*stale-while-revalidate/);
    expect(res.headers["Netlify-CDN-Cache-Control"]).toMatch(/max-age=300.*stale-while-revalidate/);
  });
});

describe("resilience", () => {
  test("reuses a fresh warm result instead of calling Drive again", async () => {
    const fake = createFakeDrive(sampleTree().folders);
    global.fetch = fake;
    const mod = load();
    await get(mod);
    const callsAfterFirst = fake.calls.length;
    await get(mod);
    expect(fake.calls.length).toBe(callsAfterFirst);
  });

  test("serves the last good result (stale: true) when Drive starts failing", async () => {
    const mod = load();
    const folders = sampleTree().folders;
    global.fetch = createFakeDrive(folders);
    const t0 = Date.now();
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(t0);
    expect(json(await get(mod)).count).toBe(7);

    nowSpy.mockReturnValue(t0 + 5 * 60 * 1000); // past the fresh window
    global.fetch = createFakeDrive(folders, { fail: () => ({ status: 503 }) });
    const res = await get(mod);
    nowSpy.mockRestore();
    expect(res.statusCode).toBe(200);
    expect(json(res).stale).toBe(true);
    expect(json(res).count).toBe(7);
  });
});

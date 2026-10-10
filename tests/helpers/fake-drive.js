/**
 * A tiny in-memory stand-in for the Google Drive v3 `files.list` endpoint.
 * Used by the gallery function tests (and handy for local experiments).
 * Understands: q = "'<folderId>' in parents and trashed = false", pageToken, pageSize.
 */
const FOLDER = "application/vnd.google-apps.folder";

function file(id, name, mimeType, extra) {
  return Object.assign({ id, name, mimeType, createdTime: "2025-01-01T00:00:00.000Z", modifiedTime: "2025-01-01T00:00:00.000Z" }, extra);
}
const img = (id, name, w, h, extra) =>
  file(id, name, "image/jpeg", Object.assign({ imageMediaMetadata: { width: w, height: h }, thumbnailLink: `https://lh3.googleusercontent.com/${id}=s220` }, extra));
const vid = (id, name, extra) =>
  file(id, name, "video/mp4", Object.assign({ videoMediaMetadata: { width: 1920, height: 1080, durationMillis: "42000" }, thumbnailLink: `https://lh3.googleusercontent.com/${id}=s220` }, extra));
const folder = (id, name) => file(id, name, FOLDER);

/** @param {Record<string, object[]>} folders  folderId -> children */
function createFakeDrive(folders, options = {}) {
  const calls = [];
  const maxPage = options.maxPage || 1000;

  async function fakeFetch(url, init = {}) {
    const u = new URL(url);
    calls.push({ url: String(url), headers: init.headers || {}, method: init.method });
    if (options.networkError) throw Object.assign(new Error("boom"), { name: "TypeError" });
    if (options.fail) {
      const f = options.fail(calls.length, u);
      if (f) return { ok: false, status: f.status, json: async () => f.body || { error: { status: "ERR", errors: [{ reason: f.reason || "unknown" }] } } };
    }
    const m = /'([^']+)' in parents/.exec(u.searchParams.get("q") || "");
    const children = m && folders[m[1]];
    if (!children) return { ok: false, status: 404, json: async () => ({ error: { status: "NOT_FOUND", errors: [{ reason: "notFound" }] } }) };

    const size = Math.min(Number(u.searchParams.get("pageSize")) || 100, maxPage);
    const start = Number(u.searchParams.get("pageToken") || 0);
    const slice = children.slice(start, start + size);
    const body = { files: slice };
    if (start + size < children.length) body.nextPageToken = String(start + size);
    return { ok: true, status: 200, json: async () => body };
  }
  fakeFetch.calls = calls;
  return fakeFetch;
}

/** A realistic folder tree: root files, numbered category folders, a nested folder, unsupported files. */
function sampleTree() {
  const root = "ROOTFOLDER123";
  return {
    root,
    folders: {
      [root]: [
        img("ROOTIMG0001", "IMG_2041.jpg", 4000, 3000, { createdTime: "2025-05-01T10:00:00.000Z" }),
        vid("ROOTVID0001", "Lab_tour.mp4", { createdTime: "2025-05-02T10:00:00.000Z" }),
        file("ROOTDOC0001", "notes.pdf", "application/pdf"),
        folder("FOLDERCAMPUS", "01-Campus"),
        folder("FOLDERRESEARC", "02-Research"),
        folder("FOLDEREMPTY00", "03-Empty")
      ],
      FOLDERCAMPUS: [
        img("CAMPUSIMG001", "Graduation_Day.jpg", 3000, 4500, { createdTime: "2025-03-01T10:00:00.000Z" }),
        img("CAMPUSIMG002", "library-evening.JPG", 6000, 4000, { createdTime: "2025-03-02T10:00:00.000Z", imageMediaMetadata: { width: 6000, height: 4000, rotation: 1 } }),
        file("CAMPUSHEIC01", "photo.heic", "image/heic"),
        folder("FOLDERTRIP000", "Trip")
      ],
      FOLDERTRIP000: [img("TRIPIMG00001", "Group_photo.png", 2000, 1000, { createdTime: "2025-02-01T10:00:00.000Z" })],
      FOLDERRESEARC: [
        img("RESIMG000001", "Poster_presentation.jpg", 1600, 1200, { createdTime: "2025-04-01T10:00:00.000Z" }),
        vid("RESVID000001", "Demo.webm".replace("webm", "mp4"), { createdTime: "2025-04-02T10:00:00.000Z" }),
        file("RESTXT000001", "readme.txt", "text/plain")
      ],
      FOLDEREMPTY00: []
    }
  };
}

module.exports = { createFakeDrive, sampleTree, img, vid, folder, file, FOLDER };

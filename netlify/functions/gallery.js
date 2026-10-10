/* ══════════════════════════════════════════════════════════════
   Netlify Function: GET /.netlify/functions/gallery

   Lists the images and videos in ONE public Google Drive folder
   (and, optionally, its sub-folders) using the Drive API v3, and
   returns a small, stable JSON schema for the front end.

   Configuration (Netlify → Site settings → Environment variables)
     GOOGLE_DRIVE_API_KEY    server-side only; never sent to the browser
     GOOGLE_DRIVE_FOLDER_ID  the public folder to read
   Optional
     GALLERY_RECURSIVE       "false" disables sub-folder scanning for everyone (default: on)
     GALLERY_DEBUG           "1" adds a developer-only diagnostic to errors

   Security model
     • The key is read from the environment, sent in the x-goog-api-key
       header (not in the URL), and redacted from anything logged.
     • Responses never contain the key, Google's raw error payloads,
       stack traces or environment variable names.
     • Only one query parameter is accepted (recursive=true|false), so the
       cache has at most two variants and nobody can bypass the CDN cache
       with unique URLs to burn the Drive quota.
   ══════════════════════════════════════════════════════════════ */
"use strict";

const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const FOLDER_MIME = "application/vnd.google-apps.folder";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const LIMITS = {
  maxDepth: 4,              // folder levels below the root
  maxFolders: 60,           // folders scanned in total
  maxItems: 500,            // media items returned
  pageSize: 500,            // Drive page size (max 1000)
  maxPagesPerFolder: 10,
  concurrency: 4,           // parallel Drive requests
  requestTimeoutMs: 6500,
  deadlineMs: 8500,         // Netlify's default function timeout is 10 s
  freshMs: 60 * 1000,       // reuse a warm result this long
  staleMs: 6 * 60 * 60 * 1000 // serve a stale result this long if Drive is failing
};

const FIELDS =
  "nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,parents," +
  "thumbnailLink,webViewLink,webContentLink,description," +
  "imageMediaMetadata(width,height,rotation),videoMediaMetadata(width,height,durationMillis))";

const ID_RE = /^[A-Za-z0-9_-]{10,100}$/;

/* ── Errors ──────────────────────────────────────────────────── */
class GalleryError extends Error {
  constructor(code, status, reason) {
    super(code);
    this.code = code;
    this.status = status;
    this.reason = reason || "";
  }
}

const SAFE_MESSAGES = {
  bad_request: "The request could not be understood.",
  method_not_allowed: "Method not allowed.",
  not_configured: "The gallery is not available right now.",
  drive_forbidden: "The gallery is not available right now.",
  drive_not_found: "The gallery is not available right now.",
  drive_error: "The gallery is not available right now.",
  drive_rate_limited: "The gallery is busy. Please try again shortly.",
  drive_unavailable: "The gallery is temporarily unavailable. Please try again shortly."
};

/* Developer-only hints. Shown only under `netlify dev` or GALLERY_DEBUG=1, never in production. */
const DEV_HINTS = {
  not_configured: "Set GOOGLE_DRIVE_API_KEY and GOOGLE_DRIVE_FOLDER_ID in Netlify (or .env for `netlify dev`). The folder ID is the last segment of the Drive folder URL.",
  drive_forbidden: "403/401 from Drive: (1) enable the Google Drive API on the key's Cloud project, (2) check the key's API restriction includes Drive API, (3) remove HTTP-referrer restrictions (server calls send no referrer), (4) share the folder as 'Anyone with the link'.",
  drive_not_found: "404 from Drive: the folder ID is wrong, or the folder is not shared as 'Anyone with the link'.",
  drive_error: "400 from Drive: the API key is malformed or the query was rejected.",
  drive_rate_limited: "Drive quota or rate limit reached. Responses are cached; wait and retry.",
  drive_unavailable: "Drive was unreachable, timed out, or returned a 5xx."
};

/* ── Small helpers ───────────────────────────────────────────── */
const sanitize = (value, max = 160) =>
  String(value == null ? "" : value)
    .replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, "")
    .trim()
    .slice(0, max);

const natural = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

function kindOf(mimeType) {
  if (IMAGE_TYPES.has(mimeType)) return "image";
  if (VIDEO_TYPES.has(mimeType)) return "video";
  return null;
}

/* "01-Campus" -> "Campus", "03_Industry_Visits" -> "Industry Visits" */
function categoryLabel(folderName) {
  const original = sanitize(folderName, 80);
  const cleaned = original.replace(/^\s*\d+\s*[-_.):]*\s*/, "").replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  return cleaned || original || "Uncategorized";
}

/* File name -> readable title; camera-style names fall back to a neutral label */
function humanizeTitle(fileName, category, kind) {
  const base = sanitize(fileName, 200)
    .replace(/\.[A-Za-z0-9]{2,5}$/, "")
    .replace(/[_]+/g, " ")
    .replace(/(?<=[A-Za-z])-+(?=[A-Za-z])/g, " ") // "library-evening" -> "library evening"; dates keep their hyphens
    .replace(/\s+/g, " ")
    .trim();
  const cameraStyle = /^(?:img|dsc|dscn|dscf|pxl|vid|mvi|mov|gopr|photo|image|video|screenshot|wa\d*|signal)[\s_-]*[\d\s_.-]*$/i;
  if (!base || /^[\d\s_.-]+$/.test(base) || cameraStyle.test(base)) {
    const noun = kind === "video" ? "Video" : "Photo";
    return category && category !== "Uncategorized" ? `${noun} from ${category}` : noun;
  }
  return base.slice(0, 120);
}

function driveThumb(id, width) {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w${width}`;
}

/* Drive returns ...=s220; ask for a width instead. Only trust Google-hosted https URLs. */
function sizedThumb(link, width) {
  if (typeof link !== "string") return "";
  if (!/^https:\/\/[a-z0-9.-]+\.(?:googleusercontent|google)\.com\//i.test(link)) return "";
  return link.replace(/=[sw]\d+(?:-[a-z0-9-]+)?$/i, "") + `=w${width}`;
}

function normalizeFile(file, pathSegments, kind) {
  const top = pathSegments[0];
  const category = top ? categoryLabel(top) : "Uncategorized";
  const meta = (kind === "video" ? file.videoMediaMetadata : file.imageMediaMetadata) || {};
  let width = Number(meta.width) || 0;
  let height = Number(meta.height) || 0;
  if (kind === "image" && Number(meta.rotation) % 2 === 1) [width, height] = [height, width];
  const id = file.id;

  return {
    id,
    name: sanitize(file.name, 200),
    title: humanizeTitle(file.name, category, kind),
    mimeType: file.mimeType,
    kind,
    category,
    folderPath: pathSegments.map((s) => sanitize(s, 80)).join("/"),
    thumbnailUrl: sizedThumb(file.thumbnailLink, 640) || driveThumb(id, 640),
    thumbnailFallbackUrl: driveThumb(id, 640),
    fullUrl: kind === "image" ? driveThumb(id, 2000) : "",
    previewUrl: kind === "video" ? `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview` : "",
    viewUrl: file.webViewLink || `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`,
    downloadUrl: file.webContentLink || `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`,
    width,
    height,
    durationMs: Number(meta.durationMillis) || 0,
    size: Number(file.size) || 0,
    description: sanitize(file.description, 300),
    createdTime: file.createdTime || "",
    modifiedTime: file.modifiedTime || ""
  };
}

async function mapLimit(list, limit, worker) {
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, list.length) }, async () => {
    while (next < list.length) {
      const index = next++;
      await worker(list[index], index);
    }
  });
  await Promise.all(runners);
}

/* ── Drive access ────────────────────────────────────────────── */
function mapDriveFailure(status, reason) {
  if (status === 429) return new GalleryError("drive_rate_limited", 503, reason);
  if (status === 403 && /ratelimit|quota|dailylimit/i.test(reason)) return new GalleryError("drive_rate_limited", 503, reason);
  if (status === 401 || status === 403) return new GalleryError("drive_forbidden", 500, reason);
  if (status === 404) return new GalleryError("drive_not_found", 500, reason);
  if (status >= 500) return new GalleryError("drive_unavailable", 503, reason);
  return new GalleryError("drive_error", 500, reason);
}

async function listPage(folderId, apiKey, pageToken, deadline) {
  const params = new URLSearchParams({
    q: `'${folderId}' in parents and trashed = false`,
    fields: FIELDS,
    pageSize: String(LIMITS.pageSize)
  });
  if (pageToken) params.set("pageToken", pageToken);

  const budget = Math.min(LIMITS.requestTimeoutMs, deadline - Date.now());
  if (budget <= 0) throw new GalleryError("drive_unavailable", 503, "deadline");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), budget);

  let res;
  try {
    res = await fetch(`${DRIVE_FILES_URL}?${params.toString()}`, {
      method: "GET",
      headers: { "x-goog-api-key": apiKey, accept: "application/json" },
      signal: controller.signal
    });
  } catch (err) {
    throw new GalleryError("drive_unavailable", 503, err && err.name === "AbortError" ? "timeout" : "network");
  } finally {
    clearTimeout(timer);
  }

  let body = null;
  try { body = await res.json(); } catch (_) { body = null; }

  if (!res.ok) {
    const e = body && body.error;
    const reason = sanitize((e && e.errors && e.errors[0] && e.errors[0].reason) || (e && e.status) || "", 60);
    throw mapDriveFailure(res.status, reason);
  }
  if (!body || !Array.isArray(body.files)) throw new GalleryError("drive_error", 500, "bad_payload");
  return body;
}

async function listFolder(folderId, apiKey, deadline) {
  const files = [];
  let token = "";
  for (let page = 0; page < LIMITS.maxPagesPerFolder; page++) {
    const body = await listPage(folderId, apiKey, token, deadline);
    files.push(...body.files);
    token = body.nextPageToken || "";
    if (!token) return { files, complete: true };
  }
  return { files, complete: false };
}

/* Breadth-first walk. The root must succeed; a failing sub-folder only marks the result partial. */
async function collect(rootId, apiKey, opts, deadline) {
  const limits = Object.assign({}, LIMITS, opts);
  const items = [];
  const state = { truncated: false, partial: false, skipped: 0, scanned: 0 };
  let level = [{ id: rootId, path: [], depth: 0 }];

  for (let first = true; level.length; first = false) {
    const next = [];
    await mapLimit(level, limits.concurrency, async (folder) => {
      if (Date.now() >= deadline) { state.truncated = true; return; }
      let listing;
      try {
        listing = await listFolder(folder.id, apiKey, deadline);
      } catch (err) {
        if (first) throw err;
        state.partial = true;
        return;
      }
      state.scanned++;
      if (!listing.complete) state.truncated = true;

      for (const file of listing.files) {
        if (!file || !file.id || !file.name) continue;
        if (file.mimeType === FOLDER_MIME) {
          if (!limits.recursive) continue;
          if (folder.depth >= limits.maxDepth || !ID_RE.test(file.id) ||
              state.scanned + next.length >= limits.maxFolders) { state.truncated = true; continue; }
          next.push({ id: file.id, path: folder.path.concat(file.name), depth: folder.depth + 1 });
          continue;
        }
        const kind = kindOf(file.mimeType);
        if (!kind) { state.skipped++; continue; }
        if (items.length >= limits.maxItems) { state.truncated = true; continue; }
        items.push(normalizeFile(file, folder.path, kind));
      }
    });
    level = next;
  }
  return { items, state };
}

function buildPayload(rootId, result) {
  const items = result.items.sort((a, b) =>
    (b.createdTime || "").localeCompare(a.createdTime || "") || natural(a.name, b.name));

  // Categories follow their folder order (01-, 02-, ...); "Uncategorized" always last.
  const order = new Map();
  items.forEach((it) => {
    const top = it.folderPath.split("/")[0];
    if (top && !order.has(it.category)) order.set(it.category, top);
  });
  const categories = Array.from(order.keys()).sort((a, b) => natural(order.get(a), order.get(b)));
  if (items.some((it) => it.category === "Uncategorized")) categories.push("Uncategorized");

  return {
    success: true,
    count: items.length,
    kinds: {
      image: items.filter((i) => i.kind === "image").length,
      video: items.filter((i) => i.kind === "video").length
    },
    items,
    categories,
    truncated: result.state.truncated,
    partial: result.state.partial,
    folderUrl: `https://drive.google.com/drive/folders/${rootId}`,
    fetchedAt: new Date().toISOString()
  };
}

/* ── Response helpers ────────────────────────────────────────── */
const BASE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff"
};

function ok(payload) {
  return {
    statusCode: 200,
    headers: Object.assign({}, BASE_HEADERS, {
      // Browser: short; CDN: a few minutes, then serve stale while it refreshes in the background.
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      "Netlify-CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=3600, durable"
    }),
    body: JSON.stringify(payload)
  };
}

function fail(err, isDev, secrets) {
  const code = err instanceof GalleryError ? err.code : "drive_error";
  const status = err instanceof GalleryError ? err.status : 500;
  const body = { success: false, error: { code, message: SAFE_MESSAGES[code] || SAFE_MESSAGES.drive_error } };
  if (isDev) body.debug = { reason: err.reason || "", hint: DEV_HINTS[code] || "" };

  // Log the category only: never the key, never Google's payload.
  let line = JSON.stringify({ code, status, reason: err.reason || "" });
  (secrets || []).forEach((s) => { if (s) line = line.split(s).join("[redacted]"); });
  console.error("[gallery]", line);

  const headers = Object.assign({}, BASE_HEADERS, { "Cache-Control": "no-store" });
  if (code === "method_not_allowed") headers.Allow = "GET, HEAD";
  return { statusCode: status, headers, body: JSON.stringify(body) };
}

/* ── Handler ─────────────────────────────────────────────────── */
let warm = null; // { at, key, payload }

exports.handler = async function handler(event) {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const isDev = process.env.NETLIFY_DEV === "true" || process.env.GALLERY_DEBUG === "1";
  const secrets = [apiKey];

  try {
    const method = (event && event.httpMethod) || "GET";
    if (method !== "GET" && method !== "HEAD") throw new GalleryError("method_not_allowed", 405);

    const query = (event && event.queryStringParameters) || {};
    const keys = Object.keys(query);
    if (keys.some((k) => k !== "recursive")) throw new GalleryError("bad_request", 400, "unsupported_parameter");
    if (keys.length && !/^(true|false)$/.test(String(query.recursive))) throw new GalleryError("bad_request", 400, "invalid_value");

    if (!apiKey || !folderId || !ID_RE.test(folderId)) throw new GalleryError("not_configured", 500, "config");

    // The server setting wins; otherwise the site's own config (recursive: true|false) decides.
    const recursive = process.env.GALLERY_RECURSIVE !== "false" && query.recursive !== "false";
    const cacheKey = `${folderId}|${recursive}`;

    const now = Date.now();
    if (warm && warm.key === cacheKey && now - warm.at < LIMITS.freshMs) return ok(warm.payload);

    try {
      const result = await collect(
        folderId,
        apiKey,
        { recursive },
        now + LIMITS.deadlineMs
      );
      const payload = buildPayload(folderId, result);
      if (isDev) payload.skipped = result.state.skipped;
      warm = { at: Date.now(), key: cacheKey, payload };
      return ok(payload);
    } catch (err) {
      // Drive is failing but we have an older good answer: degrade gracefully.
      if (warm && warm.key === cacheKey && Date.now() - warm.at < LIMITS.staleMs) {
        console.error("[gallery]", JSON.stringify({ code: err.code || "drive_error", served: "stale" }));
        return ok(Object.assign({}, warm.payload, { stale: true }));
      }
      throw err;
    }
  } catch (err) {
    return fail(err, isDev, secrets);
  }
};

// Exposed for unit tests only.
exports._internals = {
  LIMITS, collect, buildPayload, normalizeFile, categoryLabel, humanizeTitle, sizedThumb, kindOf,
  resetWarmCache() { warm = null; }
};

// Zero-dependency server: serves index.html + a small JSON API. Run: node server/server.js
const http = require("http"), fs = require("fs"), path = require("path");
const store = require("./store");
const PORT = process.env.PORT || 3000;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || ""; // optional CORS, e.g. your GitHub Pages URL
const INDEX = path.join(__dirname, "..", "index.html");
const RULE_IDS = ["urgency", "account", "prize", "secret", "link", "shortLink", "oddLink", "app", "fee", "job", "qr", "digitalArrest", "generic"];
const REPORT_VERDICTS = ["scam", "suspicious"];
const RE = { // allowed shape of each detail type
  p: /^[6-9]\d{9}$/,
  d: /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/[a-z0-9_-]{1,40})?$/,
  u: /^[a-z0-9._-]{2,40}@[a-z]{2,20}$/,
};

function cleanEntities(list) {
  if (!Array.isArray(list) || list.length > 10) return null;
  const seen = new Set(), out = [];
  for (const e of list) {
    if (!e || typeof e.t !== "string" || typeof e.v !== "string" || !Object.hasOwn(RE, e.t) || e.v.length > 90 || !RE[e.t].test(e.v)) return null;
    if (!seen.has(e.t + e.v)) { seen.add(e.t + e.v); out.push({ t: e.t, v: e.v }); }
  }
  return out;
}

const hits = new Map(); // simple per-IP rate limiter
function limited(ip, bucket, max) {
  const now = Date.now(), k = bucket + ip, arr = (hits.get(k) || []).filter((t) => now - t < 60000);
  arr.push(now); hits.set(k, arr);
  return arr.length > max;
}
setInterval(() => { const now = Date.now(); for (const [k, a] of hits) if (!a.some((t) => now - t < 60000)) hits.delete(k); }, 60000).unref();

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0, big = false; const chunks = [];
    req.on("data", (c) => { size += c.length; if (size > 8192) big = true; else chunks.push(c); });
    req.on("end", () => (big ? reject(Object.assign(new Error("too large"), { code: "TOO_LARGE" })) : resolve(Buffer.concat(chunks).toString("utf8"))));
    req.on("error", reject);
  });
}

function secure(res) {
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self' https://generativelanguage.googleapis.com; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (ALLOW_ORIGIN) { res.setHeader("Access-Control-Allow-Origin", ALLOW_ORIGIN); res.setHeader("Access-Control-Allow-Headers", "Content-Type"); res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS"); }
}
const json = (res, code, obj) => { res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }); res.end(JSON.stringify(obj)); };

const server = http.createServer(async (req, res) => {
  secure(res);
  const url = new URL(req.url, "http://localhost");
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  try {
    if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(fs.readFileSync(INDEX));
    }
    if (url.pathname.startsWith("/api/")) {
      if (limited(ip, "api", 60)) return json(res, 429, { error: "Too many requests. Please wait a minute." });
      if (req.method === "GET" && url.pathname === "/api/health") return json(res, 200, { ok: true });
      if (req.method === "GET" && url.pathname === "/api/stats") return json(res, 200, store.stats());
      if (req.method === "POST" && (url.pathname === "/api/related" || url.pathname === "/api/report")) {
        if (!String(req.headers["content-type"] || "").startsWith("application/json")) return json(res, 415, { error: "Send JSON" });
        let data; const raw = await readBody(req);
        try { data = JSON.parse(raw); } catch { return json(res, 400, { error: "Invalid JSON" }); }
        const entities = data && cleanEntities(data.entities);
        if (!entities) return json(res, 400, { error: "Invalid entities" });
        if (url.pathname === "/api/related") return json(res, 200, store.related(entities));
        if (limited(ip, "report", 10)) return json(res, 429, { error: "Too many reports. Please wait a minute." });
        if (!entities.length || !REPORT_VERDICTS.includes(data.verdict) || !RULE_IDS.includes(data.scamType)) return json(res, 400, { error: "Invalid report" });
        const rec = store.add({ type: data.scamType, verdict: data.verdict, entities });
        return json(res, 201, { id: rec.id, ...store.related(entities) });
      }
    }
    json(res, 404, { error: "Not found" });
  } catch (e) {
    if (e.code === "TOO_LARGE") return json(res, 413, { error: "Request too large" });
    console.error(e.message);
    json(res, 500, { error: "Server error" });
  }
});

if (require.main === module) server.listen(PORT, () => console.log("ScamGuard running on http://localhost:" + PORT));
module.exports = server;
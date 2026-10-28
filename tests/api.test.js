// Run: node --test   (starts the real server on a random port with a temporary database)
const { test, before, after } = require("node:test");
const assert = require("node:assert");
const os = require("os"), path = require("path"), fs = require("fs");
process.env.DB_FILE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "sg-")), "db.json");
const server = require("../server/server");
let base;
before(async () => { await new Promise((r) => server.listen(0, "127.0.0.1", r)); base = "http://127.0.0.1:" + server.address().port; });
after(() => server.close());
const post = (p, body, raw, type = "application/json") => fetch(base + p, { method: "POST", headers: { "Content-Type": type }, body: raw ?? JSON.stringify(body) });
const KYC = [{ t: "d", v: "examplebank-kyc-update.xyz" }];

test("security headers are set", async () => {
  const r = await fetch(base + "/api/health");
  assert.strictEqual(r.status, 200);
  assert.ok(r.headers.get("content-security-policy").includes("default-src 'self'"));
  assert.strictEqual(r.headers.get("x-content-type-options"), "nosniff");
  assert.strictEqual(r.headers.get("x-frame-options"), "DENY");
});
test("GET / serves the app", async () => {
  const r = await fetch(base + "/");
  assert.ok((await r.text()).includes("ScamGuard"));
});
test("GET /tips.html serves the quiz page", async () => {
  const r = await fetch(base + "/tips.html");
  assert.strictEqual(r.status, 200);
  assert.ok((await r.text()).includes("Safety Tips Quiz"));
});
test("path traversal and other files are not served", async () => {
  for (const p of ["/server/store.js", "/..%2Fserver%2Fstore.js", "/package.json", "/server/data.json"])
    assert.strictEqual((await fetch(base + p)).status, 404, p);
});
test("related: fake-KYC domain connects the whole simulated cluster", async () => {
  const d = await (await post("/api/related", { entities: KYC })).json();
  assert.strictEqual(d.reportCount, 7);
  assert.ok(d.linked.some((e) => e.t === "p" && e.v === "9876500012"));
  assert.ok(d.linked.some((e) => e.t === "d" && e.v === "examplebank-kyc-verify.top"));
});
test("related: unknown details match nothing", async () => {
  const d = await (await post("/api/related", { entities: [{ t: "p", v: "9000011111" }] })).json();
  assert.strictEqual(d.reportCount, 0);
});
test("bad input is rejected", async () => {
  assert.strictEqual((await post("/api/related", { entities: [{ t: "p", v: "123" }] })).status, 400);
  assert.strictEqual((await post("/api/related", { entities: [{ t: "__proto__", v: "x" }] })).status, 400);
  assert.strictEqual((await post("/api/related", { entities: "nope" })).status, 400);
  assert.strictEqual((await post("/api/related", null, "{not json")).status, 400);
  assert.strictEqual((await post("/api/related", null, "{}", "text/plain")).status, 415);
  const many = Array.from({ length: 11 }, (_, i) => ({ t: "p", v: "98765000" + String(10 + i) }));
  assert.strictEqual((await post("/api/related", { entities: many })).status, 400);
  assert.strictEqual((await post("/api/related", null, JSON.stringify({ x: "a".repeat(20000) }))).status, 413);
});
test("report: invalid type, verdict or empty entities are rejected", async () => {
  assert.strictEqual((await post("/api/report", { scamType: "hack", verdict: "scam", entities: KYC })).status, 400);
  assert.strictEqual((await post("/api/report", { scamType: "account", verdict: "safe", entities: KYC })).status, 400);
  assert.strictEqual((await post("/api/report", { scamType: "account", verdict: "scam", entities: [] })).status, 400);
});
test("report: saved, grows the cluster, never stores message text", async () => {
  const body = { scamType: "account", verdict: "scam", entities: [{ t: "d", v: "examplebank-kyc-update.xyz" }, { t: "p", v: "9000022222" }], text: "SECRET MESSAGE" };
  const r = await post("/api/report", body);
  assert.strictEqual(r.status, 201);
  assert.strictEqual((await r.json()).reportCount, 8);
  const d = await (await post("/api/related", { entities: [{ t: "p", v: "9000022222" }] })).json();
  assert.strictEqual(d.reportCount, 8);
  assert.ok(!fs.readFileSync(process.env.DB_FILE, "utf8").includes("SECRET MESSAGE"));
});
test("stats: totals, 7 daily buckets and clusters", async () => {
  const s = await (await fetch(base + "/api/stats")).json();
  assert.ok(s.total >= 28 && s.simulated === 27);
  assert.strictEqual(s.daily.length, 7);
  assert.ok(s.clusters.length >= 4 && s.clusters[0].reports >= 8);
});
test("rate limit: too many reports get 429", async () => {
  const codes = [];
  for (let i = 0; i < 12; i++) codes.push((await post("/api/report", { scamType: "job", verdict: "scam", entities: [{ t: "p", v: "90000333" + String(10 + i) }] })).status);
  assert.ok(codes.includes(429), codes.join(","));
});
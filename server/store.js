// Small file-based database for scam reports. Stores ONLY extracted details
// (phone / domain / UPI id), never the message text.
const fs = require("fs"), path = require("path");
const FILE = process.env.DB_FILE || path.join(__dirname, "data.json");
const DAY = 86400000;
// SIMULATED demo reports: [days ago, scam type, entities]. p = phone, d = domain, u = UPI id
const SEED = [
  [0.5, "account", ["d:examplebank-kyc-update.xyz", "p:9876500011"]],
  [1, "account", ["d:examplebank-kyc-update.xyz", "p:9876500012"]],
  [2, "account", ["d:examplebank-kyc-update.xyz", "u:kyc.helpdesk@okaxis"]],
  [2, "account", ["p:9876500011", "u:kyc.helpdesk@okaxis"]],
  [3, "account", ["d:examplebank-kyc-verify.top", "p:9876500012"]],
  [4, "secret", ["p:9876500012"]],
  [5, "account", ["d:examplebank-kyc-verify.top"]],
  [1, "app", ["p:9812345678", "d:bijli-bill-pay.top"]],
  [2, "app", ["p:9812345678", "u:bijli.pay@ybl"]],
  [3, "account", ["d:bijli-bill-pay.top", "p:9812300021"]],
  [6, "app", ["p:9812345678"]],
  [7, "app", ["u:bijli.pay@ybl", "p:9812300021"]],
  [0.2, "prize", ["d:bit.ly/claim-prize-now", "p:9123400077"]],
  [1, "prize", ["d:bit.ly/claim-prize-now", "u:luckydraw.claim@paytm"]],
  [2, "prize", ["p:9123400077", "u:luckydraw.claim@paytm"]],
  [3, "fee", ["u:luckydraw.claim@paytm"]],
  [5, "prize", ["d:bit.ly/claim-prize-now"]],
  [6, "prize", ["d:bit.ly/claim-prize-now", "p:9123400078"]],
  [1, "link", ["d:parcel-track.example.top", "p:9988700055"]],
  [2, "link", ["d:parcel-track.example.top"]],
  [4, "link", ["d:parcel-track.example.top", "u:parcel.fee@ibl"]],
  [1, "digitalArrest", ["p:9000000099"]],
  [2, "digitalArrest", ["p:9000000099", "u:court.fine@oksbi"]],
  [4, "digitalArrest", ["u:court.fine@oksbi"]],
  [2, "job", ["p:9000000123", "d:easy-earn-daily.click"]],
  [3, "job", ["d:easy-earn-daily.click", "u:earnnow@ybl"]],
  [5, "job", ["p:9000000123"]],
];
const key = (e) => e.t + ":" + e.v;
const parse = (s) => ({ t: s[0], v: s.slice(2) });
let db;

function save() {
  try { fs.writeFileSync(FILE + ".tmp", JSON.stringify(db)); fs.renameSync(FILE + ".tmp", FILE); }
  catch (e) { console.error("DB save failed (kept in memory):", e.message); }
}
function load() {
  try { db = JSON.parse(fs.readFileSync(FILE, "utf8")); if (!Array.isArray(db.reports)) throw new Error("bad"); }
  catch {
    db = { next: 1, reports: [] };
    for (const [d, type, ents] of SEED)
      db.reports.push({ id: db.next++, at: Date.now() - d * DAY, type, verdict: "scam", simulated: true, entities: ents.map(parse) });
    save();
  }
}

function add({ type, verdict, entities }) {
  const r = { id: db.next++, at: Date.now(), type, verdict, simulated: false, entities };
  db.reports.push(r);
  while (db.reports.length > 5000) { const i = db.reports.findIndex((x) => !x.simulated); if (i < 0) break; db.reports.splice(i, 1); }
  save();
  return r;
}

// Every report connected to the given details, directly or through shared details.
function related(query) {
  const qk = new Set(query.map(key)), seenK = new Set(qk), seenR = new Set();
  for (let grew = true; grew; ) {
    grew = false;
    for (const r of db.reports)
      if (!seenR.has(r.id) && r.entities.some((e) => seenK.has(key(e)))) {
        seenR.add(r.id); r.entities.forEach((e) => seenK.add(key(e))); grew = true;
      }
  }
  const reps = db.reports.filter((r) => seenR.has(r.id)), count = {};
  reps.forEach((r) => r.entities.forEach((e) => (count[key(e)] = (count[key(e)] || 0) + 1)));
  const row = (k) => ({ t: k[0], v: k.slice(2), n: count[k] });
  return {
    reportCount: reps.length,
    simulated: reps.filter((r) => r.simulated).length,
    matched: [...qk].filter((k) => count[k]).map(row),
    linked: Object.keys(count).filter((k) => !qk.has(k)).sort((a, b) => count[b] - count[a]).slice(0, 10).map(row),
  };
}

function components() {
  const R = db.reports, parent = R.map((_, i) => i), owner = new Map();
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  R.forEach((r, i) => r.entities.forEach((e) => { const k = key(e); if (owner.has(k)) parent[find(i)] = find(owner.get(k)); else owner.set(k, i); }));
  const groups = new Map();
  R.forEach((r, i) => { const g = find(i); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(r); });
  return [...groups.values()];
}

function stats() {
  const R = db.reports, now = Date.now(), byType = {}, daily = Array(7).fill(0);
  R.forEach((r) => {
    byType[r.type] = (byType[r.type] || 0) + 1;
    const d = Math.floor((now - r.at) / DAY);
    if (d >= 0 && d < 7) daily[6 - d]++;
  });
  const clusters = components().filter((g) => g.length >= 2).map((g) => {
    const c = {};
    g.forEach((r) => r.entities.forEach((e) => (c[key(e)] = (c[key(e)] || 0) + 1)));
    const top = Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => ({ t: k[0], v: k.slice(2), n }));
    return { reports: g.length, entities: Object.keys(c).length, top };
  }).sort((a, b) => b.reports - a.reports).slice(0, 5);
  return { total: R.length, simulated: R.filter((r) => r.simulated).length, last7: daily.reduce((a, b) => a + b, 0),
           byType: Object.entries(byType).sort((a, b) => b[1] - a[1]), daily, clusters };
}

load();
module.exports = { add, related, stats };
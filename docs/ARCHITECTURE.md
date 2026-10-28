# Architecture

```
index.html (browser)
 ├─ Rule engine: 13 weighted regex signals + negation filter + trusted-domain allowlist
 ├─ Verdict, highlights, reasons, steps (EN / HI / MR)
 ├─ Recovery Assistant (offline, 3 scenarios x 3 languages)
 ├─ Entity extraction: phone / link / UPI id
 └─ API calls (details only) ──────────────┐
                                           ▼
server/server.js (Node, no dependencies)
 ├─ Security headers, validation, body limit, rate limit
 ├─ POST /api/related   connected reports for given details
 ├─ POST /api/report    opt-in report (details only)
 ├─ GET  /api/stats     totals, daily counts, top clusters
 └─ GET  /api/health
                                           ▼
server/store.js
 └─ File-based store: reports + 27 simulated seed reports.
    Clusters = reports joined through shared phone / link / UPI id.

Optional: browser ──(user's own key, on button press)──► Gemini API
```
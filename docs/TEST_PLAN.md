# Test Plan

Run everything with `node --test`. **44 automated tests, all passing.**

| Area | File | What is checked |
|---|---|---|
| Rule engine | `tests/engine.test.js` | Scam, suspicious and safe messages (incl. Hindi, rephrased OTP request, SIM threat, job offers, look-alike bank domain, genuine bank link); edge cases (empty, spaces, HTML, long input); all 10 built-in samples |
| Recovery Assistant | `tests/engine.test.js` | 5 steps for every scenario in EN/HI/MR; money scenario starts with 1930; every scenario names 1930 or cybercrime.gov.in |
| Entity extraction | `tests/engine.test.js` | Phones (+91, spaced), links, shorteners, UPI IDs; no false matches on emails, OTPs, amounts; max 10 |
| Translations | `tests/engine.test.js` | Every language has all linked-report and recovery texts |
| API and security | `tests/api.test.js` | Security headers, path traversal, input validation, malformed JSON, wrong content type, oversized body (413), report saved and cluster grows, message text never stored, stats shape, rate limit (429) |

## Manual checks (browser)
- 10 samples show the right verdict card.
- Language toggle updates verdict, recovery steps and connected-reports text.
- Sample 1 shows 7 connected reports (server version); reporting raises it to 8.
- Layout works on a phone-sized screen.
- AI explanation works with a valid key and fails gracefully without one.

## Known gaps
Small hand-written test set; no tests on real-world messages; no formal accessibility audit.
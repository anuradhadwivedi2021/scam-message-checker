# Security & Privacy

## What is collected
- **Message text:** processed in the browser only. Never sent to our server, never stored.
- **Extracted details** (phone numbers, links, UPI IDs): sent to `/api/related` to look up reports. Saved only if the user presses "Report this scam" (stored with scam type, verdict and time).
- **Not stored:** names, IP addresses, message text, API keys. IPs are used only in memory for rate limiting.
- **Gemini (optional):** if the user presses the AI button with their own key, the message text goes to Google's Gemini API over HTTPS. The key stays in browser memory and is not saved.

## Server protections
- Strict input validation: phone `^[6-9]\d{9}$`, link and UPI formats, max 10 details, allowed scam types and verdicts only.
- Request body limit of 8 KB; JSON content type required.
- Rate limits per IP: 60 API requests and 10 reports per minute.
- Headers: Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- Only `index.html` is served as a file (no path traversal). All of this is covered by automated tests (`tests/api.test.js`).
- Output is escaped before it is shown (`esc()` and `textContent`), so message text cannot inject HTML.

## Known limitations
- No user accounts: anyone can submit a report, so reports could be spammed or poisoned. Rate limits reduce but do not remove this. A real deployment needs verification and moderation.
- The Gemini key is typed by the user in their own browser. A production version should call Gemini from the server.
- The file-based store is for a demo. Use a managed database for real use.
- HTTPS is provided by the hosting platform (Render), not by the app.
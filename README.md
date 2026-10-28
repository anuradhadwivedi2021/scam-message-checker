# ScamTrace AI (Scam Message Checker)

**Track:** Cybersecurity & Digital Safety
**Event:** PromptWars × KickToTech 2026
**Tagline:** Detect the scam. Connect the clues. Protect the next victim.

## Problem and users
Fake KYC alerts, "UPI refund" links, lottery wins, electricity cut-off threats and "digital arrest" calls reach families in India every day. Elderly and first-time smartphone users often cannot tell them from real messages, and most do not know what to do after sharing an OTP, clicking a link or paying money.

**Users:** parents and grandparents in India, and the family members who help them.

## Solution
Paste a suspicious SMS or WhatsApp message. The app:
1. Gives a verdict (**POTENTIAL SCAM**, **SUSPICIOUS** or **NO OBVIOUS WARNING SIGNS**) with a risk score.
2. Highlights the warning phrases and explains in plain language why the message looks risky.
3. Works in **English, Hindi and Marathi**.
4. **Fraud network lookup:** extracts phone numbers, links and UPI IDs and shows which simulated scam reports share them, directly or through other details.
5. **Recovery Assistant:** step-by-step actions if the user shared an OTP, clicked a link or sent money, with a one-tap call to the Cybercrime Helpline **1930**.
6. **Cyber Intelligence Dashboard** (`/dashboard.html`): totals, reports per day, scam types and top connected clusters.
7. Optional: a short AI explanation using the user's own Gemini API key.

## How it works
- A rule engine in `index.html` scores 13 scam signals (urgency, account-block threats, prizes, OTP/PIN requests, links, short links, odd links, app installs, fees, job lures, QR/payment requests, "digital arrest", impersonal greetings).
- Safety warnings such as "Do not share this OTP" are not counted as scam signals. Official bank domains are allowlisted; look-alike domains are still flagged.
- Score 6 or more = potential scam, 2 to 5 = suspicious, below 2 = no obvious warning signs.
- A small Node server (no dependencies) stores reports and links them: reports that share a phone, link or UPI ID are grouped into one cluster.
- The rule check, verdict and Recovery Assistant work fully offline in the browser. Fraud lookup and dashboard need the server.

## Run steps
Needs Node.js 18 or newer.
1. Download or clone the project and open a terminal in the project folder.
2. Run `node server/server.js`
3. Open `http://localhost:3000`
4. Choose a sample message (for example the fake KYC one) or paste your own, then press **Check message**.
5. Open `http://localhost:3000/dashboard.html` for the dashboard.
6. Optional AI: open the AI section, paste a Gemini API key, press the AI button.

If you open `index.html` directly without the server, the checker still works but the connected-reports panel is hidden.

## Run the tests
```
node --test
```
44 automated tests, 44 passing: rule engine (scam, suspicious and safe messages, Hindi message, look-alike domain, edge cases, all built-in samples), detail extraction, and the API (validation, rate limit, body limit, security headers).

## Data safety
- Message text is processed in the browser only. It is never sent to our server and never stored.
- Only extracted details (phone, link, UPI ID) are sent to the server, and saved only if the user presses "Report this scam".
- All pre-loaded reports are **simulated** and marked as such. No real person's data is used.
- The Gemini key is typed by the user, kept in memory only, and never saved or hardcoded. If the user presses the AI button, the message text goes to Google's Gemini API.
- Input is validated, size-limited and rate-limited; output is escaped. See `docs/SECURITY.md`.

## Limitations
- Rules can miss new scam styles. Real-world accuracy is unknown because the test set is small and hand-written.
- Screenshot and URL-only analysis are not built. Only pasted text is analysed.
- The fraud network uses simulated demo reports. There are no user accounts, so a real deployment would need verification and moderation against fake or spam reports.
- The file-based store is for a demo only.
- Hindi and Marathi translations should be reviewed by a native speaker.
- AI explanations can be wrong. Always confirm with your bank using the number on your card.
- This is an awareness aid, not a guarantee of safety.

## AI tools used
Claude (Anthropic) to plan, generate, test and review code and to draft translations. Gemini API (`gemini-2.5-flash`) for the optional runtime explanation.

## Originality declaration
This project was built during the hackathon with AI assistance, using fictional sample data only. I can explain the code and the prompts used.
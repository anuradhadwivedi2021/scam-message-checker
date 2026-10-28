# Scam Message Checker (ScamGuard AI)

**Track:** Cybersecurity & Digital Safety
**Event:** PromptWars × KickToTech 2026

## Problem and users
Fake KYC alerts, "UPI refund" links, lottery wins, electricity cut-off threats and "digital arrest" calls reach families every day. Elderly and first-time smartphone users often cannot tell them apart from real messages, and many lose money before anyone can help.

**Users:** parents and grandparents in India, and the family members who help them.

## Solution
Paste a suspicious SMS or WhatsApp message. The app:
1. Gives a verdict: **POTENTIAL SCAM**, **SUSPICIOUS** or **NO OBVIOUS WARNING SIGNS**, with a risk score.
2. Highlights the warning phrases inside the original message.
3. Lists in plain language why the message looks risky.
4. Gives clear next steps (do not click links, never share OTP/PIN, block the sender).
5. Offers a one-tap call button for the National Cybercrime Helpline **1930**.
6. Works in **English, Hindi and Marathi**.
7. Optional: a short AI explanation using the user's own Gemini API key.

## How it works
- A rule engine scores **13 scam signals**: urgency, account-block threats, prize/refund claims, requests for OTP/PIN/code, links, shortened links, odd links, app installs, fees, job lures, QR/payment requests, "digital arrest" threats and impersonal greetings.
- Safety warnings such as "Do not share this OTP" are not counted as scam signals (negation filter).
- Links to a small allowlist of official bank domains (HDFC, SBI, ICICI, Axis) are not flagged. Look-alike domains such as `hdfcbank.com.something.xyz` still are.
- Score 6 or more = potential scam, 2 to 5 = suspicious, below 2 = no obvious warning signs.
- Rules work fully offline. The AI layer is optional and only adds a short explanation.
- The API key is typed into the page, kept in memory only, and never saved or hardcoded.

## Run steps
1. Download or clone the project.
2. Open `index.html` in any modern browser (double-click). No install, no server.
3. Choose "Sample message" or paste your own text, then press **Check message**.
4. Optional AI: open the AI section, paste a Gemini API key, press the AI button. Needs internet.

## Run the tests
Needs Node.js 18 or newer.
```
node --test tests/engine.test.js
```
The tests load the rule engine straight from `index.html`.

## Tested
- **24 automated tests, 24 passing:** scam, suspicious and safe messages, a Hindi message, a look-alike bank domain, a rephrased OTP request, and edge cases (empty input, spaces only, HTML in the message, 2000-character input, all 10 built-in samples).
- Writing these tests found 5 bugs in the first version (a normal chat message marked suspicious, a rephrased OTP request marked safe, and others). They were fixed and the tests now pass.
- Manual checklist (browser):
  - [ ] All 10 samples show the right verdict card
  - [ ] EN / हिन्दी / मराठी toggle updates the result
  - [ ] Clear button resets the page
  - [ ] AI explanation works with a valid key and fails gracefully without one

## Data safety
- Only fictional sample messages are included.
- Nothing is stored (no localStorage, no server, no logging).
- The only data that leaves the browser is the message text sent to Google's Gemini API when the user presses the AI button with their own key.

## Limitations
- Rules can miss new scam styles. Real-world accuracy is unknown because the test set is small and hand-written.
- Only five big banks' official domains are allowlisted. Other genuine links may be marked SUSPICIOUS.
- A job offer without a link or fee is marked SUSPICIOUS, not SCAM.
- Hindi and Marathi keyword coverage is limited, and the translations should be reviewed by a native speaker.
- AI explanations can be wrong. Always confirm with your bank using the number on your card.
- This is an awareness aid, not a guarantee of safety.

## AI tools used
Claude (Anthropic) to plan, generate, test and review the code and to draft translations. Gemini API (`gemini-2.5-flash`) for the optional runtime explanation.

## Originality declaration
This project was built during the hackathon with AI assistance, using fictional sample data only. I can explain the code and the prompts used.
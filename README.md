# Scam Message Checker

**Track:** Cybersecurity & Digital Safety
**Event:** PromptWars x KickToTech 2026

## Problem and users
Fake KYC alerts, "UPI refund" links, lottery wins and fake job offers reach families every day, and elderly or first-time smartphone users often cannot tell them apart from real messages. Many lose money before anyone can help.

**Users:** parents and grandparents, and the family members who help them.

## Solution
Paste a suspicious SMS or WhatsApp message. The app:
1. Gives a verdict: **SCAM**, **SUSPICIOUS** or **LOOKS SAFE**, with a risk score.
2. Highlights the warning words inside the original message.
3. Lists in plain language why it looks risky.
4. Gives clear next steps (do not click, never share OTP, call 1930, report at cybercrime.gov.in, call the bank on the number printed on the card).
5. Works in **English, Hindi and Marathi**.
6. Optional: an AI explanation using the user's own Gemini API key.

## How it works
- A rule engine scores 12 scam signals (urgency, account-block threats, prize or refund claims, requests for OTP/PIN, links, shortened or odd links, app installs, fees, job lures, QR/payment requests, impersonal greetings).
- Safety warnings such as "Do not share this OTP" are not counted as scam signals.
- Rules work fully offline. The AI layer is optional and only adds a short explanation.
- The API key is typed into the page, kept in memory only, and never saved or hardcoded.

## Run steps
1. Download `index.html`.
2. Open it in any modern browser (double-click). No install, no server.
3. Use "Try a sample message" or paste your own text, then press **Check message**.
4. Optional AI: open "AI explanation", paste a Gemini API key, press **Explain with AI**. Needs internet.

## Data safety
- Only fictional sample messages are included. Nothing is stored or sent anywhere, except the message text sent to Gemini when the user presses the AI button with their own key.

## Tested
Rule engine run on the 10 built-in fictional samples (6 scam, 2 suspicious, 2 genuine): **10 of 10 matched the expected verdict**. Edge cases checked: empty input, spaces only, link-only message, a normal chat message, and a Hindi message.

Manual checklist still to be ticked in the browser:
- [ ] All 10 samples show the right verdict card
- [ ] Language toggle (EN / हिन्दी / मराठी) updates the result
- [ ] Clear button resets the page
- [ ] AI explanation works with a valid key, and fails gracefully without one

## Limitations
- Rules can miss new scam styles, and a genuine message with a link can be marked SUSPICIOUS.
- The sample set is small (10 messages), so accuracy on real-world messages is unknown.
- Hindi and Marathi detection keywords are limited; Hindi and Marathi UI text should be reviewed by a native speaker.
- AI explanations can be wrong. The app always tells users to confirm with their bank.
- It is an awareness aid, not a guarantee of safety.

## AI tools used
Claude (Anthropic) to plan, generate and review the code and to draft translations; Gemini API for the optional runtime explanation.

## Originality declaration
This project was built during the hackathon with AI assistance, using fictional sample data only. I can explain the code and the prompts used.

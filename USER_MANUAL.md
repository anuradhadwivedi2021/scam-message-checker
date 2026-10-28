# ScamGuard AI (Scam Message Checker) – User Manual

**Track:** Cybersecurity & Digital Safety · PromptWars × KickToTech 2026
**Live demo:** https://scam-message-checker.onrender.com (free hosting, first load can take up to a minute)

## 1. Open the application
**Online:** open the live demo link above.

**Locally** (needs Node.js 18 or newer):
1. Open a terminal in the project folder.
2. Run `node server/server.js`
3. Open `http://localhost:3000`

If you open `index.html` directly without the server, the message checker still works, but the "connected reports" panel is hidden.

## 2. Check a message
1. Choose a sample message from the dropdown, or paste a suspicious SMS or WhatsApp message (up to 2000 characters).
2. Press **Check message**.
3. Read the result:
   - **Verdict:** POTENTIAL SCAM, SUSPICIOUS, or NO OBVIOUS WARNING SIGNS, with a risk meter.
   - **Highlighted message:** the risky phrases are marked.
   - **Warning signs:** a plain-language reason for each flag.
   - **What to do:** step-by-step safety advice.

## 3. Language and text size
- Switch between **English, Hindi and Marathi**. The verdict, advice and recovery steps change too.
- Press **A+** for larger text.

## 4. Connected reports (fraud network lookup)
The app picks out phone numbers, links and UPI IDs from the message and shows which earlier reports share them. All pre-loaded reports are **simulated**.
- Press **Report this scam** to add only those details (never the message text) to the list.

## 5. Recovery Assistant ("I already clicked / paid")
Pick your situation:
- I shared an OTP or PIN
- I clicked a link or installed an app
- I sent money

Follow the five steps shown. Press **Call Cybercrime Helpline (1930)** to call at once. You can also report a scam number or link on **Sanchar Saathi (Chakshu)**.

## 6. Share and copy
- **Share with family:** opens WhatsApp with a ready message so a trusted person can help check.
- **Copy result:** copies the verdict, reasons, steps and message, useful when reporting to the bank or police.

## 7. Cyber Intelligence Dashboard
Open `/dashboard.html` (needs the server). It shows total reports, reports per day, scam types, and the biggest connected clusters.

## 8. Scam Library
Open `/scams.html`. It explains 7 common India scams (fake KYC, UPI refund, digital arrest, lottery, job lure, electricity bill, fake APK) with warning signs, in English, Hindi and Marathi.

## 9. Optional AI explanation
Open the AI section, paste your own Gemini API key, and press the AI button for a short explanation. The key stays in your browser memory only and is never saved. The message text goes to Google's Gemini API only when you press this button.

## 10. Privacy and safety
- The message text is checked in your browser. It is never sent to our server or stored.
- Only extracted details (phone, link, UPI ID) are sent for lookup, and saved only if you press **Report this scam**.
- Never share OTPs, PINs, CVVs or passwords with anyone.

**Important:** ScamGuard AI is an awareness aid, not a guarantee. Rules can miss new scam styles. Always verify suspicious messages with your bank using the number on your card. For suspected financial cybercrime in India, call **1930**.

## Run the tests
`node --test` runs 44 automated tests (rule engine, detail extraction, API security). All 44 pass.

# Software Requirements Specification: ScamGuard AI

## Users
Senior citizens, non-English speakers and their family members in India.

## Functional requirements
- **FR-1** Interface and results in English, Hindi and Marathi.
- **FR-2** Offline rule engine with 13 scam signals and a verdict (scam / suspicious / no obvious warning signs).
- **FR-3** Highlight warning phrases inside the message.
- **FR-4** Negation filter so genuine warnings ("Do not share your OTP") are not flagged.
- **FR-5** Recovery Assistant for "shared OTP/PIN", "clicked link or installed app" and "sent money", with a one-tap 1930 call button.
- **FR-6** Extract phone numbers, links and UPI IDs and show connected earlier reports.
- **FR-7** Opt-in "Report this scam" that saves only the extracted details.
- **FR-8** Optional Gemini explanation using the user's own key.
- **FR-9** Scan history kept only in the user's browser, with long digit strings masked; search, filter, delete, clear and CSV export.
- **FR-10** Safety Tips quiz (5 questions, explanations, score) in English, Hindi and Marathi.
- **FR-11** High contrast and Senior Mode settings saved in the browser.
- **FR-12** Recovery Assistant also covers "shared Aadhaar/PAN/documents" and "digital arrest call".
- **FR-13** Share with family by WhatsApp or SMS.

## Non-functional requirements
- **NFR-1 Privacy:** message text is never sent to our server or stored.
- **NFR-2 Security:** input validation, request limits, rate limits and security headers (tested).
- **NFR-3 Usability (design goals, not formally audited):** large readable text, 44 px or larger touch targets, visible keyboard focus, reduced-motion support, mobile-friendly layout.

## Out of scope (future work)
Screenshot (image) analysis, URL content scanning, verified or moderated reporting, user accounts.
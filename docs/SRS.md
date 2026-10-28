# Software Requirements Specification (SRS)
## Project: ScamGuard AI (PromptWars 2026)

### 1. Introduction
ScamGuard AI is a client-side digital scam prevention assistant tailored for Indian users, particularly senior citizens and non-English speakers, to evaluate suspicious SMS and WhatsApp messages in English, Hindi, or Marathi.

### 2. Core User Stories
* **US-1 (Senior Citizen):** "As a senior citizen, I want to paste suspicious SMS messages and view highlighted warning words in Hindi/Marathi so that I don't fall for fake bank account block traps."
* **US-2 (Victim in Panic):** "As a user who accidentally shared money or OTP, I want an instant 1-tap call button to 1930 Cybercrime Helpline so that my funds can be frozen during the Golden Hour."

### 3. Functional Requirements
* **FR-1:** Multilingual interface switching across English, Hindi, and Marathi.
* **FR-2:** Offline heuristic pattern matching against 13 scam signals.
* **FR-3:** Range-merging string highlight renderer for detected scam terms.
* **FR-4:** Rule negation filter to prevent false-positives on legitimate bank security alerts.
* **FR-5:** Emergency triage section with direct `1930` helpline dialer.
* **FR-6:** Optional Gemini AI REST API integration using ephemeral client-side keys.

### 4. Non-Functional & Security Requirements
* **NFR-1 (Privacy):** Ephemeral in-memory execution. No data saved to `localStorage` or remote servers.
* **NFR-2 (Performance):** Heuristic analysis completed in under 10ms.
* **NFR-3 (Accessibility):** Compliant with WCAG AAA contrast standards; minimum touch targets of 44px.
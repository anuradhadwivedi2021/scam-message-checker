# Test Plan & Traceability Matrix
## ScamGuard AI

### Test Matrix
| ID | Category | Scenario | Expected Verdict | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Scam | Bank KYC Expired with Link | Potential Scam | PASS |
| **TC-02** | Scam | Lucky Draw Prize with Advance Fee | Potential Scam | PASS |
| **TC-03** | Scam | UPI Refund with QR PIN Trap | Potential Scam | PASS |
| **TC-04** | Scam | Electricity Bill Cutoff with APK | Potential Scam | PASS |
| **TC-05** | Scam | Digital Arrest CBI Threat | Potential Scam | PASS |
| **TC-06** | Scam | Card Blocked OTP Request | Potential Scam | PASS |
| **TC-07** | Suspicious | Undelivered Parcel Link | Suspicious | PASS |
| **TC-08** | Suspicious | Free Insurance Review Link | Suspicious | PASS |
| **TC-09** | Safe | Legitimate Bank Debit Alert | No Obvious Warning Signs | PASS |
| **TC-10** | Safe | Legitimate OTP Security Warning | No Obvious Warning Signs | PASS |
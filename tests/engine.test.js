// Run: node --test tests/engine.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// index.html se rule engine nikaal ke test karta hai (koi copy-paste nahi)
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const a = html.indexOf('const SAMPLES');
const b = html.indexOf('const $ = id');
const { analyze, SAMPLES } = new Function(html.slice(a, b) + '; return { analyze, SAMPLES };')();

// [expected verdict, name, message]
const cases = [
  // ---- SCAM ----
  ['scam', 'KYC expired + odd link', 'Dear customer, your Example Bank KYC has expired. Your account will be blocked within 24 hours. Update now: http://examplebank-kyc-update.xyz/login'],
  ['scam', 'Lucky draw + fee + short link', 'Congratulations! You have won Rs 25,00,000 in the Lucky Draw. Pay Rs 4,999 processing fee. Click bit.ly/claim-prize-now'],
  ['scam', 'UPI refund QR trap', 'Your UPI refund of Rs 1,850 is pending. Scan this QR code and enter your UPI PIN to receive the money.'],
  ['scam', 'Digital arrest CBI', 'URGENT NOTICE: You are under Digital Arrest by CBI. Stay on Skype video call or police will reach your home.'],
  ['scam', 'Fake bank manager asks OTP', 'Hi, I am your bank manager. Your debit card is blocked. Tell me the OTP you just received.'],
  ['scam', 'Hindi KYC', 'प्रिय ग्राहक, आपका बैंक खाता बंद हो जाएगा। KYC अपडेट करें तुरंत: http://sbi-kyc.xyz'],
  ['scam', 'SIM deactivation threat', 'TRAI: Your SIM will be deactivated in 2 hours. Call 9876543210 immediately'],
  ['scam', 'Fake OTP request (rephrased)', 'Sir I am from SBI, please read me the code sent to your phone'],
  ['suspicious', 'Job offer (no fee/link)', 'Work from home! Earn Rs 5000 daily. Join our WhatsApp group now'],
  ['scam', 'Job offer + registration fee', 'Earn Rs 5000 daily from home. Pay Rs 500 registration fee to join our Telegram group'],
  ['scam', 'Lookalike bank domain', 'Update KYC now at https://hdfcbank.com.verify-login.xyz immediately'],
  ['scam', 'APK install', 'Your electricity will be disconnected tonight. Install QuickSupport app and call 9812345678'],

  // ---- SUSPICIOUS ----
  ['suspicious', 'Parcel link', 'Your parcel could not be delivered. Update address: http://parcel-track.example.top/confirm'],
  ['suspicious', 'Free insurance review', 'You have been selected for a free insurance review. Details: www.insure-offer.example.in'],

  // ---- SAFE ----
  ['safe', 'Bank debit alert', 'Example Bank: Rs 450.00 debited from A/c XX1234 at Metro Store via UPI. If not done by you, call the number on the back of your card.'],
  ['safe', 'OTP with warning', '482913 is your OTP for login to Example Shop. Do not share this OTP with anyone. Valid for 10 minutes.'],
  ['safe', 'Normal chat', 'Hi, are you coming for dinner tonight at 8?'],
  ['safe', 'Single word', 'hi'],
  ['safe', 'Genuine bank statement link', 'HDFC Bank: Your statement is ready. View at https://www.hdfcbank.com/statement'],
];

for (const [expected, name, text] of cases) {
  test(`${expected.toUpperCase()}: ${name}`, () => {
    assert.strictEqual(analyze(text).verdict, expected);
  });
}

// ---- Edge cases ----
test('empty string does not crash', () => {
  assert.strictEqual(analyze('').verdict, 'safe');
});
test('only spaces does not crash', () => {
  assert.strictEqual(analyze('     ').verdict, 'safe');
});
test('2000-char input is fast (<100ms)', () => {
  const t0 = Date.now();
  analyze('urgent '.repeat(285));
  assert.ok(Date.now() - t0 < 100);
});
test('HTML in message is just text for the engine', () => {
  assert.doesNotThrow(() => analyze('<script>alert(1)</script> click http://x.xyz'));
});
test('all 10 built-in samples run without error', () => {
  assert.strictEqual(SAMPLES.length, 10);
  SAMPLES.forEach(s => assert.doesNotThrow(() => analyze(s)));
});
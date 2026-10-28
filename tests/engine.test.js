// Run: node --test tests/engine.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// index.html se rule engine nikaal ke test karta hai (koi copy-paste nahi)
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const a = html.indexOf('const T = {');
const b = html.indexOf('const $ = id');
const { analyze, SAMPLES, T, extractEntities } = new Function(html.slice(a, b) + '; return { analyze, SAMPLES, T, extractEntities };')();

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
  ['suspicious', 'Unsolicited job offer (payment asked later on the call)', 'Dear Candidate, you have been shortlisted for a work from home job at Example Technologies. Reference: HRL. Call HR on 9876543210 to confirm your offer.'],
  ['suspicious', 'Parcel link', 'Your parcel could not be delivered. Update address: http://parcel-track.example.top/confirm'],
  ['suspicious', 'Free insurance review', 'You have been selected for a free insurance review. Details: www.insure-offer.example.in'],

  // ---- SAFE ----
  ['safe', 'Bank debit alert', 'Example Bank: Rs 450.00 debited from A/c XX1234 at Metro Store via UPI. If not done by you, call the number on the back of your card.'],
  ['safe', 'OTP with warning', '482913 is your OTP for login to Example Shop. Do not share this OTP with anyone. Valid for 10 minutes.'],
  ['safe', 'Genuine interview schedule', 'Your interview is scheduled for tomorrow 10 AM at our Pune office. Please bring a copy of your resume.'],
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

// ---- Recovery Assistant content (EN / HI / MR) ----
const LANGS = ['en', 'hi', 'mr'];
const TYPES = ['otp', 'link', 'money', 'docs', 'arrest'];

test('recovery: every language has labels, note and call text', () => {
  for (const l of LANGS) {
    for (const k of ['recTitle', 'recDesc', 'recOtp', 'recLink', 'recMoney', 'recDocs', 'recArrest', 'recCall', 'recNote', 'smsBtn', 'histTitle', 'histEmpty', 'histExport', 'setTitle', 'setContrast', 'setSenior']) {
      assert.ok(T[l][k] && T[l][k].length > 3, `${l}.${k} missing`);
    }
  }
});
test('recovery: 5 non-empty steps for every type in every language', () => {
  for (const l of LANGS) for (const t of TYPES) {
    const steps = T[l].recSteps[t];
    assert.strictEqual(steps.length, 5, `${l}.${t}`);
    steps.forEach(x => assert.ok(x.trim().length > 10 && !x.includes('undefined')));
  }
});
test('recovery: "sent money" always starts with calling 1930', () => {
  for (const l of LANGS) assert.ok(T[l].recSteps.money[0].includes('1930'), l);
});
test('recovery: every type mentions cybercrime.gov.in or 1930', () => {
  for (const l of LANGS) for (const t of TYPES) {
    assert.ok(T[l].recSteps[t].join(' ').match(/1930|cybercrime\.gov\.in/), `${l}.${t}`);
  }
});

// ---- Entity extraction (what gets sent to the server) ----
const has = (list, t, v) => list.some(e => e.t === t && e.v === v);
test('extract: phone from sample, link from sample, shortener keeps its path', () => {
  assert.ok(has(extractEntities(SAMPLES[3]), 'p', '9812345678'));
  assert.ok(has(extractEntities(SAMPLES[0]), 'd', 'examplebank-kyc-update.xyz'));
  assert.ok(has(extractEntities(SAMPLES[1]), 'd', 'bit.ly/claim-prize-now'));
  assert.ok(has(extractEntities(SAMPLES[7]), 'd', 'insure-offer.example.in'));
});
test('extract: +91 and spaced phone formats give the same number', () => {
  assert.ok(has(extractEntities('call +91 98123 45678 now'), 'p', '9812345678'));
  assert.ok(has(extractEntities('call 09812345678'), 'p', '9812345678'));
});
test('extract: UPI id found, and not mistaken for a link', () => {
  const r = extractEntities('Pay to shop.link@ybl. Thanks');
  assert.ok(has(r, 'u', 'shop.link@ybl'));
  assert.ok(!r.some(e => e.t === 'd'));
});
test('extract: normal email, OTP, amounts and plain text give nothing', () => {
  assert.deepStrictEqual(extractEntities('mail me at a@gmail.com'), []);
  assert.deepStrictEqual(extractEntities('482913 is your OTP. Rs 25,00,000 and 4,999'), []);
  assert.deepStrictEqual(extractEntities('hi, are you coming for dinner?'), []);
});
test('extract: at most 10 entities', () => {
  const many = Array.from({ length: 15 }, (_, i) => `98765000${String(i).padStart(2, '0')}`).join(' ');
  assert.strictEqual(extractEntities(many).length, 10);
});
test('linked-reports text exists in every language', () => {
  for (const l of ['en', 'hi', 'mr']) for (const k of ['linkTitle', 'linkNote', 'linkNone', 'linkSummary', 'linkSeen', 'linkAlso', 'reportBtn', 'reportDone', 'reportErr'])
    assert.ok(T[l][k] && T[l][k].length > 3, `${l}.${k}`);
  for (const l of ['en', 'hi', 'mr']) assert.ok(T[l].linkSummary.includes('{n}') && T[l].linkSeen.includes('{n}'));
});
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import puppeteer from "puppeteer-core";

const baseUrl = process.env.EXPERIENCE_URL || "http://127.0.0.1:5173";
assert.ok(new URL(baseUrl).hostname === "127.0.0.1" || new URL(baseUrl).hostname === "localhost", "Fixtures are restricted to a local development server");
if (process.env.CAPTURE_EXPERIENCE) await fs.mkdir("previews/rework", { recursive: true });
const browser = await puppeteer.launch({
  executablePath: process.env.BROWSER_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const fixture = {
  role: "participant",
  public: {
    site: { name: "FATU OPEN HOUSE 2026", theme: "ตะลุยแดนมังกร", faculty: "คณะศิลปกรรมศาสตร์", dateLabel: "Open House 2026" },
    venues: {
      theater: { name: "โรงละคร", mapUrl: "https://www.google.com/maps/search/?api=1&query=old-theater", visualIdentityKey: "azure-dragon", visualLabel: "มังกรฟ้า", isPublished: true },
      faculty: { name: "ตึกคณะ", visualIdentityKey: "white-tiger", visualLabel: "พยัคฆ์ขาว", isPublished: true },
      weaving: { name: "โรงทอ", visualIdentityKey: "nine-tailed-fox", visualLabel: "จิ้งจอก 9 หาง", isPublished: true },
      sc3: { name: "ตึก SC3", visualIdentityKey: "red-phoenix", visualLabel: "หงส์แดง", isPublished: true },
    },
    activities: {
      morning: { slug: "morning", title: "เวิร์กช็อปพู่กัน", venueId: "theater", startAt: "2026-10-04T09:00:00+07:00", endAt: "2026-10-04T11:00:00+07:00", isPublished: true, pointsEnabled: true, pointsAwarded: 20 },
      afternoon: { slug: "afternoon", title: "การแสดงมังกร", venueId: "faculty", startAt: "2026-10-04T13:00:00+07:00", endAt: "2026-10-04T14:00:00+07:00", isPublished: true },
      allDay: { slug: "all-day", title: "นิทรรศการตลอดวัน", venueId: "theater", isPublished: true, shortDescription: "แวะร่วมสนุกได้ตลอดงาน" },
    },
    prizes: {
      giant: { name: "ตุ๊กตายักษ์", stock: 1, pointsRequired: 45, isPublished: true },
      small: { name: "ตุ๊กตาเล็ก", stock: 5, pointsRequired: 25, isPublished: true },
      hairpin: { name: "ปิ่นปักผม", stock: 8, pointsRequired: 15, isPublished: true },
      charm: { name: "พู่ห้อยโทรศัพท์", stock: 12, pointsRequired: 10, isPublished: true },
      fan: { name: "พัดมือ", stock: 20, pointsRequired: 10, isPublished: true },
      envelope: { name: "ซองแดง (ส่วนลดอาหาร)", stock: 0, pointsRequired: 0, isPublished: true },
    },
  },
};
const failures = [];
let passed = 0;
async function check(name, run) {
  if (process.env.EXPERIENCE_FILTER && !name.includes(process.env.EXPERIENCE_FILTER)) return;
  try { await run(); passed++; console.log(`PASS ${name}`); }
  catch (error) { failures.push(`${name}: ${error.message}`); console.error(`FAIL ${failures.at(-1)}\n${error.stack}`); }
}
try {
  const page = await browser.newPage();
  const runtimeErrors = [];
  page.on("pageerror", error => runtimeErrors.push(error.message));
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument((data) => {
    window.__fatuTest = data;
    window.__fatuTest.profile = { uid: "fixture-participant", username: "fixture", displayName: "ผู้ทดสอบ", role: data.role, pointTotal: 20, transactions: [], visits: {} };
    window.__fatuTest.user = { uid: "fixture-participant", email: "fixture@example.test", getIdToken: async () => "local-fixture-token" };
    window.__fatuTest.refreshProfile = async () => {};
    sessionStorage.setItem("fatu_story_intro_seen", "1");
    window.__cameraStreams = [];
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", { configurable: true, value: async () => {
      if (window.__fatuTest.denyCamera) throw new DOMException("Permission denied", "NotAllowedError");
      if (window.__fatuTest.cameraDelay) await new Promise(resolve => setTimeout(resolve, window.__fatuTest.cameraDelay));
      const canvas = document.createElement("canvas"); canvas.width = 640; canvas.height = 480;
      const context = canvas.getContext("2d");
      const timer = setInterval(() => { context.fillStyle = "#256b74"; context.fillRect(0, 0, 640, 480); }, 50);
      const stream = canvas.captureStream(20);
      window.__cameraStreams.push(stream);
      stream.getTracks()[0].addEventListener("ended", () => clearInterval(timer));
      return stream;
    }});
  }, fixture);
  await page.setRequestInterception(true);
  let drawn = false;
  let drawCalls = 0;
  let blockDecorativeMedia = false;
  let duplicateCheckin = false;
  let checkinLocationName = "โรงละคร";
  const prize = { id: "fixture-prize", title: "พัดมังกรทดสอบ", description: "รางวัลจากชุดทดสอบ", tier: "rare", voucherCode: "FATU26LUCKY:LOCAL-TEST", redeemed: false };
  let loseDrawResponse = false;
  page.on("request", async (request) => {
    const url = new URL(request.url());
    if (blockDecorativeMedia && url.origin === new URL(baseUrl).origin && /^\/(assets|images)\//.test(url.pathname)) {
      return request.abort();
    }
    if (url.origin === new URL(baseUrl).origin && url.pathname === "/src/services/auth.ts") {
      return request.respond({ contentType: "application/javascript", body: `export const staffRoles=["admin","editor","staff","staff_pending","viewer"]; export async function getStaffRole(){return staffRoles.includes(window.__fatuTest.role)?window.__fatuTest.role:null;} export function subscribeToAuthState(cb){let active=true;queueMicrotask(()=>{if(active)cb(window.__fatuTest.user);});return()=>{active=false;};} export async function signOutAdmin(){} export async function signInAdmin(){return {user:window.__fatuTest.user};} export async function usernameLogin(){return {user:window.__fatuTest.user,profile:window.__fatuTest.profile};} export function getAdminAuthErrorMessage(){return "เข้าสู่ระบบไม่สำเร็จ";} export async function requestPasswordReset(){return "ตรวจสอบอีเมล";}` });
    }
    if (url.origin === new URL(baseUrl).origin && url.pathname === "/src/contexts/AuthContext.tsx") {
      return request.respond({ contentType: "application/javascript", body: `export function AuthProvider({children}) { return children; } export function useAuth() { const f = window.__fatuTest; return { firebaseUser:f.user, profile:f.profile, role:f.role, loading:false, isStaff:["admin","editor","staff"].includes(f.role), isAdmin:f.role==="admin", isPendingStaff:f.role==="staff_pending", refreshProfile:f.refreshProfile, logout:async()=>{}, login:async()=>f.profile }; }` });
    }
    if (url.origin === new URL(baseUrl).origin && url.pathname === "/src/services/realtime.ts") {
      return request.respond({ contentType: "application/javascript", body: `export const realtimePaths = {public:Object.fromEntries(["site","venues","activities","prizes","media","announcements","faq","settings","registrationConfig"].map(k=>[k,"public/"+k])),admin:{roles:"admin/roles"}}; export async function readRealtime(path) { if(path.startsWith("admin/roles"))return window.__fatuTest.role; return path.split("/").reduce((o,k)=>o?.[k],window.__fatuTest) || null; } export function subscribeRealtime(path,cb) { let active=true;queueMicrotask(async()=>{if(active)cb(await readRealtime(path));});return()=>{active=false;}; } export async function setRealtime() {} export async function updateRealtime() {} export async function pushRealtime() { return "fixture"; }` });
    }
    if (url.origin === new URL(baseUrl).origin && url.pathname === "/api/lucky-draw") {
      const body = JSON.parse(request.postData() || "{}");
      if (body.action === "draw") {
        drawn = true; drawCalls++;
        if (loseDrawResponse) return request.respond({ status: 502, contentType: "application/json", body: JSON.stringify({ error: "การตอบกลับขาดหายระหว่างเปิดหีบ" }) });
      }
      return request.respond({ contentType: "application/json", body: JSON.stringify(body.action === "draw" ? { ok: true, prize: { id: prize.id, name: prize.title, description: prize.description, rarity: prize.tier }, voucher: { voucherCode: prize.voucherCode, prizeId: prize.id, prizeName: prize.title, description: prize.description, rarity: prize.tier, status: "pending" } } : { ok: true, status: { eligible: true, claimed: drawn, prize: drawn ? prize : null, conditions: { hasVisitedVenue: true, hasCompletedActivity: true, visitedVenuesCount: 1, completedActivitiesCount: 1 }, catalogCount: 1 } }) });
    }
    if (url.origin === new URL(baseUrl).origin && url.pathname === "/api/admin") {
      return request.respond({ contentType: "application/json", body: JSON.stringify({ participants: [], applications: [], roles: {}, entries: [] }) });
    }
    if (url.origin === new URL(baseUrl).origin && url.pathname === "/api/checkin") {
      return request.respond({ contentType: "application/json", body: JSON.stringify({ ok: true, activityTitle: "เวิร์กช็อปพู่กัน", locationName: checkinLocationName, pointsAdded: duplicateCheckin ? 0 : 20, pointTotal: 40, duplicate: duplicateCheckin, message: duplicateCheckin ? "เข้าร่วมกิจกรรมนี้แล้ว" : "เช็กอินสำเร็จ" }) });
    }
    if (url.origin === new URL(baseUrl).origin && url.pathname === "/api/survey") {
      return request.respond({ contentType: "application/json", body: JSON.stringify({ ok: true, completed: false, status: { completed: false } }) });
    }
    return request.continue();
  });
  await check("camera preview contains a playing stream", async () => {
    await page.goto(`${baseUrl}/scan`, { waitUntil: "networkidle2" });
    await page.waitForFunction(() => { const v = document.querySelector("video"); return v && v.srcObject && v.videoWidth > 0 && !v.paused; }, { timeout: 3000 });
  });
  await check("camera streams stop when leaving scan", async () => {
    await page.click('a[href="/rewards"]');
    await page.waitForFunction(() => location.pathname === "/rewards");
    await page.waitForFunction(() => window.__cameraStreams.every(s => s.getTracks().every(t => t.readyState === "ended")), { timeout: 2000 });
    assert.equal(await page.evaluate(() => window.__cameraStreams.some(s => s.getTracks().some(t => t.readyState === "live"))), false);
  });
  await check("switching cameras replaces the stream and permission denial remains usable", async () => {
    await page.goto(`${baseUrl}/scan`, { waitUntil: "networkidle2" });
    await page.waitForFunction(() => document.querySelector("video")?.videoWidth > 0);
    await page.click('button[title="สลับกล้องหน้า/หลัง"]');
    await page.waitForFunction(() => {
      const streams = window.__cameraStreams; const latest = streams[streams.length - 1];
      const video = document.querySelector("video");
      const restart = [...document.querySelectorAll("button")].find(button => button.textContent.includes("รีสตาร์ตกล้อง"));
      return video?.srcObject === latest && !video.paused && video.style.opacity === "1"
        && latest.getVideoTracks()[0].readyState === "live" && restart && !restart.disabled;
    });
    assert.equal(await page.evaluate(() => window.__cameraStreams.filter(s => s.getTracks().some(t => t.readyState === "live")).length), 1);
    await page.evaluate(() => { window.__fatuTest.denyCamera = true; });
    await page.locator('button::-p-text(รีสตาร์ตกล้อง)').click();
    await page.waitForFunction(() => document.body.innerText.includes("เปิดกล้องไม่ได้"), { timeout: 3000 });
    assert.ok(await page.$('button::-p-text(อัปโหลดรูป QR)'));
    assert.equal(await page.evaluate(() => window.__cameraStreams.some(s => s.getTracks().some(t => t.readyState === "live"))), false);
  });
  await check("a camera permission response after unmount cannot leak a live stream", async () => {
    const slowCamera = await page.evaluateOnNewDocument(() => { window.__fatuTest.cameraDelay = 700; });
    try {
      await page.goto(`${baseUrl}/scan`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(".scan-page");
      await page.click('a[href="/rewards"]');
      await page.waitForFunction(() => location.pathname === "/rewards");
      await page.waitForFunction(() => window.__cameraStreams.length > 0 && window.__cameraStreams.every(s => s.getTracks().every(t => t.readyState === "ended")), { timeout: 2500 });
    } finally { await page.removeScriptToEvaluateOnNewDocument(slowCamera.identifier); }
  });
  for (const route of ["/scan", "/survey", "/lucky-draw"]) {
    await check(`one bottom navigation on ${route}`, async () => {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle2" });
      assert.equal(await page.$$eval(".bottom-nav", nodes => nodes.length), 1);
    });
  }
  await check("schedule includes activities without fixed times", async () => {
    await page.goto(`${baseUrl}/schedule`, { waitUntil: "networkidle2" });
    assert.ok((await page.$eval("body", node => node.innerText)).includes("นิทรรศการตลอดวัน"));
  });
  await check("schedule filters, search and saved missions", async () => {
    await page.select('select[aria-label="เลือกสถานที่"]', "faculty");
    await page.waitForFunction(() => document.querySelectorAll(".schedule-activity").length === 1);
    assert.equal(await page.$$(".schedule-activity").then(nodes => nodes.length), 1);
    assert.ok((await page.$eval(".schedule-timeline", node => node.innerText)).includes("การแสดงมังกร"));
    await page.select('select[aria-label="เลือกสถานที่"]', "all");
    await page.select('select[aria-label="เลือกช่วงเวลา"]', "morning");
    await page.waitForFunction(() => document.querySelectorAll(".schedule-activity").length === 1 && document.querySelector(".schedule-timeline")?.textContent.includes("เวิร์กช็อปพู่กัน"));
    assert.equal(await page.$$(".schedule-activity").then(nodes => nodes.length), 1);
    await page.$eval('button[aria-label="บันทึก เวิร์กช็อปพู่กัน"]', button => button.scrollIntoView({ block: "center", behavior: "instant" }));
    await page.locator('button[aria-label="บันทึก เวิร์กช็อปพู่กัน"]').click();
    await page.select('select[aria-label="เลือกช่วงเวลา"]', "all");
    await page.$eval(".saved-filter", button => button.scrollIntoView({ block: "center", behavior: "instant" }));
    await page.locator(".saved-filter").click();
    await page.waitForFunction(() => document.querySelector(".saved-filter")?.getAttribute("aria-pressed") === "true");
    assert.equal(await page.$$(".schedule-activity").then(nodes => nodes.length), 1);
    await page.reload({ waitUntil: "networkidle2" });
    assert.equal(await page.$eval('button[aria-label="เลิกบันทึก เวิร์กช็อปพู่กัน"]', node => node.getAttribute("aria-pressed")), "true");
    await page.type('input[aria-label="ค้นหากิจกรรม"]', "ไม่มีกิจกรรมนี้");
    await page.waitForSelector(".schedule-empty");
    assert.ok((await page.$eval(".schedule-empty", node => node.innerText)).includes("ยังไม่พบภารกิจ"));
  });
  await check("Bangkok schedule stays correct in another timezone", async () => {
    await page.emulateTimezone("Europe/London");
    await page.goto(`${baseUrl}/schedule`, { waitUntil: "networkidle2" });
    assert.ok((await page.$eval(".schedule-time", node => node.innerText)).includes("09:00"));
  });
  await check("manual QR check-in records points and shows a seal", async () => {
    await page.goto(`${baseUrl}/scan`, { waitUntil: "networkidle2" });
    await page.click('button::-p-text(กรอกรหัส)');
    await page.type('input[placeholder*="FATU26"]', "FATU26:fixture:test-token");
    await page.click('button[type="submit"]');
    await page.waitForSelector(".checkin-result-card");
    assert.ok((await page.$eval(".checkin-result-card", node => node.innerText)).includes("+20 แต้ม"));
    assert.ok((await page.$eval(".checkin-total", node => node.innerText)).includes("40"));
    assert.equal(await page.evaluate(() => window.__cameraStreams.some(s => s.getTracks().some(t => t.readyState === "live"))), false);
    assert.ok(await page.$(".dragon-scroll.empowered .scroll-guardian img"));
    assert.equal(await page.$eval(".scroll-guardian img", image => image.getAttribute("src")), "/images/azure-dragon-art.webp");
    await page.waitForFunction(() => document.activeElement === document.querySelector(".checkin-celebration"));
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute("aria-label")), "ปิดผลเช็กอิน");
    if (process.env.CAPTURE_EXPERIENCE) { await page.waitForFunction(() => document.querySelector(".scroll-guardian img")?.naturalWidth > 0 && Number(getComputedStyle(document.querySelector(".scroll-guardian")).opacity) === 1 && Number(getComputedStyle(document.querySelector(".checkin-celebration")).opacity) === 1); await page.screenshot({ path: "previews/rework/checkin-power.png" }); }
    await page.keyboard.press("Escape");
    await page.waitForSelector(".checkin-celebration", { hidden: true });
    assert.equal(await page.evaluate(() => document.body.style.overflow), "");
  });
  await check("duplicate check-in does not invent a power reward or extra points", async () => {
    duplicateCheckin = true;
    try {
      await page.goto(`${baseUrl}/scan`, { waitUntil: "networkidle2" });
      await page.locator('button::-p-text(กรอกรหัส)').click();
      await page.type('input[placeholder*="FATU26"]', "FATU26:fixture:test-token");
      await page.click('button[type="submit"]');
      await page.waitForSelector(".checkin-duplicate");
      assert.equal(await page.$(".dragon-scroll.empowered"), null);
      assert.equal(await page.$(".seal-burst"), null);
      assert.ok(!(await page.$eval(".checkin-result-card", node => node.innerText)).includes("+20"));
      await page.keyboard.press("Escape");
    } finally { duplicateCheckin = false; }
  });
  await check("legacy faculty check-in names keep the white tiger guardian after renaming", async () => {
    checkinLocationName = "ตึกคณะ";
    try {
      await page.goto(`${baseUrl}/scan`, { waitUntil: "networkidle2" });
      await page.locator('button::-p-text(กรอกรหัส)').click();
      await page.type('input[placeholder*="FATU26"]', "FATU26:fixture:test-token");
      await page.click('button[type="submit"]');
      await page.waitForSelector(".checkin-result-card");
      assert.equal(await page.$eval("#checkin-result-title", node => node.textContent), "ตึกคณะศิลปกรรมศาสตร์");
      assert.equal(await page.$eval(".scroll-guardian img", image => image.getAttribute("src")), "/images/white-tiger-art.webp");
      await page.keyboard.press("Escape");
      await page.waitForSelector(".checkin-celebration", { hidden: true });
    } finally { checkinLocationName = "โรงละคร"; }
  });
  await check("reward ritual makes one request and preserves its real voucher", async () => {
    await page.goto(`${baseUrl}/lucky-draw`, { waitUntil: "networkidle2" });
    await page.$eval(".treasure-notice .ceremony-button", button => { button.click(); button.click(); });
    await page.waitForSelector(".phase-charging");
    assert.equal(await page.$$(".treasure-guardian-orbit>span").then(nodes => nodes.length), 4);
    await page.waitForSelector(".phase-summoning");
    if (process.env.CAPTURE_EXPERIENCE) await page.screenshot({ path: "previews/rework/ceremony.png" });
    await page.waitForSelector(".phase-opening");
    await page.waitForSelector(".phase-revealed", { timeout: 6000 });
    assert.equal(drawCalls, 1);
    assert.ok((await page.$eval(".ceremony-reward", node => node.innerText)).includes(prize.title));
    if (process.env.CAPTURE_EXPERIENCE) { await page.waitForFunction(() => Number(getComputedStyle(document.querySelector(".ceremony-reward")).opacity) === 1); await fs.mkdir("previews/rework", { recursive: true }); await page.screenshot({ path: "previews/rework/reveal.png" }); }
    await page.click(".ceremony-reward button");
    await page.waitForSelector(".voucher-qr");
    assert.equal(await page.$eval(".voucher-code", node => node.innerText), prize.voucherCode);
    await page.reload({ waitUntil: "networkidle2" });
    assert.equal(await page.$eval(".voucher-code", node => node.innerText), prize.voucherCode);
    assert.equal(drawCalls, 1);
  });
  await check("lost reward response recovers the committed voucher without redrawing", async () => {
    drawn = false; loseDrawResponse = true;
    await page.goto(`${baseUrl}/lucky-draw`, { waitUntil: "networkidle2" });
    await page.click(".treasure-notice .ceremony-button");
    await page.waitForSelector(".phase-revealed", { timeout: 6000 });
    assert.equal(drawCalls, 2);
    assert.ok((await page.$eval(".ceremony-reward", node => node.innerText)).includes(prize.title));
    await page.click(".ceremony-reward button");
    loseDrawResponse = false;
  });
  await check("reduced-motion reward reveal skips ceremonial delay", async () => {
    drawn = false;
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.goto(`${baseUrl}/lucky-draw`, { waitUntil: "networkidle2" });
    await page.click(".treasure-notice .ceremony-button");
    await page.waitForSelector(".phase-revealed", { timeout: 1500 });
    await page.click(".ceremony-reward button");
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
  });
  await check("skipping the ceremony keeps the same server reward", async () => {
    drawn = false;
    await page.goto(`${baseUrl}/lucky-draw`, { waitUntil: "networkidle2" });
    const before = drawCalls;
    await page.click(".treasure-notice .ceremony-button");
    await page.click(".ceremony-skip");
    await page.waitForSelector(".voucher-code", { timeout: 3000 });
    assert.equal(await page.$eval(".voucher-code", node => node.innerText), prize.voucherCode);
    assert.equal(drawCalls, before + 1);
    assert.equal(await page.evaluate(() => document.body.style.overflow), "");
  });
  for (const role of ["admin", "editor", "staff", "viewer", "staff_pending", "participant"]) {
    await check(`unified portal limits ${role} role visibility and direct URLs`, async () => {
      const script = await page.evaluateOnNewDocument(role => { window.__fatuTest.role = role; window.__fatuTest.profile.role = "admin"; }, role);
      try {
        await page.goto(`${baseUrl}/staff`, { waitUntil: "networkidle2" });
        if (role === "participant") {
          await page.waitForFunction(() => document.body.innerText.includes("ไม่มีสิทธิ์"));
          assert.equal(await page.$(".admin-nav"), null);
        } else if (role === "staff_pending") {
          await page.waitForFunction(() => location.pathname === "/admin/pending");
          assert.equal(await page.$(".admin-nav"), null);
        } else {
          await page.waitForSelector(".admin-nav");
          const links = await page.$$eval(".admin-nav a", nodes => nodes.map(node => node.getAttribute("href")));
          assert.equal(links.includes("/admin/audit"), role === "admin");
          assert.equal(links.includes("/admin/activities"), ["admin", "editor"].includes(role));
          assert.equal(links.includes("/admin/operations"), ["admin", "staff"].includes(role));
          assert.equal(links.includes("/admin/field"), ["admin", "staff"].includes(role));
          if (["staff", "viewer"].includes(role)) {
            await page.goto(`${baseUrl}/admin/settings`, { waitUntil: "networkidle2" });
            assert.ok((await page.$eval(".admin-content", node => node.innerText)).includes("ไม่มีสิทธิ์เข้าหน้านี้"));
          }
        }
      } finally { await page.removeScriptToEvaluateOnNewDocument(script.identifier); }
    });
  }
  await check("opening gate, guardian selection and passport exit", async () => {
    await page.goto(baseUrl, { waitUntil: "networkidle2" });
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("replay_story_intro")));
    await page.waitForSelector(".wuxia-opening");
    await page.waitForFunction(() => Number(getComputedStyle(document.querySelector(".wuxia-opening")).opacity) === 1);
    await page.waitForFunction(() => Number(getComputedStyle(document.querySelector(".imperial-gate")).opacity) === 1);
    if (process.env.CAPTURE_EXPERIENCE) await page.screenshot({ path: "previews/rework/opening.png" });
    await page.click(".gate-act .ceremony-button");
    await page.waitForSelector(".guardian-choice");
    assert.equal(await page.$(".guardian-choice-spirit"), null);
    await page.waitForFunction(() => [...document.querySelectorAll(".guardian-choice .venue-photograph img")].every(image => image.complete && image.naturalWidth > 0));
    await page.waitForFunction(() => Number(getComputedStyle(document.querySelector(".guardian-act")).opacity) === 1);
    await page.waitForFunction(() => [...document.querySelectorAll(".guardian-choice")].every(card => Number(getComputedStyle(card).opacity) === 1));
    assert.deepEqual(await page.$$eval(".guardian-location-copy strong", nodes => nodes.map(node => node.textContent)), ["โรงละคอน", "ตึกคณะศิลปกรรมศาสตร์", "โรงทอ", "ตึก SC3"]);
    if (process.env.CAPTURE_EXPERIENCE) await page.screenshot({ path: "previews/rework/opening-places.png" });
    await page.click(".guardian-choice:nth-child(2)");
    await page.waitForSelector(".guardian-choice-spirit");
    assert.equal(await page.$eval(".guardian-choice:nth-child(2)", node => node.getAttribute("aria-pressed")), "true");
    await page.click(".guardian-act .ceremony-button");
    await page.waitForSelector(".passport-act");
    await page.click(".passport-act .ceremony-button");
    await page.waitForFunction(() => location.pathname === "/explore");
    assert.equal(await page.evaluate(() => sessionStorage.getItem("fatu_chosen_realm")), "white-tiger");
    assert.equal(await page.evaluate(() => document.body.style.overflow), "");
  });
  await check("all four actual building photos load and guardians appear on request", async () => {
    await page.goto(`${baseUrl}/explore`, { waitUntil: "networkidle2" });
    assert.equal(await page.$$(".realm-place-card").then(nodes => nodes.length), 4);
    const photos = await page.$$eval(".realm-place-image-link img", images => images.map(image => image.getAttribute("src")));
    assert.deepEqual(photos, ["theater", "faculty", "weaving", "sc3"].map(name => `/images/venues/${name}.webp`));
    for (let index = 0; index < 4; index++) {
      await page.$$eval(".realm-place-image-link img", (images, index) => images[index].scrollIntoView({ block: "center", behavior: "instant" }), index);
      await page.waitForFunction(index => { const image = document.querySelectorAll(".realm-place-image-link img")[index]; return image.complete && image.naturalWidth > 0; }, {}, index);
    }
    assert.equal(await page.$(".guardian-manifestation"), null);
    await page.locator('button[aria-label="เรียกผู้พิทักษ์จิ้งจอก 9 หาง"]').click();
    await page.waitForSelector(".guardian-manifestation");
    assert.ok((await page.$eval(".guardian-manifestation", node => node.innerText)).includes("จิ้งจอก 9 หาง"));
    await page.keyboard.press("Escape");
    await page.waitForSelector(".guardian-manifestation", { hidden: true });
  });
  await check("corrected place names and exact organizer map URLs override stale CMS values", async () => {
    await page.goto(`${baseUrl}/map`, { waitUntil: "networkidle2" });
    assert.deepEqual(await page.$$eval(".realm-place-title h3", nodes => nodes.map(node => node.textContent)), ["โรงละคอน", "ตึกคณะศิลปกรรมศาสตร์", "โรงทอ", "ตึก SC3"]);
    assert.deepEqual(await page.$$eval(".map-navigation-button", links => links.map(link => link.getAttribute("href"))), ["rUZJNLSjKU1fE7iE7", "XiaLXPfzJABEcMa99", "AQ8zYg4cs9VbhAZdA", "on7t5SseFTmAvudd9"].map(id => `https://maps.app.goo.gl/${id}`));
    await page.goto(`${baseUrl}/venue/faculty`, { waitUntil: "networkidle2" });
    assert.ok((await page.$eval(".venue-real-heading", node => node.innerText)).includes("ตึกคณะศิลปกรรมศาสตร์"));
    assert.equal(await page.$eval(".venue-directions a", link => link.getAttribute("href")), "https://maps.app.goo.gl/XiaLXPfzJABEcMa99");
  });
  await check("opening remains navigable on a short phone and can always be skipped", async () => {
    await page.setViewport({ width: 360, height: 640, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    try {
      await page.goto(baseUrl, { waitUntil: "networkidle2" });
      await page.evaluate(() => window.dispatchEvent(new CustomEvent("replay_story_intro")));
      await page.locator(".gate-act .ceremony-button").click();
      await page.waitForSelector(".guardian-act");
      await page.$eval(".guardian-act .ceremony-button", button => button.scrollIntoView({ block: "center", behavior: "instant" }));
      const layout = await page.$eval(".wuxia-opening", node => ({ width: node.clientWidth, scrollWidth: node.scrollWidth }));
      assert.ok(layout.scrollWidth <= layout.width + 2, `Opening overflow: ${JSON.stringify(layout)}`);
      const skip = await page.$eval('button[aria-label="ข้ามบทนำ"]', button => ({ top: button.getBoundingClientRect().top, bottom: button.getBoundingClientRect().bottom }));
      assert.ok(skip.top >= 0 && skip.bottom <= 640, "Skip must remain visible after scrolling the places");
      await page.keyboard.press("Escape");
      await page.waitForSelector(".wuxia-opening", { hidden: true });
      assert.equal(await page.evaluate(() => document.body.style.overflow), "");
    } finally { await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); }
  });
  await check("cinematic formations stop rotating for reduced motion and opening is optional", async () => {
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    try {
      await page.goto(baseUrl, { waitUntil: "networkidle2" });
      assert.equal(await page.$(".wuxia-opening"), null);
      await page.evaluate(() => window.dispatchEvent(new CustomEvent("replay_story_intro")));
      await page.waitForSelector(".wuxia-opening .celestial-array");
      assert.equal(await page.$eval(".array-outer", node => getComputedStyle(node).animationName), "none");
      await page.locator('button[aria-label="ข้ามบทนำ"]').click();
      await page.waitForSelector(".wuxia-opening", { hidden: true });
    } finally { await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]); }
  });
  await check("passport previews are real places with optional guardian buttons", async () => {
    await page.goto(`${baseUrl}/profile`, { waitUntil: "networkidle2" });
    assert.equal(await page.$$(".passport-photo .venue-photograph").then(nodes => nodes.length), 4);
    assert.equal(await page.$(".guardian-manifestation"), null);
    await page.locator('button[aria-label="เรียกผู้พิทักษ์มังกรฟ้า"]').click();
    await page.waitForSelector(".guardian-manifestation");
    assert.equal(await page.$eval(".guardian-manifestation>img", image => image.getAttribute("src")), "/images/azure-dragon-art.webp");
    await page.keyboard.press("Escape");
  });
  await check("venue scan and bottom navigation both unfurl the scroll", async () => {
    await page.goto(`${baseUrl}/venue/theater`, { waitUntil: "networkidle2" });
    assert.ok(await page.$('.venue-real-hero [data-venue-photo="azure-dragon"]'));
    const content = await page.$eval(".venue-missions", node => node.innerText);
    assert.ok(content.includes("09:00–11:00"));
    assert.ok(!content.includes("T09:00:00"));
    assert.ok(await page.$(".point-medallion"));
    await page.locator(".scroll-scan-cta").click();
    await page.waitForSelector(".scroll-route-reveal .dragon-scroll");
    assert.equal(await page.evaluate(() => location.pathname), "/scan");
    await page.locator('.bottom-nav a[href="/map"]').click();
    await page.waitForSelector(".map-expedition");
    await page.locator(".scanner-nav-button").click();
    await page.waitForSelector(".scroll-route-reveal .dragon-scroll");
    assert.equal(await page.evaluate(() => location.pathname), "/scan");
  });
  await check("legacy check-in URL uses the same working scroll scanner", async () => {
    await page.goto(`${baseUrl}/checkin`, { waitUntil: "networkidle2" });
    await page.waitForSelector(".scan-page");
    assert.equal(await page.evaluate(() => location.pathname), "/scan");
    assert.equal(await page.$$(".bottom-nav").then(nodes => nodes.length), 1);
  });
  await check("activity details show local times, a real place and a scroll action", async () => {
    await page.goto(`${baseUrl}/activity/morning`, { waitUntil: "networkidle2" });
    await page.waitForSelector(".activity-scroll-heading");
    const details = await page.$eval(".activity-essential-info", node => node.innerText);
    assert.ok(details.includes("09:00–11:00"));
    assert.equal(await page.$eval(".activity-location-photo img", image => image.getAttribute("src")), "/images/venues/theater.webp");
    assert.equal(await page.$eval(".activity-actions .scroll-scan-cta", link => link.getAttribute("href")), "/scan");
  });
  await check("prize catalog uses published stock and points, and filters affordable items", async () => {
    await page.goto(`${baseUrl}/prizes`, { waitUntil: "networkidle2" });
    await page.waitForFunction(() => document.querySelectorAll(".prize-collection-card").length === 6);
    const catalog = await page.$eval(".prize-collection", node => node.innerText);
    for (const name of ["ตุ๊กตายักษ์", "ตุ๊กตาเล็ก", "ปิ่นปักผม", "พู่ห้อยโทรศัพท์", "พัดมือ", "ซองแดง"]) assert.ok(catalog.includes(name));
    assert.ok(catalog.includes("เหลือ 1 ชิ้น"));
    assert.ok(catalog.includes("หมดแล้ว"));
    assert.equal(await page.$$(".prize-illustration-label").then(nodes => nodes.length), 6);
    await page.$eval('button::-p-text(แต้มของฉันแลกได้)', button => button.scrollIntoView({ block: "center", behavior: "instant" }));
    await page.locator('button::-p-text(แต้มของฉันแลกได้)').click();
    await page.waitForFunction(() => document.querySelectorAll(".prize-collection-card").length === 3);
    await page.$eval('button[aria-label="ดูวิธีรับปิ่นปักผม"]', button => button.scrollIntoView({ block: "center", behavior: "instant" }));
    await page.locator('button[aria-label="ดูวิธีรับปิ่นปักผม"]').click();
    await page.waitForSelector(".prize-detail-modal");
    assert.ok((await page.$eval(".prize-detail-sheet dl", node => node.innerText)).includes("15 แต้ม"));
    assert.equal(await page.$eval(".prize-detail-sheet .button-imperial-red", link => link.getAttribute("href")), "/profile");
    await page.keyboard.press("Escape");
    await page.waitForSelector(".prize-detail-modal", { hidden: true });
    assert.equal(await page.evaluate(() => document.body.style.overflow), "");
  });
  await check("blocked decorative media leaves opening and activity navigation usable", async () => {
    blockDecorativeMedia = true;
    try {
      await page.goto(baseUrl, { waitUntil: "networkidle2" });
      await page.evaluate(() => window.dispatchEvent(new CustomEvent("replay_story_intro")));
      await page.waitForSelector(".wuxia-opening");
      assert.ok((await page.$eval(".wuxia-opening", node => node.innerText)).includes("สี่ผู้พิทักษ์"));
      await page.locator('button[aria-label="ข้ามบทนำ"]').click();
      await page.waitForSelector(".wuxia-opening", { hidden: true });
      await page.goto(`${baseUrl}/schedule`, { waitUntil: "networkidle2" });
      assert.equal(await page.$$(".schedule-activity").then(nodes => nodes.length), 3);
      await page.type('input[aria-label="ค้นหากิจกรรม"]', "พู่กัน");
      assert.equal(await page.$$(".schedule-activity").then(nodes => nodes.length), 1);
      await page.locator('a[href="/scan"]').click();
      await page.waitForSelector(".scan-page");
      assert.ok(await page.$('button::-p-text(อัปโหลดรูป QR)'));
    } finally { blockDecorativeMedia = false; }
  });
  for (const width of [360, 412]) {
    await check(`navigation and end-of-page content fit at ${width}px`, async () => {
      await page.setViewport({ width, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
      await page.goto(`${baseUrl}/schedule`, { waitUntil: "networkidle2" });
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const layout = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth, lastCardBottom: document.querySelector(".schedule-activity:last-child").getBoundingClientRect().bottom, navTop: document.querySelector(".bottom-nav").getBoundingClientRect().top, navCount: document.querySelectorAll(".bottom-nav").length }));
      assert.ok(layout.width <= layout.viewport + 2);
      assert.equal(layout.navCount, 1);
      assert.ok(layout.lastCardBottom < layout.navTop, "The last activity must scroll clear of the fixed navigation");
    });
    await check(`photo pages, guardian controls and last mission fit at ${width}px`, async () => {
      for (const route of ["/explore", "/map", "/profile", "/prizes", "/activity/morning", "/venue/theater"]) {
        await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle2" });
        const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth, controls: [...document.querySelectorAll(".guardian-summon, .scroll-scan-cta, .mission-scan")].map(node => node.getBoundingClientRect().height) }));
        assert.ok(dimensions.width <= dimensions.viewport + 2, `${route} overflowed`);
        assert.ok(dimensions.controls.every(height => height >= 44), `${route} must have touch targets of at least 44px`);
      }
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const clearance = await page.evaluate(() => ({ end: document.querySelector(".venue-directions").getBoundingClientRect().bottom, nav: document.querySelector(".bottom-nav").getBoundingClientRect().top }));
      assert.ok(clearance.end < clearance.nav);
    });
  }
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  if (process.env.CAPTURE_EXPERIENCE) {
    drawn = false;
    const guestScript = await page.evaluateOnNewDocument(() => { window.__fatuTest.user = null; window.__fatuTest.profile = null; });
    await page.goto(baseUrl, { waitUntil: "networkidle2" }); await page.screenshot({ path: "previews/rework/home-visitor.png", fullPage: true });
    await page.removeScriptToEvaluateOnNewDocument(guestScript.identifier);
    for (const [route, name] of [["/", "home"], ["/schedule", "schedule"], ["/scan", "scan"], ["/lucky-draw", "lucky-draw"], ["/admin/login", "portal"], ["/map", "map"], ["/profile", "passport"], ["/venue/theater", "venue"], ["/prizes", "prizes"], ["/activity/morning", "activity"]]) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle2" });
      await page.waitForFunction(() => !document.querySelector(".scroll-route-reveal") || getComputedStyle(document.querySelector(".scroll-route-reveal")).visibility === "hidden");
      await page.screenshot({ path: `previews/rework/${name}.png`, fullPage: true });
    }
  }
  console.log(`Draw requests: ${drawCalls}`);
  assert.deepEqual(runtimeErrors, [], "No page runtime errors");
  assert.deepEqual(failures, [], failures.join("\n"));
  console.log(`EXPERIENCE PASSED ${passed}/${passed + failures.length} CASES`);
} finally { await browser.close(); }

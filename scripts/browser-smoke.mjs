import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const routes = [
  ["/", "FATU OPEN HOUSE 2026"],
  ["/register", "รับใบเบิกทางแดนมังกร"],
  ["/login", "เข้าสู่ระบบ"],
  ["/venue/theater", "โรงละคอน"],
  ["/prizes", "ของรางวัล"],
  ["/pass", "ใบเบิกทาง"],
  ["/scan", "สแกน QR"],
  ["/staff/login", "TEAM PORTAL"],
  ["/admin/login", "เข้าสู่ระบบจัดการ"],
  ["/lucky-draw", "หีบสมบัติ"],
  ["/survey", "แบบประเมิน"],
  ["/map", "แผนที่"],
  ["/schedule", "ตาราง"],
  ["/faq", "FAQ"],
  ["/about", "FATU Open House 2026"],
];

const browser = await puppeteer.launch({
  executablePath: edgePath,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.evaluate(() => {
    sessionStorage.setItem("fatu_story_intro_seen", "1");
  });

  const failures = [];

  for (const [path, expectedText] of routes) {
    const errors = [];
    const onConsole = (msg) => {
      if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
    };
    const onPageError = (error) => errors.push(`pageerror: ${error.message}`);

    page.on("console", onConsole);
    page.on("pageerror", onPageError);

    const response = await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle2", timeout: 20000 });
    await new Promise((resolve) => setTimeout(resolve, 300));

    const state = await page.evaluate(() => ({
      text: document.body?.innerText || "",
      width: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
      brokenImages: Array.from(document.images)
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.getAttribute("src") || ""),
    }));

    page.off("console", onConsole);
    page.off("pageerror", onPageError);

    try {
      assert.ok(response && response.status() < 400, `HTTP ${response?.status()} on ${path}`);
      assert.ok(state.text.includes(expectedText), `Missing expected text "${expectedText}" on ${path}`);
      assert.ok(!state.text.includes("เจ้า... ผู้มาเยือน จงลืมตาขึ้น!"), `Opening overlay blocked ${path}`);
      assert.ok(state.width <= state.viewport + 2, `Horizontal overflow on ${path}: ${state.width} > ${state.viewport}`);
      assert.deepEqual(state.brokenImages, [], `Broken images on ${path}: ${state.brokenImages.join(", ")}`);
      assert.deepEqual(errors, [], `Browser errors on ${path}: ${errors.join(" | ")}`);
      console.log(`PASS ${path}`);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
      console.error(`FAIL ${path}: ${failures.at(-1)}`);
    }
  }

  assert.deepEqual(failures, [], failures.join("\n"));
  console.log(`\nBROWSER SMOKE PASSED ${routes.length}/${routes.length} ROUTES AT 412x915`);
} finally {
  await browser.close();
}

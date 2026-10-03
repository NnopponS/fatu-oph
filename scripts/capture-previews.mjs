import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const artifactDir = "C:\\Users\\worap\\.gemini\\antigravity\\brain\\03ce5dd8-0773-4831-b4b2-5906c74463dd";
const localOutDir = path.resolve("previews");

if (!fs.existsSync(localOutDir)) fs.mkdirSync(localOutDir, { recursive: true });
if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

async function run() {
  console.log("Launching browser for screenshots...");
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  // Set mobile device viewport matching typical modern phone (390 x 844 iPhone 14 / modern Android)
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  const routes = [
    { name: "01_home_visitor.png", url: "http://127.0.0.1:4173/" },
    { name: "02_register_page.png", url: "http://127.0.0.1:4173/register" },
    { name: "03_login_page.png", url: "http://127.0.0.1:4173/login" },
    { name: "04_venue_page.png", url: "http://127.0.0.1:4173/venue/theater" },
    { name: "05_rewards_catalog.png", url: "http://127.0.0.1:4173/prizes" },
    { name: "06_journey_passport.png", url: "http://127.0.0.1:4173/pass" },
    { name: "07_qr_scanner.png", url: "http://127.0.0.1:4173/scan" },
    { name: "08_staff_portal.png", url: "http://127.0.0.1:4173/staff/login" },
    { name: "09_admin_login.png", url: "http://127.0.0.1:4173/admin/login" },
    { name: "10_lucky_draw.png", url: "http://127.0.0.1:4173/lucky-draw" },
    { name: "11_survey_page.png", url: "http://127.0.0.1:4173/survey" },
    { name: "12_map_expedition.png", url: "http://127.0.0.1:4173/map" },
    { name: "13_timeline_schedule.png", url: "http://127.0.0.1:4173/schedule" },
    { name: "14_faq_announcements.png", url: "http://127.0.0.1:4173/faq" },
    { name: "15_about_mythology.png", url: "http://127.0.0.1:4173/about" },
  ];

  for (const r of routes) {
    console.log(`Capturing ${r.url}...`);
    try {
      await page.goto(r.url, { waitUntil: "networkidle0", timeout: 15000 });
      // Allow opening animation to settle
      await new Promise((res) => setTimeout(res, 2200));

      const localFile = path.join(localOutDir, r.name);
      const artifactFile = path.join(artifactDir, r.name);

      await page.screenshot({ path: localFile, fullPage: false });
      fs.copyFileSync(localFile, artifactFile);
      console.log(`Saved ${r.name}`);
    } catch (err) {
      console.error(`Failed ${r.name}:`, err.message);
    }
  }

  await browser.close();
  console.log("All screenshots captured successfully!");
}

run().catch(console.error);

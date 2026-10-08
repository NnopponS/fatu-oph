import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";
import assert from "node:assert/strict";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const artifactDir = "C:\\Users\\worap\\.gemini\\antigravity\\brain\\03ce5dd8-0773-4831-b4b2-5906c74463dd";
const localOutDir = path.resolve("previews");

if (!fs.existsSync(localOutDir)) fs.mkdirSync(localOutDir, { recursive: true });
if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

async function run() {
  console.log("Launching browser to verify guardian selection bug fix...");
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  await page.goto("http://127.0.0.1:4173/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => sessionStorage.removeItem("fatu_story_intro_seen"));
  await page.reload({ waitUntil: "networkidle0" });

  // 1. Advance past Stage 0 (Dragon Gate opening)
  const ceremonyBtn = await page.waitForSelector(".ceremony-button", { timeout: 10000 });
  await ceremonyBtn.click();
  await new Promise((res) => setTimeout(res, 2600)); // wait for awakening transition to stage 1

  // Verify we are at stage 1
  const cards = await page.$$(".guardian-choice");
  assert.equal(cards.length, 4, "Must have 4 guardian destination cards");

  // Click Card 2 (White Tiger)
  console.log("Clicking Card 2 (White Tiger)...");
  await cards[1].click();
  await new Promise((res) => setTimeout(res, 600));

  // Check how many spirits or avatars are in the DOM
  const spiritsOnCard1AfterTiger = await cards[0].$$(".guardian-choice-spirit, .guardian-preview-art");
  const spiritsOnCard2AfterTiger = await cards[1].$$(".guardian-choice-spirit");
  console.log(`Spirits on Card 1 (Dragon card): ${spiritsOnCard1AfterTiger.length}`);
  console.log(`Spirits on Card 2 (Tiger card): ${spiritsOnCard2AfterTiger.length}`);
  assert.equal(spiritsOnCard1AfterTiger.length, 0, "Card 1 must NOT retain the dragon spirit when Card 2 is clicked!");
  assert.equal(spiritsOnCard2AfterTiger.length, 1, "Card 2 must show the White Tiger spirit!");

  // Take screenshot when White Tiger is selected
  const snapTigerLocal = path.join(localOutDir, "opening_select_white_tiger.png");
  const snapTigerArtifact = path.join(artifactDir, "opening_select_white_tiger.png");
  await page.screenshot({ path: snapTigerLocal });
  fs.copyFileSync(snapTigerLocal, snapTigerArtifact);
  console.log("Captured opening_select_white_tiger.png (Dragon is completely gone from Card 1!)");

  // Now click Card 3 (Nine-Tailed Fox)
  console.log("Clicking Card 3 (Nine-Tailed Fox)...");
  await cards[2].click();
  await new Promise((res) => setTimeout(res, 600));

  const spiritsOnCard2AfterFox = await cards[1].$$(".guardian-choice-spirit, .guardian-preview-art");
  const spiritsOnCard3AfterFox = await cards[2].$$(".guardian-choice-spirit");
  assert.equal(spiritsOnCard2AfterFox.length, 0, "Card 2 must NOT retain the tiger spirit when Card 3 is clicked!");
  assert.equal(spiritsOnCard3AfterFox.length, 1, "Card 3 must show the Nine-Tailed Fox spirit!");

  const snapFoxLocal = path.join(localOutDir, "opening_select_nine_tailed_fox.png");
  const snapFoxArtifact = path.join(artifactDir, "opening_select_nine_tailed_fox.png");
  await page.screenshot({ path: snapFoxLocal });
  fs.copyFileSync(snapFoxLocal, snapFoxArtifact);
  console.log("Captured opening_select_nine_tailed_fox.png");

  await browser.close();
  console.log("VERIFICATION PASSED: No stuck dragon picture! Spirits transition cleanly!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

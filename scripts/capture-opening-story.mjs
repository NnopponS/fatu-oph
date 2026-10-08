import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const artifactDir = "C:\\Users\\worap\\.gemini\\antigravity\\brain\\03ce5dd8-0773-4831-b4b2-5906c74463dd";
const localOutDir = path.resolve("previews");

if (!fs.existsSync(localOutDir)) fs.mkdirSync(localOutDir, { recursive: true });
if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

async function run() {
  console.log("Launching browser to capture opening story experience...");
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  // Clear session storage so OpeningExperience always shows
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    sessionStorage.removeItem("fatu_story_intro_seen");
  });
  await page.reload({ waitUntil: "networkidle0" });

  // 1. Capture early in Act 0 (kinetic text inking in)
  await new Promise((res) => setTimeout(res, 2200));
  const snap1Local = path.join(localOutDir, "opening_act0_kinetic_reveal.png");
  const snap1Artifact = path.join(artifactDir, "opening_act0_kinetic_reveal.png");
  await page.screenshot({ path: snap1Local });
  fs.copyFileSync(snap1Local, snap1Artifact);
  console.log("Captured opening_act0_kinetic_reveal.png");

  // 2. Capture fully resolved Act 0 (after brush underline & narration finished)
  await new Promise((res) => setTimeout(res, 2000));
  const snap2Local = path.join(localOutDir, "opening_act0_full_scene.png");
  const snap2Artifact = path.join(artifactDir, "opening_act0_full_scene.png");
  await page.screenshot({ path: snap2Local });
  fs.copyFileSync(snap2Local, snap2Artifact);
  console.log("Captured opening_act0_full_scene.png");

  // 3. Click "เปิดประตูมังกร" ceremony button to advance to Guardian Choice
  const ceremonyBtn = await page.$(".ceremony-button");
  if (ceremonyBtn) {
    await ceremonyBtn.click();
    await new Promise((res) => setTimeout(res, 2600)); // wait for awakening transition to stage 1
    const snap3Local = path.join(localOutDir, "opening_act1_guardians_choice.png");
    const snap3Artifact = path.join(artifactDir, "opening_act1_guardians_choice.png");
    await page.screenshot({ path: snap3Local });
    fs.copyFileSync(snap3Local, snap3Artifact);
    console.log("Captured opening_act1_guardians_choice.png");

    // 4. Select a guardian and proceed to Act 2 (Passport Seal)
    const guardianCard = await page.$(".guardian-choice");
    if (guardianCard) {
      await guardianCard.click();
      await new Promise((res) => setTimeout(res, 600));
      const nextBtn = await page.$(".guardian-act .ceremony-button");
      if (nextBtn) {
        await nextBtn.click();
        await new Promise((res) => setTimeout(res, 1000));
        const snap4Local = path.join(localOutDir, "opening_act2_journey_seal.png");
        const snap4Artifact = path.join(artifactDir, "opening_act2_journey_seal.png");
        await page.screenshot({ path: snap4Local });
        fs.copyFileSync(snap4Local, snap4Artifact);
        console.log("Captured opening_act2_journey_seal.png");
      }
    }
  }

  await browser.close();
  console.log("Completed capturing opening story experience!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

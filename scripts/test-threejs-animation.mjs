import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const artifactDir = "C:\\Users\\worap\\.gemini\\antigravity\\brain\\03ce5dd8-0773-4831-b4b2-5906c74463dd";
const localOutDir = path.resolve("previews");

if (!fs.existsSync(localOutDir)) fs.mkdirSync(localOutDir, { recursive: true });
if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

async function run() {
  console.log("Launching Edge to test Roleplay Interactive Story & 3D WebGL Realm Scene...");
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--use-gl=angle",
    ],
  });

  const page = await browser.newPage();
  // Test on standard mobile device
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  const consoleLogs = [];
  const errors = [];

  page.on("console", (msg) => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === "error") {
      errors.push(text);
    }
  });

  page.on("pageerror", (err) => {
    errors.push(`PageError: ${err.message}`);
  });

  try {
    console.log("Navigating to http://127.0.0.1:4173/...");
    await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle0", timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1500));

    // Capture Act 0: The Awakening (Mobile)
    console.log("Capturing Act 0 (The Awakening - Mobile)...");
    let localFile = path.join(localOutDir, "story_roleplay_act_0_awakening.png");
    let artifactFile = path.join(artifactDir, "story_roleplay_act_0_awakening.png");
    await page.screenshot({ path: localFile });
    fs.copyFileSync(localFile, artifactFile);
    console.log("Saved story_roleplay_act_0_awakening.png");

    // Click "แตะฝ่ามือเพื่อปลุกพลังปราณมังกร!"
    console.log("Tapping Awaken Dragon Qi button...");
    const awakenBtn = await page.$("button.button-imperial-red");
    if (awakenBtn) {
      await awakenBtn.click();
      await new Promise((r) => setTimeout(r, 900));

      // Capture Act 1: Choose Affinity
      console.log("Capturing Act 1 (Choose Realm Affinity - Mobile)...");
      localFile = path.join(localOutDir, "story_roleplay_act_1_affinity.png");
      artifactFile = path.join(artifactDir, "story_roleplay_act_1_affinity.png");
      await page.screenshot({ path: localFile });
      fs.copyFileSync(localFile, artifactFile);
      console.log("Saved story_roleplay_act_1_affinity.png");

      // Select "แดนพยัคฆ์ขาว" to test dynamic 3D camera swoop
      console.log("Selecting White Tiger realm...");
      const realmButtons = await page.$$("button.roleplay-stagger-item");
      if (realmButtons.length >= 2) {
        await realmButtons[1].click(); // White Tiger
        await new Promise((r) => setTimeout(r, 700));
      }

      // Click "ยืนยันสายวิชา & ไปต่อ"
      const confirmBtn = await page.$("button.button-imperial-red");
      if (confirmBtn) {
        await confirmBtn.click();
        await new Promise((r) => setTimeout(r, 900));

        // Capture Act 2: Mission Briefing
        console.log("Capturing Act 2 (Mission Rules Briefing - Mobile)...");
        localFile = path.join(localOutDir, "story_roleplay_act_2_rules.png");
        artifactFile = path.join(artifactDir, "story_roleplay_act_2_rules.png");
        await page.screenshot({ path: localFile });
        fs.copyFileSync(localFile, artifactFile);
        console.log("Saved story_roleplay_act_2_rules.png");

        // Click "รับทราบกฎ! เตรียมรับใบเบิกทาง"
        const rulesBtn = await page.$("button.button-imperial-red");
        if (rulesBtn) {
          await rulesBtn.click();
          await new Promise((r) => setTimeout(r, 900));

          // Capture Act 3: Travel Pass Ceremony
          console.log("Capturing Act 3 (Travel Pass Ceremony - Mobile)...");
          localFile = path.join(localOutDir, "story_roleplay_act_3_seal_pass.png");
          artifactFile = path.join(artifactDir, "story_roleplay_act_3_seal_pass.png");
          await page.screenshot({ path: localFile });
          fs.copyFileSync(localFile, artifactFile);
          console.log("Saved story_roleplay_act_3_seal_pass.png");
        }
      }
    }

    // Now test Desktop Wide Screen (1280x820)
    console.log("\nTesting Desktop Wide Viewport (1280x820)...");
    await page.setViewport({ width: 1280, height: 820, isMobile: false, deviceScaleFactor: 2 });
    // Replay story intro on desktop
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("replay_story_intro"));
    });
    await new Promise((r) => setTimeout(r, 1200));

    console.log("Capturing Act 0 (The Awakening - Desktop Wide)...");
    localFile = path.join(localOutDir, "story_roleplay_desktop_act_0.png");
    artifactFile = path.join(artifactDir, "story_roleplay_desktop_act_0.png");
    await page.screenshot({ path: localFile });
    fs.copyFileSync(localFile, artifactFile);
    console.log("Saved story_roleplay_desktop_act_0.png");

    // Click Awaken on Desktop
    const deskAwakenBtn = await page.$("button.button-imperial-red");
    if (deskAwakenBtn) {
      await deskAwakenBtn.click();
      await new Promise((r) => setTimeout(r, 900));

      console.log("Capturing Act 1 (Choose Affinity - Desktop Wide)...");
      localFile = path.join(localOutDir, "story_roleplay_desktop_act_1.png");
      artifactFile = path.join(artifactDir, "story_roleplay_desktop_act_1.png");
      await page.screenshot({ path: localFile });
      fs.copyFileSync(localFile, artifactFile);
      console.log("Saved story_roleplay_desktop_act_1.png");

      // Go to Act 3 to see the pass ceremony on desktop
      const deskConfirmBtn = await page.$("button.button-imperial-red");
      if (deskConfirmBtn) {
        await deskConfirmBtn.click();
        await new Promise((r) => setTimeout(r, 800));

        const deskRulesBtn = await page.$("button.button-imperial-red");
        if (deskRulesBtn) {
          await deskRulesBtn.click();
          await new Promise((r) => setTimeout(r, 800));

          console.log("Capturing Act 3 (Travel Pass Ceremony - Desktop Wide)...");
          localFile = path.join(localOutDir, "story_roleplay_desktop_act_3.png");
          artifactFile = path.join(artifactDir, "story_roleplay_desktop_act_3.png");
          await page.screenshot({ path: localFile });
          fs.copyFileSync(localFile, artifactFile);
          console.log("Saved story_roleplay_desktop_act_3.png");

          // Click stamp to complete and enter homepage
          const deskStampBtn = await page.$("button.button-imperial-red");
          if (deskStampBtn) {
            await deskStampBtn.click();
            await new Promise((r) => setTimeout(r, 1200));
          }
        }
      }
    }

    // Capture Home Hero
    console.log("Capturing Home Hero on Desktop...");
    localFile = path.join(localOutDir, "home_hero_with_chosen_realm.png");
    artifactFile = path.join(artifactDir, "home_hero_with_chosen_realm.png");
    await page.screenshot({ path: localFile });
    fs.copyFileSync(localFile, artifactFile);
    console.log("Saved home_hero_with_chosen_realm.png");

    console.log("\n--- TEST SUMMARY ---");
    console.log(`Total console logs: ${consoleLogs.length}`);
    console.log(`Total errors: ${errors.length}`);
    if (errors.length > 0) {
      console.error("ERRORS FOUND:", errors);
    } else {
      console.log("SUCCESS: 0 console errors or warnings found!");
    }
  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    await browser.close();
  }
}

run();

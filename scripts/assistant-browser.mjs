import assert from "node:assert/strict";
import fs from "node:fs/promises";
import puppeteer from "puppeteer-core";

const base=process.env.EXPERIENCE_URL||"http://127.0.0.1:5173";
assert.ok(["127.0.0.1","localhost"].includes(new URL(base).hostname),"Fixtures require an owned local Vite server");
const browser=await puppeteer.launch({executablePath:process.env.BROWSER_PATH||"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",headless:true,args:["--no-sandbox"]});
const data={public:{site:{name:"FATU OPEN HOUSE 2026",theme:"ตะลุยแดนมังกร",faculty:"คณะศิลปกรรมศาสตร์"},venues:Object.fromEntries([["theater","azure-dragon","โรงละคอน"],["faculty","white-tiger","ตึกคณะศิลปกรรมศาสตร์"],["weaving","nine-tailed-fox","โรงทอ"],["sc3","red-phoenix","ตึก SC3"]].map(([id,visualIdentityKey,name])=>[id,{name,visualIdentityKey,visualLabel:name,isPublished:true}])),activities:{test:{slug:"test",title:"กิจกรรมทดสอบ",venueId:"weaving",isPublished:true}},prizes:{}}};
const errors=[];let passed=0;const failures=[];const requests=[];
const page=await browser.newPage();page.on("pageerror",error=>errors.push(error.message));
await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
await page.evaluateOnNewDocument(fixture=>{window.__assistantFixture=fixture;sessionStorage.setItem("fatu_story_intro_seen","1");sessionStorage.setItem("fatu_chosen_realm","nine-tailed-fox");},data);
await page.setRequestInterception(true);
page.on("request",async request=>{
  const url=new URL(request.url());if(url.origin!==new URL(base).origin)return request.continue();
  if(url.pathname==="/src/contexts/AuthContext.tsx")return request.respond({contentType:"application/javascript",body:'export function AuthProvider({children}){return children;} export function useAuth(){return {firebaseUser:null,profile:null,role:null,loading:false,isStaff:false,isAdmin:false,isPendingStaff:false,refreshProfile:async()=>{},logout:async()=>{}};}'});
  if(url.pathname==="/src/services/realtime.ts")return request.respond({contentType:"application/javascript",body:'export const realtimePaths={public:Object.fromEntries(["site","venues","activities","prizes","media","announcements","faq","settings","registrationConfig"].map(k=>[k,"public/"+k])),admin:{roles:"admin/roles"}};export async function readRealtime(path){return path.split("/").reduce((o,k)=>o?.[k],window.__assistantFixture)||null;}export function subscribeRealtime(path,cb){let active=true;queueMicrotask(async()=>{if(active)cb(await readRealtime(path));});return()=>{active=false;};}export async function setRealtime(){}export async function updateRealtime(){}export async function pushRealtime(){return "fixture";}'});
  if(url.pathname==="/api/assistant")requests.push(request.url());
  return request.continue();
});
async function go(path){await page.goto(base+path,{waitUntil:"networkidle2"});await page.waitForSelector(".guardian-pet-root, .assistant-page");}
async function open(){await page.click(".guardian-pet-launcher");await page.waitForFunction(()=>document.querySelector(".guardian-chat-popup")?.hidden===false);}
async function check(name,run){try{await run();passed++;console.log(`PASS ${name}`);}catch(error){failures.push(`${name}: ${error.message}`);console.error(`FAIL ${failures.at(-1)}`);}}
async function choose(category, title) {
  if(await page.$(".guardian-message"))await page.locator('.guardian-guide-footer button::-p-text(เลือกคำถามอื่น)').click();
  await page.locator(`.guardian-guide-categories button::-p-text(${category})`).click();
  await page.locator(`.guardian-quick-questions button::-p-text(${title})`).click();
  await page.waitForSelector(".guardian-message");
}
try {
  await check("initial chosen realm renders original pixel sprite",async()=>{await go("/");assert.equal(await page.$eval(".guardian-pet-root",e=>e.dataset.guardian),"nine-tailed-fox");assert.ok(await page.$(".guardian-pet-launcher svg rect"));});
  for(const [venue,realm] of [["theater","azure-dragon"],["faculty","white-tiger"],["weaving","nine-tailed-fox"],["sc3","red-phoenix"]])await check(`venue ${venue} changes guardian`,async()=>{await go(`/venue/${venue}`);assert.equal(await page.$eval(".guardian-pet-root",e=>e.dataset.guardian),realm);});
  await check("activity follows its venue guardian",async()=>{await go("/activity/test");assert.equal(await page.$eval(".guardian-pet-root",e=>e.dataset.guardian),"nine-tailed-fox");});
  await check("topic selection answers immediately without a question input",async()=>{await go("/");await open();assert.equal(await page.$(".guardian-chat textarea"),null);await choose("ร่วมงาน","สะสมกี่แต้ม");assert.match(await page.$eval(".guardian-message",e=>e.textContent),/200 แต้ม/);assert.equal(await page.evaluate(()=>document.activeElement.classList.contains("guardian-answer-title")),true);});
  await check("admissions retain official year and source",async()=>{await choose("สมัครเรียน","การละคอน: Portfolio ปี 2570");assert.match(await page.$eval(".guardian-message",e=>e.textContent),/2\.75/);await page.click(".guardian-citations summary");assert.ok(await page.$('.guardian-citations a[href$="2026092206261193.pdf"]'));assert.match(await page.$eval(".guardian-citations",e=>e.textContent),/ปี 2570/);});
  await check("YouTube and Facebook links work alongside evidence",async()=>{await choose("ติดต่อ","YouTube");assert.ok(await page.$('.guardian-answer-links a[href="https://www.youtube.com/@fineartstu8432"]'));assert.ok(await page.$(".guardian-citations"));await choose("ติดต่อ","Facebook");assert.ok(await page.$('.guardian-answer-links a[href="https://www.facebook.com/FineArtsTU/"]'));});
  await check("Escape closes popup and reopen keeps the selected answer",async()=>{await page.keyboard.press("Escape");assert.equal(await page.$eval(".guardian-chat-popup",e=>e.hidden),true);assert.equal(await page.evaluate(()=>document.activeElement.classList.contains("guardian-pet-launcher")),true);await open();assert.equal(await page.$eval(".guardian-message",e=>e.dataset.topic),"contact-facebook-messenger");});
  await check("hide from guide closes it and offers a compact restore button",async()=>{await page.click('.guardian-chat-header button[aria-label="ซ่อนสัตว์เลี้ยง"]');await page.waitForSelector(".guardian-pet-restore");assert.equal(await page.$(".guardian-pet-launcher"),null);assert.equal(await page.$eval(".guardian-chat-popup",e=>e.hidden),true);assert.equal(await page.evaluate(()=>document.activeElement.classList.contains("guardian-pet-restore")),true);});
  await check("hidden preference persists across navigation and reload",async()=>{await go("/venue/theater");assert.ok(await page.$(".guardian-pet-restore"));await page.reload({waitUntil:"networkidle2"});assert.ok(await page.$(".guardian-pet-restore"));assert.equal(await page.$(".guardian-pet-launcher"),null);});
  await check("restoring pet uses the current venue and persists",async()=>{await page.click('button[aria-label="แสดงสัตว์เลี้ยง"]');await page.waitForSelector(".guardian-pet-launcher");assert.equal(await page.$eval(".guardian-pet-root",e=>e.dataset.guardian),"azure-dragon");assert.equal(await page.evaluate(()=>localStorage.getItem("fatu_guardian_hidden")),"0");});
  await check("pet can be hidden without opening the guide",async()=>{await page.click(".guardian-pet-hide");await page.waitForSelector(".guardian-pet-restore");await page.click(".guardian-pet-restore");await page.waitForSelector(".guardian-pet-launcher");});
  await check("small mobile and keyboard viewport retain visible menu footer",async()=>{await page.setViewport({width:360,height:520,isMobile:true,hasTouch:true});await open();const box=await page.$eval(".guardian-chat-popup",e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,bottom:r.bottom,top:r.top,w:innerWidth,h:innerHeight};});assert.ok(box.left>=0&&box.right<=box.w&&box.bottom<=box.h&&box.top>=0);assert.ok(await page.$(".guardian-guide-footer a"));assert.ok(await page.$eval(".guardian-chat-messages",e=>e.scrollHeight>=e.clientHeight));});
  await check("reduced motion disables pet animation",async()=>{await page.emulateMediaFeatures([{name:"prefers-reduced-motion",value:"reduce"}]);assert.equal(await page.$eval(".pixel-guardian-body",e=>getComputedStyle(e).animationName),"none");});
  await check("full guide page has no duplicate pet or free-text input",async()=>{await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});await go("/assistant");assert.equal(await page.$(".guardian-pet-root"),null);assert.equal(await page.$("textarea"),null);assert.ok(await page.$(".guardian-guide-categories"));});
  await check("staff guide offers instructions without performing an action",async()=>{await page.locator('.guardian-guide-categories button::-p-text(เจ้าหน้าที่)').click();await page.locator('.guardian-quick-questions button::-p-text(บันทึกกิจกรรม)').click();assert.match(await page.$eval(".guardian-message",e=>e.textContent),/ก่อนกดยืนยัน/);assert.ok(await page.$('.guardian-answer-links a[href="/admin/field"]'));});
  await check("guide never calls an assistant API and has no runtime errors",()=>{assert.deepEqual(requests,[]);assert.deepEqual(errors,[]);});
  if(process.env.CAPTURE_EXPERIENCE){await go("/venue/theater");await open();await choose("สมัครเรียน","การละคอน: Portfolio ปี 2570");await fs.mkdir("previews/rework",{recursive:true});await page.screenshot({path:"previews/rework/guardian-guide.png"});}
} finally {await browser.close();}
console.log(`GUIDE UI PASSED ${passed}/${passed+failures.length} CASES`);
if(failures.length)process.exitCode=1;

import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
const browser = await puppeteer.launch({executablePath:process.env.CHROME_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
const page = await browser.newPage();
const errors=[]; const external=[]; const apiRequests=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
await page.setRequestInterception(true);
page.on('request',request=>{
  if (new URL(request.url()).pathname.startsWith('/api/')) apiRequests.push(request.url());
  if (new URL(request.url()).origin !== new URL(base).origin && !request.url().startsWith('data:')) { external.push(request.url()); return request.abort(); }
  request.continue();
});
// Fonts are optional network requests; make this a completely isolated browser verification.
await page.evaluateOnNewDocument(()=>localStorage.setItem('fatu_guardian_hidden','1'));
async function click(selector) {
  const target = await page.waitForSelector(selector, {visible:true});
  await target.evaluate(element => element.scrollIntoView({block:'center', behavior:'instant'}));
  await target.click();
}
try {
  for (const width of (process.env.INTERACTIONS_ONLY ? [] : [360,390,768,1440])) {
    await page.setViewport({width,height:900,deviceScaleFactor:1});
    for (const [route,text] of [['/','เปิดโลกศิลปะ'],['/schedule','ตารางกิจกรรม'],['/activity/oph26-acting-r1','Studio 2'],['/venue/theater','โรงละคอน'],['/explore','สี่สถานที่'],['/map','แผนที่'],['/faq','30 ตุลาคม 2569'],['/login','เข้าสู่ระบบ'],['/admin/plan','เข้าสู่ระบบจัดการ'],['/prizes','ของรางวัล']]) {
      await page.goto(base+route,{waitUntil:'networkidle0'});
      const state = await page.evaluate(()=>({text:document.body.innerText,width:document.documentElement.scrollWidth,viewport:innerWidth,broken:[...document.images].filter(i=>i.complete && i.naturalWidth===0).map(i=>i.src)}));
      assert.ok(state.text.includes(text),`${width} ${route}: missing ${text}`);
      assert.ok(state.width<=state.viewport+1,`${width} ${route}: overflow ${state.width}`);
      assert.deepEqual(state.broken,[],`${width} ${route}: broken images`);
    }
    console.log(`PASS: 10 public/protected routes at ${width}px; content, overflow, images, and admin access boundary`);
  }
  await page.setViewport({width:390,height:844});
  await page.goto(base+'/schedule',{waitUntil:'networkidle0'});
  const count=()=>page.$$eval('.planner-activity',a=>a.length);
  const expectCount=async expected=>{await page.waitForFunction(n=>document.querySelectorAll('.planner-activity').length===n,{},expected);assert.equal(await count(),expected);};
  await expectCount(38);
  await page.select('select[aria-label="เลือกสถานที่"]','sc3'); await expectCount(5);
  await page.type('input[aria-label="ค้นหากิจกรรม"]','ArtSa');await expectCount(5);
  await page.select('select[aria-label="เลือกช่วงเวลา"]','afternoon');await expectCount(2);
  await click('.reset-filters');await expectCount(38);
  await click('.planner-tabs button:nth-child(3)');await expectCount(5);
  assert.ok(page.url().includes('category=performance'));
  await click('.reset-filters');await expectCount(38);
  await click('.planner-activity .bookmark-button');
  await page.waitForFunction(()=>document.querySelector('.bookmark-button')?.getAttribute('aria-pressed')==='true');
  await click('.planner-toggle');await expectCount(1);
  await page.reload({waitUntil:'networkidle0'});
  assert.ok(await page.$eval('.bookmark-button',button=>button.getAttribute('aria-pressed')==='true'));
  await click('.planner-toggle');await expectCount(1);
  await click('.bookmark-button');await expectCount(0);
  await click('.reset-filters');
  await click('.day-operations summary');assert.equal(await page.$$eval('.day-operations>div',a=>a.length),14);
  const pdf = await fetch(base+'/documents/open-house-plan-2026.pdf');assert.equal(pdf.status,200);assert.match(pdf.headers.get('content-type'),/pdf/);
  await page.goto(base+'/login',{waitUntil:'networkidle0'});
  await page.type('input[autocomplete="username"]','preview-user');
  await page.type('input[type="password"]','preview-password');
  await click('button[type="submit"]');
  await page.waitForFunction(()=>document.body.innerText.includes('ระบบสมาชิกยังไม่เปิดใช้งาน'));
  assert.deepEqual(errors,[]);
  assert.deepEqual(apiRequests,[],'Read-only preview must not call the event API');
  assert.ok(!external.some(url=>/firebaseio|googleapis.com.*identity|fatu-oph-2026.vercel.app/.test(url)),'Unconfigured preview must not call live event services');
  console.log('PASS: venue/room/time/category filters, clear filters, saved persistence, saved empty state, 14 operations, PDF, unconfigured auth, no live service calls, no browser errors');
} finally {await browser.close();}

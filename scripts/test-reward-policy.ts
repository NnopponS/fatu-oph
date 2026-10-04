/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert/strict";

// This suite always targets disposable emulators, never the event database.
process.env.FIREBASE_DATABASE_EMULATOR_HOST = "127.0.0.1:9000";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIREBASE_ADMIN_PROJECT_ID = "demo-fatu-oph-2026";
process.env.FIREBASE_DATABASE_URL = "https://demo-fatu-oph-2026-default-rtdb.firebaseio.com";
process.env.VITE_FIREBASE_API_KEY = "fake-api-key";
const [{ adminDb, adminAuth }, checkin, lucky, survey, auth, admin, { loadRewardPolicy }, { buildGuideTopics }] = await Promise.all([
  import("../api/_lib/server.ts"), import("../api/checkin.ts"), import("../api/lucky-draw.ts"),
  import("../api/survey.ts"), import("../api/auth.ts"), import("../api/admin.ts"), import("../api/_lib/rewards.ts"), import("../src/lib/guardian-guide.ts"),
]);
async function call(handler: (request: Request) => Promise<Response>, body: Record<string, unknown>, token = "") {
  const response = await handler(new Request("http://127.0.0.1/test", {method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify(body)}));
  return {status:response.status, data:await response.json() as Record<string, any>};
}
async function participant(uid: string, points = 0, role?: string) {
  await adminAuth.createUser({uid}).catch(() => {});
  await adminDb.ref(`operations/participants/${uid}`).set({username:uid,displayName:`ทดสอบ ${uid}`,role:"participant"});
  await adminDb.ref(`operations/accounting/participants/${uid}`).set({pointTotal:points});
  if(role) await adminDb.ref(`admin/roles/${uid}`).set({role});
  const customToken=await adminAuth.createCustomToken(uid);
  const response=await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:customToken,returnSecureToken:true})});
  assert.equal(response.status,200);
  return (await response.json() as {idToken:string}).idToken;
}
await adminDb.ref().set(null);
await adminDb.ref("public/venues").set({a:{name:"A",isPublished:true},b:{name:"B",isPublished:true}});
await adminDb.ref("admin/venueQr").set({a:{token:"secure-a"},b:{token:"secure-b"}});
await adminDb.ref("public/activities").set({
  a1:{title:"A1",venueId:"a",isPublished:true,pointsEnabled:true,pointsAwarded:100,completionMethod:"qr"},
  a2:{title:"A2",venueId:"a",isPublished:true,pointsEnabled:true,pointsAwarded:100,completionMethod:"qr"},
  zero:{title:"Zero",venueId:"b",isPublished:true,pointsEnabled:false,pointsAwarded:0,completionMethod:"qr"},
  b1:{title:"B1",venueId:"b",isPublished:true,pointsEnabled:true,pointsAwarded:100,completionMethod:"qr"},
});
await adminDb.ref("admin/activityQr").set(Object.fromEntries(["a1","a2","zero","b1"].map(id=>[id,{token:`token-${id}`}])));
const attendee=await participant("attendee");
const staff=await participant("staff_tester",0,"staff");
const editor=await participant("editor_tester",0,"editor");
let result=await call(checkin.POST,{qrPayload:"FATU26:CHK:a"},attendee);
assert.equal(result.status,400,"venue QR without its secret must never grant points");
result=await call(checkin.POST,{qrPayload:"FATU26:CHK:a:secure-a"},attendee);
assert.equal(result.data.pointsAdded,100);
result=await call(checkin.POST,{qrPayload:"FATU26:CHK:a:secure-a"},attendee);
assert.equal(result.data.pointsAdded,0);
result=await call(checkin.POST,{qrPayload:"FATU26:a1:token-a1"},attendee);
assert.equal(result.data.pointTotal,200,"direct venue first + first activity preserve the 2025 flow");
result=await call(checkin.POST,{qrPayload:"FATU26:a2:token-a2"},attendee);
assert.equal(result.data.pointsAdded,0);
assert.equal(result.data.pointTotal,200);
const activityFirst=await participant("activity_first");
const attempts=await Promise.all([call(checkin.POST,{qrPayload:"FATU26:a1:token-a1"},activityFirst),call(checkin.POST,{qrPayload:"FATU26:a1:token-a1"},activityFirst)]);
assert.equal(attempts.reduce((sum,r)=>sum+Number(r.data.pointsAdded||0),0),100);
result=await call(checkin.POST,{qrPayload:"FATU26:CHK:a:secure-a"},activityFirst);
assert.equal(result.data.pointsAdded,0,"activity visit prevents a later venue bonus");
result=await call(checkin.POST,{qrPayload:"FATU26:zero:token-zero"},activityFirst);
assert.equal(result.data.pointsAdded,0);
result=await call(checkin.POST,{qrPayload:"FATU26:b1:token-b1"},activityFirst);
assert.equal(result.data.pointsAdded,100,"zero-point activity does not consume activity entitlement");
console.log("PASS secure venue QR, legacy order, activity cap and concurrent duplicate check-in");

const surveyToken=await participant("survey_tester",100);
const surveyBody={action:"submit",overallRating:4,venueRating:3,activityRating:5,staffRating:4,feedback:"ทดสอบ"};
const submissions=await Promise.all([call(survey.POST,surveyBody,surveyToken),call(survey.POST,surveyBody,surveyToken)]);
assert.equal(submissions.filter(r=>r.status===200).length,1);
assert.equal((await adminDb.ref("operations/accounting/participants/survey_tester/pointTotal").get()).val(),200);
await adminDb.ref("operations/surveys/survey_tester").remove();
result=await call(survey.POST,{action:"status"},surveyToken);
assert.equal(result.data.submitted,true,"status recovers after an interrupted index write");
assert.equal(result.data.record.overallRating,4);
result=await call(survey.POST,surveyBody,surveyToken);
assert.equal(result.status,409);
console.log("PASS survey contract, concurrent single bonus and interrupted response recovery");

await adminDb.ref("public/prizes/fan").set({name:"พัด",isPublished:true,stock:2,drawWeight:1,rarity:"common"});
const low=await participant("low",199);
result=await call(lucky.POST,{action:"status"},low);
assert.equal(result.data.status.eligible,false);
assert.equal(result.data.status.progress.remaining,1);
const ready=await participant("ready",200);
result=await call(lucky.POST,{action:"status"},ready);
assert.equal(result.data.status.eligible,true,"points alone qualify without a fixed venue/activity count");
assert.equal(result.data.status.conditions.visitedVenuesCount,0);
const draws=await Promise.all([call(lucky.POST,{action:"draw"},ready),call(lucky.POST,{action:"draw"},ready)]);
assert.deepEqual(draws.map(r=>r.status).sort(),[200,409]);
assert.equal((await adminDb.ref("operations/accounting/participants/ready/pointTotal").get()).val(),200);
assert.equal((await adminDb.ref("operations/prizeRuntime/fan/claimedCount").get()).val(),1);
const voucherCode=draws.find(r=>r.status===200)!.data.voucher.voucherCode;
await adminDb.ref("operations/luckyDraws/ready").remove();
result=await call(lucky.POST,{action:"status"},ready);
assert.equal(result.data.status.prize.voucherCode,voucherCode);
assert.equal(result.data.status.claimed,true);
result=await call(lucky.POST,{action:"peek-voucher",voucherCode},staff);
assert.equal(result.status,200);
assert.equal(result.data.voucher.status,"pending");
assert.equal((await adminDb.ref("operations/luckyVouchers/"+voucherCode.split(":")[1]+"/status").get()).val(),"pending");
result=await call(lucky.POST,{action:"redeem-voucher",voucherCode},editor);
assert.equal(result.status,403);
const claims=await Promise.all([call(lucky.POST,{action:"redeem-voucher",voucherCode},staff),call(lucky.POST,{action:"redeem-voucher",voucherCode},staff)]);
assert.deepEqual(claims.map(r=>r.status).sort(),[200,409]);
result=await call(lucky.POST,{action:"status"},ready);
assert.equal(result.data.status.prize.redeemed,true,"receipt recovery never resets an already claimed voucher");
console.log("PASS 200-point eligibility, one draw, no debit, voucher preview, role guard and atomic payout");

const lastA=await participant("last_a",200),lastB=await participant("last_b",200);
await adminDb.ref("operations/rateLimits").remove();
const last=await Promise.all([call(lucky.POST,{action:"draw"},lastA),call(lucky.POST,{action:"draw"},lastB)]);
assert.deepEqual(last.map(r=>r.status).sort(),[200,409]);
assert.equal((await adminDb.ref("operations/prizeRuntime/fan/claimedCount").get()).val(),2);
const loser=last[0].status===409?lastA:lastB;
result=await call(lucky.POST,{action:"status"},loser);
assert.equal(result.data.status.claimed,false);
assert.equal(result.data.status.progress.points,200);
assert.equal(result.data.status.catalogCount,0);
result=await call(lucky.POST,{action:"catalog"});
assert.equal(result.data.prizes[0].stockRemaining,0);
assert.equal("weight" in result.data.prizes[0],false);
console.log("PASS last-unit stock race, public stock and retained entitlement when sold out");

await adminDb.ref("public/site/rewardPolicy").set({pointsPerVenue:100,surveyPoints:100,pointsRequired:300,pointExchangeEnabled:false});
result=await call(lucky.POST,{action:"status"},attendee);
assert.equal(result.data.status.progress.required,300);
assert.equal(result.data.status.eligible,false);
result=await call(auth.POST,{action:"me"},attendee);
assert.equal(result.data.luckyDraw.eligible,false);
assert.equal(result.data.luckyDraw.pointsRequired,300);
result=await call(admin.POST,{action:"redeemPrize",participantId:"attendee",prizeId:"fan"},staff);
assert.equal(result.status,400,"point exchange is opt-in, not an accidental second payout flow");
const guideAnswer=buildGuideTopics(await loadRewardPolicy()).find(topic=>topic.id==="event-rewards")!.answer;
assert.ok(guideAnswer.includes("300"));assert.ok(guideAnswer.includes("ไม่บังคับ"));
console.log("PASS configurable threshold agrees across auth/draw and optional exchange stays disabled");
console.log("REWARD POLICY REGRESSION SUITE PASSED");
process.exit(0);

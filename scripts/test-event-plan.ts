import assert from 'node:assert/strict';
import plan from '../src/data/open-house-plan.json';
import seed from '../firebase/seed/public.json';
import { activitySchema, venueSchema, siteSchema } from '../src/data/schemas';
import { buildPlanImport } from '../src/lib/plan-import';
import { activityTiming } from '../src/lib/schedule';

const activities = Object.entries(plan.activities).map(([id, value]) => ({id, ...activitySchema.parse(value)}));
assert.equal(activities.length,38);
assert.equal(activities.filter(a => a.category==='workshop').length,32);
assert.equal(activities.filter(a => a.category==='performance').length,5);
assert.equal(activities.filter(a => a.category==='recreation').length,1);
assert.equal(Object.keys(plan.schedule).length,14);
siteSchema.parse(plan.site); siteSchema.parse(seed.site);
Object.values(plan.venues).forEach(v=>venueSchema.parse(v));
for (const item of activities) {
  assert.ok(plan.venues[item.venueId]);
  assert.equal(activityTiming(item.startAt).date,'2026-10-30');
  assert.ok(Date.parse(item.endAt)>Date.parse(item.startAt));
  assert.equal(item.capacity,null); assert.equal(item.pointsEnabled,false); assert.equal(item.price,null); assert.equal(item.isFree,false);
  assert.deepEqual(seed.activities[item.id],plan.activities[item.id]);
}
const workshopCounts = Object.fromEntries(['theater','weaving-building','sc3'].map(id=>[id,activities.filter(a=>a.venueId===id && a.category==='workshop').length]));
assert.deepEqual(workshopCounts,{theater:11,'weaving-building':16,sc3:5});
assert.ok(!activities.some(a=>a.title==='Theater Design · รอบที่ 4'));
assert.equal(activities.find(a=>a.id==='oph26-lego-r3')?.startAt,'2026-10-30T11:15:00+07:00');
assert.equal(activities.find(a=>a.id==='oph26-mood-board-r4')?.startAt,'2026-10-30T14:15:00+07:00');
assert.equal(plan.eventPlan.staffing.reduce((n,g)=>n+g.declaredTotal,0),142);
assert.equal(plan.eventPlan.staffing.flatMap(g=>g.departments).reduce((n,d)=>n+d.count,0),143);

function apply(current: Record<string,unknown>, patch: Record<string,unknown>) {
  const output = structuredClone(current);
  for (const [path,value] of Object.entries(patch)) {
    const parts=path.split('/'); let node=output;
    for (const part of parts.slice(0,-1)) node=node[part] as Record<string,unknown> || (node[part]={}) as Record<string,unknown>;
    node[parts.at(-1)!]=structuredClone(value);
  }
  return output;
}
const first = buildPlanImport({});
assert.equal(first.added,60); // 38 activities + 14 operations + 4 venues + 3 FAQ + 1 announcement.
const imported = apply({},first.patch);
assert.equal(buildPlanImport(imported).paths,0,'Import must be idempotent');
const edited = structuredClone(imported);
(edited.activities as Record<string,unknown>)['organizer-custom']={title:'Keep me'};
const acting = (edited.activities as Record<string,Record<string,unknown>>)['oph26-acting-r1'];
Object.assign(acting,{title:'Edited by organizer',price:100,pointsEnabled:true,pointsAwarded:20,availabilityStatus:'open',capacity:25});
const original=structuredClone(edited);
assert.equal(buildPlanImport(edited).paths,0,'Default import must preserve organizer edits');
const refreshed=apply(edited,buildPlanImport(edited,true).patch);
const refreshedActing=(refreshed.activities as Record<string,Record<string,unknown>>)['oph26-acting-r1'];
for (const key of ['price','pointsEnabled','pointsAwarded','availabilityStatus','capacity']) assert.equal(refreshedActing[key],acting[key]);
assert.equal(refreshedActing.title,'Acting · รอบที่ 1');
assert.deepEqual((refreshed.activities as Record<string,unknown>)['organizer-custom'],{title:'Keep me'});
assert.deepEqual(edited,original,'Building a patch must not mutate the database snapshot');

console.log('PASS: PDF schedule, 32 workshop sessions, venues, staffing discrepancy, safe/idempotent import and protected operational settings');

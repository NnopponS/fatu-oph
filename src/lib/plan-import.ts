import plan from "@/data/open-house-plan.json";

type PublicData = Record<string, unknown>;
const record = (value: unknown): PublicData => value && typeof value === "object" ? value as PublicData : {};
export function buildPlanImport(current: PublicData, refreshSchedule = false) {
  const patch: PublicData = {}; let added = 0; let refreshed = 0;
  for (const kind of ["activities", "schedule", "venues", "faq", "announcements"] as const) {
    const existing = record(current[kind]);
    for (const [id, value] of Object.entries(plan[kind])) {
      if (!existing[id]) { patch[`${kind}/${id}`] = value; added++; }
      else if (refreshSchedule && (kind === "activities" || kind === "schedule") && record(existing[id]).sourceId === plan.eventPlan.id) {
        const fields = kind === "activities" ? ["title", "shortDescription", "description", "startAt", "endAt", "room", "venueId", "category", "sessionNumber", "tags"] : ["title", "startAt", "endAt", "venueId", "category"];
        for (const field of fields) patch[`${kind}/${id}/${field}`] = record(value)[field] ?? null;
        refreshed++;
      }
    }
  }
  if (!current.eventPlan) patch.eventPlan = plan.eventPlan;
  // Update only the event date and location. Registration/reward settings stay admin-managed.
  if (!current.site) patch.site = plan.site;
  else for (const field of ["dateLabel", "locationLabel"] as const) {
    if (record(current.site)[field] !== plan.site[field]) patch[`site/${field}`] = plan.site[field];
  }
  return { patch, added, refreshed, paths: Object.keys(patch).length };
}

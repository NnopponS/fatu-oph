export function activityTiming(raw: string) {
  const empty = { date: "", time: "", minutes: null as number | null };
  if (!raw) return empty;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return { ...empty, date: raw };
  const clock = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(raw.trim());
  if (clock) {
    const hours = Number(clock[1]); const minutes = Number(clock[2]);
    if (hours > 23 || minutes > 59) return empty;
    return { date: "", time: `${String(hours).padStart(2, "0")}:${clock[2]}`, minutes: hours * 60 + minutes };
  }
  if (!raw.includes("T")) return empty;
  const zoned = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw) ? raw : `${raw}+07:00`;
  const instant = new Date(zoned);
  if (Number.isNaN(instant.getTime())) return empty;
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(instant).map(part => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

export function scheduleDateLabel(date: string) {
  return new Date(`${date}T12:00:00+07:00`).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "short" });
}

export function activityLiveState(startAt: string, endAt: string, now = new Date()) {
  const start = activityTiming(startAt); const end = activityTiming(endAt);
  if (!start.date || start.minutes === null) return "unscheduled";
  const current = activityTiming(now.toISOString());
  if (start.date > current.date) return "upcoming";
  if (start.date < current.date) return "ended";
  if (start.minutes > (current.minutes ?? 0)) return "upcoming";
  if (end.minutes !== null && (!end.date || end.date === current.date) && end.minutes <= (current.minutes ?? 0)) return "ended";
  return end.minutes !== null ? "live" : "scheduled";
}

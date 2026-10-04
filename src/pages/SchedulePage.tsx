import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, CalendarDays, Clock3, MapPin, Search, SlidersHorizontal, Sparkles, Swords, X } from "lucide-react";
import { useActivities, useVenues } from "@/data/content";
import { activityLiveState, activityTiming, scheduleDateLabel } from "@/lib/schedule";

import { ChineseHero } from "@/components/ChineseOrnaments";
import { useAuth } from "@/contexts/AuthContext";
import { hasVenueActivityAward } from "@/lib/reward-policy";

const savedKey = "fatu_saved_activities";
function readSaved(): string[] {
  try { const ids: unknown = JSON.parse(localStorage.getItem(savedKey) || "[]"); return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : []; }
  catch { return []; }
}

export function SchedulePage() {
  const activities = useActivities(); const venues = useVenues();
  const { profile } = useAuth();
  const [onlyEarnable, setOnlyEarnable] = useState(false);
  const [liveOnly, setLiveOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [venueId, setVenueId] = useState("all");
  const [date, setDate] = useState("all");
  const [period, setPeriod] = useState("all");
  const [onlySaved, setOnlySaved] = useState(false);
  const [saved, setSaved] = useState(readSaved);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 60000); return () => window.clearInterval(timer); }, []);
  const dates = useMemo(() => [...new Set(activities.items.map(activity => activityTiming(activity.startAt).date).filter(Boolean))].sort(), [activities.items]);
  const filtered = useMemo(() => activities.items.filter(activity => {
    const timing = activityTiming(activity.startAt);
    const venue = venues.items.find(item => item.id === activity.venueId);
    const matchesText = `${activity.title} ${activity.shortDescription} ${venue?.name || ""} ${activity.tags.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesText && (venueId === "all" || activity.venueId === venueId)
      && (date === "all" || !timing.date || timing.date === date)
      && (period === "all" || (timing.minutes !== null && (period === "morning" ? timing.minutes < 720 : timing.minutes >= 720)))
      && (!onlySaved || saved.includes(activity.id))
      && (!onlyEarnable || (activity.pointsEnabled && activity.pointsAwarded > 0 && !hasVenueActivityAward(profile?.transactions || [], activity.venueId)))
      && (!liveOnly || (activity.availabilityStatus === "open" && activityLiveState(activity.startAt, activity.endAt, now) === "live"));
  }).sort((a, b) => {
    const aa = activityTiming(a.startAt); const bb = activityTiming(b.startAt);
    if (aa.minutes === null) return bb.minutes === null ? a.displayOrder - b.displayOrder : 1;
    if (bb.minutes === null) return -1;
    return aa.date.localeCompare(bb.date) || aa.minutes - bb.minutes;
  }), [activities.items, venues.items, query, venueId, date, period, onlySaved, saved, onlyEarnable, liveOnly, profile, now]);
  const live = filtered.filter(activity => activity.availabilityStatus === "open" && activityLiveState(activity.startAt, activity.endAt, now) === "live");
  const upcoming = filtered.find(activity => activity.availabilityStatus === "open" && activityLiveState(activity.startAt, activity.endAt, now) === "upcoming");
  function toggleSaved(id: string) {
    const next = saved.includes(id) ? saved.filter(value => value !== id) : [...saved, id]; setSaved(next);
    try { localStorage.setItem(savedKey, JSON.stringify(next)); } catch { /* Keep the list usable when storage is unavailable. */ }
  }
  function clearFilters() { setQuery(""); setVenueId("all"); setDate("all"); setPeriod("all"); setOnlySaved(false); setOnlyEarnable(false); setLiveOnly(false); }

  return (
    <div className="schedule-page">
      <ChineseHero className="quest-banner" seal="藝" kicker={<><Swords size={16} /> YOUR NEXT ADVENTURE</>} title={<>เลือกภารกิจ<br /><em>แล้วออกเดินทาง</em></>} description={<>ตารางกิจกรรม เวิร์กช็อป และการแสดง<br />ค้นหาสิ่งที่ชอบ แล้วเก็บให้ครบทุกสถานที่</>}>
        <div className="quest-banner-stats"><span><CalendarDays size={16} /> {activities.items.length} กิจกรรม</span><span><MapPin size={16} /> {venues.items.length} สถานที่</span></div>
      </ChineseHero>

      <section className="schedule-controls" aria-label="ตัวกรองตารางกิจกรรม">
        <label className="schedule-search"><Search size={19} /><input aria-label="ค้นหากิจกรรม" placeholder="ค้นหากิจกรรมหรือสถานที่..." value={query} onChange={event => setQuery(event.target.value)} />{query && <button aria-label="ล้างคำค้นหา" onClick={() => setQuery("")}><X size={16} /></button>}</label>
        <div className="filter-scroll" aria-label="เลือกวัน">
          <button className={date === "all" ? "filter-chip selected" : "filter-chip"} aria-pressed={date === "all"} onClick={() => setDate("all")}>ทุกวัน</button>
          {dates.map(day => <button key={day} className={date === day ? "filter-chip selected" : "filter-chip"} aria-pressed={date === day} onClick={() => setDate(day)}>{scheduleDateLabel(day)}</button>)}
        </div>
        <div className="schedule-selects">
          <label><MapPin size={16} /><select aria-label="เลือกสถานที่" value={venueId} onChange={event => setVenueId(event.target.value)}><option value="all">ทุกสถานที่</option>{venues.items.map(venue => <option value={venue.id} key={venue.id}>{venue.name}</option>)}</select></label>
          <label><Clock3 size={16} /><select aria-label="เลือกช่วงเวลา" value={period} onChange={event => setPeriod(event.target.value)}><option value="all">ทุกช่วงเวลา</option><option value="morning">ช่วงเช้า · ก่อน 12:00</option><option value="afternoon">ช่วงบ่าย · ตั้งแต่ 12:00</option></select></label>
        </div>
        <button className={`saved-filter ${onlySaved ? "selected" : ""}`} aria-pressed={onlySaved} onClick={() => setOnlySaved(!onlySaved)}><Bookmark size={16} fill={onlySaved ? "currentColor" : "none"} /> กิจกรรมที่บันทึกไว้ <span>{saved.filter(id => activities.items.some(a => a.id === id)).length}</span></button>
      </section>

      {(live.length > 0 || upcoming) && <section className="schedule-spotlight"><span className="eyebrow"><span className="live-dot" />{live.length > 0 ? "กำลังจัดอยู่" : "กิจกรรมถัดไป"}</span><Link to={`/activity/${(live[0] || upcoming)?.id}`}><strong>{(live[0] || upcoming)?.title}</strong><ArrowRight size={18} /></Link><span><MapPin size={14} /> {venues.items.find(v => v.id === (live[0] || upcoming)?.venueId)?.name} · {scheduleDateLabel(activityTiming((live[0] || upcoming)?.startAt || "").date)} · {activityTiming((live[0] || upcoming)?.startAt || "").time}</span></section>}

      <div className="schedule-results-heading"><h2><SlidersHorizontal size={17} /> ตารางกิจกรรม</h2><span role="status" aria-live="polite">{filtered.length} รายการ</span></div>
      {activities.loading ? <div className="schedule-empty" role="status"><img src="/assets/animations/loading-seal.svg" alt="" width={60} /><p>กำลังเปิดคัมภีร์กิจกรรม...</p></div> : activities.error ? <div className="schedule-empty" role="alert"><p>{activities.error}</p></div> : filtered.length === 0 ? <div className="schedule-empty"><Search size={32} /><h3>{activities.items.length ? "ยังไม่พบภารกิจที่ตรงกับตัวกรอง" : "กำหนดการกำลังจะมา"}</h3><p>{activities.items.length ? "ลองเลือกสถานที่หรือช่วงเวลาอื่น" : "เมื่อทีมงานประกาศกิจกรรม รายละเอียดจะปรากฏที่นี่"}</p>{activities.items.length ? <button className="button-gold-outline" onClick={clearFilters}>แสดงกิจกรรมทั้งหมด</button> : <Link to="/explore" className="button-imperial-red">สำรวจสถานที่ก่อน <ArrowRight size={16} /></Link>}</div> : <div className="schedule-timeline">
        {filtered.map((activity, index) => {
          const timing = activityTiming(activity.startAt); const end = activityTiming(activity.endAt);
          const venue = venues.items.find(item => item.id === activity.venueId);
          const state = activityLiveState(activity.startAt, activity.endAt, now);
          const isSaved = saved.includes(activity.id);
          const availability = { open: "เข้าร่วมได้", full: "เต็มแล้ว", closed: "ปิดรับแล้ว", "coming-soon": "เร็ว ๆ นี้" }[activity.availabilityStatus];
          return <article className="schedule-activity" key={activity.id} style={{ animationDelay: `${Math.min(index * 45, 180)}ms` }}>
            <div className="schedule-time"><span className="timeline-node" /><strong>{timing.time || "—"}</strong><small>{end.time ? `ถึง ${end.time}` : timing.time ? "รอประกาศเวลาสิ้นสุด" : "ยังไม่ระบุเวลา"}</small>{timing.date && <small>{scheduleDateLabel(timing.date)}</small>}</div>
            <div className="schedule-activity-card">
              <div className="schedule-card-top"><span className={`activity-state ${activity.availabilityStatus}`}>{state === "live" && activity.availabilityStatus === "open" ? "กำลังจัดอยู่" : availability}</span><button className={isSaved ? "bookmark-button saved" : "bookmark-button"} aria-label={`${isSaved ? "เลิกบันทึก" : "บันทึก"} ${activity.title}`} aria-pressed={isSaved} onClick={() => toggleSaved(activity.id)}><Bookmark size={19} fill={isSaved ? "currentColor" : "none"} /></button></div>
              <Link to={`/activity/${activity.id}`} className="schedule-card-link"><h3>{activity.title}</h3><span className="schedule-venue"><MapPin size={14} />{venue?.name || "รอประกาศสถานที่"}</span>{activity.shortDescription && <p>{activity.shortDescription}</p>}{!timing.time && <small className="unscheduled-label">ยังไม่ระบุเวลา · สอบถามที่จุดกิจกรรม</small>}<div className="schedule-card-footer">{activity.pointsEnabled && activity.pointsAwarded > 0 ? <span className="points-pill"><Sparkles size={13} />{hasVenueActivityAward(profile?.transactions || [], activity.venueId) ? "รับแต้มสถานที่นี้แล้ว" : `+${activity.pointsAwarded} แต้มครั้งแรกในสถานที่`}</span> : <span>{activity.isFree ? "เข้าร่วมฟรี" : activity.priceLabel || "ดูรายละเอียดค่าเข้าร่วม"}</span>}<span>รายละเอียด <ArrowRight size={15} /></span></div></Link>
            </div>
          </article>;
        })}
      </div>}
    </div>
  );
}

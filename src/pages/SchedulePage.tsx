import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Bookmark, CalendarDays, Clock3, Download, MapPin, Search, X } from "lucide-react";
import { useActivities, useVenues } from "@/data/content";
import { activityLiveState, activityTiming, scheduleDateLabel } from "@/lib/schedule";
import { readRealtime } from "@/services/realtime";
import { useAuth } from "@/contexts/AuthContext";
import { hasVenueActivityAward } from "@/lib/reward-policy";

type Operation = { title: string; venueId: string; startAt: string; endAt: string; category: string };
const savedKey = "fatu_saved_activities";
function readSaved(): string[] { try { const value: unknown = JSON.parse(localStorage.getItem(savedKey) || "[]"); return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : []; } catch { return []; } }
export function SchedulePage() {
  const activities = useActivities(); const venues = useVenues(); const [params, setParams] = useSearchParams();
  const { profile } = useAuth(); const [onlyEarnable, setOnlyEarnable] = useState(false);
  const [query, setQuery] = useState(""); const [venueId, setVenueId] = useState("all"); const [period, setPeriod] = useState("all");
  const [saved, setSaved] = useState(readSaved); const [onlySaved, setOnlySaved] = useState(false); const [liveOnly, setLiveOnly] = useState(false);
  const [storageNotice, setStorageNotice] = useState(""); const [now, setNow] = useState(() => new Date());
  const [operations, setOperations] = useState<Operation[]>([]);
  const category = params.get("category") || "all";
  const [date, setDate] = useState("all");
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 60000); return () => clearInterval(timer); }, []);
  useEffect(() => { let active = true; readRealtime<Record<string, Operation>>("public/schedule").then(value => { if (active) setOperations(Object.values(value || {})); }).catch(() => {}); return () => { active = false; }; }, []);
  const dates = useMemo(() => [...new Set(activities.items.map(a => activityTiming(a.startAt).date).filter(Boolean))].sort(), [activities.items]);
  const venueNames = useMemo(() => Object.fromEntries(venues.items.map(v => [v.id, v.name])), [venues.items]);
  const filtered = useMemo(() => activities.items.filter(a => {
    const time = activityTiming(a.startAt);
    return `${a.title} ${a.room} ${a.shortDescription} ${venueNames[a.venueId] || ""} ${a.tags.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())
      && (venueId === "all" || a.venueId === venueId) && (category === "all" || a.category === category)
      && (date === "all" || time.date === date) && (!onlySaved || saved.includes(a.id))
      && (period === "all" || (time.minutes !== null && (period === "morning" ? time.minutes < 720 : time.minutes >= 720)))
      && (!onlyEarnable || (a.pointsEnabled && a.pointsAwarded > 0 && !hasVenueActivityAward(profile?.transactions || [], a.venueId)))
      && (!liveOnly || (a.availabilityStatus === "open" && activityLiveState(a.startAt, a.endAt, now) === "live"));
  }).sort((a,b) => a.startAt.localeCompare(b.startAt) || a.displayOrder-b.displayOrder), [activities.items, query, venueId, category, date, onlySaved, saved, period, liveOnly, now, venueNames, onlyEarnable, profile]);
  const savedActivities = activities.items.filter(a => saved.includes(a.id));
  function toggleSaved(id: string) { const next = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id]; setSaved(next); try { localStorage.setItem(savedKey, JSON.stringify(next)); } catch { setStorageNotice("เบราว์เซอร์นี้ไม่อนุญาตให้บันทึก ข้อมูลจะอยู่จนกว่าจะปิดหน้านี้"); } }
  function clear() { setQuery(""); setVenueId("all"); setPeriod("all"); setOnlySaved(false); setLiveOnly(false); setOnlyEarnable(false); setDate("all"); setParams({}); }
  return <div className="premium-schedule">
    <header className="schedule-editorial-hero"><div><span className="editorial-kicker">A DAY FULL OF POSSIBILITIES</span><h1>วางแผนวันของคุณ<span>แล้วมาลองสิ่งใหม่ด้วยกัน.</span></h1><p>เวิร์กช็อป การแสดง และช่วงเวลาที่คุณไม่อยากพลาด</p><div><span><CalendarDays size={17} /> 30 ตุลาคม 2569</span><span><MapPin size={17} /> ธรรมศาสตร์ รังสิต</span></div></div><span className="schedule-hero-number" aria-hidden="true">30<small>OCT / 2026</small></span></header>
    <div className="schedule-workspace"><aside className="schedule-sidebar"><div className="schedule-sidebar-title"><h2>ค้นหาสิ่งที่ชอบ</h2><button className="reset-filters" onClick={clear}>ล้างตัวกรอง</button></div><label className="schedule-search"><Search size={18} /><input aria-label="ค้นหากิจกรรม" placeholder="กิจกรรม ห้อง หรือสถานที่" value={query} onChange={e => setQuery(e.target.value)} />{query && <button aria-label="ล้างคำค้นหา" onClick={() => setQuery("")}><X size={16} /></button>}</label>
      <label className="premium-field">สถานที่<select aria-label="เลือกสถานที่" value={venueId} onChange={e => setVenueId(e.target.value)}><option value="all">ทุกสถานที่</option>{venues.items.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></label>
      <label className="premium-field">ช่วงเวลา<select aria-label="เลือกช่วงเวลา" value={period} onChange={e => setPeriod(e.target.value)}><option value="all">ทุกช่วงเวลา</option><option value="morning">เช้า · ก่อน 12:00 น.</option><option value="afternoon">บ่าย · ตั้งแต่ 12:00 น.</option></select></label>
      {dates.length > 1 && <label className="premium-field">วันจัดกิจกรรม<select aria-label="เลือกวัน" value={date} onChange={e => setDate(e.target.value)}><option value="all">ทุกวัน</option>{dates.map(day => <option value={day} key={day}>{scheduleDateLabel(day)}</option>)}</select></label>}
      <button className={`planner-toggle ${onlySaved ? "selected" : ""}`} aria-pressed={onlySaved} onClick={() => setOnlySaved(!onlySaved)}><Bookmark size={17} /> ที่บันทึกไว้ <span>{savedActivities.length}</span></button>
      <button className={`planner-toggle ${liveOnly ? "selected" : ""}`} aria-pressed={liveOnly} onClick={() => setLiveOnly(!liveOnly)}><i className="live-dot" /> กำลังจัดอยู่</button>
      {activities.items.some(a => a.pointsEnabled) && <button className={`planner-toggle ${onlyEarnable ? "selected" : ""}`} aria-pressed={onlyEarnable} onClick={() => setOnlyEarnable(!onlyEarnable)}>กิจกรรมที่ยังรับแต้มได้</button>}
      <div className="planner-note"><Bookmark size={23} /><h3>เก็บกิจกรรมที่สนใจ</h3><p>กดสัญลักษณ์บันทึกบนกิจกรรม แล้วเลือก “ที่บันทึกไว้” เพื่อกลับมาดูแผนของคุณ</p><small>รายการบันทึกเก็บในเบราว์เซอร์นี้</small></div>
      <a className="plan-pdf-link" href="/documents/open-house-plan-2026.pdf" target="_blank" rel="noreferrer"><Download size={16} /> กำหนดการต้นฉบับ PDF</a>
    </aside><section className="planner-results"><div className="planner-tabs" aria-label="ประเภทกิจกรรม">{[{id:"all",name:"ทั้งหมด"},{id:"workshop",name:"เวิร์กช็อป"},{id:"performance",name:"การแสดง"},{id:"recreation",name:"สันทนาการ"}].map(c => <button key={c.id} aria-pressed={category===c.id} className={category===c.id ? "selected" : ""} onClick={() => setParams(c.id === "all" ? {} : {category:c.id})}>{c.name}</button>)}</div>
      <div className="planner-results-heading"><span><strong>ตารางกิจกรรม</strong> · {filtered.length} รายการ</span><span>เวลาประเทศไทย (GMT+7)</span></div>
      {storageNotice && <p role="status">{storageNotice}</p>}
      {activities.loading ? <p role="status">กำลังโหลดตารางกิจกรรม...</p> : activities.error ? <p role="alert">{activities.error}</p> : !filtered.length ? <div className="planner-empty"><Search size={30} /><h2>ยังไม่พบกิจกรรมที่ตรงใจ</h2><p>ลองเปลี่ยนคำค้นหา สถานที่ หรือช่วงเวลา</p><button className="premium-button" onClick={clear}>แสดงกิจกรรมทั้งหมด</button></div> : <div className="planner-timeline">{filtered.map(a => { const start = activityTiming(a.startAt); const end = activityTiming(a.endAt); const isSaved = saved.includes(a.id); const state = activityLiveState(a.startAt,a.endAt,now); return <article key={a.id} className={`planner-activity category-${a.category}`}><div className="planner-time"><strong>{start.time || "—"}</strong><span>{end.time || "รอประกาศ"}</span></div><div className="planner-activity-body"><div className="planner-activity-top"><span className="category-label">{a.category==="workshop" ? "WORKSHOP" : a.category==="performance" ? "PERFORMANCE" : "RECREATION"}</span>{state==="live" && a.availabilityStatus==="open" && <span className="live-label">กำลังจัดอยู่</span>}{a.availabilityStatus==="full" && <span>เต็มแล้ว</span>}{a.availabilityStatus==="closed" && <span>ปิดรับแล้ว</span>}<button className={isSaved ? "bookmark-button saved" : "bookmark-button"} onClick={() => toggleSaved(a.id)} aria-label={`${isSaved ? "เลิกบันทึก" : "บันทึก"} ${a.title}`} aria-pressed={isSaved}><Bookmark size={20} fill={isSaved ? "currentColor" : "none"} /></button></div><Link to={`/activity/${a.id}`}><h3>{a.title}</h3><p>{a.shortDescription}</p><div className="planner-activity-footer"><span><MapPin size={14} /> {venueNames[a.venueId] || "รอประกาศสถานที่"}{a.room && <em> / {a.room}</em>}</span><ArrowRight size={17} /></div></Link></div></article>; })}</div>}
      <details className="day-operations"><summary><Clock3 size={18} /> เวลาเปิดงาน ลงทะเบียน และพัก</summary><p>ช่วงพักและเคลียร์พื้นที่แยกตามสถานที่ เพื่อช่วยวางแผนการเดินทาง</p>{operations.filter(op => (venueId==="all" || op.venueId===venueId) && (date==="all" || activityTiming(op.startAt).date===date)).sort((a,b) => a.startAt.localeCompare(b.startAt)).map((op,i) => <div key={i}><time>{activityTiming(op.startAt).time}–{activityTiming(op.endAt).time}</time><strong>{op.title}</strong><span>{venueNames[op.venueId]}</span></div>)}</details>
      <p className="schedule-source-note">อ้างอิงแผนโครงการกิจกรรม TU Open House · สถานที่และเวลาอาจเปลี่ยนแปลงตามความเหมาะสม<br />ค่าใช้จ่าย จำนวนที่นั่ง และวิธีเข้าร่วม กรุณาสอบถามเจ้าหน้าที่ที่จุดกิจกรรม</p>
    </section></div>
  </div>;
}

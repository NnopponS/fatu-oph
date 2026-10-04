import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock, MapPin, ScrollText, Users } from "lucide-react";
import { resolveMediaUrl, useActivities, useMedia, useVenues } from "@/data/content";
import { GuardianButton, VenuePhoto } from "@/components/RealmPlaces";
import { PointMedallion } from "@/components/DragonScroll";
import { realmFor } from "@/lib/realms";
import { activityTiming, scheduleDateLabel } from "@/lib/schedule";
import { useAuth } from "@/contexts/AuthContext";
import { hasVenueActivityAward } from "@/lib/reward-policy";
import { LatticeCorners } from "@/components/ChineseOrnaments";

const availability = { open: "เปิดให้ร่วมสนุก", full: "รอบนี้เต็มแล้ว", closed: "ปิดรับแล้ว", "coming-soon": "เปิดเร็ว ๆ นี้" };
const pointRules = { once: "บันทึกการผ่านกิจกรรมครั้งเดียว", "per-session": "บันทึกการผ่านตามรอบกิจกรรม", "repeat-limited": "บันทึกการผ่านตามจำนวนครั้งที่กำหนด", "manual-only": "ให้เจ้าหน้าที่บันทึกเมื่อทำกิจกรรมสำเร็จ" };

export function ActivityPage() {
  const { id = "" } = useParams();
  const { profile } = useAuth();
  const activities = useActivities(); const venues = useVenues(); const media = useMedia();
  const activity = activities.items.find(item => item.id === id || item.slug === id);
  if (activities.loading || venues.loading) return <section className="page-section"><p role="status">กำลังเปิดคัมภีร์กิจกรรม...</p></section>;
  if (!activity) return <section className="page-section"><h1>ไม่พบกิจกรรม</h1><Link className="button-gold-outline" to="/schedule">กลับไปเลือกกิจกรรม</Link></section>;
  const venue = venues.items.find(item => item.id === activity.venueId);
  const meta = realmFor(venue?.visualIdentityKey || "azure-dragon");
  const start = activityTiming(activity.startAt); const end = activityTiming(activity.endAt);
  const cover = resolveMediaUrl(activity.coverMediaId, media.items);
  const staffOnly = activity.requiresStaffVerification || activity.completionMethod === "staff";
  const awarded = hasVenueActivityAward(profile?.transactions || [], activity.venueId);
  return <div className="activity-expedition places-page" style={{ "--realm-color": meta.color } as React.CSSProperties}>
    <Link className="venue-back" to="/schedule"><ArrowLeft size={17} />กลับสู่ตารางกิจกรรม</Link>
    <header className="activity-scroll-heading"><LatticeCorners /><span className="section-kicker"><ScrollText size={16} /> QUEST MANUSCRIPT</span><h1>{activity.title}</h1><p>{activity.shortDescription || "เลือกวิชาที่คุณชอบ แล้วค้นพบศิลปะด้วยตัวเอง"}</p><div className="activity-heading-meta"><span><CheckCircle2 size={16} />{availability[activity.availabilityStatus]}</span>{activity.pointsEnabled && (awarded ? <span className="mission-staff-note">รับแต้มจากสถานที่นี้แล้ว</span> : <PointMedallion points={activity.pointsAwarded} />)}</div></header>
    {cover && <img className="activity-cover" src={cover} alt={activity.title} />}
    <div className="activity-essential-info"><div><CalendarDays size={20} /><span>วันจัดกิจกรรม<strong>{start.date ? scheduleDateLabel(start.date) : "สอบถามที่หน้างาน"}</strong></span></div><div><Clock size={20} /><span>เวลา<strong>{start.time ? `${start.time}${end.time ? `–${end.time}` : ""} น.` : "แวะร่วมสนุกได้ตามเวลาหน้างาน"}</strong></span></div>{activity.capacity !== null && <div><Users size={20} /><span>จำนวนผู้เข้าร่วม<strong>{activity.capacity} คน</strong></span></div>}<div><CheckCircle2 size={20} /><span>ค่าเข้าร่วม<strong>{activity.priceLabel || (activity.isFree ? "ร่วมกิจกรรมฟรี" : activity.price !== null ? `${activity.price.toLocaleString("th-TH")} บาท` : "สอบถามเจ้าหน้าที่")}</strong></span></div></div>
    <section className="activity-detail"><h2>วิชานี้มีอะไรให้ลอง?</h2><p>{activity.description || activity.shortDescription || "พบกับกิจกรรมของคณะศิลปกรรมศาสตร์ และร่วมสนุกกับรุ่นพี่ที่จุดกิจกรรม"}</p>{activity.pointsEnabled && <div className="activity-points-note"><ScrollText size={20} /><span>{awarded ? "รับแต้มกิจกรรมของสถานที่นี้แล้ว กิจกรรมต่อไปบันทึกตราโดยไม่เพิ่มแต้ม" : `กิจกรรมที่ให้แต้มครั้งแรกในสถานที่นี้ +${activity.pointsAwarded} แต้ม · `}{pointRules[activity.pointGrantMode]}{activity.repeatLimit ? ` · สูงสุด ${activity.repeatLimit} ครั้ง` : ""}</span></div>}</section>
    {venue && <section className="activity-location"><Link to={`/venue/${venue.id}`} className="activity-location-photo"><VenuePhoto identity={venue.visualIdentityKey} name={venue.name} /></Link><div><span className="section-kicker">MEET YOU HERE</span><h2><MapPin size={20} />{venue.name}</h2><p>{meta.title}</p><div className="activity-location-actions"><Link to={`/venue/${venue.id}`}>ดูสถานที่ <ArrowRight size={15} /></Link><GuardianButton identity={venue.visualIdentityKey} /></div></div></section>}
    <div className="activity-actions">{activity.registrationMode === "external" && /^https?:\/\//.test(activity.registrationUrl) && <a className="button-imperial-red" href={activity.registrationUrl} target="_blank" rel="noreferrer">{activity.ctaLabel || "ลงทะเบียนกิจกรรม"}<ArrowRight size={18} /></a>}{staffOnly ? <p>เมื่อทำกิจกรรมสำเร็จ ให้เจ้าหน้าที่บันทึกผลลงใบเบิกทาง</p> : (activity.completionMethod === "qr" || activity.pointsEnabled) && <Link className="scroll-scan-cta" to="/scan"><ScrollText size={27} /><span><small>ทำกิจกรรมสำเร็จแล้ว?</small><strong>เปิดคัมภีร์สแกน</strong></span><ArrowRight size={19} /></Link>}<Link className="button-gold-outline" to="/map">ดูเส้นทางไปสถานที่จัดงาน <MapPin size={17} /></Link></div>
  </div>;
}

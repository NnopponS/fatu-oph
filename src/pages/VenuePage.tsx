import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Award, CheckCircle2, Clock, MapPin, Navigation, ScrollText, Sparkles } from "lucide-react";
import { useActivities, useMedia, useVenues, resolveMediaUrl } from "@/data/content";
import { useAuth } from "@/contexts/AuthContext";
import { GuardianButton, VenuePhoto } from "@/components/RealmPlaces";
import { PointMedallion } from "@/components/DragonScroll";
import { QiParticles } from "@/components/WuxiaScene";
import { LatticeCorners, SilkDivider } from "@/components/ChineseOrnaments";
import { realmFor } from "@/lib/realms";
import { activityTiming, scheduleDateLabel } from "@/lib/schedule";
import { hasVenueActivityAward } from "@/lib/reward-policy";

export function VenuePage() {
  const { id } = useParams(); const venues = useVenues(); const activities = useActivities(); const media = useMedia(); const { profile } = useAuth();
  const venue = venues.items.find(item => item.id === id);
  if (venues.loading) return <div className="places-page" role="status">กำลังเปิดคัมภีร์สถานที่...</div>;
  if (!venue) return <section className="places-page"><h1>ไม่พบสถานที่นี้</h1><Link to="/explore">กลับไปเลือกสถานที่</Link></section>;
  const meta = realmFor(venue.visualIdentityKey);
  const related = activities.items.filter(item => item.venueId === id && !item.isArchived);
  const completed = new Set((profile?.transactions || []).map(item => item.activityId).filter(Boolean));
  const isDone = (activity: typeof related[number]) => completed.has(activity.id) || completed.has(activity.slug);
  const count = related.filter(isDone).length;
  const awarded = hasVenueActivityAward(profile?.transactions || [], venue.id);
  const maxPoints = Math.max(0,...related.filter(activity=>activity.pointsEnabled).map(activity=>activity.pointsAwarded));
  return <div className="venue-expedition" style={{ "--realm-color": meta.color } as CSSProperties}>
    <Link className="venue-back" to="/explore"><ArrowLeft size={17} />เลือกสถานที่อื่น</Link>
    <section className="venue-real-hero">
      <LatticeCorners />
      <VenuePhoto identity={venue.visualIdentityKey} name={venue.name} cover={resolveMediaUrl(venue.coverMediaId, media.items)} priority />
      <div className="venue-photo-caption"><MapPin size={13} />{meta.photoLabel}</div><QiParticles count={8} />
      <div className="venue-real-heading"><span>{meta.title}</span><h1>{venue.name}</h1><p>{venue.description || "สัมผัสโลกศิลปะ ร่วมกิจกรรม และเก็บตราประทับประจำสถานที่"}</p><div className="venue-hero-actions"><GuardianButton identity={venue.visualIdentityKey} />{profile?.visits?.[venue.id] && <span className="venue-collected"><CheckCircle2 size={16} />เช็กอินแล้ว</span>}</div></div>
    </section>
    <SilkDivider label="คัมภีร์ประจำดินแดน" />
    <Link to="/scan" className="scroll-scan-cta"><span className="mini-scroll-icon"><ScrollText size={25} /></span><span><small>ปลุกพลังคัมภีร์แดนมังกร</small><strong>สแกนเช็กอินที่นี่</strong></span><ArrowRight size={22} /></Link>
    <section className="venue-mission-progress"><Award size={24} /><div><strong>ภารกิจประจำ{venue.name}</strong><p>{count} / {related.length} ภารกิจสำเร็จ{maxPoints > 0 ? awarded ? " · รับแต้มกิจกรรมของสถานที่นี้แล้ว" : ` · กิจกรรมที่ให้แต้มครั้งแรก +${maxPoints} แต้ม` : ""}</p><div className="progress-track" role="progressbar" aria-label="ภารกิจที่สำเร็จ" aria-valuemin={0} aria-valuemax={related.length || 1} aria-valuenow={count}><div className="progress-fill" style={{ width: `${related.length ? count / related.length * 100 : 0}%` }} /></div></div></section>
    <section className="venue-missions"><div className="places-section-heading"><div><span className="section-kicker">YOUR NEXT CHALLENGE</span><h2>วิชาที่รอให้คุณค้นพบ</h2></div><Sparkles size={22} /></div>
      {activities.loading && <p role="status">กำลังโหลดกิจกรรม...</p>}{!activities.loading && !related.length && <p>ติดตามกิจกรรมของสถานที่นี้ได้เร็ว ๆ นี้</p>}
      {related.map((activity, index) => {
        const start = activityTiming(activity.startAt); const end = activityTiming(activity.endAt); const done = isDone(activity);
        return <article className={`venue-mission-card ${done ? "done" : ""}`} key={activity.id}><div className="mission-card-top"><span className="mission-index">วิชาที่ {String(index + 1).padStart(2, "0")}</span>{activity.pointsEnabled && (awarded && !done ? <span className="mission-staff-note">ร่วมสนุก · บันทึกตรา</span> : <PointMedallion points={activity.pointsAwarded} completed={done} />)}</div><h3>{activity.title}</h3><p>{activity.shortDescription || activity.description || "เข้ามาร่วมกิจกรรมและค้นพบสิ่งที่คุณชอบ"}</p><div className="mission-card-bottom"><span className="mission-time"><Clock size={15} />{start.time ? `${start.date ? `${scheduleDateLabel(start.date)} · ` : ""}${start.time}${end.time ? `–${end.time}` : ""} น.` : "สอบถามเวลาที่จุดกิจกรรม"}</span>
          {done ? <span className="mission-completed"><CheckCircle2 size={17} />ผ่านวิชาแล้ว</span> : activity.requiresStaffVerification || activity.completionMethod === "staff" ? <span className="mission-staff-note">ให้เจ้าหน้าที่บันทึกผล</span> : activity.completionMethod === "qr" || activity.pointsEnabled ? <Link className="mission-scan" to="/scan"><ScrollText size={17} />เปิดคัมภีร์สแกน</Link> : <Link className="mission-scan" to="/schedule">ดูตาราง <ArrowRight size={15} /></Link>}
        </div>{activity.registrationMode === "external" && /^https?:\/\//.test(activity.registrationUrl) && <a className="mission-registration" href={activity.registrationUrl} target="_blank" rel="noreferrer">{activity.ctaLabel || "ลงทะเบียนกิจกรรม"}<ArrowRight size={15} /></a>}</article>;
      })}
    </section>
    <section className="venue-directions"><MapPin size={23} /><div><h2>เดินทางมา{venue.name}</h2><p>{venue.directions || venue.landmarkNotes || "คณะศิลปกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต"}</p><a href={venue.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name} คณะศิลปกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์ รังสิต`)}`} target="_blank" rel="noreferrer"><Navigation size={16} />เปิดเส้นทางนำทาง <ArrowRight size={16} /></a></div></section>
  </div>;
}

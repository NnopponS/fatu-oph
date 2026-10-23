import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, CalendarDays, Clock3, MapPin, QrCode, Sparkles, Ticket } from "lucide-react";
import { useActivities, useSite, useVenues } from "@/data/content";
import { useAuth } from "@/contexts/AuthContext";
import { realmFor } from "@/lib/realms";
import { activityTiming } from "@/lib/schedule";
import { isFirebaseConfigured } from "@/lib/firebase";
import { RewardProgress } from "@/components/RewardProgress";

export function HomePage() {
  const site = useSite(); const venues = useVenues(); const activities = useActivities();
  const { profile } = useAuth();
  const headline = site.item?.heroTitle || "เปิดโลกศิลปะ\nค้นพบตัวตนใหม่.";
  const workshops = activities.items.filter(item => item.category === "workshop");
  const featured = [...new Map(workshops.map(item => [item.title.split(" · ")[0], item])).values()].slice(0, 4);
  const shows = activities.items.filter(item => item.category === "performance").sort((a,b) => a.startAt.localeCompare(b.startAt));
  return <div className="premium-home">
    <section className="discovery-hero">
      <div className="discovery-copy">
        <span className="editorial-kicker"><i /> FACULTY OF FINE AND APPLIED ARTS</span>
        <div className="hero-edition">THAMMASAT UNIVERSITY <span>OPEN HOUSE / 2026</span></div>
        <h1>{headline.split("\n").map((line,index) => <span className={index ? "headline-line accented" : "headline-line"} key={index}>{line}</span>)}</h1>
        <p className="hero-description">{site.item?.heroDescription || "ตะลุยแดนมังกรไปกับ FATU Open House\nลอง ลงมือทำ และปล่อยให้ความคิดสร้างสรรค์พาคุณไป"}</p>
        <div className="hero-actions"><Link to="/schedule" className="premium-button">{site.item?.heroCtaText || "ค้นหากิจกรรมที่ใช่"} <ArrowRight size={18} /></Link><Link to="/explore" className="premium-text-link">สำรวจสถานที่ <ArrowRight size={16} /></Link></div>
        <div className="hero-date"><CalendarDays size={20} /><div><strong>{site.item?.dateLabel || "30 ตุลาคม 2569"}</strong><span>{site.item?.locationLabel || "มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต"}</span></div></div>
      </div>
      <div className="discovery-art"><img src="/images/azure-dragon-art.webp" alt="มังกรฟ้าสีหยกท่ามกลางหมู่เมฆและแสงสีทอง สัญลักษณ์การผจญภัยในโลกศิลปะ" {...{fetchpriority:"high"}} /><div className="art-topline"><span>THE CREATIVE JOURNEY</span><Sparkles size={17} /></div><div className="art-caption"><span>ตะลุยแดนมังกร</span><strong>Let your creativity<br />take flight.</strong><span className="art-coordinate">FATU · RANGSIT CAMPUS</span></div><span className="art-seal" aria-hidden="true">藝</span></div>
    </section>

    <div className="event-facts"><div><span>THE DATE</span><strong>30 OCT <small>2026</small></strong></div><div><span>THE EXPERIENCE</span><strong>{workshops.length} <small>รอบเวิร์กช็อป</small></strong></div><div><span>THE DESTINATIONS</span><strong>03 <small>พื้นที่จัดกิจกรรมตามแผน</small></strong></div><a href="#discover"><span>YOUR NEXT CHAPTER</span><strong>เริ่มสำรวจ <ArrowDown size={19} /></strong></a></div>

    {profile && <section className="member-welcome"><div><span className="editorial-kicker">YOUR JOURNEY</span><h2>ยินดีต้อนรับ {profile.displayName || profile.username}</h2><p>{profile.pointTotal || 0} แต้มสะสม · เก็บความทรงจำในใบเบิกทางของคุณ</p></div><Link to="/scan" className="premium-button"><QrCode size={18} /> สแกนเช็กอิน</Link></section>}
    {profile && <RewardProgress />}

    <section id="discover" className="editorial-section">
      <div className="editorial-heading"><div><span className="editorial-kicker">FIND YOUR SPARK</span><h2>หนึ่งวัน หลายความเป็นไปได้</h2><p>ไม่ต้องเก่งมาก่อน แค่พกความอยากลองมาให้เต็มที่</p></div><Link to="/schedule">ดูทุกกิจกรรม <ArrowRight size={17} /></Link></div>
      <div className="experience-grid">{featured.map((activity, index) => {
        const venue = venues.items.find(v => v.id === activity.venueId); const meta = realmFor(venue?.visualIdentityKey || "azure-dragon");
        const title = activity.title.split(" · ")[0];
        const sessions = workshops.filter(item => item.title.split(" · ")[0] === title);
        return <Link className="experience-card" to={`/activity/${sessions[0]?.id || activity.id}`} key={activity.id}><div className={`experience-art experience-art-${index}`}><img src={meta.photo} alt={venue?.name || "สถานที่จัดกิจกรรม"} loading="lazy" /><span>WORKSHOP</span><div className="experience-index">0{index + 1}</div><span className="experience-open"><ArrowRight size={21} /></span></div><div className="experience-info"><span>{venue?.name} · {sessions.length} รอบ</span><h3>{title}</h3><p>{activity.shortDescription}</p><div><Clock3 size={15} /> เริ่ม {activityTiming(sessions[0]?.startAt || "").time} น. <ArrowRight size={16} /></div></div></Link>;
      })}</div>
    </section>

    <section className="editorial-section destinations-section"><div className="editorial-heading"><div><span className="editorial-kicker">PLACES TO GET INSPIRED</span><h2>ทุกสถานที่ มีเรื่องราวให้ค้นพบ</h2></div><Link to="/map"><MapPin size={16} /> เปิดแผนที่</Link></div><div className="destination-grid">{venues.items.map((venue,index) => { const meta = realmFor(venue.visualIdentityKey); const count = activities.items.filter(a => a.venueId === venue.id).length; return <Link className="destination-card" to={`/venue/${venue.id}`} key={venue.id}><img src={meta.photo} alt={venue.name} loading="lazy" /><div className="destination-shade" /><span className="destination-number">0{index+1} / EXPLORE</span><div className="destination-info"><small>{meta.guardian}</small><h3>{venue.name}</h3><span>{count ? `${count} กิจกรรมตามแผน` : "ยังไม่มีกิจกรรมในแผนฉบับนี้"}<ArrowRight size={18} /></span></div></Link>; })}</div></section>

    <section className="stage-section"><div className="stage-intro"><span className="editorial-kicker">THE STAGE IS YOURS</span><h2>ศิลปะที่มีชีวิต<br />ความทรงจำที่มีเสียง</h2><p>พักจากเวิร์กช็อป แล้วมาพบกันหน้าเวที<br />กับละคร ดนตรี และพลังสร้างสรรค์ของ FATU</p><Link to="/schedule?category=performance" className="premium-text-link">ดูตารางการแสดง <ArrowRight size={17} /></Link><span className="stage-symbol" aria-hidden="true">藝</span></div><div className="stage-list">{shows.map(show => <Link to={`/activity/${show.id}`} key={show.id}><time>{activityTiming(show.startAt).time}<span>{activityTiming(show.endAt).time}</span></time><div><small>{show.room || "โรงละคอน"}</small><h3>{show.title}</h3></div><ArrowRight size={18} /></Link>)}</div></section>

    <section className="visit-banner"><div><span className="editorial-kicker">MAKE IT A DAY TO REMEMBER</span><h2>เจอกันที่ธรรมศาสตร์ รังสิต</h2><p>ลงทะเบียนหน้างาน 07:00–09:00 น. ที่โรงละคอน โรงทอ และห้อง ArtSa ตึก SC3</p><small>สถานที่และเวลาอาจเปลี่ยนแปลงตามความเหมาะสม</small></div><Link to="/schedule" className="premium-button"><Ticket size={18} /> วางแผนวันของคุณ</Link></section>
    <footer className="editorial-footer"><div className="footer-brand">FATU<span>OPEN HOUSE 2026</span></div><p>คณะศิลปกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์<br />พื้นที่ของความคิดสร้างสรรค์ และตัวตนที่เป็นคุณ</p><div><Link to="/faq">ข้อมูลงาน</Link><a href="/documents/open-house-plan-2026.pdf" target="_blank" rel="noreferrer">แผนกิจกรรม PDF</a><Link to="/admin/plan">สำหรับทีมงาน</Link></div><small>{!isFirebaseConfigured ? "ข้อมูลจากแผนกิจกรรม · โหมดดูข้อมูล (ยังไม่เชื่อมระบบสมาชิก)" : "FATU OPEN HOUSE 2026 · THAMMASAT UNIVERSITY"}</small></footer>
  </div>;
}

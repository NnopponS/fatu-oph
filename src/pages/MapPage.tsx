import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin, Navigation, Route } from "lucide-react";
import { useActivities, useVenues } from "@/data/content";
import { useAuth } from "@/contexts/AuthContext";
import { RealmPlaceCard } from "@/components/RealmPlaces";
import { ChineseHero } from "@/components/ChineseOrnaments";

export function MapPage() {
  const venues = useVenues(); const activities = useActivities(); const { profile } = useAuth();
  return <div className="places-page map-expedition">
    <ChineseHero className="places-intro" kicker={<><Route size={16} /> EXPEDITION MAP</>} title={<>ออกเดินทาง<br /><em>สู่แดนมังกร</em></>} description={<>คณะศิลปกรรมศาสตร์ · มธ. ศูนย์รังสิต<br />ดูภาพอาคาร เลือกสถานที่ แล้วเปิดเส้นทางนำทาง</>} seal="遊"><div className="map-route-stops" aria-label="สถานที่จัดงาน">{venues.items.map((venue, index) => <a key={venue.id} href={`#place-${venue.id}`} onClick={event => { event.preventDefault(); document.getElementById(`place-${venue.id}`)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }); }}><b>{index + 1}</b><span>{venue.name}</span></a>)}</div></ChineseHero>
    {venues.loading && <p role="status">กำลังโหลดแผนที่...</p>}{venues.error && <p role="alert">{venues.error}</p>}
    <div className="map-places-list">{venues.items.map((venue, index) => <section id={`place-${venue.id}`} key={venue.id} className="map-place-stop">
      <RealmPlaceCard venue={venue} index={index} count={activities.items.filter(activity => activity.venueId === venue.id).length} visited={Boolean(profile?.visits?.[venue.id])} />
      <div className="map-place-directions"><MapPin size={17} /><p>{venue.directions || venue.landmarkNotes || "ตั้งอยู่ในพื้นที่จัดงานคณะศิลปกรรมศาสตร์"}</p></div>
      <a className="map-navigation-button" href={venue.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name} คณะศิลปกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์ รังสิต`)}`} target="_blank" rel="noreferrer"><Navigation size={18} />นำทางไป{venue.name}<ArrowUpRight size={18} /></a>
    </section>)}</div>
    <aside className="travel-note"><Route size={22} /><div><strong>เดินทางในจังหวะของคุณ</strong><p>เลือกจุดเริ่มต้นได้ตามสะดวก ดูป้ายหน้างานหรือสอบถามเจ้าหน้าที่เรื่องรถรับส่งและจุดจอดรถ</p><Link to="/schedule">จัดเส้นทางจากตารางกิจกรรม <ArrowUpRight size={16} /></Link></div></aside>
  </div>;
}

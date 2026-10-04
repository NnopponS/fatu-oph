import { VenuePhoto } from "@/components/RealmPlaces";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Compass, ScrollText, Swords } from "lucide-react";
import { useVenues } from "@/data/content";
import { useAuth } from "@/contexts/AuthContext";

export function JourneyBoard() {
  const venues = useVenues(); const { profile } = useAuth();
  const visited = new Set(Object.keys(profile?.visits || {}));
  const total = venues.items.length;
  const completed = venues.items.filter(venue => visited.has(venue.id)).length;
  const selected = sessionStorage.getItem("fatu_chosen_realm");
  const next = venues.items.find(venue => !visited.has(venue.id) && venue.visualIdentityKey === selected) || venues.items.find(venue => !visited.has(venue.id));
  if (!total) return null;
  return <section className="journey-board">
    <div className="journey-heading"><span className="eyebrow"><Swords size={15} /> THE FOUR GUARDIANS</span><Link to="/profile"><ScrollText size={15} />ใบเบิกทาง</Link></div>
    <h2>{completed === total ? "ผู้พิทักษ์ครบทุกสถานที่แล้ว" : "เก็บตราประทับให้ครบ"}</h2><p>{profile ? `คุณสำรวจแล้ว ${completed} จาก ${total} สถานที่` : "เริ่มการเดินทาง แล้วสะสมเรื่องราวของคุณ"}</p>
    <div className="journey-seals">{venues.items.map(venue => <Link to={`/venue/${venue.id}`} key={venue.id} className={visited.has(venue.id) ? "journey-seal collected" : "journey-seal"}><span><VenuePhoto identity={venue.visualIdentityKey} name={venue.name} />{visited.has(venue.id) && <i><Check size={12} /></i>}</span><strong>{venue.name}</strong><small>{visited.has(venue.id) ? "ประทับแล้ว" : "รอคุณไปสำรวจ"}</small></Link>)}</div>
    <div className="journey-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed} aria-label="จำนวนสถานที่ที่สำรวจแล้ว"><span style={{ width: `${completed / total * 100}%` }} /></div>
    <Link className="journey-next" to={next ? `/venue/${next.id}` : "/rewards"}><Compass size={19} /><span><small>{next ? "เส้นทางถัดไป" : "ภารกิจครบแล้ว"}</small><strong>{next?.name || "ดูรางวัลและบัตรรับของ"}</strong></span><ArrowRight size={18} /></Link>
    <Link className="journey-schedule" to="/schedule">เปิดคัมภีร์กิจกรรมทั้งหมด <ArrowRight size={14} /></Link>
  </section>;
}

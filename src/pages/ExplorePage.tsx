import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { useActivities, useVenues } from "@/data/content";
import { useAuth } from "@/contexts/AuthContext";
import { RealmPlaceCard } from "@/components/RealmPlaces";

export function ExplorePage() {
  const venues = useVenues(); const activities = useActivities(); const { profile } = useAuth();
  return <section className="places-page">
    <div className="places-intro"><span className="section-kicker">THE FOUR GUARDIANS</span><h1>สี่สถานที่<br /><em>หนึ่งการผจญภัย</em></h1><p>เลือกกิจกรรมที่ชอบ ออกไปสำรวจ<br />และเก็บตราประทับให้ครบทุกสถานที่</p><Link to="/map"><MapPin size={16} />เปิดแผนที่งาน <ArrowRight size={16} /></Link></div>
    {venues.loading && <p role="status">กำลังโหลดสถานที่...</p>}{venues.error && <p role="alert">{venues.error}</p>}
    <div className="realm-place-grid">{venues.items.map((venue, index) => <RealmPlaceCard key={venue.id} venue={venue} index={index} count={activities.items.filter(activity => activity.venueId === venue.id).length} visited={Boolean(profile?.visits?.[venue.id])} />)}</div>
  </section>;
}

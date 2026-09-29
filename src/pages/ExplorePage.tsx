import { Link } from "react-router-dom";
import { useActivities, useVenues } from "@/data/content";

export function ExplorePage() {
  const venues = useVenues();
  const activities = useActivities();

  return (
    <section className="page-section">
      <span className="section-kicker">EXPLORE</span>
      <h1 className="page-title">สถานที่ภายในงาน</h1>
      <p className="page-lead">ชื่อสถานที่จริงเป็นข้อมูลหลัก ส่วนสัตว์ในตำนานใช้เป็น visual identity เท่านั้น</p>
      {venues.loading ? <p className="content-status">กำลังโหลดสถานที่...</p> : null}
      {venues.error ? <p className="content-status content-error">{venues.error}</p> : null}
      <div className="venue-list">
        {venues.items.map((venue, index) => {
          const count = activities.items.filter((activity) => activity.venueId === venue.id).length;
          return (
            <Link className="venue-list-item venue-list-link" to={`/venue/${venue.id}`} key={venue.id}>
              <span className="venue-index">{String(index + 1).padStart(2, "0")}</span>
              <div><span className="venue-identity">{venue.visualLabel}</span><h2>{venue.name}</h2><p>{venue.description || "ดูรายละเอียดสถานที่"} · {count} กิจกรรม</p></div>
            </Link>
          );
        })}
      </div>
      <div className="action-row"><Link className="secondary-button" to="/map">เปิดหน้าการเดินทาง</Link><Link className="secondary-button" to="/checkin">สแกน QR กิจกรรม</Link></div>
    </section>
  );
}

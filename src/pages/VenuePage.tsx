import { Link, useParams } from "react-router-dom";
import { resolveMediaUrl, useActivities, useMedia, useVenues } from "@/data/content";

export function VenuePage() {
  const { id = "" } = useParams();
  const venues = useVenues();
  const activities = useActivities();
  const media = useMedia();
  const venue = venues.items.find((item) => item.id === id);

  if (venues.loading || activities.loading) return <section className="page-section"><p>กำลังโหลด...</p></section>;
  if (!venue) return <section className="page-section"><h1>ไม่พบสถานที่</h1></section>;

  const related = activities.items.filter((activity) => activity.venueId === id);

  return (
    <section className="page-section">
      <span className="section-kicker">{venue.visualLabel}</span>
      <h1 className="page-title">{venue.name}</h1>
      <p className="page-lead">{venue.description || "รายละเอียดสถานที่จะอัปเดตโดยทีมงาน"}</p>
      {resolveMediaUrl(venue.coverMediaId || "", media.items) ? <img className="cover-image" src={resolveMediaUrl(venue.coverMediaId || "", media.items)} alt={venue.name} /> : null}

      <div className="info-card">
        <h2>การเดินทาง</h2>
        <p>{venue.directions || "ทีมงานกำลังอัปเดตข้อมูลการเดินทาง"}</p>
        <a
          className="secondary-button"
          href={venue.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + " มหาวิทยาลัยธรรมศาสตร์ รังสิต")}`}
          target="_blank"
          rel="noreferrer"
        >
          เปิดแผนที่
        </a>
      </div>

      <h2 className="subheading">กิจกรรมที่ {venue.name}</h2>
      <div className="content-list">
        {related.length ? related.map((activity) => (
          <Link className="content-card" to={`/activity/${activity.id}`} key={activity.id}>
            <div>
              <strong>{activity.title}</strong>
              <p>{activity.shortDescription || activity.description}</p>
            </div>
            {activity.pointsEnabled ? <span className="pill">+{activity.pointsAwarded} แต้ม</span> : null}
          </Link>
        )) : <p className="content-status">ยังไม่มีกิจกรรมที่เผยแพร่</p>}
      </div>
    </section>
  );
}

import { Link, useParams } from "react-router-dom";
import { resolveMediaUrl, useActivities, useMedia, useVenues } from "@/data/content";

function formatTime(value: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function ActivityPage() {
  const { id = "" } = useParams();
  const activities = useActivities();
  const venues = useVenues();
  const media = useMedia();
  const activity = activities.items.find((item) => item.id === id);

  if (activities.loading || venues.loading) return <section className="page-section"><p>กำลังโหลด...</p></section>;
  if (!activity) return <section className="page-section"><h1>ไม่พบกิจกรรม</h1></section>;

  const venue = venues.items.find((item) => item.id === activity.venueId);

  return (
    <section className="page-section">
      <span className="section-kicker">ACTIVITY</span>
      <h1 className="page-title">{activity.title}</h1>
      <p className="page-lead">{activity.shortDescription || activity.description}</p>
      {resolveMediaUrl(activity.coverMediaId || "", media.items) ? <img className="cover-image" src={resolveMediaUrl(activity.coverMediaId || "", media.items)} alt={activity.title} /> : null}

      <div className="detail-grid">
        <div className="info-card">
          <span>สถานที่</span>
          <strong>{venue?.name || activity.venueId}</strong>
          {venue ? <Link to={`/venue/${venue.id}`}>ดูสถานที่</Link> : null}
        </div>
        <div className="info-card">
          <span>เวลา</span>
          <strong>{formatTime(activity.startAt) || "ตรวจสอบที่หน้างาน"}</strong>
          {activity.endAt ? <small>ถึง {formatTime(activity.endAt)}</small> : null}
        </div>
        <div className="info-card">
          <span>สถานะ</span>
          <strong>{activity.availabilityStatus}</strong>
          {activity.capacity !== null ? <small>จำนวนรับ {activity.capacity} คน</small> : null}
        </div>
        <div className="info-card">
          <span>คะแนน</span>
          <strong>{activity.pointsEnabled ? `+${activity.pointsAwarded} แต้ม` : "ไม่ให้คะแนน"}</strong>
          {activity.pointsEnabled ? <small>{activity.pointGrantMode}</small> : null}
        </div>
      </div>

      <div className="prose-card">
        <h2>รายละเอียด</h2>
        <p>{activity.description || "ไม่มีรายละเอียดเพิ่มเติม"}</p>
      </div>

      <div className="action-row">
        {activity.registrationMode === "external" && activity.registrationUrl ? (
          <a className="primary-button" href={activity.registrationUrl} target="_blank" rel="noreferrer">ลงทะเบียนกิจกรรม</a>
        ) : null}
        {activity.completionMethod === "qr" ? <Link className="secondary-button" to="/checkin">สแกน QR เข้าร่วม</Link> : null}
      </div>
    </section>
  );
}

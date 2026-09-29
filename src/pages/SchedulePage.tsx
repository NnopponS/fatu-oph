import { Link } from "react-router-dom";
import { useActivities, useVenues } from "@/data/content";

export function SchedulePage() {
  const activities = useActivities();
  const venues = useVenues();
  const sorted = [...activities.items]
    .filter((item) => item.startAt)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));

  return (
    <section className="page-section">
      <span className="section-kicker">SCHEDULE</span>
      <h1 className="page-title">ตารางกิจกรรม</h1>
      <p className="page-lead">ตารางนี้อัปเดตจากข้อมูลที่ทีมงานเผยแพร่ในระบบ Admin</p>
      {activities.loading ? <p>กำลังโหลด...</p> : null}
      <div className="timeline">
        {sorted.length ? sorted.map((activity) => {
          const venue = venues.items.find((item) => item.id === activity.venueId);
          const date = new Date(activity.startAt);
          return (
            <Link className="timeline-item" to={`/activity/${activity.id}`} key={activity.id}>
              <time>{Number.isNaN(date.getTime()) ? activity.startAt : new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit" }).format(date)}</time>
              <div>
                <strong>{activity.title}</strong>
                <p>{venue?.name || activity.venueId}</p>
              </div>
            </Link>
          );
        }) : <p className="content-status">ยังไม่มีตารางกิจกรรมที่เผยแพร่</p>}
      </div>
    </section>
  );
}

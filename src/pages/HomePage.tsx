import { ArrowRight, MapPinned, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { resolveMediaUrl, useActivities, useAnnouncements, useMedia, useSite, useVenues } from "@/data/content";

export function HomePage() {
  const site = useSite();
  const venues = useVenues();
  const activities = useActivities();
  const announcements = useAnnouncements();
  const media = useMedia();

  return (
    <>
      <section className="hero">
        <div className="hero-pattern" aria-hidden="true" />
        <div className="eyebrow"><Sparkles size={16} strokeWidth={1.8} />{site.item?.name || "FATU OPEN HOUSE 2026"}</div>
        <h1>{site.item?.theme || "ตะลุยแดนมังกร"}</h1>
        <p>{site.item?.description || "สำรวจสถานที่จริง ดูกิจกรรม ตารางงาน สะสมแต้ม และใช้บัตร Open House ได้จากมือถือเครื่องเดียว"}</p>
        {site.item?.dateLabel || site.item?.locationLabel ? <p className="hero-meta">{[site.item?.dateLabel, site.item?.locationLabel].filter(Boolean).join(" · ")}</p> : null}
        <div className="action-row">
          <Link className="primary-button" to="/explore">เริ่มสำรวจ <ArrowRight size={18} /></Link>
          {site.item?.registrationOpen !== false ? <Link className="hero-secondary" to="/pass">สร้างบัตร</Link> : null}
        </div>
      </section>

      {announcements.items.length ? <section className="section announcement-list">{announcements.items.slice(0, 3).map((item) => <article className={"notice-card " + (item.level === "important" ? "important" : "")} key={item.id}><strong>{item.title}</strong><p>{item.body}</p></article>)}</section> : null}

      <section className="section">
        <div className="section-heading"><div><span className="section-kicker">สถานที่</span><h2>4 จุดหลักภายในงาน</h2></div><MapPinned size={24} strokeWidth={1.6} /></div>
        {venues.loading ? <p className="content-status">กำลังโหลดสถานที่...</p> : null}
        {venues.error ? <p className="content-status content-error">{venues.error}</p> : null}
        <div className="venue-grid">
          {venues.items.map((venue) => {
            const cover = resolveMediaUrl(venue.coverMediaId || "", media.items);
            return (
              <Link className={"venue-card venue-" + venue.visualIdentityKey} key={venue.id} to={`/venue/${venue.id}`}>
                {cover ? <img className="venue-card-image" src={cover} alt="" aria-hidden="true" /> : <div className="venue-card-art" aria-hidden="true" />}
                <div className="venue-card-content"><span>{venue.visualLabel}</span><h3>{venue.name}</h3><p>{venue.description || "ดูสถานที่และกิจกรรม"}</p></div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-heading"><div><span className="section-kicker">กิจกรรม</span><h2>กิจกรรมที่เผยแพร่</h2></div><Link className="text-link" to="/schedule">ดูตาราง</Link></div>
        <div className="content-list">
          {activities.items.slice(0, 6).map((activity) => <Link className="content-card" to={`/activity/${activity.id}`} key={activity.id}><div><strong>{activity.title}</strong><p>{activity.shortDescription || activity.description}</p></div>{activity.pointsEnabled ? <span className="pill">+{activity.pointsAwarded}</span> : null}</Link>)}
          {!activities.loading && !activities.items.length ? <p className="content-status">ยังไม่มีกิจกรรมที่เผยแพร่</p> : null}
        </div>
      </section>
    </>
  );
}

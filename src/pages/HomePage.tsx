import { ArrowRight, MapPinned, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { usePublishedVenues } from "@/data/venues";

export function HomePage() {
  const { venues, loading, error } = usePublishedVenues();

  return (
    <>
      <section className="hero">
        <div className="hero-pattern" aria-hidden="true" />
        <div className="eyebrow">
          <Sparkles size={16} strokeWidth={1.8} />
          FATU OPEN HOUSE 2026
        </div>
        <h1>ตะลุยแดนมังกร</h1>
        <p>
          สำรวจคณะศิลปกรรมศาสตร์ผ่านสถานที่จริง กิจกรรมภายในงาน
          และระบบสะสมแต้มที่จัดการได้จากส่วน Admin
        </p>
        <Link className="primary-button" to="/explore">
          ดูสถานที่
          <ArrowRight size={18} />
        </Link>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">สถานที่</span>
            <h2>ใช้ชื่อสถานที่จริงทุกจุด</h2>
          </div>
          <MapPinned size={24} strokeWidth={1.6} />
        </div>

        {loading ? <p className="content-status">กำลังโหลดสถานที่...</p> : null}
        {error ? <p className="content-status content-error" role="alert">{error}</p> : null}

        {!loading && !error ? (
          <div className="venue-grid">
            {venues.map((venue) => (
              <article
                className={"venue-card venue-" + venue.visualIdentityKey}
                key={venue.id}
              >
                <div className="venue-card-art" aria-hidden="true" />
                <div className="venue-card-content">
                  <span>{venue.visualLabel}</span>
                  <h3>{venue.name}</h3>
                  <p>รายละเอียดสถานที่และกิจกรรมจะอัปเดตจากระบบ Admin</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}

import { ArrowRight, MapPinned, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { venueSeeds } from "@/data/venues";

export function HomePage() {
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

        <div className="venue-grid">
          {venueSeeds.map((venue) => (
            <article className={"venue-card venue-" + venue.visualIdentity} key={venue.id}>
              <div className="venue-card-art" aria-hidden="true" />
              <div className="venue-card-content">
                <span>{venue.visualLabel}</span>
                <h3>{venue.name}</h3>
                <p>รูปสถานที่จริงและกิจกรรมจะถูกเพิ่มผ่านระบบ Content/Admin ภายหลัง</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

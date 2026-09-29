import { useVenues } from "@/data/content";

export function MapPage() {
  const { items, loading } = useVenues();

  return (
    <section className="page-section">
      <span className="section-kicker">MAP</span>
      <h1 className="page-title">แผนที่และการเดินทาง</h1>
      <p className="page-lead">ใช้ชื่อสถานที่จริงทุกจุด เพื่อให้ค้นหาและเดินทางหน้างานได้ง่าย</p>
      {loading ? <p>กำลังโหลด...</p> : null}
      <div className="content-list">
        {items.map((venue) => (
          <article className="content-card static-card" key={venue.id}>
            <div>
              <span className="venue-identity">{venue.visualLabel}</span>
              <strong>{venue.name}</strong>
              <p>{venue.directions || "กดเปิดแผนที่เพื่อค้นหาสถานที่"}</p>
            </div>
            <a
              className="secondary-button compact"
              href={venue.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + " มหาวิทยาลัยธรรมศาสตร์ รังสิต")}`}
              target="_blank"
              rel="noreferrer"
            >
              นำทาง
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

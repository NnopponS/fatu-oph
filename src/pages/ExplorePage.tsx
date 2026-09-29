import { usePublishedVenues } from "@/data/venues";

export function ExplorePage() {
  const { venues, loading, error } = usePublishedVenues();

  return (
    <section className="page-section">
      <span className="section-kicker">EXPLORE</span>
      <h1 className="page-title">สถานที่ภายในงาน</h1>
      <p className="page-lead">
        ชื่อสถานที่จริงเป็นข้อมูลหลัก ส่วนสัตว์ในตำนานใช้เพื่อสร้างบรรยากาศและ visual identity เท่านั้น
      </p>

      {loading ? <p className="content-status">กำลังโหลดสถานที่...</p> : null}
      {error ? <p className="content-status content-error" role="alert">{error}</p> : null}

      {!loading && !error ? (
        <div className="venue-list">
          {venues.map((venue, index) => (
            <article className="venue-list-item" key={venue.id}>
              <span className="venue-index">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <span className="venue-identity">{venue.visualLabel}</span>
                <h2>{venue.name}</h2>
                <p>รายละเอียดการเดินทางและกิจกรรมจะอัปเดตจากระบบ Admin</p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

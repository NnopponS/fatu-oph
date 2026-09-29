import { Link } from "react-router-dom";

export function AdminPlaceholderPage() {
  return (
    <main className="standalone-page">
      <div className="admin-card">
        <span className="section-kicker">ADMIN</span>
        <h1>FATU Open House 2026</h1>
        <p>
          พื้นที่ Admin จะรองรับการเพิ่ม แก้ไข ปิดกิจกรรม กำหนดแต้ม
          และจัดการข้อมูลหน้างานโดยไม่ต้อง deploy ใหม่
        </p>
        <Link className="text-link" to="/">กลับหน้าหลัก</Link>
      </div>
    </main>
  );
}

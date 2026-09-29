import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="standalone-page">
      <div className="admin-card">
        <span className="section-kicker">404</span>
        <h1>ไม่พบหน้านี้</h1>
        <Link className="text-link" to="/">กลับหน้าหลัก</Link>
      </div>
    </main>
  );
}

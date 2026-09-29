import { useState } from "react";
import { Link } from "react-router-dom";
import { QrScanner } from "@/components/QrScanner";
import { loadPass } from "@/lib/pass";
import { completeActivity } from "@/services/api";

export function CheckinPage() {
  const pass = loadPass();
  const [manual, setManual] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "working" | "success" | "error"; message?: string }>({ type: "idle" });
  const [scannerKey, setScannerKey] = useState(0);

  async function submit(value: string) {
    if (!pass) {
      setStatus({ type: "error", message: "กรุณาลงทะเบียนบัตรผู้เข้าร่วมก่อน" });
      return;
    }
    setStatus({ type: "working", message: "กำลังตรวจสอบกิจกรรม..." });
    try {
      const result = await completeActivity(value, pass.token);
      setStatus({
        type: "success",
        message: result.pointsAdded > 0
          ? `เช็กอิน ${result.activityTitle} สำเร็จ +${result.pointsAdded} แต้ม (รวม ${result.pointTotal})`
          : `บันทึก ${result.activityTitle} แล้ว ไม่มีแต้มเพิ่ม`,
      });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "เช็กอินไม่สำเร็จ" });
      setScannerKey((value) => value + 1);
    }
  }

  return (
    <section className="page-section">
      <span className="section-kicker">CHECK-IN</span>
      <h1 className="page-title">สแกน QR กิจกรรม</h1>
      {!pass ? (
        <div className="notice-card">
          <p>ต้องมีบัตรผู้เข้าร่วมก่อนจึงจะสะสมแต้มได้</p>
          <Link className="primary-button" to="/pass">สร้างบัตร</Link>
        </div>
      ) : (
        <>
          {status.type !== "success" ? <QrScanner key={scannerKey} onScan={(value) => void submit(value)} /> : null}
          <div className="manual-code">
            <label>
              <span>หรือวางข้อความจาก QR</span>
              <input value={manual} onChange={(event) => setManual(event.target.value)} placeholder="FATU26:..." />
            </label>
            <button className="secondary-button" type="button" disabled={!manual || status.type === "working"} onClick={() => void submit(manual)}>
              ตรวจสอบ
            </button>
          </div>
        </>
      )}
      {status.message ? <p className={status.type === "error" ? "form-error" : "success-message"}>{status.message}</p> : null}
      {status.type === "success" ? <button className="secondary-button" type="button" onClick={() => { setStatus({ type: "idle" }); setManual(""); setScannerKey((value) => value + 1); }}>สแกนกิจกรรมถัดไป</button> : null}
    </section>
  );
}

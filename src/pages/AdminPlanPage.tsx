import { useState } from "react";
import { Download, FileText, Upload, UsersRound } from "lucide-react";
import { AdminAccess } from "@/pages/AdminPage";
import plan from "@/data/open-house-plan.json";
import { buildPlanImport } from "@/lib/plan-import";
import { readRealtime, updateRealtime } from "@/services/realtime";
import { adminAction } from "@/services/api";
import { isFirebaseConfigured } from "@/lib/firebase";

export function AdminPlanPage() {
  const [refresh, setRefresh] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<ReturnType<typeof buildPlanImport> | null>(null);
  const staffTotal = plan.eventPlan.staffing.reduce((sum, group) => sum + group.departments.reduce((n, d) => n+d.count,0),0);
  async function inspect() { setBusy(true); setMessage(""); try { const current = await readRealtime<Record<string,unknown>>("public"); setPreview(buildPlanImport(current || {}, refresh)); } catch (e) { setMessage(e instanceof Error ? e.message : "ตรวจสอบไม่สำเร็จ"); } finally { setBusy(false); } }
  async function apply() {
    if (!preview) return;
    setBusy(true); setMessage("");
    try {
      // Re-read before mutation: another editor may have added records after the preview.
      const current = await readRealtime<Record<string,unknown>>("public"); const latest = buildPlanImport(current || {},refresh);
      if (latest.paths) await updateRealtime("public", latest.patch);
      setPreview(null); setMessage(`นำเข้าสำเร็จ · เพิ่ม ${latest.added} รายการ · อัปเดตกำหนดการ ${latest.refreshed} รายการ`);
      try { await adminAction("contentAudit", {kind:"eventPlan",id:plan.eventPlan.id,operation:"import"}); } catch { setMessage(previous => previous + " · บันทึกข้อมูลแล้ว แต่ส่งประวัติ Audit ไม่สำเร็จ กรุณาแจ้งผู้ดูแล"); }
    } catch (e) { setMessage(e instanceof Error ? e.message : "นำเข้าไม่สำเร็จ"); } finally { setBusy(false); }
  }
  return <AdminAccess roles={["admin", "editor"]}><section className="admin-plan-page"><div className="admin-heading"><div><span className="editorial-kicker">EVENT OPERATIONS / 30 OCT 2026</span><h1>แผนกิจกรรมและเจ้าหน้าที่</h1><p>แผนโครงการกิจกรรม TU Open House · คณะศิลปกรรมศาสตร์</p></div><a className="secondary-button" href={plan.eventPlan.sourceFile} target="_blank" rel="noreferrer"><Download size={17} /> เอกสารต้นฉบับ</a></div>
    <div className="plan-stats"><div><FileText /><strong>38</strong><span>กิจกรรมและการแสดง</span></div><div><FileText /><strong>32</strong><span>รอบเวิร์กช็อป</span></div><div><UsersRound /><strong>142</strong><span>เจ้าหน้าที่ตามยอดเอกสาร</span></div><div><UsersRound /><strong>{staffTotal}</strong><span>คน เมื่อรวมรายฝ่าย</span></div></div>
    <div className="plan-warning"><strong>ยอดเจ้าหน้าที่โรงทอต้องตรวจสอบ</strong><p>เอกสารระบุ 30 คน แต่รายฝ่ายรวม 31 คน ทำให้ยอดรวมรายฝ่ายเป็น 143 คน ขณะที่ยอดสุทธิในเอกสารคือ 142 คน ระบบเก็บตัวเลขเดิมทั้งสองแบบโดยไม่ปรับยอดแทนผู้จัดงาน</p></div>
    <section className="plan-import-panel"><span className="editorial-kicker">IMPORT THE EVENT PLAN</span><h2>นำแผนเข้าระบบกิจกรรม</h2><p>เพิ่มกิจกรรม 38 รายการ ช่วงลงทะเบียนและพัก 14 รายการ พร้อมข้อมูลสถานที่ FAQ และประกาศที่ยังไม่มีในระบบ รายการเดิมที่มี ID เดียวกันจะข้ามโดยอัตโนมัติ</p><p>อัปเดตเฉพาะวันและสถานที่จัดงานในข้อมูลเว็บไซต์ กิจกรรมใหม่ยังไม่เปิดรับและไม่ให้แต้ม จนกว่าทีมงานจะตั้งค่าในหน้ากิจกรรม</p><label className="plan-check"><input type="checkbox" checked={refresh} onChange={e => {setRefresh(e.target.checked);setPreview(null);}} /> อัปเดตชื่อ ห้อง และเวลาเฉพาะกิจกรรมที่เคยนำเข้าจากแผนนี้ โดยคงราคา ที่นั่ง แต้ม และสถานะที่ทีมงานตั้งไว้</label>
      <button className="premium-button" disabled={busy || !isFirebaseConfigured} onClick={() => void inspect()}><FileText size={17} /> {busy ? "กำลังดำเนินการ..." : "ตรวจสอบข้อมูลก่อนนำเข้า"}</button>
      {preview && <div className="plan-import-preview"><h3>พร้อมนำเข้า</h3><p>เพิ่ม {preview.added} รายการ · อัปเดตกำหนดการ {preview.refreshed} รายการ · รวม {preview.paths} จุดข้อมูล</p><button className="premium-button" disabled={busy || !preview.paths} onClick={() => void apply()}><Upload size={17} /> ยืนยันนำเข้าแผน</button></div>}
      {message && <p role="status">{message}</p>}
    </section>
    <div className="staff-plan-grid">{plan.eventPlan.staffing.map(group => { const sum = group.departments.reduce((n,d) => n+d.count,0);return <section key={group.id}><div><h2>{group.name}</h2><span>{group.declaredTotal} คนตามเอกสาร</span></div><table><caption className="sr-only">จำนวนเจ้าหน้าที่ {group.name}</caption><thead><tr><th>ฝ่าย</th><th>คน</th></tr></thead><tbody>{group.departments.map(d => <tr key={d.name}><td>{d.name}</td><td>{d.count}</td></tr>)}</tbody><tfoot><tr><th>รวมรายฝ่าย</th><th>{sum}</th></tr></tfoot></table></section>;})}</div>
    <p>{plan.eventPlan.note}</p></section></AdminAccess>;
}

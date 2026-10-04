import { useState } from "react";
import { Award, CheckCircle2, Gift, QrCode, Search, ShieldCheck, X } from "lucide-react";
import { useAdminSession } from "@/pages/AdminPage";
import { useActivities, useVenues } from "@/data/content";
import { QrScanner } from "@/components/QrScanner";

interface Participant { id: string; username: string; displayName: string }
interface Voucher { voucherCode: string; displayName: string; username: string; prizeName: string; status: string; claimedAt?: string }

export function StaffDashboardPage() {
  const { user: firebaseUser } = useAdminSession();
  const activities = useActivities(); const venues = useVenues();
  const [tab, setTab] = useState<"activity" | "voucher">("activity");
  const [identifier, setIdentifier] = useState("");
  const [activityId, setActivityId] = useState("");
  const [reason, setReason] = useState("กล้องผู้เข้าร่วมขัดข้อง");
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [code, setCode] = useState("");
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [camera, setCamera] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const activity = activities.items.find(a => a.id === activityId);
  const venue = venues.items.find(v => v.id === activity?.venueId);

  async function request<T>(url: string, body: Record<string, unknown>): Promise<T> {
    const token = await firebaseUser?.getIdToken();
    if (!token) throw new Error("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "ทำรายการไม่สำเร็จ กรุณาลองอีกครั้ง");
    return data;
  }

  async function perform(run: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try { await run(); } catch (err) { setError(err instanceof Error ? err.message : "ทำรายการไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  async function inspect() {
    await perform(async () => {
      if (tab === "activity") {
        const result = await request<{ participant: Participant }>("/api/admin", { action: "participantByUsername", username: identifier.trim().replace(/^FATU26PASS:/i, "") });
        setParticipant(result.participant);
      } else {
        const result = await request<{ voucher: Voucher }>("/api/lucky-draw", { action: "peek-voucher", voucherCode: code.trim() });
        setVoucher(result.voucher);
      }
    });
  }
  async function confirm() {
    await perform(async () => {
      if (tab === "activity" && participant && activity) {
        const result = await request<{ duplicate: boolean; pointsAdded: number; venueCapped?: boolean }>("/api/admin", { action: "completeActivity", participantId: participant.id, activityId, reason });
        setMessage(result.duplicate ? "บันทึกกิจกรรมนี้แล้ว ไม่เพิ่มคะแนนซ้ำ" : `${participant.displayName} · บันทึก ${activity.title} แล้ว${result.venueCapped ? " · รับแต้มจากสถานที่นี้แล้ว" : ` · +${result.pointsAdded} แต้ม`}`);
        setParticipant(null); setIdentifier("");
      } else if (tab === "voucher" && voucher?.status === "pending") {
        const result = await request<{ message: string }>("/api/lucky-draw", { action: "redeem-voucher", voucherCode: voucher.voucherCode });
        setMessage(result.message); setVoucher(null); setCode("");
      }
    });
  }

  return <div className="field-workspace">
    <header><span className="eyebrow"><ShieldCheck size={15} /> EVENT OPERATIONS</span><h1>จุดบริการผู้เข้าร่วม</h1><p>ตรวจผู้เข้าร่วมและรายการให้ตรงกัน แล้วค่อยยืนยัน</p></header>
    <div className="field-tabs" role="tablist" aria-label="งานของเจ้าหน้าที่">
      <button id="field-activity-tab" role="tab" aria-controls="field-panel" aria-selected={tab === "activity"} onClick={() => { setTab("activity"); setCamera(false); setError(""); setMessage(""); }} disabled={busy}><Award size={18} />บันทึกกิจกรรม</button>
      <button id="field-voucher-tab" role="tab" aria-controls="field-panel" aria-selected={tab === "voucher"} onClick={() => { setTab("voucher"); setCamera(false); setError(""); setMessage(""); }} disabled={busy}><Gift size={18} />จ่ายรางวัล</button>
    </div>
    <div id="field-panel" role="tabpanel" aria-labelledby={`field-${tab}-tab`}>
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="field-success" role="status"><CheckCircle2 size={20} />{message}</p>}
      <form onSubmit={event => { event.preventDefault(); void inspect(); }} className="field-form">
        <span className="field-step">01 · ตรวจข้อมูล</span>
        {tab === "activity" ? <>
          <label htmlFor="field-activity">กิจกรรมที่ประจำจุด</label>
          <select id="field-activity" value={activityId} onChange={event => { setActivityId(event.target.value); setParticipant(null); }} required disabled={busy || activities.loading}>
            <option value="">เลือกกิจกรรมก่อนบันทึก</option>
            {venues.items.map(v => <optgroup label={v.name} key={v.id}>{activities.items.filter(a => a.venueId === v.id).map(a => <option value={a.id} key={a.id}>{a.title}</option>)}</optgroup>)}
          </select>
          {activities.error && <p className="form-error">{activities.error}</p>}
          <label htmlFor="field-identifier">ชื่อผู้ใช้ หรือ QR ใบเบิกทาง</label>
          <input id="field-identifier" value={identifier} onChange={event => { setIdentifier(event.target.value); setParticipant(null); }} placeholder="เช่น dragon_26 หรือ FATU26PASS:..." required autoComplete="off" disabled={busy} />
          <label htmlFor="field-reason">เหตุผลที่บันทึกแทนการสแกน</label>
          <input id="field-reason" value={reason} onChange={event => { setReason(event.target.value); setParticipant(null); }} required minLength={3} disabled={busy} />
        </> : <><label htmlFor="field-voucher">รหัส Voucher ของผู้เข้าร่วม</label><input id="field-voucher" value={code} onChange={event => { setCode(event.target.value); setVoucher(null); }} placeholder="FATU26LUCKY:LKY-..." required autoComplete="off" disabled={busy} /><p>สแกนหรือกรอกรหัสเพื่อตรวจชื่อและรางวัลก่อนจ่ายของ</p></>}
        <div className="field-actions"><button className="admin-submit" type="submit" disabled={busy || tab === "activity" && !activityId}><Search size={17} />{busy ? "กำลังตรวจสอบ..." : "ตรวจข้อมูล"}</button><button className="secondary-button" type="button" disabled={busy} onClick={() => setCamera(!camera)}>{camera ? <X size={17} /> : <QrCode size={17} />}{camera ? "ปิดกล้อง" : "สแกน QR"}</button></div>
        {camera && <QrScanner onScan={value => { if (tab === "activity") { setIdentifier(value); setParticipant(null); } else { setCode(value); setVoucher(null); } setCamera(false); }} />}
      </form>
      {(tab === "activity" && participant && activity || tab === "voucher" && voucher) && <section className="field-confirm" aria-label="ยืนยันรายการ">
        <span className="field-step">02 · ยืนยันรายการ</span>
        <h2>{tab === "activity" ? participant?.displayName : voucher?.displayName}</h2><p>@{tab === "activity" ? participant?.username : voucher?.username}</p>
        {tab === "activity" ? <><strong>{activity?.title}</strong><p>{venue?.name} · ได้สูงสุด {activity?.pointsAwarded || 0} แต้ม หากยังไม่เคยรับแต้มจากสถานที่นี้</p><small>เหตุผล: {reason}</small></> : <><strong>{voucher?.prizeName}</strong><p>{voucher?.status === "claimed" ? "รับของรางวัลแล้ว · ไม่สามารถจ่ายซ้ำ" : "ยังไม่ได้รับของรางวัล"}</p></>}
        <button className="admin-submit" onClick={() => void confirm()} disabled={busy || tab === "voucher" && voucher?.status !== "pending"}>{busy ? "กำลังบันทึก..." : tab === "activity" ? "ยืนยันบันทึกกิจกรรม" : "ยืนยันจ่ายของรางวัล"}</button>
        <button className="secondary-button" disabled={busy} onClick={() => { setParticipant(null); setVoucher(null); }}>กลับไปแก้ไขข้อมูล</button>
      </section>}
    </div>
    <p className="field-note">ผู้เข้าร่วมสแกน QR ประจำจุดด้วยโทรศัพท์ตนเองได้ หน้านี้ใช้ช่วยกรณีสแกนไม่ได้และยืนยันการรับของรางวัล</p>
  </div>;
}

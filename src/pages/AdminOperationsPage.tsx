import { useEffect, useMemo, useState, type FormEvent } from "react";
import { QrScanner } from "@/components/QrScanner";
import { useActivities, usePrizes } from "@/data/content";
import { AdminAccess, useAdminSession } from "@/pages/AdminPage";
import { adminAction } from "@/services/api";

interface ParticipantRow {
  id: string;
  displayName: string;
  school: string;
  phone: string;
  email: string;
  createdAt: string;
  pointTotal: number;
}

interface ParticipantDetail {
  pointTotal: number;
  entryCheckin: { createdAt?: string; staffId?: string } | null;
  transactions: Array<{
    id: string;
    points: number;
    reason: string;
    source?: string;
    createdAt: string;
    reversedAt?: string;
  }>;
  claims: Array<{
    id: string;
    prizeId?: string;
    pointsSpent?: number;
    status?: string;
    createdAt?: string;
  }>;
  completions: Array<{
    id: string;
    activityId?: string;
    pointsAdded?: number;
    createdAt?: string;
  }>;
}

function loadParticipantDetail(participantId: string) {
  return adminAction<ParticipantDetail>("participantDetail", { participantId });
}

export function AdminOperationsPage() {
  const session = useAdminSession();
  const prizes = usePrizes();
  const activities = useActivities();
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [detail, setDetail] = useState<ParticipantDetail | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [scanOpen, setScanOpen] = useState(false);

  async function refresh() {
    const result = await adminAction<{ participants: ParticipantRow[] }>("participants");
    setParticipants(result.participants);
  }

  useEffect(() => { void refresh(); }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    void loadParticipantDetail(selectedId)
      .then(setDetail)
      .catch((error) => setMessage(error instanceof Error ? error.message : "โหลดประวัติไม่สำเร็จ"));
  }, [selectedId]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("th");
    if (!term) return participants;
    return participants.filter((item) => [item.displayName, item.school, item.phone, item.email, item.id].join(" ").toLocaleLowerCase("th").includes(term));
  }, [participants, query]);

  const selected = participants.find((item) => item.id === selectedId);

  async function refreshSelected() {
    if (selectedId) setDetail(await loadParticipantDetail(selectedId));
  }

  async function adjust(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const data = new FormData(event.currentTarget);
    const points = Number(data.get("points") || 0);
    const reason = String(data.get("reason") || "");
    const result = await adminAction<{ pointTotal: number }>("adjustPoints", { participantId: selected.id, points, reason });
    setMessage(`ปรับแต้มแล้ว ยอดใหม่ ${result.pointTotal}`);
    event.currentTarget.reset();
    await refresh();
    await refreshSelected();
  }

  async function complete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const data = new FormData(event.currentTarget);
    const activityId = String(data.get("activityId") || "");
    const result = await adminAction<{ pointTotal: number; pointsAdded: number; duplicate?: boolean }>("completeActivity", { participantId: selected.id, activityId });
    setMessage(result.duplicate ? `กิจกรรมนี้ถูกบันทึกตามกติกาแล้ว · ${result.pointTotal} แต้ม` : `บันทึกกิจกรรม +${result.pointsAdded} แต้ม · รวม ${result.pointTotal}`);
    await refresh();
    await refreshSelected();
  }

  async function redeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const data = new FormData(event.currentTarget);
    const prizeId = String(data.get("prizeId") || "");
    const result = await adminAction<{ pointTotal: number; stockRemaining: number }>("redeemPrize", { participantId: selected.id, prizeId });
    setMessage(`แลกรางวัลสำเร็จ เหลือ ${result.pointTotal} แต้ม · stock ${result.stockRemaining}`);
    await refresh();
    await refreshSelected();
  }

  async function entryCheckin() {
    if (!selected) return;
    const result = await adminAction<{ duplicate?: boolean }>("entryCheckin", {
      participantId: selected.id,
    });
    setMessage(result.duplicate ? "ผู้เข้าร่วมเช็กอินเข้างานแล้ว" : "เช็กอินเข้างานสำเร็จ");
    await refreshSelected();
  }

  async function reverseTransaction(transactionId: string) {
    if (!selected || session.role !== "admin") return;
    const reason = window.prompt("เหตุผลที่ย้อนรายการคะแนน");
    if (!reason?.trim()) return;
    const result = await adminAction<{ pointTotal: number }>("reverseTransaction", {
      participantId: selected.id,
      transactionId,
      reason: reason.trim(),
    });
    setMessage(`ย้อนรายการแล้ว ยอดใหม่ ${result.pointTotal} แต้ม`);
    await refresh();
    await refreshSelected();
  }

  async function scan(value: string) {
    const match = /^FATU26PASS:(.+)$/.exec(value);
    if (!match) {
      setMessage("QR นี้ไม่ใช่บัตรผู้เข้าร่วม");
      setScanOpen(false);
      return;
    }
    try {
      const result = await adminAction<{ participant: ParticipantRow }>("participantByPass", { passToken: match[1] });
      setSelectedId(result.participant.id);
      setQuery(result.participant.displayName);
      setMessage("พบบัตรผู้เข้าร่วม");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ค้นหาบัตรไม่สำเร็จ");
    }
    setScanOpen(false);
  }

  function exportCsv() {
    const rows = [
      ["participantId", "displayName", "school", "phone", "email", "points", "createdAt"],
      ...participants.map((p) => [p.id, p.displayName, p.school, p.phone, p.email, p.pointTotal, p.createdAt]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `fatu-participants-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminAccess roles={["admin", "staff"]}>
      <section>
      <div className="admin-heading">
        <div><span className="section-kicker">OPERATIONS</span><h1 className="admin-page-title">ผู้เข้าร่วมและคะแนน</h1></div>
        <div className="action-row"><button className="secondary-button" onClick={() => setScanOpen((value) => !value)}>สแกนบัตร</button><button className="secondary-button" onClick={exportCsv}>Export CSV</button></div>
      </div>

      {scanOpen ? <div className="admin-scanner"><QrScanner onScan={(value) => void scan(value)} /></div> : null}
      {message ? <p className="success-message">{message}</p> : null}

      <div className="admin-split">
        <div>
          <input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นชื่อ โรงเรียน เบอร์โทร อีเมล หรือ ID" />
          <div className="admin-list">
            {filtered.map((participant) => (
              <button className={"admin-list-item " + (selectedId === participant.id ? "selected" : "")} onClick={() => setSelectedId(participant.id)} key={participant.id}>
                <strong>{participant.displayName}</strong><small>{participant.pointTotal} แต้ม · {participant.school}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="admin-editor">
          {selected ? (
            <>
              <div className="prose-card">
                <h2>{selected.displayName}</h2>
                <p>{selected.school}</p>
                <p>{selected.phone} {selected.email}</p>
                <strong className="score-number">{detail?.pointTotal ?? selected.pointTotal}</strong><small> คะแนน</small>
                <p>{detail?.entryCheckin ? `เช็กอินเข้างานแล้ว · ${detail.entryCheckin.createdAt || ""}` : "ยังไม่ได้เช็กอินเข้างาน"}</p>
                <button className="secondary-button" type="button" onClick={() => void entryCheckin()}>
                  {detail?.entryCheckin ? "บันทึกเช็กอินแล้ว" : "เช็กอินเข้างาน"}
                </button>
              </div>
              <form className="admin-form" onSubmit={complete}>
                <h3>ยืนยันจบกิจกรรม</h3>
                <label><span>กิจกรรม</span><select name="activityId" required>{activities.items.map((activity) => <option value={activity.id} key={activity.id}>{activity.title}{activity.pointsEnabled ? ` · +${activity.pointsAwarded}` : ""}</option>)}</select></label>
                <button className="admin-submit">บันทึกการเข้าร่วม</button>
              </form>
              <form className="admin-form" onSubmit={adjust}>
                <h3>ปรับคะแนน</h3>
                <label><span>จำนวน (+/-)</span><input name="points" type="number" required /></label>
                <label><span>เหตุผล</span><input name="reason" required minLength={2} /></label>
                <button className="admin-submit">บันทึกการปรับแต้ม</button>
              </form>
              <form className="admin-form" onSubmit={redeem}>
                <h3>แลกรางวัล</h3>
                <label><span>ของรางวัล</span><select name="prizeId" required>{prizes.items.map((prize) => <option value={prize.id} key={prize.id}>{prize.name} · {prize.pointsRequired} แต้ม</option>)}</select></label>
                <button className="admin-submit">ยืนยันการแลก</button>
              </form>

              <div className="prose-card">
                <h3>ประวัติคะแนน</h3>
                {detail?.transactions.length ? detail.transactions.map((tx) => (
                  <div className="history-row history-row-admin" key={tx.id}>
                    <div>
                      <strong>{tx.reason}</strong>
                      <small>{tx.createdAt} · {tx.source || "transaction"}{tx.reversedAt ? " · ย้อนแล้ว" : ""}</small>
                    </div>
                    <div className="history-actions">
                      <strong className={tx.points >= 0 ? "positive" : "negative"}>{tx.points > 0 ? "+" : ""}{tx.points}</strong>
                      {session.role === "admin" && !tx.reversedAt && tx.source !== "prize-redemption" && tx.source !== "prize-refund" && tx.source !== "reversal" ? (
                        <button className="text-button danger-text" type="button" onClick={() => void reverseTransaction(tx.id)}>ย้อนรายการ</button>
                      ) : null}
                    </div>
                  </div>
                )) : <p>ยังไม่มีประวัติคะแนน</p>}
              </div>

              <div className="prose-card">
                <h3>กิจกรรมที่เจ้าหน้าที่บันทึก</h3>
                {detail?.completions.length ? detail.completions.map((completion) => (
                  <div className="history-row" key={completion.id}>
                    <span>{activities.items.find((item) => item.id === completion.activityId)?.title || completion.activityId || "กิจกรรม"}</span>
                    <strong>+{completion.pointsAdded || 0}</strong>
                  </div>
                )) : <p>ยังไม่มีรายการจากเจ้าหน้าที่</p>}
              </div>

              <div className="prose-card">
                <h3>การแลกรางวัล</h3>
                {detail?.claims.length ? detail.claims.map((claim) => (
                  <div className="history-row" key={claim.id}>
                    <span>{prizes.items.find((item) => item.id === claim.prizeId)?.name || claim.prizeId || "ของรางวัล"} · {claim.status || "unknown"}</span>
                    <strong>-{claim.pointsSpent || 0}</strong>
                  </div>
                )) : <p>ยังไม่มีการแลกรางวัล</p>}
              </div>
            </>
          ) : <p className="content-status">เลือกผู้เข้าร่วมจากรายการ</p>}
        </div>
      </div>
      </section>
    </AdminAccess>
  );
}

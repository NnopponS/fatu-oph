import { useEffect, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { useSite } from "@/data/content";
import { clearPass, loadPass, savePass, type SavedPass } from "@/lib/pass";
import { loadParticipant, registerParticipant, type ParticipantView } from "@/services/api";

export function PassPage() {
  const site = useSite();
  const [pass, setPass] = useState<SavedPass | null>(() => loadPass());
  const [profile, setProfile] = useState<ParticipantView | null>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [restoreCode, setRestoreCode] = useState("");
  const [loading, setLoading] = useState(Boolean(pass));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pass) return;
    setLoading(true);
    void loadParticipant(pass.token)
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : "โหลดบัตรไม่สำเร็จ"))
      .finally(() => setLoading(false));
    void QRCode.toDataURL(`FATU26PASS:${pass.token}`, { width: 360, margin: 2 }).then(setQrUrl);
  }, [pass]);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(null);
    setLoading(true);
    try {
      const result = await registerParticipant({
        displayName: String(data.get("displayName") || ""),
        school: String(data.get("school") || ""),
        phone: String(data.get("phone") || ""),
        email: String(data.get("email") || ""),
      });
      const saved = { participantId: result.participantId, token: result.passToken, displayName: result.displayName };
      savePass(saved);
      setPass(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ลงทะเบียนไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function restore() {
    const token = restoreCode.trim().replace(/^FATU26PASS:/, "");
    if (token.length < 20) {
      setError("รหัสกู้คืนไม่ถูกต้อง");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await loadParticipant(token);
      const saved = {
        participantId: data.participant.id,
        token,
        displayName: data.participant.displayName,
      };
      savePass(saved);
      setPass(saved);
      setProfile(data);
      setRestoreCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "กู้คืนบัตรไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  if (!pass) {
    if (!site.loading && site.item?.registrationOpen === false) {
      return (
        <section className="page-section">
          <span className="section-kicker">PASS</span>
          <h1 className="page-title">ยังไม่เปิดลงทะเบียน</h1>
          <p className="page-lead">ทีมงานยังไม่ได้เปิดระบบสร้างบัตรผู้เข้าร่วม กรุณาตรวจสอบอีกครั้งภายหลัง</p>
        </section>
      );
    }

    return (
      <section className="page-section">
        <span className="section-kicker">PASS</span>
        <h1 className="page-title">ลงทะเบียนผู้เข้าร่วม</h1>
        <p className="page-lead">กรอกข้อมูลพื้นฐานเพื่อสร้างบัตร Open House สำหรับสะสมแต้มและรับรางวัล</p>
        <form className="visitor-form" onSubmit={register}>
          <label><span>ชื่อ-นามสกุล *</span><input name="displayName" required minLength={2} /></label>
          <label><span>โรงเรียน / สถาบัน</span><input name="school" /></label>
          <label><span>เบอร์โทรศัพท์</span><input name="phone" inputMode="tel" /></label>
          <label><span>อีเมล</span><input name="email" type="email" /></label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button button-reset" disabled={loading} type="submit">
            {loading ? "กำลังสร้างบัตร..." : "สร้างบัตร Open House"}
          </button>
        </form>

        <div className="prose-card">
          <h2>มีบัตรจากอุปกรณ์เดิมแล้ว?</h2>
          <p>วางรหัสกู้คืนของบัตรเพื่อใช้งานต่อบนอุปกรณ์นี้</p>
          <div className="manual-code">
            <label>
              <span>รหัสกู้คืน</span>
              <input
                value={restoreCode}
                onChange={(event) => setRestoreCode(event.target.value)}
                placeholder="FATU26PASS:..."
              />
            </label>
            <button
              className="secondary-button"
              type="button"
              disabled={loading || !restoreCode.trim()}
              onClick={() => void restore()}
            >
              กู้คืนบัตร
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <span className="section-kicker">MY PASS</span>
      <h1 className="page-title">{profile?.participant.displayName || pass.displayName}</h1>
      <p className="page-lead">แสดง QR นี้ให้เจ้าหน้าที่เมื่อจำเป็น และใช้เมนูเช็กอินเพื่อสแกน QR ของกิจกรรม</p>

      <div className="pass-card">
        {qrUrl ? (
          <div>
            <img src={qrUrl} alt="QR บัตรผู้เข้าร่วม FATU Open House" />
            <a className="text-link" href={qrUrl} download="fatu-open-house-pass.png">บันทึก QR ลงเครื่อง</a>
            <button
              className="text-button"
              type="button"
              onClick={() =>
                void navigator.clipboard
                  .writeText(`FATU26PASS:${pass.token}`)
                  .then(() => window.alert("คัดลอกรหัสกู้คืนแล้ว เก็บรหัสนี้เป็นความลับ"))
                  .catch(() => setError("คัดลอกอัตโนมัติไม่ได้ กรุณาบันทึก QR แทน"))
              }
            >
              คัดลอกรหัสกู้คืน
            </button>
          </div>
        ) : null}
        <div>
          <span>คะแนนปัจจุบัน</span>
          <strong className="score-number">{profile?.pointTotal ?? 0}</strong>
          <small>คะแนน</small>
        </div>
      </div>

      {loading ? <p>กำลังอัปเดตข้อมูล...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {profile?.claims.length ? (
        <div className="prose-card">
          <h2>รางวัลที่แลกแล้ว</h2>
          {profile.claims.map((claim) => (
            <div className="history-row" key={claim.id}>
              <span>{claim.prizeName}</span>
              <strong>-{claim.pointsSpent}</strong>
            </div>
          ))}
        </div>
      ) : null}

      <div className="prose-card">
        <h2>ประวัติคะแนนล่าสุด</h2>
        {profile?.transactions.length ? profile.transactions.slice(0, 8).map((tx) => (
          <div className="history-row" key={tx.id}>
            <span>{tx.reason}</span>
            <strong className={tx.points >= 0 ? "positive" : "negative"}>{tx.points > 0 ? "+" : ""}{tx.points}</strong>
          </div>
        )) : <p>ยังไม่มีรายการคะแนน</p>}
      </div>

      <button
        className="text-button danger-text"
        type="button"
        onClick={() => {
          clearPass();
          setPass(null);
          setProfile(null);
          setQrUrl("");
        }}
      >
        ลบบัตรออกจากอุปกรณ์นี้
      </button>
    </section>
  );
}

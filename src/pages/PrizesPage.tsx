import { useEffect, useState } from "react";
import { resolveMediaUrl, useMedia, usePrizes } from "@/data/content";
import { loadPass } from "@/lib/pass";
import { loadParticipant } from "@/services/api";

export function PrizesPage() {
  const prizes = usePrizes();
  const media = useMedia();
  const pass = loadPass();
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    if (!pass) return;
    void loadParticipant(pass.token).then((data) => setPoints(data.pointTotal)).catch(() => setPoints(null));
  }, [pass]);

  return (
    <section className="page-section">
      <span className="section-kicker">REWARDS</span>
      <h1 className="page-title">ของรางวัล</h1>
      <p className="page-lead">{points === null ? "ลงทะเบียนบัตรเพื่อดูคะแนนของคุณ" : `คุณมี ${points} คะแนน`}</p>

      <div className="content-list">
        {prizes.items.length ? prizes.items.map((prize) => (
          <article className="content-card static-card prize-card" key={prize.id}>
            {resolveMediaUrl(prize.imageMediaId || "", media.items) ? <img className="prize-thumb" src={resolveMediaUrl(prize.imageMediaId || "", media.items)} alt={prize.name} /> : null}
            <div>
              <strong>{prize.name}</strong>
              <p>{prize.description || "รายละเอียดการแลกรางวัลจะแสดงเมื่อทีมงานเผยแพร่"}</p>
              <small>คงเหลือตั้งต้น {prize.stock} ชิ้น · แลกได้สูงสุด {prize.claimLimit} ครั้ง/คน</small>
            </div>
            <span className="pill">{prize.pointsRequired} แต้ม</span>
          </article>
        )) : <p className="content-status">ยังไม่มีของรางวัลที่เปิดให้แลก</p>}
      </div>
    </section>
  );
}

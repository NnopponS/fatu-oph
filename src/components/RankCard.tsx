import { useState } from "react";
import { Share2, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useRewardPolicy } from "@/data/content";
import { rankFor } from "@/lib/ranks";
import { sfx } from "@/lib/sfx";

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>(resolve => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = src; });
}
function wrap(c: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, line: number) {
  let row = ""; let cy = y;
  for (const ch of text) { if (c.measureText(row + ch).width > max) { c.fillText(row, x, cy); row = ch; cy += line; } else row += ch; }
  c.fillText(row, x, cy);
}

interface Props { name: string; username: string; points: number; visited: number; total: number; venueNames: string[]; visitedFlags: boolean[] }

export function RankCard({ name, username, points, visited, total, venueNames, visitedFlags }: Props) {
  const { rules } = useRewardPolicy();
  const reduced = useReducedMotion();
  const { current, next, progress } = rankFor(points, visited, rules.pointsRequired || 100);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function share() {
    if (busy) return;
    setBusy(true); setNote(""); sfx.rise(.9);
    try {
      const W = 1080; const H = 1920; const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H;
      const c = canvas.getContext("2d"); if (!c) throw new Error("canvas");
      const sky = c.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#04181c"); sky.addColorStop(.55, "#0b3a40"); sky.addColorStop(1, "#3b0606");
      c.fillStyle = sky; c.fillRect(0, 0, W, H);
      const glow = c.createRadialGradient(W / 2, 520, 40, W / 2, 520, 620); glow.addColorStop(0, `${current.color}aa`); glow.addColorStop(1, "transparent");
      c.fillStyle = glow; c.fillRect(0, 0, W, H);
      c.fillStyle = "#ffffff12"; [[0, 1500, 430, 380], [300, 1550, 520, 440], [700, 1480, 380, 340]].forEach(([x, y, w, h]) => { c.beginPath(); c.moveTo(x, H); c.lineTo(x + w / 2, y - h * .3); c.lineTo(x + w, H); c.fill(); });
      const frame = c.createLinearGradient(0, 0, W, H); frame.addColorStop(0, "#f5dc9b"); frame.addColorStop(.5, "#b38628"); frame.addColorStop(1, "#f5dc9b");
      c.strokeStyle = frame; c.lineWidth = 6; c.strokeRect(54, 54, W - 108, H - 108); c.lineWidth = 2; c.strokeRect(78, 78, W - 156, H - 156);
      const seal = await loadImage("/assets/brand/dragon-seal.svg");
      if (seal) c.drawImage(seal, W / 2 - 230, 290, 460, 460);
      c.textAlign = "center"; c.fillStyle = "#f5dc9b"; c.font = "600 34px 'Noto Sans Thai', sans-serif";
      c.fillText("FATU OPEN HOUSE 2026 · ตะลุยแดนมังกร", W / 2, 200);
      c.fillStyle = current.color; c.font = "900 190px serif"; c.globalAlpha = .9; c.fillText(current.glyph, W / 2, 620); c.globalAlpha = 1;
      c.fillStyle = "#fff6dc"; c.font = "800 84px 'Noto Sans Thai', sans-serif"; wrap(c, current.title, W / 2, 900, 880, 100);
      c.fillStyle = current.color; c.font = "700 34px 'Noto Sans Thai', sans-serif"; c.fillText(current.english, W / 2, 1040);
      c.fillStyle = "#ffffff"; c.font = "800 66px 'Noto Sans Thai', sans-serif"; c.fillText(name, W / 2, 1160);
      c.fillStyle = "#cfc6a4"; c.font = "500 38px 'Noto Sans Thai', sans-serif"; c.fillText(`@${username}`, W / 2, 1220);
      c.fillStyle = "#f5dc9b"; c.font = "900 150px 'Noto Sans Thai', sans-serif"; c.fillText(String(points), W / 2, 1390);
      c.font = "600 40px 'Noto Sans Thai', sans-serif"; c.fillText("แต้มสะสม", W / 2, 1445);
      const gap = 230; const startX = W / 2 - gap * 1.5;
      venueNames.slice(0, 4).forEach((venue, i) => {
        const x = startX + i * gap; const done = visitedFlags[i];
        c.beginPath(); c.arc(x, 1580, 62, 0, Math.PI * 2); c.fillStyle = done ? "#a11a1a" : "#ffffff14"; c.fill();
        c.lineWidth = 4; c.strokeStyle = done ? "#f5dc9b" : "#ffffff44"; c.setLineDash(done ? [] : [10, 10]); c.stroke(); c.setLineDash([]);
        c.fillStyle = done ? "#f5dc9b" : "#ffffff77"; c.font = "900 56px serif"; c.fillText(["青", "白", "狐", "朱"][i] || "印", x, 1600);
        c.font = "500 26px 'Noto Sans Thai', sans-serif"; c.fillText(venue, x, 1680);
      });
      c.fillStyle = "#ffffff99"; c.font = "500 30px 'Noto Sans Thai', sans-serif"; c.fillText(`พิชิต ${visited}/${total} แดน · คณะศิลปกรรมศาสตร์ มธ.`, W / 2, 1790);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("blob");
      const file = new File([blob], "fatu-oph-2026-expedition.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: "ใบเบิกทางจอมยุทธ์ FATU OPH 2026" }); sfx.chime(); }
      else {
        const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = file.name; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 4000); sfx.chime(); setNote("บันทึกภาพแล้ว นำไปโพสต์ Story ได้เลย");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) { setNote("สร้างภาพไม่สำเร็จ ลองใหม่อีกครั้ง"); sfx.error(); }
    } finally { setBusy(false); }
  }

  return <section className="rank-card" style={{ "--rank-color": current.color } as React.CSSProperties} aria-label="ระดับยุทธ์ของคุณ">
    <motion.span className="rank-glyph" aria-hidden="true" key={current.id} initial={{ scale: reduced ? 1 : 2.2, opacity: 0, rotate: reduced ? 0 : -14 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: "spring", damping: 12, stiffness: 160 }}>{current.glyph}</motion.span>
    <div className="rank-copy">
      <small><Sparkles size={12} /> {current.english}</small>
      <strong>{current.title}</strong>
      {next ? <><div className="rank-track" role="progressbar" aria-label={`ความคืบหน้าสู่ ${next.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}><i style={{ width: `${progress * 100}%` }} /></div><p>อีก {Math.max(0, next.min - points)} แต้มสู่ “{next.title}”</p></> : <p>ถึงขั้นสูงสุดแล้ว ยอดเยี่ยมมาก</p>}
    </div>
    <button type="button" className="rank-share" onClick={() => void share()} disabled={busy}><Share2 size={16} />{busy ? "กำลังวาดคัมภีร์..." : "แชร์ลง Story"}</button>
    {note && <p className="rank-note" role="status">{note}</p>}
  </section>;
}

import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { askAssistant } from "@/services/api";

export function AssistantPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [links, setLinks] = useState<Array<{ label: string; href: string }>>([]);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    try {
      const result = await askAssistant(question.trim());
      setAnswer(result.answer);
      setLinks(result.links);
    } catch {
      setAnswer("ค้นข้อมูลไม่สำเร็จ กรุณาลองใหม่");
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-section assistant-page">
      <span className="section-kicker">ASSISTANT</span>
      <h1 className="page-title">ถามข้อมูลภายในงาน</h1>
      <p className="page-lead">ค้นจากสถานที่ กิจกรรม FAQ และของรางวัลที่ทีมงานเผยแพร่</p>
      <form className="assistant-form" onSubmit={submit}>
        <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="เช่น โรงละครมีกิจกรรมอะไรบ้าง" />
        <button className="primary-button button-reset" type="submit" disabled={loading}>{loading ? "กำลังค้น..." : "ถาม"}</button>
      </form>
      {answer ? (
        <div className="assistant-answer">
          {answer.split("\n").map((line, index) => <p key={index}>{line}</p>)}
          <div className="action-row">
            {links.map((link) => <Link className="secondary-button" key={link.href + link.label} to={link.href}>{link.label}</Link>)}
          </div>
        </div>
      ) : null}
    </section>
  );
}

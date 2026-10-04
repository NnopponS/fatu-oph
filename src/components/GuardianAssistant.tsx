import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, BookOpen, EyeOff, X } from "lucide-react";
import { PixelGuardian } from "@/components/PixelGuardian";
import { useFaq, useRewardPolicy } from "@/data/content";
import { realms, type RealmKey } from "@/lib/realms";
import { useGuardianRealm } from "@/lib/useGuardianRealm";
import { buildGuideTopics, guideCategories, type GuideCategory } from "@/lib/guardian-guide";

export function GuardianChat({ realm, onClose, onHide, embedded = false, active = true }: {
  realm: RealmKey; onClose?: () => void; onHide?: () => void; embedded?: boolean; active?: boolean;
}) {
  const location = useLocation();
  const meta = realms[realm];
  const { rules } = useRewardPolicy();
  const faq = useFaq();
  const topics = buildGuideTopics(rules, faq.items);
  const [category, setCategory] = useState<GuideCategory>(() => location.pathname.startsWith("/admin") ? "staff" : "event");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = topics.find(topic => topic.id === selectedId);
  const body = useRef<HTMLDivElement>(null);
  const answer = useRef<HTMLHeadingElement>(null);
  const firstCategory = useRef<HTMLButtonElement>(null);
  const previousId = useRef<string | null>(null);
  useEffect(() => {
    if (!active) return;
    if (selectedId) answer.current?.focus({ preventScroll: true });
    else if (!embedded || previousId.current) firstCategory.current?.focus({ preventScroll: true });
    previousId.current = selectedId;
    if (body.current) body.current.scrollTop = 0;
  }, [active, embedded, selectedId]);

  return <section className={`guardian-chat ${embedded ? "embedded" : ""}`} aria-label="คู่มือผู้พิทักษ์">
    <header className="guardian-chat-header">
      <PixelGuardian realm={realm} />
      <div><span>เลือกหัวข้อ · ดูคำตอบได้ทันที</span><h2>{meta.guardian}</h2><small>{meta.place}</small></div>
      {onHide && <button type="button" aria-label="ซ่อนสัตว์เลี้ยง" onClick={onHide}><EyeOff size={20} /></button>}
      {onClose && <button type="button" aria-label="ย่อผู้ช่วย" onClick={onClose}><X size={22} /></button>}
    </header>
    <div className="guardian-chat-messages" ref={body}>
      {selected ? <article className="guardian-message assistant" data-topic={selected.id}>
        <span className="guardian-message-author">{meta.guardian} · คำตอบที่เตรียมไว้</span>
        <h3 className="guardian-answer-title" tabIndex={-1} ref={answer}>{selected.label}</h3>
        <p>{selected.answer}</p>
        {selected.sources.length > 0 && <details className="guardian-citations">
          <summary><BookOpen size={14} />แหล่งอ้างอิง {selected.sources.length} รายการ</summary>
          {selected.sources.map(source => <div key={source.id}>
            {source.url ? <SourceLink href={source.url}>{source.title}</SourceLink> : <strong>{source.title}</strong>}
            <small>{source.academicYear ? `ปี ${source.academicYear} · ` : ""}{source.authority === "official" ? "แหล่งทางการ" : "ข้อมูลผู้จัด"} · ตรวจ {source.verifiedAt}{source.confidence === "needs-confirmation" ? " · ต้องยืนยันเพิ่มเติม" : ""}</small>
          </div>)}
        </details>}
        <div className="guardian-answer-links">{selected.links.map(link => <SourceLink key={link.href} href={link.href}>{link.label}</SourceLink>)}</div>
      </article> : <>
        <div className="guardian-chat-welcome"><span className="pixel-welcome-seal" aria-hidden="true">問</span><h3>เลือกเรื่องที่อยากรู้</h3><p>สมัครคณะ วางแผนร่วมงาน หรือดูวิธีใช้งาน<br />กดหัวข้อเพื่ออ่านคำตอบและเอกสารอ้างอิง</p></div>
        <nav className="guardian-guide-categories" aria-label="หมวดคำถาม">{guideCategories.map((item, index) => <button type="button" ref={index === 0 ? firstCategory : undefined} key={item.id} aria-pressed={item.id === category} onClick={() => setCategory(item.id)}>{item.label}</button>)}</nav>
        <div className="guardian-quick-questions">{topics.filter(topic => topic.category === category).map(topic => <button type="button" key={topic.id} onClick={() => setSelectedId(topic.id)}>{topic.label}<ArrowUpRight size={14} /></button>)}</div>
      </>}
    </div>
    <footer className="guardian-guide-footer">
      {selected ? <button type="button" onClick={() => setSelectedId(null)}><ArrowLeft size={16} />เลือกคำถามอื่น</button> : <Link to="/faq" onClick={onClose}>ดูคำถามที่พบบ่อยทั้งหมด<ArrowUpRight size={14} /></Link>}
      <small>ข้อมูลรับสมัครให้ตรวจปีและประกาศล่าสุดก่อนสมัครจริง</small>
    </footer>
  </section>;
}

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  if (href.startsWith("/") && !href.startsWith("//")) return <Link to={href}>{children}<ArrowUpRight size={12} /></Link>;
  if (!/^https:\/\//.test(href)) return <span>{children}</span>;
  return <a href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={12} /></a>;
}

const hiddenKey = "fatu_guardian_hidden";
export function GuardianAssistant() {
  const location = useLocation();
  const realm = useGuardianRealm();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(() => { try { return localStorage.getItem(hiddenKey) === "1"; } catch { return false; } });
  const launcher = useRef<HTMLButtonElement>(null);
  const restore = useRef<HTMLButtonElement>(null);
  const focusPending = useRef(false);
  const standalone = location.pathname.startsWith("/admin") || ["/register", "/login", "/forgot-password"].includes(location.pathname);
  useEffect(() => {
    try { localStorage.setItem(hiddenKey, hidden ? "1" : "0"); } catch { /* Private browsers may block storage. */ }
    if (focusPending.current) { (hidden ? restore.current : launcher.current)?.focus({ preventScroll: true }); focusPending.current = false; }
  }, [hidden]);
  useEffect(() => {
    function escape(event: KeyboardEvent) { if (open && event.key === "Escape") { setOpen(false); launcher.current?.focus({ preventScroll: true }); } }
    window.addEventListener("keydown", escape); return () => window.removeEventListener("keydown", escape);
  }, [open]);
  function hidePet() { setOpen(false); focusPending.current = true; setHidden(true); }
  function restorePet() { focusPending.current = true; setHidden(false); }
  if (location.pathname === "/assistant") return null;
  return <div className={`guardian-pet-root ${standalone ? "standalone" : ""} ${hidden ? "pet-hidden" : ""}`} data-guardian={realm} data-pet-hidden={hidden}>
    <div className="guardian-chat-popup" hidden={!open || hidden} role="dialog" aria-modal="false" aria-label={`คู่มือ${realms[realm].guardian}`}>
      <GuardianChat active={open && !hidden} realm={realm} onHide={hidePet} onClose={() => { setOpen(false); launcher.current?.focus({ preventScroll: true }); }} />
    </div>
    {hidden ? <button type="button" className="guardian-pet-restore" ref={restore} aria-label="แสดงสัตว์เลี้ยง" onClick={restorePet}><BookOpen size={16} /><span>ผู้ช่วย</span></button> : <>
      <button type="button" className={`guardian-pet-launcher ${open ? "chat-open" : ""}`} ref={launcher} onClick={() => setOpen(!open)} aria-label={`ถาม${realms[realm].guardian} · เลือกหัวข้อคำถาม`} aria-expanded={open}><PixelGuardian realm={realm} /><span>ถามผู้พิทักษ์</span><i aria-hidden="true">?</i></button>
      <button type="button" className="guardian-pet-hide" aria-label="ซ่อนสัตว์เลี้ยง" title="ซ่อนสัตว์เลี้ยง" onClick={hidePet}><X size={16} /></button>
    </>}
  </div>;
}

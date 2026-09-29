import { useAnnouncements, useFaq } from "@/data/content";

export function FaqPage() {
  const faq = useFaq();
  const announcements = useAnnouncements();

  return (
    <section className="page-section">
      <span className="section-kicker">INFO</span>
      <h1 className="page-title">ข้อมูลสำคัญและ FAQ</h1>

      {announcements.items.length ? (
        <div className="announcement-list">
          {announcements.items.map((item) => (
            <article className={"notice-card " + (item.level === "important" ? "important" : "")} key={item.id}>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      ) : null}

      <div className="faq-list">
        {faq.items.map((item) => (
          <details className="faq-item" key={item.id}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
        {!faq.loading && !faq.items.length ? <p className="content-status">ยังไม่มีคำถามที่เผยแพร่</p> : null}
      </div>
    </section>
  );
}

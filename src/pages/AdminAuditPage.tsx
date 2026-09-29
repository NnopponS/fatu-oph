import { useEffect, useState } from "react";
import { AdminAccess } from "@/pages/AdminPage";
import { adminAction } from "@/services/api";

export function AdminAuditPage() {
  const [entries, setEntries] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void adminAction<{ entries: Array<Record<string, unknown>> }>("audit")
      .then((result) => setEntries(result.entries))
      .catch((err) => setError(err instanceof Error ? err.message : "โหลด Audit ไม่สำเร็จ"));
  }, []);

  return (
    <AdminAccess roles={["admin"]}>
      <section>
      <span className="section-kicker">AUDIT</span>
      <h1 className="admin-page-title">ประวัติการทำรายการ</h1>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="audit-list">
        {entries.map((entry) => <article className="audit-row" key={String(entry.id)}><strong>{String(entry.type || "event")}</strong><span>{String(entry.createdAt || "")}</span><code>{JSON.stringify(entry)}</code></article>)}
        {!entries.length && !error ? <p className="content-status">ยังไม่มี Audit</p> : null}
      </div>
      </section>
    </AdminAccess>
  );
}

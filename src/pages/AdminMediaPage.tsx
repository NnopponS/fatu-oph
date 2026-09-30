import { useEffect, useState, type FormEvent } from "react";
import { AdminAccess } from "@/pages/AdminPage";
import { adminAction } from "@/services/api";
import { deleteAdminMedia, uploadAdminMedia, type MediaRecord } from "@/services/media";
import { realtimePaths, subscribeRealtime } from "@/services/realtime";

export function AdminMediaPage() {
  const [items, setItems] = useState<MediaRecord[]>([]);
  const [message, setMessage] = useState("");

  useEffect(
    () =>
      subscribeRealtime<Record<string, Omit<MediaRecord, "id">> | null>(realtimePaths.public.media, (value) => {
        setItems(Object.entries(value || {}).map(([id, media]) => ({ id, ...media })).sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))));
      }),
    [],
  );

  async function remove(mediaId: string) {
    if (!window.confirm("ลบสื่อนี้ออกจากระบบ?")) return;
    try {
      await deleteAdminMedia(mediaId);
      setMessage("ลบสื่อแล้ว");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ลบสื่อไม่สำเร็จ");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    if (!(file instanceof File) || !file.size) return;

    setMessage("กำลังอัปโหลด...");
    try {
      const record = await uploadAdminMedia({
        file,
        kind: String(data.get("kind") || "image") as MediaRecord["kind"],
        altText: String(data.get("altText") || ""),
        venueId: String(data.get("venueId") || "") || undefined,
        activityId: String(data.get("activityId") || "") || undefined,
      });
      await adminAction("contentAudit", {
        kind: "media",
        id: record.id,
        operation: "upload",
      });
      setMessage("อัปโหลดสำเร็จ");
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "อัปโหลดไม่สำเร็จ");
    }
  }

  return (
    <AdminAccess roles={["admin", "editor"]}>
      <section>
      <span className="section-kicker">MEDIA</span>
      <h1 className="admin-page-title">รูปและวิดีโอ</h1>
      <p className="admin-page-lead">ไฟล์คงที่ใช้ public/media ส่วนไฟล์ที่ทีมงานอัปโหลดใช้ Vercel Blob และเก็บ URL ใน Firebase</p>
      <form className="admin-form media-form" onSubmit={submit}>
        <label><span>ไฟล์</span><input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" required /></label>
        <label><span>ประเภท</span><select name="kind"><option value="image">Image</option><option value="poster">Poster</option><option value="video">Video</option></select></label>
        <label><span>Alt text</span><input name="altText" required /></label>
        <div className="form-grid"><label><span>Venue ID (ถ้ามี)</span><input name="venueId" /></label><label><span>Activity ID (ถ้ามี)</span><input name="activityId" /></label></div>
        <button className="admin-submit">อัปโหลด</button>
        {message ? <p>{message}</p> : null}
      </form>
      <div className="media-grid">
        {items.map((item) => (
          <article className="media-card" key={item.id}>
            {item.kind === "video" ? <video src={item.url} controls preload="metadata" /> : <img src={item.url} alt={item.altText} />}
            <p>{item.altText}</p>
            <small>Media ID: {item.id}</small>
            <small>{item.provider}</small>
            <button className="text-button danger-text" type="button" onClick={() => void remove(item.id)}>ลบ</button>
          </article>
        ))}
      </div>
      </section>
    </AdminAccess>
  );
}

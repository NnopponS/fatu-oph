import { useMemo, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import {
  activitySchema,
  announcementSchema,
  faqSchema,
  prizeSchema,
  useActivities,
  useAnnouncements,
  useFaq,
  usePrizes,
  useVenues,
  venueSchema,
} from "@/data/content";
import { AdminAccess } from "@/pages/AdminPage";
import { adminAction } from "@/services/api";
import { realtimePaths, setRealtime } from "@/services/realtime";

type Kind = "activities" | "venues" | "prizes" | "faq" | "announcements";

function number(value: FormDataEntryValue | null, fallback = 0) {
  return value === null || value === "" ? fallback : Number(value);
}

function bool(data: FormData, key: string) {
  return data.get(key) === "on";
}

export function AdminContentPage({ kind }: { kind: Kind }) {
  const venues = useVenues(false);
  const activities = useActivities(false);
  const prizes = usePrizes(false);
  const faq = useFaq(false);
  const announcements = useAnnouncements(false);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [qrImage, setQrImage] = useState("");

  const collectionState = kind === "activities" ? activities : kind === "venues" ? venues : kind === "prizes" ? prizes : kind === "faq" ? faq : announcements;
  const collection = collectionState.items;
  const current = useMemo(() => collection.find((item) => item.id === editingId) as Record<string, unknown> | undefined, [collection, editingId]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = editingId || crypto.randomUUID();
    const now = new Date().toISOString();
    let value: Record<string, unknown>;
    let path: string;

    if (kind === "activities") {
      value = activitySchema.parse({
        slug: String(data.get("slug") || id),
        title: String(data.get("title") || ""),
        shortDescription: String(data.get("shortDescription") || ""),
        description: String(data.get("description") || ""),
        venueId: String(data.get("venueId") || ""),
        coverMediaId: String(data.get("coverMediaId") || ""),
        startAt: String(data.get("startAt") || ""),
        endAt: String(data.get("endAt") || ""),
        registrationMode: String(data.get("registrationMode") || "none"),
        registrationUrl: String(data.get("registrationUrl") || ""),
        ctaLabel: String(data.get("ctaLabel") || ""),
        price: data.get("price") ? number(data.get("price")) : null,
        priceLabel: String(data.get("priceLabel") || ""),
        isFree: bool(data, "isFree"),
        capacity: data.get("capacity") ? number(data.get("capacity")) : null,
        availabilityStatus: String(data.get("availabilityStatus") || "open"),
        tags: String(data.get("tags") || "").split(",").map((v) => v.trim()).filter(Boolean),
        displayOrder: number(data.get("displayOrder")),
        isPublished: bool(data, "isPublished"),
        isArchived: bool(data, "isArchived"),
        pointsEnabled: bool(data, "pointsEnabled"),
        pointsAwarded: number(data.get("pointsAwarded")),
        pointGrantMode: String(data.get("pointGrantMode") || "once"),
        repeatLimit: data.get("repeatLimit") ? number(data.get("repeatLimit")) : null,
        completionMethod: String(data.get("completionMethod") || "none"),
        requiresStaffVerification: bool(data, "requiresStaffVerification"),
        createdAt: String(current?.createdAt || now),
        updatedAt: now,
      });
      path = `${realtimePaths.public.activities}/${id}`;
    } else if (kind === "venues") {
      value = venueSchema.parse({
        name: String(data.get("name") || ""),
        visualIdentityKey: String(data.get("visualIdentityKey") || "azure-dragon"),
        visualLabel: String(data.get("visualLabel") || ""),
        description: String(data.get("description") || ""),
        directions: String(data.get("directions") || ""),
        landmarkNotes: String(data.get("landmarkNotes") || ""),
        mapUrl: String(data.get("mapUrl") || ""),
        latitude: data.get("latitude") ? number(data.get("latitude")) : null,
        longitude: data.get("longitude") ? number(data.get("longitude")) : null,
        coverMediaId: String(data.get("coverMediaId") || ""),
        displayOrder: number(data.get("displayOrder")),
        isPublished: bool(data, "isPublished"),
      });
      path = `${realtimePaths.public.venues}/${id}`;
    } else if (kind === "prizes") {
      value = prizeSchema.parse({
        name: String(data.get("name") || ""),
        description: String(data.get("description") || ""),
        imageMediaId: String(data.get("imageMediaId") || ""),
        stock: number(data.get("stock")),
        pointsRequired: number(data.get("pointsRequired")),
        claimLimit: Math.max(1, number(data.get("claimLimit"), 1)),
        displayOrder: number(data.get("displayOrder")),
        isPublished: bool(data, "isPublished"),
      });
      path = `${realtimePaths.public.prizes}/${id}`;
    } else if (kind === "faq") {
      value = faqSchema.parse({
        question: String(data.get("question") || ""),
        answer: String(data.get("answer") || ""),
        displayOrder: number(data.get("displayOrder")),
        isPublished: bool(data, "isPublished"),
      });
      path = `${realtimePaths.public.faq}/${id}`;
    } else {
      value = announcementSchema.parse({
        title: String(data.get("title") || ""),
        body: String(data.get("body") || ""),
        level: String(data.get("level") || "info"),
        displayOrder: number(data.get("displayOrder")),
        isPublished: bool(data, "isPublished"),
      });
      path = `${realtimePaths.public.announcements}/${id}`;
    }

    await setRealtime(path, value);
    await adminAction("contentAudit", { kind, id, operation: "save" });
    setEditingId(id);
    setMessage("บันทึกแล้ว");
  }

  async function remove(id: string) {
    if (!window.confirm("ลบรายการนี้?")) return;
    const root = kind === "activities" ? realtimePaths.public.activities : kind === "venues" ? realtimePaths.public.venues : kind === "prizes" ? realtimePaths.public.prizes : kind === "faq" ? realtimePaths.public.faq : realtimePaths.public.announcements;
    await setRealtime(`${root}/${id}`, null);
    await adminAction("contentAudit", { kind, id, operation: "delete" });
    if (editingId === id) setEditingId("");
  }

  async function showActivityQr(id: string, rotate = false) {
    const result = await adminAction<{ qrPayload: string }>("activityQr", {
      activityId: id,
      rotate,
    });
    setQrImage(await QRCode.toDataURL(result.qrPayload, { width: 420, margin: 2 }));
    setMessage(rotate ? "สร้าง QR ใหม่แล้ว QR เดิมใช้ไม่ได้" : "โหลด QR แล้ว");
  }

  const title = kind === "activities" ? "กิจกรรม" : kind === "venues" ? "สถานที่" : kind === "prizes" ? "ของรางวัล" : kind === "faq" ? "FAQ" : "ประกาศ";

  return (
    <AdminAccess roles={["admin", "editor"]}>
      <section>
      <div className="admin-heading"><div><span className="section-kicker">CONTENT</span><h1 className="admin-page-title">{title}</h1></div><button className="secondary-button" onClick={() => { setEditingId(""); setQrImage(""); }}>สร้างใหม่</button></div>
      {collectionState.loading ? <p className="content-status">กำลังโหลดข้อมูล...</p> : null}
      {collectionState.error ? <p className="form-error" role="alert">{collectionState.error}</p> : null}
      <div className="admin-split">
        <div className="admin-list">
          {collection.map((item) => (
            <button className={"admin-list-item " + (editingId === item.id ? "selected" : "")} key={item.id} onClick={() => { setEditingId(item.id); setQrImage(""); }}>
              <strong>{String((item as Record<string, unknown>).title || (item as Record<string, unknown>).name || (item as Record<string, unknown>).question || "รายการ")}</strong>
              <small>{(item as { isPublished?: boolean }).isPublished ? "เผยแพร่" : "ฉบับร่าง"}</small>
            </button>
          ))}
        </div>

        <form className="admin-editor" key={editingId || "new"} onSubmit={(event) => void save(event).catch((error) => setMessage(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ"))}>
          {kind === "activities" ? <ActivityFields current={current} venues={venues.items} /> : null}
          {kind === "venues" ? <VenueFields current={current} /> : null}
          {kind === "prizes" ? <PrizeFields current={current} /> : null}
          {kind === "faq" ? <FaqFields current={current} /> : null}
          {kind === "announcements" ? <AnnouncementFields current={current} /> : null}
          <div className="action-row">
            <button className="admin-submit" type="submit">บันทึก</button>
            {editingId ? <button className="secondary-button" type="button" onClick={() => void remove(editingId).catch((error) => setMessage(error instanceof Error ? error.message : "ลบไม่สำเร็จ"))}>ลบ</button> : null}
            {kind === "activities" && editingId ? (
              <>
                <button className="secondary-button" type="button" onClick={() => void showActivityQr(editingId).catch((error) => setMessage(error instanceof Error ? error.message : "โหลด QR ไม่สำเร็จ"))}>แสดง QR</button>
                <button className="secondary-button" type="button" onClick={() => void showActivityQr(editingId, true).catch((error) => setMessage(error instanceof Error ? error.message : "สร้าง QR ไม่สำเร็จ"))}>สร้าง QR ใหม่</button>
              </>
            ) : null}
          </div>
          {message ? <p className="success-message">{message}</p> : null}
          {qrImage ? (
            <div className="admin-qr-wrap">
              <img className="admin-qr" src={qrImage} alt="QR Code กิจกรรม" />
              <a className="secondary-button" href={qrImage} download={`fatu-activity-${editingId}.png`}>ดาวน์โหลด QR</a>
            </div>
          ) : null}
        </form>
      </div>
      </section>
    </AdminAccess>
  );
}

function Field({ label, name, value = "", type = "text", required = false, step }: { label: string; name: string; value?: unknown; type?: string; required?: boolean; step?: string }) {
  return <label><span>{label}</span><input name={name} type={type} required={required} step={step} defaultValue={String(value ?? "")} /></label>;
}
function Check({ label, name, value }: { label: string; name: string; value?: unknown }) {
  return <label className="check-row"><input name={name} type="checkbox" defaultChecked={Boolean(value)} /><span>{label}</span></label>;
}
function TextArea({ label, name, value = "" }: { label: string; name: string; value?: unknown }) {
  return <label><span>{label}</span><textarea name={name} defaultValue={String(value ?? "")} rows={4} /></label>;
}
function Select({ label, name, value, options }: { label: string; name: string; value?: unknown; options: Array<[string, string | undefined]> }) {
  const fallback = options[0]?.[0] ?? "";
  return <label><span>{label}</span><select name={name} required defaultValue={String(value ?? fallback)}>{options.length === 0 ? <option value="">ยังไม่มีข้อมูลให้เลือก</option> : null}{options.map(([v, l]) => <option value={v} key={v}>{l || v}</option>)}</select></label>;
}

function ActivityFields({ current = {}, venues }: { current?: Record<string, unknown>; venues: Array<{ id: string; name?: string }> }) {
  return <>
    <Field label="ชื่อกิจกรรม" name="title" value={current.title} required />
    <Field label="Slug" name="slug" value={current.slug} required />
    <Select label="สถานที่" name="venueId" value={current.venueId} options={venues.map((v) => [v.id, v.name])} />
    <Field label="คำอธิบายสั้น" name="shortDescription" value={current.shortDescription} />
    <Field label="Cover media ID หรือ /media/... URL" name="coverMediaId" value={current.coverMediaId} />
    <TextArea label="รายละเอียด" name="description" value={current.description} />
    <div className="form-grid"><Field label="เริ่ม" name="startAt" value={current.startAt} type="datetime-local" /><Field label="สิ้นสุด" name="endAt" value={current.endAt} type="datetime-local" /></div>
    <div className="form-grid"><Field label="Capacity" name="capacity" value={current.capacity} type="number" /><Field label="ลำดับ" name="displayOrder" value={current.displayOrder} type="number" /></div>
    <Select label="สถานะ" name="availabilityStatus" value={current.availabilityStatus} options={[["open","เปิด"],["coming-soon","เร็ว ๆ นี้"],["full","เต็ม"],["closed","ปิด"]]} />
    <Select label="การลงทะเบียน" name="registrationMode" value={current.registrationMode} options={[["none","ไม่ต้องลงทะเบียน"],["external","ลิงก์ภายนอก"],["on-site","หน้างาน"]]} />
    <Field label="Registration URL" name="registrationUrl" value={current.registrationUrl} />
    <Field label="ข้อความปุ่ม CTA" name="ctaLabel" value={current.ctaLabel} />
    <div className="form-grid"><Field label="ราคา" name="price" value={current.price} type="number" step="0.01" /><Field label="ข้อความราคา" name="priceLabel" value={current.priceLabel} /></div>
    <Check label="เข้าร่วมฟรี" name="isFree" value={current.isFree ?? true} />
    <Field label="Tags (คั่นด้วย ,)" name="tags" value={Array.isArray(current.tags) ? current.tags.join(", ") : ""} />
    <Check label="ให้คะแนน" name="pointsEnabled" value={current.pointsEnabled} />
    <div className="form-grid"><Field label="คะแนน" name="pointsAwarded" value={current.pointsAwarded} type="number" /><Field label="Repeat limit" name="repeatLimit" value={current.repeatLimit} type="number" /></div>
    <Select label="กติกาคะแนน" name="pointGrantMode" value={current.pointGrantMode} options={[["once","ครั้งเดียว"],["per-session","ต่อ session"],["repeat-limited","จำกัดจำนวน"],["manual-only","เจ้าหน้าที่เท่านั้น"]]} />
    <Select label="วิธีจบกิจกรรม" name="completionMethod" value={current.completionMethod} options={[["none","ไม่มี"],["qr","QR"],["staff","เจ้าหน้าที่"]]} />
    <Check label="ต้องให้เจ้าหน้าที่ตรวจ" name="requiresStaffVerification" value={current.requiresStaffVerification} />
    <Check label="เผยแพร่" name="isPublished" value={current.isPublished} />
    <Check label="เก็บถาวร" name="isArchived" value={current.isArchived} />
  </>;
}
function VenueFields({ current = {} }: { current?: Record<string, unknown> }) {
  return <>
    <Field label="ชื่อสถานที่จริง" name="name" value={current.name} required />
    <Select label="Visual identity" name="visualIdentityKey" value={current.visualIdentityKey} options={[["azure-dragon","Azure Dragon"],["white-tiger","White Tiger"],["nine-tailed-fox","Nine-Tailed Fox"],["red-phoenix","Red Phoenix"]]} />
    <Field label="Visual label" name="visualLabel" value={current.visualLabel} required />
    <TextArea label="รายละเอียด" name="description" value={current.description} />
    <Field label="Cover media ID หรือ /media/... URL" name="coverMediaId" value={current.coverMediaId} />
    <TextArea label="วิธีเดินทาง" name="directions" value={current.directions} />
    <TextArea label="จุดสังเกต" name="landmarkNotes" value={current.landmarkNotes} />
    <Field label="Google Maps URL" name="mapUrl" value={current.mapUrl} />
    <div className="form-grid"><Field label="Latitude" name="latitude" value={current.latitude} type="number" step="any" /><Field label="Longitude" name="longitude" value={current.longitude} type="number" step="any" /></div>
    <Field label="ลำดับ" name="displayOrder" value={current.displayOrder} type="number" />
    <Check label="เผยแพร่" name="isPublished" value={current.isPublished} />
  </>;
}
function PrizeFields({ current = {} }: { current?: Record<string, unknown> }) {
  return <>
    <Field label="ชื่อรางวัล" name="name" value={current.name} required />
    <TextArea label="รายละเอียด" name="description" value={current.description} />
    <Field label="Image media ID หรือ /media/... URL" name="imageMediaId" value={current.imageMediaId} />
    <div className="form-grid"><Field label="Stock" name="stock" value={current.stock} type="number" /><Field label="คะแนนที่ใช้" name="pointsRequired" value={current.pointsRequired} type="number" /></div>
    <div className="form-grid"><Field label="จำกัดต่อคน" name="claimLimit" value={current.claimLimit} type="number" /><Field label="ลำดับ" name="displayOrder" value={current.displayOrder} type="number" /></div>
    <Check label="เผยแพร่" name="isPublished" value={current.isPublished} />
  </>;
}
function FaqFields({ current = {} }: { current?: Record<string, unknown> }) {
  return <><Field label="คำถาม" name="question" value={current.question} required /><TextArea label="คำตอบ" name="answer" value={current.answer} /><Field label="ลำดับ" name="displayOrder" value={current.displayOrder} type="number" /><Check label="เผยแพร่" name="isPublished" value={current.isPublished} /></>;
}
function AnnouncementFields({ current = {} }: { current?: Record<string, unknown> }) {
  return <><Field label="หัวข้อ" name="title" value={current.title} required /><TextArea label="ข้อความ" name="body" value={current.body} /><Select label="ระดับ" name="level" value={current.level} options={[["info","ทั่วไป"],["important","สำคัญ"]]} /><Field label="ลำดับ" name="displayOrder" value={current.displayOrder} type="number" /><Check label="เผยแพร่" name="isPublished" value={current.isPublished} /></>;
}

import { useEffect, useState, type FormEvent } from "react";
import { siteSchema, useSite } from "@/data/content";
import { AdminAccess, useAdminSession } from "@/pages/AdminPage";
import { adminAction } from "@/services/api";
import { realtimePaths, setRealtime } from "@/services/realtime";

interface StaffRow {
  uid: string;
  email: string;
  role: "admin" | "editor" | "staff" | "viewer";
  disabled: boolean;
}

export function AdminSettingsPage() {
  const session = useAdminSession();
  const site = useSite();
  const [roles, setRoles] = useState<StaffRow[]>([]);
  const [message, setMessage] = useState("");

  async function refresh() {
    if (session.role !== "admin") return;
    const result = await adminAction<{ roles: StaffRow[] }>("roles");
    setRoles(result.roles);
  }

  useEffect(() => {
    if (session.role !== "admin") return;
    void adminAction<{ roles: StaffRow[] }>("roles")
      .then((result) => setRoles(result.roles))
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : "โหลด Staff ไม่สำเร็จ"),
      );
  }, [session.role]);

  async function saveSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const value = siteSchema.parse({
        name: String(data.get("name") || ""),
        eventYear: Number(data.get("eventYear") || 2026),
        theme: String(data.get("theme") || ""),
        faculty: String(data.get("faculty") || ""),
        description: String(data.get("description") || ""),
        dateLabel: String(data.get("dateLabel") || ""),
        locationLabel: String(data.get("locationLabel") || ""),
        registrationOpen: data.get("registrationOpen") === "on",
      });
      await setRealtime(realtimePaths.public.site, value);
      await adminAction("contentAudit", { kind: "site", id: "site", operation: "save" });
      setMessage("บันทึกข้อมูลงานแล้ว");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
    }
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await adminAction("createStaff", {
        email: String(data.get("email") || ""),
        password: String(data.get("password") || ""),
        role: String(data.get("role") || "staff"),
      });
      form.reset();
      setMessage("สร้างบัญชีทีมงานแล้ว");
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "สร้างบัญชีไม่สำเร็จ");
    }
  }

  async function setRole(uid: string, role: StaffRow["role"]) {
    await adminAction("setRole", { uid, role });
    setMessage("อัปเดตสิทธิ์แล้ว");
    await refresh();
  }

  async function setDisabled(uid: string, disabled: boolean) {
    await adminAction("setStaffDisabled", { uid, disabled });
    setMessage(disabled ? "ปิดบัญชีแล้ว" : "เปิดบัญชีแล้ว");
    await refresh();
  }

  return (
    <AdminAccess roles={["admin", "editor"]}>
      <section>
        <span className="section-kicker">SETTINGS</span>
        <h1 className="admin-page-title">ข้อมูลงานและทีมงาน</h1>

        <form className="admin-form" key={site.item ? JSON.stringify(site.item) : "site"} onSubmit={saveSite}>
          <h2>ข้อมูล Open House</h2>
          <label><span>ชื่องาน</span><input name="name" required defaultValue={site.item?.name || "FATU Open House 2026"} /></label>
          <div className="form-grid">
            <label><span>ปี</span><input name="eventYear" type="number" min={2026} required defaultValue={site.item?.eventYear || 2026} /></label>
            <label><span>ธีม</span><input name="theme" required defaultValue={site.item?.theme || "ตะลุยแดนมังกร"} /></label>
          </div>
          <label><span>คณะ / หน่วยงาน</span><input name="faculty" required defaultValue={site.item?.faculty || "Faculty of Fine and Applied Arts, Thammasat University"} /></label>
          <label><span>คำอธิบายงาน</span><textarea name="description" rows={4} defaultValue={site.item?.description || ""} /></label>
          <div className="form-grid">
            <label><span>วันที่แสดงผล</span><input name="dateLabel" placeholder="เช่น 7–8 พฤศจิกายน 2026" defaultValue={site.item?.dateLabel || ""} /></label>
            <label><span>สถานที่รวม</span><input name="locationLabel" placeholder="เช่น มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต" defaultValue={site.item?.locationLabel || ""} /></label>
          </div>
          <label className="check-row"><input name="registrationOpen" type="checkbox" defaultChecked={site.item?.registrationOpen ?? true} /><span>เปิดให้สร้างบัตรผู้เข้าร่วม</span></label>
          <button className="admin-submit">บันทึกข้อมูลงาน</button>
        </form>

        {session.role === "admin" ? (
          <>
            <form className="admin-form staff-form" onSubmit={create}>
              <h2>สร้างบัญชีทีมงาน</h2>
              <label><span>อีเมล</span><input name="email" type="email" required /></label>
              <label><span>รหัสผ่านชั่วคราว</span><input name="password" type="password" minLength={8} required /></label>
              <label><span>Role</span><select name="role"><option value="staff">staff</option><option value="editor">editor</option><option value="viewer">viewer</option><option value="admin">admin</option></select></label>
              <button className="admin-submit">สร้างบัญชี</button>
            </form>

            <div className="content-list">
              {roles.map((row) => (
                <article className="content-card static-card staff-row" key={row.uid}>
                  <div><strong>{row.email || row.uid}</strong><p>{row.uid}</p></div>
                  <select value={row.role} onChange={(event) => void setRole(row.uid, event.target.value as StaffRow["role"])}><option value="admin">admin</option><option value="editor">editor</option><option value="staff">staff</option><option value="viewer">viewer</option></select>
                  <button className="secondary-button compact" onClick={() => void setDisabled(row.uid, !row.disabled)}>{row.disabled ? "เปิดบัญชี" : "ปิดบัญชี"}</button>
                </article>
              ))}
            </div>
          </>
        ) : (
          <p className="content-status">การจัดการ Staff ใช้สิทธิ์ Admin เท่านั้น</p>
        )}

        {message ? <p className="success-message">{message}</p> : null}
      </section>
    </AdminAccess>
  );
}

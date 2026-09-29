import { auth } from "@/lib/firebase";
import { loadPass } from "@/lib/pass";

async function request<T>(url: string, body: Record<string, unknown>, staff = false): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (staff) {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("Staff sign-in required.");
    headers.authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

export interface ParticipantView {
  participant: {
    id: string;
    displayName: string;
    school?: string;
    phone?: string;
    email?: string;
    createdAt: string;
  };
  pointTotal: number;
  transactions: Array<{
    id: string;
    points: number;
    reason: string;
    activityId?: string;
    createdAt: string;
  }>;
  claims: Array<{
    id: string;
    prizeId: string;
    prizeName: string;
    pointsSpent: number;
    createdAt: string;
  }>;
}

export function registerParticipant(input: {
  displayName: string;
  school?: string;
  phone?: string;
  email?: string;
}) {
  return request<{ participantId: string; passToken: string; displayName: string }>(
    "/api/participant",
    { action: "register", ...input },
  );
}

export function loadParticipant(passToken?: string) {
  const token = passToken ?? loadPass()?.token;
  if (!token) throw new Error("ยังไม่มีบัตรผู้เข้าร่วม");
  return request<ParticipantView>("/api/participant", { action: "me", passToken: token });
}

export function completeActivity(qrPayload: string, passToken?: string) {
  const token = passToken ?? loadPass()?.token;
  if (!token) throw new Error("กรุณาลงทะเบียนก่อนเช็กอิน");
  return request<{ ok: true; activityTitle: string; pointsAdded: number; pointTotal: number }>(
    "/api/checkin",
    { passToken: token, qrPayload },
  );
}

export function adminAction<T>(action: string, payload: Record<string, unknown> = {}) {
  return request<T>("/api/admin", { action, ...payload }, true);
}

export function askAssistant(question: string) {
  return request<{ answer: string; links: Array<{ label: string; href: string }> }>(
    "/api/assistant",
    { question, passToken: loadPass()?.token },
  );
}

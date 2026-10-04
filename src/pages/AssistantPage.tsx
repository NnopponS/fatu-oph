import { BookOpen } from "lucide-react";
import { ChineseHero } from "@/components/ChineseOrnaments";
import { GuardianChat } from "@/components/GuardianAssistant";
import { useGuardianRealm } from "@/lib/useGuardianRealm";

export function AssistantPage() {
  const realm=useGuardianRealm();
  return <div className="assistant-page"><ChineseHero title={<>คู่มือผู้พิทักษ์<br /><em>เลือกเรื่องที่อยากรู้</em></>} kicker={<><BookOpen size={15} /> THE GUARDIAN'S LIBRARY</>} description="เลือกหัวข้อเรื่องสมัครคณะ คะแนนสอบ ช่องทางติดต่อ และวิธีใช้ระบบ เพื่ออ่านคำตอบพร้อมเอกสารอ้างอิง" seal="問" /><GuardianChat realm={realm} embedded /></div>;
}

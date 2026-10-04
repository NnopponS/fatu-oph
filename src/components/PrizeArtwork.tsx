import { useId, useState } from "react";
import { Gift } from "lucide-react";

function illustrationFor(name: string) {
  if (/art toy|โมเดล/i.test(name)) return "/images/prize-art-toy.jpg";
  if (/พวงกุญแจ|keychain/i.test(name)) return "/images/prize-fox-keychain.jpg";
  if (/กระเป๋า|tote|bag|ถุงผ้า/i.test(name)) return "/images/prize-tote-bag.jpg";
  if (/สติ[๊กก]*เกอร์|sticker/i.test(name)) return "/images/prize-stickers-pack.jpg";
  return "";
}

/** Published prize photos take priority; concept illustrations are labelled clearly. */
export function PrizeArtwork({ name, source = "" }: { name: string; source?: string }) {
  const [failed, setFailed] = useState<string[]>([]);
  const goldId = useId();
  const illustration = illustrationFor(name);
  const image = source && !failed.includes(source) ? source : illustration && !failed.includes(illustration) ? illustration : "";
  return <div className="prize-artwork">
    {image ? <img src={image} alt={source === image ? name : `ภาพประกอบ${name}`} loading="lazy" onError={() => setFailed(previous => [...previous, image])} /> : <svg viewBox="0 0 160 160" fill="none" role="img" aria-label={`ภาพประกอบ${name}`}>
      <defs><linearGradient id={goldId} x1="25" y1="20" x2="125" y2="150" gradientUnits="userSpaceOnUse"><stop stopColor="#ffebac" /><stop offset=".5" stopColor="#c69c51" /><stop offset="1" stopColor="#f8d989" /></linearGradient></defs>
      <circle cx="80" cy="80" r="67" stroke="#d4b777" strokeOpacity=".3" /><circle cx="80" cy="80" r="58" stroke="#d4b777" strokeDasharray="3 7" strokeOpacity=".2" />
      {/พัด|fan/i.test(name) ? <g stroke={`url(#${goldId})`} strokeWidth="2"><path d="M80 118 22 64Q80 12 138 64Z" fill="#174649" /><path d="m80 118-41-68m41 68-20-80m20 80V34m0 84 20-80m-20 80 41-68" /><path d="M50 58q30-15 60 0" strokeOpacity=".6" /><path d="M80 118v14" strokeWidth="6" /></g> : /ปิ่น|hairpin/i.test(name) ? <g stroke={`url(#${goldId})`} strokeWidth="3"><path d="m55 130 44-77M49 126l43-78" /><path d="M83 47q-9-20 8-24 10-4 15 9 15-9 19 4 4 16-18 19" fill="#203e3a" /><circle cx="102" cy="40" r="6" fill="#af3438" /><path d="m109 56 4 28m-9-25 2 18" strokeWidth="1.5" /><circle cx="113" cy="86" r="5" fill="#59b8a1" /></g> : /ซองแดง|อั่งเปา|ส่วนลด|envelope/i.test(name) ? <g><rect x="43" y="28" width="74" height="106" rx="8" fill="#942a30" stroke={`url(#${goldId})`} strokeWidth="2" /><path d="m43 40 37 29 37-29" stroke="#e2bf70" strokeWidth="2" /><circle cx="80" cy="87" r="23" fill="#be9244" /><text x="80" y="97" textAnchor="middle" fill="#69211f" fontSize="29" fontFamily="serif">福</text><path d="M52 121h56" stroke="#dfbd76" /></g> : /พู่|โทรศัพท์|ทอสับ|charm/i.test(name) ? <g stroke={`url(#${goldId})`} strokeWidth="2"><path d="M80 19c-30 0-30 35 0 35s30-35 0-35Z" /><path d="M80 54v18" /><path d="m80 63 17 18-17 18-17-18Z" fill="#248678" /><path d="m67 100-5 38m11-38-1 41m8-41v43m7-43 1 41m5-41 5 38" stroke="#a4373b" strokeWidth="4" /><path d="M64 103h32" strokeWidth="4" /></g> : /ตุ๊กตา|plush/i.test(name) ? <g><ellipse cx="80" cy="112" rx="35" ry="22" fill="#216e63" stroke="#8bd4b8" strokeWidth="2" /><path d="m50 49-9-20 20 9m49 11 9-20-20 9" fill="#d8b975" /><path d="M47 58q-8 47 33 47t33-47q-6-21-33-21T47 58Z" fill="#398b7c" stroke="#8bd4b8" strokeWidth="2" /><circle cx="64" cy="68" r="5" fill="#ffe9a6" /><circle cx="96" cy="68" r="5" fill="#ffe9a6" /><path d="M73 85q7 7 14 0" stroke="#103a3c" strokeWidth="3" strokeLinecap="round" /><path d="M61 111h38l-4 20H66Z" fill="#962d32" stroke="#dbb86d" /><path d="m80 115 5 5-5 5-5-5Z" fill="#e5c57c" /></g> : <g transform="translate(43 43)"><Gift width={74} height={74} color="#e9ca83" strokeWidth={1.25} /></g>}
      <path d="m30 25 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#f1d28c" /><path d="m128 112 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#f1d28c" />
    </svg>}
    {(!source || source !== image) && <small className="prize-illustration-label">ภาพประกอบ</small>}
  </div>;
}

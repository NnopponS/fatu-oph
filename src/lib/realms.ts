export const realms = {
  "azure-dragon": { title: "สวรรค์แดนมังกรฟ้า", guardian: "มังกรฟ้า", place: "โรงละคอน", aliases: ["โรงละคร", "โรงละคอน"], mapUrl: "https://maps.app.goo.gl/rUZJNLSjKU1fE7iE7", color: "#1b9ca9", art: "/images/azure-dragon-art.webp", photo: "/images/venues/theater.webp", position: "70% center", photoLabel: "โรงละคอนแห่งมหาวิทยาลัยธรรมศาสตร์" },
  "white-tiger": { title: "เมืองมนุษย์พยัคฆ์ขาว", guardian: "พยัคฆ์ขาว", place: "ตึกคณะศิลปกรรมศาสตร์", aliases: ["ตึกคณะ", "ตึกคณะศิลปกรรมศาสตร์"], mapUrl: "https://maps.app.goo.gl/XiaLXPfzJABEcMa99", color: "#b88731", art: "/images/white-tiger-art.webp", photo: "/images/venues/faculty.webp", position: "center", photoLabel: "อาคารคณะศิลปกรรมศาสตร์" },
  "nine-tailed-fox": { title: "ป่าแดนจิ้งจอก 9 หาง", guardian: "จิ้งจอก 9 หาง", place: "โรงทอ", aliases: ["โรงทอ"], mapUrl: "https://maps.app.goo.gl/AQ8zYg4cs9VbhAZdA", color: "#b9588a", art: "/images/nine-tailed-fox-art.webp", photo: "/images/venues/weaving.webp", position: "center", photoLabel: "อาคารปฏิบัติการโรงทอ" },
  "red-phoenix": { title: "ถ้ำหงส์แดง", guardian: "หงส์แดง", place: "ตึก SC3", aliases: ["ตึก SC3", "SC3", "sc3"], mapUrl: "https://maps.app.goo.gl/on7t5SseFTmAvudd9", color: "#c44830", art: "/images/red-phoenix-art.webp", photo: "/images/venues/sc3.webp", position: "center", photoLabel: "อาคารเรียนรวมสังคมศาสตร์ SC3" },
} as const;
export type RealmKey = keyof typeof realms;
export function realmFor(key: string) { return realms[key as RealmKey] || realms["azure-dragon"]; }

export function realmForPlace(name: string) {
  return Object.entries(realms).find(([, meta]) => meta.aliases.some(alias => alias === name.trim()));
}

export function placeName(name: string) { return realmForPlace(name)?.[1].place || name; }

export function formatPlaceText(text: string) {
  return text.replace(/โรงละคร/g, "โรงละคอน").replace(/ตึกคณะ(?!ศิลปกรรมศาสตร์)/g, "ตึกคณะศิลปกรรมศาสตร์");
}

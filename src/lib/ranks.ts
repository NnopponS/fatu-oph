export interface Rank { id: string; title: string; english: string; min: number; color: string; glyph: string }

/** Cultivation ranks. Thresholds are relative to the configured reward target so Admin policy changes keep ranks meaningful. */
const ladder: Omit<Rank, "min">[] = [
  { id: "disciple", title: "ศิษย์ฝึกหัดแห่งหุบเขา", english: "NOVICE DISCIPLE", color: "#9a7b4f", glyph: "初" },
  { id: "wanderer", title: "จอมยุทธ์พเนจร", english: "WANDERING SWORDSMAN", color: "#b0703a", glyph: "俠" },
  { id: "master", title: "ยอดฝีมือแดนมังกร", english: "DRAGON MASTER", color: "#8fa3ad", glyph: "宗" },
  { id: "guardian", title: "ผู้พิทักษ์สี่ทิศ", english: "GUARDIAN OF FOUR DIRECTIONS", color: "#d4a73f", glyph: "守" },
  { id: "grandmaster", title: "ปรมาจารย์มังกรสะท้านภพ", english: "JADE GRANDMASTER", color: "#2fa88f", glyph: "龍" },
];

export function ranks(target: number): Rank[] {
  const goal = Math.max(1, target);
  return ladder.map((rank, index) => ({ ...rank, min: Math.round(goal * [0, .2, .45, .75, 1][index]) }));
}

export function rankFor(points: number, visited: number, target: number) {
  const list = ranks(target);
  // Completing all four venues guarantees at least Guardian even with few points.
  let index = 0;
  list.forEach((rank, i) => { if (points >= rank.min) index = i; });
  if (visited >= 4) index = Math.max(index, 3);
  const current = list[index]; const next = list[index + 1] || null;
  const progress = next ? Math.min(1, (points - current.min) / Math.max(1, next.min - current.min)) : 1;
  return { current, next, progress, index };
}

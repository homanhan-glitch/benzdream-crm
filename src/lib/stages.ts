import type { StageId } from "./types";

export type Stage = {
  id: StageId;
  label: string;
  short: string;
  accent: string;
  notion: string;
};

// Mirrors Notion 관리단계 select options 1:1.
// Order = visual left→right pipeline.
export const STAGES: Stage[] = [
  { id: "first_contact", label: "첫컨택", short: "첫컨택", accent: "#9ca3af", notion: "첫컨택" },
  { id: "fu_1", label: "1st F/U", short: "1차 F/U", accent: "#60a5fa", notion: "1st F/U" },
  { id: "fu_2", label: "2nd F/U", short: "2차 F/U", accent: "#a78bfa", notion: "2nd F/U" },
  { id: "decision", label: "의사결정", short: "의사결정", accent: "#fb923c", notion: "의사결정" },
  { id: "contract", label: "계약진행", short: "계약", accent: "#fbbf24", notion: "계약진행" },
  { id: "delivered", label: "출고완료", short: "출고완료", accent: "#34d399", notion: "출고완료" },
  { id: "aftercare", label: "출고후관리", short: "사후관리", accent: "#10b981", notion: "출고후관리" },
  { id: "long_touch", label: "장기터치", short: "장기터치", accent: "#a16207", notion: "장기터치" },
  { id: "lost", label: "이탈관리", short: "이탈", accent: "#ef4444", notion: "이탈관리" },
];

export const STAGE_BY_ID = Object.fromEntries(
  STAGES.map((s) => [s.id, s]),
) as Record<StageId, Stage>;

const NOTION_TO_ID: Record<string, StageId> = Object.fromEntries(
  STAGES.map((s) => [s.notion, s.id]),
) as Record<string, StageId>;

export function mapStage(raw: string | undefined | null): StageId {
  if (!raw) return "first_contact";
  const trimmed = raw.trim();
  if (NOTION_TO_ID[trimmed]) return NOTION_TO_ID[trimmed];
  // tolerant fallback
  const lc = trimmed.toLowerCase();
  for (const s of STAGES) {
    if (s.notion.toLowerCase() === lc) return s.id;
  }
  return "first_contact";
}

export function stageToNotion(id: StageId): string {
  return STAGE_BY_ID[id].notion;
}

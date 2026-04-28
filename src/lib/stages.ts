import type { StageId } from "./types";

export type Stage = {
  id: StageId;
  label: string;
  short: string;
  accent: string;
  description: string;
};

export const STAGES: Stage[] = [
  {
    id: "lead",
    label: "신규리드",
    short: "리드",
    accent: "#60a5fa",
    description: "유입 직후. 첫 컨택 24h 내 팔로업.",
  },
  {
    id: "consult",
    label: "상담중",
    short: "상담",
    accent: "#a78bfa",
    description: "니즈 파악 / 5요소 수집 단계.",
  },
  {
    id: "quote",
    label: "견적/시승",
    short: "견적·시승",
    accent: "#fbbf24",
    description: "견적서 발송 또는 시승 예약.",
  },
  {
    id: "negotiate",
    label: "협상",
    short: "협상",
    accent: "#fb923c",
    description: "가격·조건 협의.",
  },
  {
    id: "contract",
    label: "계약(배정)",
    short: "계약",
    accent: "#34d399",
    description: "계약 완료, 차량 배정.",
  },
  {
    id: "schedule",
    label: "출고일정",
    short: "출고일정",
    accent: "#22d3ee",
    description: "출고일 조율, 탁송 준비.",
  },
  {
    id: "delivered",
    label: "출고완료",
    short: "출고",
    accent: "#10b981",
    description: "차량 인도 완료.",
  },
  {
    id: "aftercare",
    label: "사후관리",
    short: "사후",
    accent: "#94a3b8",
    description: "D+1 / D+7 / D+30 / D+180 / D+365.",
  },
  {
    id: "lost",
    label: "이탈",
    short: "이탈",
    accent: "#6b7280",
    description: "거래 중단 또는 경쟁사 이동.",
  },
];

export const STAGE_BY_ID = Object.fromEntries(
  STAGES.map((s) => [s.id, s]),
) as Record<StageId, Stage>;

const STAGE_ALIASES: Record<string, StageId> = {
  "신규리드": "lead",
  "신규": "lead",
  "리드": "lead",
  "lead": "lead",
  "new": "lead",
  "상담중": "consult",
  "상담": "consult",
  "consult": "consult",
  "consultation": "consult",
  "견적/시승": "quote",
  "견적": "quote",
  "시승": "quote",
  "견적시승": "quote",
  "quote": "quote",
  "test drive": "quote",
  "협상": "negotiate",
  "negotiate": "negotiate",
  "negotiation": "negotiate",
  "계약(배정)": "contract",
  "계약": "contract",
  "배정": "contract",
  "contract": "contract",
  "출고일정": "schedule",
  "출고": "schedule",
  "schedule": "schedule",
  "delivery schedule": "schedule",
  "출고완료": "delivered",
  "delivered": "delivered",
  "사후관리": "aftercare",
  "사후": "aftercare",
  "aftercare": "aftercare",
  "follow-up": "aftercare",
  "이탈": "lost",
  "lost": "lost",
  "drop": "lost",
  "drop off": "lost",
};

export function mapStage(raw: string | undefined | null): StageId {
  if (!raw) return "lead";
  const key = raw.trim().toLowerCase();
  if (STAGE_ALIASES[key]) return STAGE_ALIASES[key];
  // try by partial match against label or alias keys
  for (const [alias, id] of Object.entries(STAGE_ALIASES)) {
    if (key.includes(alias.toLowerCase())) return id;
  }
  return "lead";
}

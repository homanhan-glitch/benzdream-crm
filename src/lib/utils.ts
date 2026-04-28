import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Customer, DnState, Heat } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskPhone(phone: string | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 4)}XXX-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-XXX-${digits.slice(6)}`;
  }
  return phone;
}

export function daysBetween(iso: string | undefined, now = new Date()): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.floor((now.getTime() - t) / 86_400_000);
}

export function addDays(iso: string, days: number): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const d = new Date(t);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatRelativeDay(iso: string | undefined): string {
  const d = daysBetween(iso);
  if (d === null) return "—";
  if (d === 0) return "오늘";
  if (d === 1) return "어제";
  if (d > 0) return `${d}일 전`;
  return `D${d}`;
}

export function formatDueDay(iso: string | undefined): string {
  const d = daysBetween(iso);
  if (d === null) return "—";
  if (d === 0) return "오늘";
  if (d === -1) return "내일";
  if (d < 0) return `D${d}`;
  return `${d}일 지남`;
}

export const HEAT_META: Record<
  Heat,
  { label: string; emoji: string; bg: string; fg: string; ring: string }
> = {
  hot: {
    label: "핫",
    emoji: "🔥",
    bg: "bg-hot/15",
    fg: "text-hot",
    ring: "ring-hot/40",
  },
  warm: {
    label: "웜",
    emoji: "🟡",
    bg: "bg-warm/15",
    fg: "text-warm",
    ring: "ring-warm/40",
  },
  cold: {
    label: "콜드",
    emoji: "🔵",
    bg: "bg-info/10",
    fg: "text-info",
    ring: "ring-info/30",
  },
  unknown: {
    label: "미정",
    emoji: "·",
    bg: "bg-surface-3",
    fg: "text-subtle",
    ring: "ring-line/40",
  },
};

export function parseHeat(raw: string | undefined): Heat {
  if (!raw) return "unknown";
  if (raw.includes("핫")) return "hot";
  if (raw.includes("웜")) return "warm";
  if (raw.includes("콜드")) return "cold";
  return "unknown";
}

export function parseRank(raw: string | undefined): "A" | "B" | "C" | "unknown" {
  if (!raw) return "unknown";
  if (raw.startsWith("A")) return "A";
  if (raw.startsWith("B")) return "B";
  if (raw.startsWith("C")) return "C";
  return "unknown";
}

export function parseGrade(
  raw: string | undefined,
): "VIP" | "A" | "B" | "F" | "unknown" {
  if (!raw) return "unknown";
  if (raw.includes("VIP")) return "VIP";
  if (raw === "A") return "A";
  if (raw === "B") return "B";
  if (raw === "F") return "F";
  return "unknown";
}

export type Milestone = {
  key: keyof DnState;
  group: "new" | "deliv";
  n: number;
  label: string;
  done: boolean;
  daysUntil: number;
};

const NEW_MILES: Array<{ key: keyof DnState; n: number }> = [
  { key: "newD3", n: 3 },
  { key: "newD7", n: 7 },
  { key: "newD14", n: 14 },
  { key: "newD30", n: 30 },
];
const DELIV_MILES: Array<{ key: keyof DnState; n: number }> = [
  { key: "delivD1", n: 1 },
  { key: "delivD7", n: 7 },
  { key: "delivD30", n: 30 },
  { key: "delivD180", n: 180 },
  { key: "delivD365", n: 365 },
];

export function nextMilestone(c: Customer, now = new Date()): Milestone | null {
  const stage = c.stage;
  const isPostDelivery =
    stage === "delivered" || stage === "aftercare" || stage === "long_touch";
  const set = isPostDelivery ? DELIV_MILES : NEW_MILES;
  const base = isPostDelivery ? c.deliveredDate : c.firstContact;
  if (!base) return null;
  const baseT = Date.parse(base);
  if (Number.isNaN(baseT)) return null;

  for (const m of set) {
    if (c.dn[m.key]) continue;
    const targetT = baseT + m.n * 86_400_000;
    const daysUntil = Math.ceil((targetT - now.getTime()) / 86_400_000);
    return {
      key: m.key,
      group: isPostDelivery ? "deliv" : "new",
      n: m.n,
      label: `${isPostDelivery ? "출고" : "신규"} D+${m.n}`,
      done: false,
      daysUntil,
    };
  }
  return null;
}

export function allMilestones(c: Customer, now = new Date()): Milestone[] {
  const out: Milestone[] = [];
  const isPostDelivery =
    c.stage === "delivered" ||
    c.stage === "aftercare" ||
    c.stage === "long_touch";
  const set = isPostDelivery ? DELIV_MILES : NEW_MILES;
  const base = isPostDelivery ? c.deliveredDate : c.firstContact;
  if (!base) return out;
  const baseT = Date.parse(base);
  if (Number.isNaN(baseT)) return out;
  for (const m of set) {
    const targetT = baseT + m.n * 86_400_000;
    out.push({
      key: m.key,
      group: isPostDelivery ? "deliv" : "new",
      n: m.n,
      label: `D+${m.n}`,
      done: !!c.dn[m.key],
      daysUntil: Math.ceil((targetT - now.getTime()) / 86_400_000),
    });
  }
  return out;
}

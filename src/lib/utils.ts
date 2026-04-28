import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Heat } from "./types";

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

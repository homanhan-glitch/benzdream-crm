import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
  const diffMs = now.getTime() - t;
  return Math.floor(diffMs / 86_400_000);
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

export type HeatLevel = "hot" | "warm" | "cool" | "risk" | "neutral";

export function computeHeat(opts: {
  stage: string;
  lastContactDays: number | null;
  dueDays: number | null;
}): HeatLevel {
  const { stage, lastContactDays, dueDays } = opts;
  if (stage === "delivered" || stage === "aftercare") return "neutral";
  if (stage === "lost") return "neutral";
  if (dueDays !== null && dueDays > 0) return "risk";
  if (dueDays !== null && dueDays === 0) return "hot";
  if (lastContactDays !== null && lastContactDays >= 7) return "risk";
  if (lastContactDays !== null && lastContactDays >= 3) return "warm";
  if (lastContactDays !== null && lastContactDays <= 1) return "hot";
  return "cool";
}

export const HEAT_STYLE: Record<HeatLevel, { dot: string; label: string; ring: string }> = {
  hot: { dot: "bg-hot", label: "text-hot", ring: "ring-hot/40" },
  warm: { dot: "bg-warm", label: "text-warm", ring: "ring-warm/40" },
  cool: { dot: "bg-cool", label: "text-cool", ring: "ring-cool/30" },
  risk: { dot: "bg-hot", label: "text-hot", ring: "ring-hot/50" },
  neutral: { dot: "bg-subtle", label: "text-subtle", ring: "ring-line/40" },
};

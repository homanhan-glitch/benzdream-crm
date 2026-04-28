"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Customer } from "@/lib/types";
import {
  cn,
  computeHeat,
  daysBetween,
  formatDueDay,
  formatRelativeDay,
  HEAT_STYLE,
  maskPhone,
} from "@/lib/utils";

type Props = {
  customer: Customer;
  onClick: () => void;
  dragging?: boolean;
};

const HEAT_LABEL: Record<string, string> = {
  hot: "핫",
  warm: "주의",
  cool: "정상",
  risk: "위험",
  neutral: "—",
};

export function Card({ customer: c, onClick, dragging }: Props) {
  const sortable = useSortable({ id: c.id });
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = sortable;

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging && !dragging ? 0.35 : 1,
  };

  const lastDays = daysBetween(c.lastContactDate);
  const dueDays = daysBetween(c.nextActionDue);
  const heat = computeHeat({
    stage: c.stage,
    lastContactDays: lastDays,
    dueDays,
  });
  const heatStyle = HEAT_STYLE[heat];

  const isOverdue = dueDays !== null && dueDays > 0 && c.stage !== "delivered" && c.stage !== "aftercare" && c.stage !== "lost";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (isDragging) return;
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "group cursor-grab select-none rounded-md border border-line bg-surface-2 p-3 text-[12px] shadow-sm transition-colors hover:border-gold/40 hover:bg-surface-3 active:cursor-grabbing",
        dragging && "ring-2 ring-gold/40 shadow-lg",
        isOverdue && "border-l-2 border-l-hot",
      )}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 truncate">
          <span className="truncate font-semibold tracking-tight text-fg">
            {c.name}
          </span>
          {c.honorific && (
            <span className="text-[10px] text-subtle">{c.honorific}</span>
          )}
        </div>
        <span
          className={cn(
            "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
            heatStyle.dot,
            "text-bg",
          )}
        >
          {HEAT_LABEL[heat]}
        </span>
      </div>

      {(c.vehicle || c.trim) && (
        <div className="mb-1.5 truncate text-[11.5px] font-medium text-gold">
          {c.vehicle}
          {c.trim ? ` · ${c.trim}` : ""}
        </div>
      )}

      <div className="mb-2 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10.5px] text-muted">
        {c.phone && (
          <div className="truncate">
            <span className="text-subtle">연락처</span>{" "}
            <span className="font-mono">{maskPhone(c.phone)}</span>
          </div>
        )}
        {c.budget && (
          <div className="truncate">
            <span className="text-subtle">예산</span> {c.budget}
          </div>
        )}
        {c.timeframe && (
          <div className="truncate">
            <span className="text-subtle">시점</span> {c.timeframe}
          </div>
        )}
        {c.decisionMaker && (
          <div className="truncate">
            <span className="text-subtle">결정</span> {c.decisionMaker}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-[10.5px]">
        <div className="flex items-center gap-1 text-subtle">
          <span>최근</span>
          <span className="text-muted">
            {formatRelativeDay(c.lastContactDate)}
          </span>
        </div>
        {c.nextActionLabel && (
          <div
            className={cn(
              "truncate text-right",
              isOverdue ? "text-hot" : "text-fg/80",
            )}
            title={c.nextActionLabel}
          >
            {c.nextActionLabel} ·{" "}
            <span className="font-medium">
              {formatDueDay(c.nextActionDue)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

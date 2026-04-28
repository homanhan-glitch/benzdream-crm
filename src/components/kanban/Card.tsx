"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Customer } from "@/lib/types";
import {
  cn,
  daysBetween,
  formatDueDay,
  formatRelativeDay,
  HEAT_META,
  maskPhone,
  nextMilestone,
} from "@/lib/utils";

type Props = {
  customer: Customer;
  onClick: () => void;
  dragging?: boolean;
};

const RANK_META: Record<string, { label: string; cls: string }> = {
  A: { label: "A·1M", cls: "bg-hot/15 text-hot border-hot/30" },
  B: { label: "B·3M", cls: "bg-warm/15 text-warm border-warm/30" },
  C: { label: "C·6M+", cls: "bg-info/10 text-info border-info/30" },
  unknown: { label: "—", cls: "bg-surface-3 text-subtle border-line" },
};

const GRADE_META: Record<string, { label: string; cls: string }> = {
  VIP: { label: "VIP", cls: "bg-gold/20 text-gold border-gold/40" },
  A: { label: "A", cls: "bg-cool/15 text-cool border-cool/30" },
  B: { label: "B", cls: "bg-info/10 text-info border-info/30" },
  F: { label: "F", cls: "bg-subtle/15 text-subtle border-line" },
  unknown: { label: "", cls: "" },
};

function milestoneStyle(daysUntil: number): string {
  if (daysUntil < 0) return "bg-hot/15 text-hot border-hot/30";
  if (daysUntil <= 1) return "bg-warm/15 text-warm border-warm/30";
  if (daysUntil <= 3) return "bg-gold/15 text-gold border-gold/30";
  return "bg-info/10 text-info border-info/30";
}

function milestoneLabel(daysUntil: number): string {
  if (daysUntil < 0) return `${-daysUntil}일 지남`;
  if (daysUntil === 0) return "오늘";
  if (daysUntil === 1) return "내일";
  return `${daysUntil}일 후`;
}

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

  const heatMeta = HEAT_META[c.heat];
  const rankMeta = RANK_META[c.rank];
  const gradeMeta = GRADE_META[c.grade];

  const dueDays = daysBetween(c.nextContact);
  const isActive = !["delivered", "aftercare", "long_touch", "lost"].includes(
    c.stage,
  );
  const isOverdue = dueDays !== null && dueDays > 0 && isActive;
  const lastContact = c.firstContact;
  const milestone = nextMilestone(c);
  const showMilestone =
    milestone !== null && milestone.daysUntil <= 3 && c.stage !== "lost";

  const vehicleDisplay = c.vehicleInterest || c.vehicleClass || "";
  const vehicleSecondary =
    c.vehicleInterest && c.vehicleClass && c.vehicleInterest !== c.vehicleClass
      ? c.vehicleClass
      : "";

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
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate font-semibold tracking-tight text-fg">
            {c.name}
          </span>
          <span className="shrink-0 text-[10px] text-subtle">고객님</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {c.grade !== "unknown" && (
            <span
              className={cn(
                "rounded border px-1.5 py-0.5 text-[9px] font-semibold",
                gradeMeta.cls,
              )}
            >
              {gradeMeta.label}
            </span>
          )}
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[9px] font-semibold",
              heatMeta.bg,
              heatMeta.fg,
            )}
            title={`고객온도: ${heatMeta.label}`}
          >
            {heatMeta.emoji}
            {c.heat !== "unknown" ? heatMeta.label : ""}
          </span>
        </div>
      </div>

      {vehicleDisplay && (
        <div className="mb-1.5 truncate text-[11.5px] font-medium text-gold">
          {vehicleDisplay}
          {vehicleSecondary && (
            <span className="text-subtle"> · {vehicleSecondary}</span>
          )}
        </div>
      )}

      <div className="mb-2 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10.5px] text-muted">
        {c.phone && (
          <div className="truncate">
            <span className="text-subtle">연락</span>{" "}
            <span className="font-mono">{maskPhone(c.phone)}</span>
          </div>
        )}
        {c.budget && (
          <div className="truncate">
            <span className="text-subtle">예산</span> {c.budget}
          </div>
        )}
        {c.rank !== "unknown" && (
          <div className="truncate">
            <span className="text-subtle">시점</span>{" "}
            <span
              className={cn(
                "rounded border px-1 py-px text-[9.5px]",
                rankMeta.cls,
              )}
            >
              {rankMeta.label}
            </span>
          </div>
        )}
        {c.criticalFactor && (
          <div className="truncate" title={c.criticalFactor}>
            <span className="text-subtle">핵심</span> {c.criticalFactor}
          </div>
        )}
      </div>

      {showMilestone && milestone && (
        <div
          className={cn(
            "mb-1.5 flex items-center justify-between gap-2 rounded border px-2 py-1 text-[10px]",
            milestoneStyle(milestone.daysUntil),
          )}
          title={`${milestone.label} 골든타임`}
        >
          <span className="font-semibold">{milestone.label}</span>
          <span>{milestoneLabel(milestone.daysUntil)}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 text-[10.5px]">
        <div className="flex items-center gap-1 text-subtle">
          <span>최근</span>
          <span className="text-muted">{formatRelativeDay(lastContact)}</span>
        </div>
        {c.nextContact ? (
          <div
            className={cn(
              "truncate text-right",
              isOverdue ? "text-hot font-medium" : "text-fg/80",
            )}
            title={`다음 컨택: ${c.nextContact}`}
          >
            <span className="text-subtle">다음</span>{" "}
            <span className="font-medium">
              {formatDueDay(c.nextContact)}
            </span>
          </div>
        ) : (
          c.competitor && (
            <div className="truncate text-right text-warm" title={c.competitor}>
              vs {c.competitor}
            </div>
          )
        )}
      </div>
    </div>
  );
}

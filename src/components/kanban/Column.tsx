"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Customer } from "@/lib/types";
import type { Stage } from "@/lib/stages";
import { Card } from "./Card";
import { cn } from "@/lib/utils";

type Props = {
  stage: Stage;
  customers: Customer[];
  onCardClick: (c: Customer) => void;
};

export function Column({ stage, customers, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[280px] shrink-0 flex-col rounded-lg border border-line bg-surface/60 transition-colors",
        isOver && "border-gold/40 bg-surface-2/80",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: stage.accent }}
          />
          <span className="text-[13px] font-semibold tracking-tight text-fg">
            {stage.label}
          </span>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{ background: `${stage.accent}22`, color: stage.accent }}
        >
          {customers.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2.5">
        {customers.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-8 text-center text-[11px] text-subtle">
            카드 없음
          </div>
        ) : (
          customers.map((c) => (
            <Card
              key={c.id}
              customer={c}
              onClick={() => onCardClick(c)}
            />
          ))
        )}
      </div>
    </div>
  );
}

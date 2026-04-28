"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Customer, StageId } from "@/lib/types";
import { STAGES } from "@/lib/stages";
import { Column } from "./Column";
import { Card } from "./Card";
import { CardDetail } from "./CardDetail";

type Props = {
  initialCustomers: Customer[];
  source: "notion" | "mock";
  fetchedAt: string;
};

export function Board({ initialCustomers }: Props) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byStage = useMemo(() => {
    const m = Object.fromEntries(
      STAGES.map((s) => [s.id, [] as Customer[]]),
    ) as Record<StageId, Customer[]>;
    for (const c of customers) {
      const list = m[c.stage] ?? m.first_contact;
      list.push(c);
    }
    return m;
  }, [customers]);

  const activeCustomer = activeId
    ? customers.find((c) => c.id === activeId) ?? null
    : null;

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    const stageIds = STAGES.map((s) => s.id) as string[];
    let targetStage: StageId | null = null;

    if (stageIds.includes(overIdStr)) {
      targetStage = overIdStr as StageId;
    } else {
      const overCustomer = customers.find((c) => c.id === overIdStr);
      if (overCustomer) targetStage = overCustomer.stage;
    }
    if (!targetStage) return;

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === activeIdStr ? { ...c, stage: targetStage as StageId } : c,
      ),
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="kanban-scroll flex h-full gap-3 overflow-x-auto px-4 py-4">
          {STAGES.map((stage) => {
            const items = byStage[stage.id];
            return (
              <SortableContext
                key={stage.id}
                id={stage.id}
                items={items.map((c) => c.id)}
              >
                <Column
                  stage={stage}
                  customers={items}
                  onCardClick={setSelected}
                />
              </SortableContext>
            );
          })}
        </div>
        <DragOverlay>
          {activeCustomer ? (
            <Card customer={activeCustomer} dragging onClick={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>
      {selected && (
        <CardDetail
          customer={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

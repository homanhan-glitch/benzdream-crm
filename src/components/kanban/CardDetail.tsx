"use client";

import { useEffect } from "react";
import { X, Phone, MessageSquare, ExternalLink } from "lucide-react";
import type { Customer } from "@/lib/types";
import { STAGE_BY_ID } from "@/lib/stages";
import { formatRelativeDay, formatDueDay, maskPhone } from "@/lib/utils";

type Props = {
  customer: Customer;
  onClose: () => void;
};

export function CardDetail({ customer: c, onClose }: Props) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const stage = STAGE_BY_ID[c.stage];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm fade-in"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col border-l border-line bg-surface shadow-2xl slide-in-right">
        <div className="flex items-center justify-between gap-2 border-b border-line bg-surface-2 px-5 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-[15px] font-semibold text-gold">
                {c.name}
              </h2>
              {c.honorific && (
                <span className="text-[11px] text-subtle">{c.honorific}</span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: stage.accent }}
              />
              <span>{stage.label}</span>
              {c.stageRaw && c.stageRaw !== stage.label && (
                <span className="text-subtle">· (Notion: {c.stageRaw})</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-line bg-surface p-1.5 text-muted transition-colors hover:bg-surface-3 hover:text-fg"
            aria-label="닫기"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4 text-[13px]">
          {c.phone && (
            <div className="flex gap-2">
              <a
                href={`tel:${c.phone}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-cool/30 bg-cool/10 px-3 py-2 text-[12px] font-medium text-cool transition-colors hover:bg-cool/15"
              >
                <Phone size={14} /> 전화
              </a>
              <a
                href={`sms:${c.phone}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-info/30 bg-info/10 px-3 py-2 text-[12px] font-medium text-info transition-colors hover:bg-info/15"
              >
                <MessageSquare size={14} /> 문자
              </a>
            </div>
          )}

          <Section title="기본 정보">
            <Field label="이름" value={c.name + (c.honorific ? ` ${c.honorific}` : "")} />
            <Field label="연락처" value={c.phone ? maskPhone(c.phone) : "—"} mono />
            <Field label="유입경로" value={c.source ?? "—"} />
            <Field label="등록일" value={c.createdAt ?? "—"} />
          </Section>

          <Section title="관심 차량">
            <Field label="차종" value={c.vehicle ?? "—"} highlight />
            <Field label="트림" value={c.trim ?? "—"} />
            <Field label="색상" value={c.color ?? "—"} />
            <Field label="예산" value={c.budget ?? "—"} />
          </Section>

          <Section title="니즈 5요소">
            <Field label="구매시점" value={c.timeframe ?? "—"} />
            <Field label="결정권자" value={c.decisionMaker ?? "—"} />
            <Field label="이슈/우려" value={c.issues ?? "—"} />
          </Section>

          <Section title="액션">
            <Field
              label="마지막 접촉"
              value={`${c.lastContactDate ?? "—"}${c.lastContactDate ? ` (${formatRelativeDay(c.lastContactDate)})` : ""}`}
            />
            <Field
              label="다음 액션"
              value={c.nextActionLabel ?? "—"}
            />
            <Field
              label="기한"
              value={`${c.nextActionDue ?? "—"}${c.nextActionDue ? ` (${formatDueDay(c.nextActionDue)})` : ""}`}
            />
          </Section>

          {c.notes && (
            <Section title="메모">
              <p className="whitespace-pre-wrap rounded-md border border-line bg-bg-2 p-3 text-[12.5px] leading-relaxed text-muted">
                {c.notes}
              </p>
            </Section>
          )}

          {c.history && c.history.length > 0 && (
            <Section title="상담 이력">
              <div className="flex flex-col gap-2">
                {c.history.map((h, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-line bg-bg-2 px-3 py-2"
                  >
                    <div className="mb-0.5 flex items-center justify-between text-[11px]">
                      <span className="font-medium text-gold-2">{h.type}</span>
                      <span className="text-subtle">{h.date}</span>
                    </div>
                    <p className="text-[12.5px] leading-relaxed text-muted">
                      {h.note}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {(c.transcriptUrl || c.notionUrl) && (
            <Section title="외부 링크">
              {c.transcriptUrl && (
                <a
                  href={c.transcriptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-md border border-line bg-bg-2 px-3 py-2 text-[12px] text-muted transition-colors hover:border-gold/40 hover:text-fg"
                >
                  <span>Whisper 통화 기록</span>
                  <ExternalLink size={13} />
                </a>
              )}
              {c.notionUrl && (
                <a
                  href={c.notionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-md border border-line bg-bg-2 px-3 py-2 text-[12px] text-muted transition-colors hover:border-gold/40 hover:text-fg"
                >
                  <span>Notion 페이지에서 열기</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </Section>
          )}
        </div>

        <div className="border-t border-line bg-surface-2 px-5 py-3 text-[11px] text-subtle">
          편집 / 단계 변경은 v0.2에서 Notion으로 직접 동기화됩니다. 지금은 보기 전용.
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-subtle">
        {title}
      </h3>
      <div className="flex flex-col gap-1">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line/60 py-1 last:border-b-0">
      <span className="shrink-0 text-[11px] text-subtle">{label}</span>
      <span
        className={`min-w-0 truncate text-right text-[12.5px] ${
          highlight ? "text-gold" : "text-fg"
        } ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

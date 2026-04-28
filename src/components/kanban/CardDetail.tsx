"use client";

import { useEffect, useState } from "react";
import { X, Phone, MessageSquare, ExternalLink, Check } from "lucide-react";
import type { ConsultLog, Customer } from "@/lib/types";
import { STAGE_BY_ID } from "@/lib/stages";
import {
  allMilestones,
  cn,
  formatDueDay,
  formatRelativeDay,
  HEAT_META,
  maskPhone,
} from "@/lib/utils";

type Props = {
  customer: Customer;
  onClose: () => void;
};

export function CardDetail({ customer: c, onClose }: Props) {
  const [logs, setLogs] = useState<ConsultLog[] | null>(null);
  const [logsState, setLogsState] = useState<"idle" | "loading" | "error">(
    "idle",
  );

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  useEffect(() => {
    if (c.logIds.length === 0) {
      setLogs([]);
      return;
    }
    setLogsState("loading");
    const ctrl = new AbortController();
    fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: c.logIds }),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        const data = (await res.json()) as { logs: ConsultLog[] };
        setLogs(data.logs ?? []);
        setLogsState("idle");
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setLogsState("error");
      });
    return () => ctrl.abort();
  }, [c.logIds]);

  const stage = STAGE_BY_ID[c.stage];
  const heatMeta = HEAT_META[c.heat];
  const milestones = allMilestones(c);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm fade-in"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col border-l border-line bg-surface shadow-2xl slide-in-right">
        <div className="flex items-center justify-between gap-2 border-b border-line bg-surface-2 px-5 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-[15px] font-semibold text-gold">
                {c.name} <span className="text-[12px] text-subtle">고객님</span>
              </h2>
              {c.grade !== "unknown" && (
                <span className="rounded border border-gold/40 bg-gold/15 px-1.5 py-0.5 text-[10px] font-semibold text-gold">
                  {c.grade === "VIP" ? "🌟VIP" : c.grade}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted">
              <div className="flex items-center gap-1">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: stage.accent }}
                />
                <span>{stage.label}</span>
              </div>
              <span className="text-line">·</span>
              <span className={heatMeta.fg}>
                {heatMeta.emoji} {heatMeta.label}
              </span>
              {c.salesStatus && (
                <>
                  <span className="text-line">·</span>
                  <span>{c.salesStatus}</span>
                </>
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

          <Section title="고객 정보">
            <Field label="이름" value={c.name} />
            <Field
              label="연락처"
              value={c.phone ? maskPhone(c.phone) : "—"}
              mono
            />
            <Field
              label="등급"
              value={c.grade === "unknown" ? "—" : c.grade}
            />
            <Field
              label="구매시점"
              value={
                c.rank === "A"
                  ? "A · 1개월 이내"
                  : c.rank === "B"
                    ? "B · 3개월 이내"
                    : c.rank === "C"
                      ? "C · 6개월 이상"
                      : "—"
              }
            />
            <Field
              label="나이대 / 성별"
              value={[c.age, c.gender].filter(Boolean).join(" · ") || "—"}
            />
            <Field label="유입경로" value={c.source ?? "—"} />
            <Field label="채널" value={c.channel ?? "—"} />
          </Section>

          <Section title="관심 차량">
            <Field label="클래스" value={c.vehicleClass ?? "—"} highlight />
            <Field label="차종" value={c.vehicleInterest ?? "—"} />
            <Field label="외장색" value={c.exteriorColor ?? "—"} />
            <Field label="내장색" value={c.interiorColor ?? "—"} />
            <Field label="구매방법" value={c.buyMethod ?? "—"} />
            <Field label="예산범위" value={c.budget ?? "—"} />
            {c.competitor && (
              <Field label="경쟁차종" value={c.competitor} />
            )}
          </Section>

          <Section title="핵심 변수 / 특이사항">
            {c.criticalFactor && (
              <p className="rounded-md border border-warm/30 bg-warm/10 p-3 text-[12.5px] leading-relaxed text-warm/90">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-warm">
                  핵심
                </span>
                <br />
                {c.criticalFactor}
              </p>
            )}
            {c.notes && (
              <p className="whitespace-pre-wrap rounded-md border border-line bg-bg-2 p-3 text-[12.5px] leading-relaxed text-muted">
                {c.notes}
              </p>
            )}
            {!c.criticalFactor && !c.notes && (
              <p className="text-[12px] text-subtle">기록 없음</p>
            )}
          </Section>

          <Section title="일정">
            <Field
              label="첫 컨택"
              value={
                c.firstContact
                  ? `${c.firstContact} (${formatRelativeDay(c.firstContact)})`
                  : "—"
              }
            />
            <Field
              label="다음 컨택"
              value={
                c.nextContact
                  ? `${c.nextContact} (${formatDueDay(c.nextContact)})`
                  : "—"
              }
            />
            {c.contractDate && (
              <Field label="계약일" value={c.contractDate} />
            )}
            {c.scheduledDelivery && (
              <Field label="출고예정일" value={c.scheduledDelivery} />
            )}
            {c.deliveredDate && (
              <Field label="출고일" value={c.deliveredDate} />
            )}
          </Section>

          {milestones.length > 0 && (
            <Section
              title={
                ["delivered", "aftercare", "long_touch"].includes(c.stage)
                  ? "출고 D+N 안부 (5터치)"
                  : "신규 D+N 팔로업"
              }
            >
              <div className="grid grid-cols-5 gap-1.5">
                {milestones.map((m) => {
                  const overdue = !m.done && m.daysUntil < 0;
                  const due = !m.done && m.daysUntil >= 0 && m.daysUntil <= 3;
                  return (
                    <div
                      key={m.key}
                      className={cn(
                        "flex flex-col items-center gap-0.5 rounded border px-1 py-1.5 text-[10px]",
                        m.done && "border-cool/30 bg-cool/10 text-cool",
                        !m.done &&
                          overdue &&
                          "border-hot/30 bg-hot/10 text-hot",
                        !m.done &&
                          due &&
                          "border-warm/30 bg-warm/10 text-warm",
                        !m.done &&
                          !overdue &&
                          !due &&
                          "border-line bg-bg-2 text-subtle",
                      )}
                    >
                      <span className="font-semibold">{m.label}</span>
                      <span className="text-[9px] opacity-80">
                        {m.done ? (
                          <Check size={10} />
                        ) : m.daysUntil === 0 ? (
                          "오늘"
                        ) : m.daysUntil < 0 ? (
                          `${-m.daysUntil}일`
                        ) : (
                          `+${m.daysUntil}d`
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          <Section title="상담 이력">
            {logsState === "loading" && (
              <p className="text-[12px] text-subtle">불러오는 중…</p>
            )}
            {logsState === "error" && (
              <p className="text-[12px] text-hot">
                상담로그 불러오기 실패
              </p>
            )}
            {logs && logs.length === 0 && logsState === "idle" && (
              <p className="text-[12px] text-subtle">기록된 상담 없음</p>
            )}
            {logs && logs.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {logs.map((log) => (
                  <a
                    key={log.id}
                    href={log.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-md border border-line bg-bg-2 px-3 py-2 text-[12px] transition-colors hover:border-gold/40"
                  >
                    <div className="mb-0.5 flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-fg">
                        {log.title}
                      </span>
                      {log.date && (
                        <span className="shrink-0 text-[10px] text-subtle">
                          {log.date}
                        </span>
                      )}
                    </div>
                    {log.preview && (
                      <p className="line-clamp-2 text-[11px] leading-relaxed text-muted">
                        {log.preview}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            )}
          </Section>

          {(c.deliveredModel || c.carNumber || c.finalResult) && (
            <Section title="출고 정보">
              {c.deliveredModel && (
                <Field label="출고모델" value={c.deliveredModel} highlight />
              )}
              {c.carNumber && (
                <Field label="차량번호" value={c.carNumber} mono />
              )}
              {c.finalResult && (
                <Field label="최종결과" value={c.finalResult} />
              )}
            </Section>
          )}

          {c.notionUrl && (
            <Section title="외부 링크">
              <a
                href={c.notionUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-md border border-line bg-bg-2 px-3 py-2 text-[12px] text-muted transition-colors hover:border-gold/40 hover:text-fg"
              >
                <span>Notion 페이지에서 열기</span>
                <ExternalLink size={13} />
              </a>
            </Section>
          )}
        </div>

        <div className="border-t border-line bg-surface-2 px-5 py-3 text-[11px] text-subtle">
          드래그로 단계 이동 시 Notion 관리단계 자동 업데이트. 다른 필드 편집은 v0.3.
        </div>
      </aside>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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

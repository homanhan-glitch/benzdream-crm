import { fetchCards } from "@/lib/notion";
import { Board } from "@/components/kanban/Board";
import { STAGES } from "@/lib/stages";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const result = await fetchCards();
  const fetchedAt = new Date().toISOString();
  const total = result.customers.length;

  const counts = STAGES.map((s) => ({
    id: s.id,
    label: s.short,
    accent: s.accent,
    n: result.customers.filter((c) => c.stage === s.id).length,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold tracking-tight text-gold">
              BenzDream
            </div>
            <span className="rounded bg-surface-2 px-2 py-0.5 text-[11px] uppercase tracking-wider text-subtle">
              CRM
            </span>
            <span className="hidden text-xs text-muted md:inline">
              한호만 팀장 · 벤츠 고객 칸반
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-subtle">
            <span>
              총{" "}
              <span className="font-semibold text-fg">{total}</span>건
            </span>
            <span className="hidden h-3 w-px bg-line md:inline" />
            <span
              className={
                result.source === "notion"
                  ? "text-cool"
                  : "text-warm"
              }
            >
              {result.source === "notion"
                ? "Notion 연결됨"
                : "Mock 데이터"}
            </span>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1800px] gap-2 overflow-x-auto px-5 pb-3 text-[11px]">
          {counts.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2.5 py-1"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: c.accent }}
              />
              <span className="text-muted">{c.label}</span>
              <span className="font-semibold text-fg">{c.n}</span>
            </div>
          ))}
        </div>
      </header>

      {result.notionError && result.source === "mock" && (
        <div className="border-b border-warm/30 bg-warm/10 px-5 py-2 text-[12px] text-warm">
          Notion 연결 실패 / 미설정 — mock 데이터로 표시 중. 사유:{" "}
          <span className="font-mono">{result.notionError}</span>
        </div>
      )}

      <main className="flex-1 overflow-hidden">
        <Board
          initialCustomers={result.customers}
          source={result.source}
          fetchedAt={fetchedAt}
        />
      </main>

      <footer className="border-t border-line bg-surface/40 px-5 py-2 text-center text-[11px] text-subtle">
        BenzDream CRM v0.1 · 읽기 전용 칸반 (드래그=화면상 이동만,
        Notion 쓰기는 v0.2)
      </footer>
    </div>
  );
}

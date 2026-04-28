import { Client } from "@notionhq/client";
import type { Customer, FetchResult, ConsultLog, DnState } from "./types";
import { mapStage } from "./stages";
import { parseGrade, parseHeat, parseRank } from "./utils";
import { MOCK_CUSTOMERS } from "./mock";

type RichProp = { type: string; [key: string]: unknown };

function getPlain(prop: RichProp | undefined): string {
  if (!prop) return "";
  switch (prop.type) {
    case "title":
    case "rich_text": {
      const arr = (prop[prop.type] as Array<{ plain_text: string }>) ?? [];
      return arr.map((x) => x.plain_text).join("").trim();
    }
    case "select": {
      const v = prop.select as { name: string } | null;
      return v?.name ?? "";
    }
    case "status": {
      const v = prop.status as { name: string } | null;
      return v?.name ?? "";
    }
    case "multi_select": {
      const v = (prop.multi_select as Array<{ name: string }>) ?? [];
      return v.map((x) => x.name).join(", ");
    }
    case "phone_number":
      return (prop.phone_number as string) ?? "";
    case "email":
      return (prop.email as string) ?? "";
    case "url":
      return (prop.url as string) ?? "";
    case "number": {
      const n = prop.number as number | null;
      return n === null ? "" : String(n);
    }
    case "date": {
      const v = prop.date as { start?: string } | null;
      return v?.start ?? "";
    }
    case "checkbox":
      return prop.checkbox ? "true" : "";
    case "formula": {
      const f = prop.formula as { type: string; [k: string]: unknown };
      if (!f) return "";
      const inner = f[f.type];
      if (typeof inner === "string") return inner;
      if (typeof inner === "number") return String(inner);
      if (inner && typeof inner === "object" && "start" in inner) {
        return (inner as { start: string }).start ?? "";
      }
      return "";
    }
    default:
      return "";
  }
}

function getRelationIds(prop: RichProp | undefined): string[] {
  if (!prop || prop.type !== "relation") return [];
  const arr = (prop.relation as Array<{ id: string }>) ?? [];
  return arr.map((r) => r.id);
}

function getCheckbox(prop: RichProp | undefined): boolean {
  if (!prop || prop.type !== "checkbox") return false;
  return prop.checkbox === true;
}

type NotionPage = {
  id: string;
  url: string;
  created_time?: string;
  last_edited_time?: string;
  properties: Record<string, RichProp>;
};

function pageToCustomer(page: NotionPage): Customer {
  const p = page.properties;
  const get = (key: string) => getPlain(p[key]);

  const dn: DnState = {
    newD3: getCheckbox(p["신규D+3✓"]),
    newD7: getCheckbox(p["신규D+7✓"]),
    newD14: getCheckbox(p["신규D+14✓"]),
    newD30: getCheckbox(p["신규D+30✓"]),
    delivD1: getCheckbox(p["출고D+1✓"]),
    delivD7: getCheckbox(p["출고D+7✓"]),
    delivD30: getCheckbox(p["출고D+30✓"]),
    delivD180: getCheckbox(p["출고D+180✓"]),
    delivD365: getCheckbox(p["출고D+365✓"]),
  };

  const stageRaw = get("관리단계");
  return {
    id: page.id,
    name: get("Name") || "(이름 없음)",
    phone: get("Phone") || undefined,
    stage: mapStage(stageRaw),
    stageRaw,
    heat: parseHeat(get("고객온도")),
    rank: parseRank(get("Rank")),
    grade: parseGrade(get("고객등급")),
    salesStatus: (get("Sales Status") || undefined) as Customer["salesStatus"],
    vehicleClass: get("클래스") || undefined,
    vehicleInterest: get("관심차종") || undefined,
    competitor: get("경쟁차종") || undefined,
    budget: get("예산범위") || undefined,
    criticalFactor: get("핵심변수") || undefined,
    notes: get("특이사항") || undefined,
    source: get("유입경로") || undefined,
    channel: get("채널") || undefined,
    age: get("나이대") || undefined,
    gender: get("성별") || undefined,
    buyMethod: get("구매방법") || undefined,
    firstContact: get("1st Contact") || undefined,
    nextContact: get("Next Contact") || undefined,
    contractDate: get("계약일") || undefined,
    scheduledDelivery: get("출고예정일") || undefined,
    deliveredDate: get("출고일") || undefined,
    finalResult: get("최종결과") || undefined,
    exteriorColor: get("외장색") || undefined,
    interiorColor: get("내장색") || undefined,
    carNumber: get("차량번호") || undefined,
    deliveredModel: get("출고모델") || undefined,
    notionUrl: page.url,
    createdAt: page.created_time?.slice(0, 10),
    dn,
    logIds: getRelationIds(p["상담로그"]),
    scheduleIds: getRelationIds(p["액션스케줄"]),
  };
}

async function resolveDataSourceId(notion: Client, dbId: string): Promise<string | null> {
  let resolvedDbId = dbId;
  try {
    await notion.databases.retrieve({ database_id: dbId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("is a page") || msg.includes("not a database")) {
      const children = await notion.blocks.children.list({
        block_id: dbId,
        page_size: 100,
      });
      type Block = { type: string; id: string };
      const blocks = children.results as unknown as Block[];
      const dbBlock = blocks.find((b) => b.type === "child_database");
      if (!dbBlock) return null;
      resolvedDbId = dbBlock.id;
    } else {
      throw e;
    }
  }
  const dbInfo = (await notion.databases.retrieve({
    database_id: resolvedDbId,
  })) as { data_sources?: Array<{ id: string }> };
  return dbInfo.data_sources?.[0]?.id ?? null;
}

export async function fetchCards(): Promise<FetchResult> {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_DB_ID;

  if (!token || !dbId) {
    return {
      customers: MOCK_CUSTOMERS,
      source: "mock",
      notionError: "NOTION_TOKEN 또는 NOTION_DB_ID 미설정 — mock 데이터",
      totalFetched: MOCK_CUSTOMERS.length,
    };
  }

  try {
    const notion = new Client({ auth: token });
    const dataSourceId = await resolveDataSourceId(notion, dbId);
    if (!dataSourceId) {
      return {
        customers: MOCK_CUSTOMERS,
        source: "mock",
        notionError: "DB 또는 data source를 찾지 못함 — Integration 권한 확인",
        totalFetched: MOCK_CUSTOMERS.length,
      };
    }

    const all: NotionPage[] = [];
    let cursor: string | undefined;
    let pageCount = 0;
    const MAX_PAGES = 20; // safety: 100 * 20 = 2000 cards
    do {
      const res = await notion.dataSources.query({
        data_source_id: dataSourceId,
        page_size: 100,
        start_cursor: cursor,
      });
      all.push(...(res.results as unknown as NotionPage[]));
      cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
      pageCount += 1;
    } while (cursor && pageCount < MAX_PAGES);

    const customers = all.filter((p) => p && p.properties).map(pageToCustomer);
    if (customers.length === 0) {
      return {
        customers: MOCK_CUSTOMERS,
        source: "mock",
        notionError: "Notion DB가 비어있거나 권한 부족",
        totalFetched: 0,
      };
    }
    return { customers, source: "notion", totalFetched: customers.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      customers: MOCK_CUSTOMERS,
      source: "mock",
      notionError: msg,
      totalFetched: MOCK_CUSTOMERS.length,
    };
  }
}

export async function fetchConsultLogs(ids: string[]): Promise<ConsultLog[]> {
  const token = process.env.NOTION_TOKEN;
  if (!token || ids.length === 0) return [];
  const notion = new Client({ auth: token });

  const results = await Promise.allSettled(
    ids.map((id) => notion.pages.retrieve({ page_id: id })),
  );

  const logs: ConsultLog[] = [];
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    const page = r.value as unknown as NotionPage & { url: string };
    const props = page.properties ?? {};
    let title = "";
    let date = "";
    let preview = "";
    for (const [key, val] of Object.entries(props)) {
      if (val.type === "title" && !title) {
        title = getPlain(val);
      }
      if (val.type === "date" && !date) {
        date = getPlain(val);
      }
      if (val.type === "rich_text" && !preview) {
        preview = getPlain(val).slice(0, 240);
      }
    }
    logs.push({
      id: page.id,
      title: title || "(제목 없음)",
      date,
      url: page.url,
      preview: preview || undefined,
    });
  }
  logs.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return logs;
}

export async function updateStageInNotion(
  pageId: string,
  notionStageName: string,
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.NOTION_TOKEN;
  if (!token) return { ok: false, error: "NOTION_TOKEN 없음" };
  try {
    const notion = new Client({ auth: token });
    await notion.pages.update({
      page_id: pageId,
      properties: {
        관리단계: { select: { name: notionStageName } },
      },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

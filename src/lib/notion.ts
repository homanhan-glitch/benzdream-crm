import { Client } from "@notionhq/client";
import type { Customer } from "./types";
import { mapStage } from "./stages";
import { MOCK_CUSTOMERS } from "./mock";

type RichProp = {
  type: string;
  [key: string]: unknown;
};

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
    case "people": {
      const v = (prop.people as Array<{ name?: string }>) ?? [];
      return v.map((p) => p.name ?? "").join(", ");
    }
    default:
      return "";
  }
}

function pickProp(props: Record<string, RichProp>, candidates: string[]): RichProp | undefined {
  const keys = Object.keys(props);
  for (const c of candidates) {
    const exact = keys.find((k) => k.toLowerCase() === c.toLowerCase());
    if (exact) return props[exact];
  }
  for (const c of candidates) {
    const partial = keys.find((k) => k.toLowerCase().includes(c.toLowerCase()));
    if (partial) return props[partial];
  }
  return undefined;
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
  const name =
    getPlain(pickProp(p, ["이름", "고객명", "Name", "성함"])) || "(이름 없음)";
  const stageRaw = getPlain(pickProp(p, ["단계", "Status", "스테이지", "상태", "진행"]));
  const phone = getPlain(pickProp(p, ["전화", "연락처", "Phone", "전화번호"]));
  const vehicle = getPlain(pickProp(p, ["관심차종", "차종", "모델", "Vehicle", "Model"]));
  const trim = getPlain(pickProp(p, ["트림", "Trim"]));
  const color = getPlain(pickProp(p, ["색상", "Color", "외장색"]));
  const budget = getPlain(pickProp(p, ["예산", "Budget", "금액"]));
  const timeframe = getPlain(pickProp(p, ["시점", "Timeframe", "구매시기", "구매시점"]));
  const decisionMaker = getPlain(pickProp(p, ["결정권자", "Decision Maker", "의사결정"]));
  const issues = getPlain(pickProp(p, ["이슈", "Issues", "Concern", "이슈/우려"]));
  const source = getPlain(pickProp(p, ["유입", "Source", "유입경로"]));
  const lastContact = getPlain(pickProp(p, ["마지막접촉", "Last Contact", "최근통화", "최근접촉"]));
  const nextAction = getPlain(pickProp(p, ["다음액션", "Next Action", "다음행동"]));
  const nextDue = getPlain(pickProp(p, ["기한", "Due", "다음일정"]));
  const notes = getPlain(pickProp(p, ["메모", "Notes", "비고"]));
  const transcriptUrl = getPlain(pickProp(p, ["transcript", "Whisper", "녹취"]));

  return {
    id: page.id,
    name,
    stage: mapStage(stageRaw),
    stageRaw,
    phone: phone || undefined,
    vehicle: vehicle || undefined,
    trim: trim || undefined,
    color: color || undefined,
    budget: budget || undefined,
    timeframe: timeframe || undefined,
    decisionMaker: decisionMaker || undefined,
    issues: issues || undefined,
    source: source || undefined,
    lastContactDate: lastContact || page.last_edited_time?.slice(0, 10),
    nextActionLabel: nextAction || undefined,
    nextActionDue: nextDue || undefined,
    notes: notes || undefined,
    transcriptUrl: transcriptUrl || undefined,
    notionUrl: page.url,
    createdAt: page.created_time?.slice(0, 10),
  };
}

export type FetchResult = {
  customers: Customer[];
  source: "notion" | "mock";
  notionError?: string;
};

export async function fetchCards(): Promise<FetchResult> {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_DB_ID;

  if (!token || !dbId) {
    return {
      customers: MOCK_CUSTOMERS,
      source: "mock",
      notionError: "NOTION_TOKEN 또는 NOTION_DB_ID 미설정 — mock 데이터 사용",
    };
  }

  try {
    const notion = new Client({ auth: token });

    let resolvedDbId: string | null = null;
    try {
      await notion.databases.retrieve({ database_id: dbId });
      resolvedDbId = dbId;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("is a page") || msg.includes("not a database")) {
        try {
          const children = await notion.blocks.children.list({
            block_id: dbId,
            page_size: 100,
          });
          type Block = { type: string; id: string };
          const blocks = children.results as unknown as Block[];
          const dbBlock = blocks.find((b) => b.type === "child_database");
          if (dbBlock) resolvedDbId = dbBlock.id;
        } catch {}
        if (!resolvedDbId) {
          return {
            customers: MOCK_CUSTOMERS,
            source: "mock",
            notionError:
              "Notion ID가 페이지를 가리키고 있고 그 안에 데이터베이스가 없습니다. DB의 URL을 보내주세요.",
          };
        }
      } else {
        throw e;
      }
    }

    const dbInfo = (await notion.databases.retrieve({
      database_id: resolvedDbId,
    })) as { data_sources?: Array<{ id: string; name: string }> };
    const dataSourceId = dbInfo.data_sources?.[0]?.id;
    if (!dataSourceId) {
      return {
        customers: MOCK_CUSTOMERS,
        source: "mock",
        notionError:
          "Notion DB에 data source가 없음 (Integration이 DB에 공유되지 않았을 가능성)",
      };
    }
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
    });
    const pages = res.results as unknown as NotionPage[];
    const customers = pages
      .filter((p) => p && p.properties)
      .map(pageToCustomer);
    if (customers.length === 0) {
      return {
        customers: MOCK_CUSTOMERS,
        source: "mock",
        notionError: "Notion DB가 비어있거나 Integration이 DB에 공유되지 않음",
      };
    }
    return { customers, source: "notion" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      customers: MOCK_CUSTOMERS,
      source: "mock",
      notionError: msg,
    };
  }
}

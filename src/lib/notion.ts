import { Client } from "@notionhq/client";
import type { Customer, FetchResult } from "./types";
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
  };
}

export async function fetchCards(): Promise<FetchResult> {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_DB_ID;

  if (!token || !dbId) {
    return {
      customers: MOCK_CUSTOMERS,
      source: "mock",
      notionError: "NOTION_TOKEN 또는 NOTION_DB_ID 미설정 — mock 데이터",
    };
  }

  try {
    const notion = new Client({ auth: token });

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
        if (!dbBlock) {
          return {
            customers: MOCK_CUSTOMERS,
            source: "mock",
            notionError:
              "Notion ID가 페이지를 가리키고 그 안에 DB 없음. DB URL을 NOTION_DB_ID로 사용.",
          };
        }
        resolvedDbId = dbBlock.id;
      } else {
        throw e;
      }
    }

    const dbInfo = (await notion.databases.retrieve({
      database_id: resolvedDbId,
    })) as { data_sources?: Array<{ id: string }> };
    const dataSourceId = dbInfo.data_sources?.[0]?.id;
    if (!dataSourceId) {
      return {
        customers: MOCK_CUSTOMERS,
        source: "mock",
        notionError:
          "DB에 data source 없음 — Integration이 DB에 공유됐는지 확인 필요",
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
        notionError: "Notion DB가 비어있거나 권한 부족",
      };
    }
    return { customers, source: "notion" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { customers: MOCK_CUSTOMERS, source: "mock", notionError: msg };
  }
}

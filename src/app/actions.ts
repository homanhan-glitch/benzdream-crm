"use server";

import { stageToNotion } from "@/lib/stages";
import { updateStageInNotion } from "@/lib/notion";
import type { StageId } from "@/lib/types";

export async function updateCustomerStage(
  pageId: string,
  stageId: StageId,
): Promise<{ ok: boolean; error?: string }> {
  if (!pageId || pageId.startsWith("m")) {
    return { ok: false, error: "mock 데이터는 Notion에 쓰지 않음" };
  }
  return updateStageInNotion(pageId, stageToNotion(stageId));
}

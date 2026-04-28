import { NextResponse } from "next/server";
import { fetchConsultLogs } from "@/lib/notion";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { ids?: string[] };
    const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
    if (ids.length === 0) {
      return NextResponse.json({ logs: [] });
    }
    const logs = await fetchConsultLogs(ids.slice(0, 25));
    return NextResponse.json({ logs });
  } catch (e) {
    return NextResponse.json(
      { logs: [], error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

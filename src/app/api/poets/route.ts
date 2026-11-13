import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { poets } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await db.select().from(poets).orderBy(asc(poets.name)));
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { poems } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(poems).where(eq(poems.published, true)).orderBy(desc(poems.createdAt)).limit(100);
    return Response.json(rows);
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { title?: string; author?: string; content?: string; language?: string; category?: string };
    if (!body.title?.trim() || !body.author?.trim() || !body.content?.trim()) {
      return Response.json({ error: "title, author et content sont requis" }, { status: 400 });
    }
    const [row] = await db.insert(poems).values({ title: body.title, author: body.author, content: body.content, language: body.language ?? "fr", category: body.category ?? null }).returning();
    return Response.json(row, { status: 201 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

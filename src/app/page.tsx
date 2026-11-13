import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { poems } from "@/db/schema";

export const dynamic = "force-dynamic";

type Poem = typeof poems.$inferSelect;

async function getPoems(): Promise<{ poems: Poem[]; dbError: string | null }> {
  try {
    const rows = await db.select().from(poems).where(eq(poems.published, true)).orderBy(desc(poems.createdAt)).limit(20);
    return { poems: rows, dbError: null };
  } catch (e) {
    return { poems: [], dbError: e instanceof Error ? e.message : String(e) };
  }
}

export default async function Home() {
  const { poems: list, dbError } = await getPoems();
  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 1.25rem" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <p style={{ letterSpacing: ".2em", fontSize: ".75rem", textTransform: "uppercase", opacity: .6 }}>Bibliothèque numérique</p>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1.1, margin: ".5rem 0" }}>POÉSIE-MR</h1>
        <p style={{ opacity: .75, fontSize: "1.1rem" }}>Poésie mauritanienne — français, arabe et hassanya. Découvrez, lisez et partagez les plus belles voix du patrimoine.</p>
      </header>

      {dbError && (
        <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 12, padding: "1rem", marginBottom: "1.5rem" }}>
          <strong>Base de données non connectée.</strong> Définissez <code>DATABASE_URL</code> (Vercel Postgres / Neon / Supabase), puis relancez : <code>npm run db:push</code>. <br />
          <span style={{ fontSize: ".85rem", opacity: .8 }}>{dbError}</span>
        </div>
      )}

      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>Poèmes récents</h2>
      {list.length === 0 ? (
        <p style={{ opacity: .7 }}>Aucun poème publié pour le moment. Ajoutez-en via <code>POST /api/poems</code> ou Drizzle Studio (<code>npm run db:studio</code>).</p>
      ) : (
        <ul style={{ display: "grid", gap: "1rem", listStyle: "none", padding: 0 }}>
          {list.map((p) => (
            <li key={p.id} style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: 12, padding: "1.25rem" }}>
              <h3 style={{ fontWeight: 700 }}>{p.title}</h3>
              <p style={{ fontSize: ".9rem", opacity: .65 }}>par {p.author}{p.category ? ` · ${p.category}` : ""} · {p.language}</p>
              <p style={{ marginTop: ".5rem", whiteSpace: "pre-wrap" }}>{p.content.slice(0, 280)}{p.content.length > 280 ? "…" : ""}</p>
            </li>
          ))}
        </ul>
      )}

      <footer style={{ marginTop: "3rem", fontSize: ".85rem", opacity: .55 }}>
        <a href="/api/health">Santé de l’API</a> · <a href="/api/poems">Poèmes (JSON)</a> · <a href="/api/poets">Poètes (JSON)</a>
      </footer>
    </main>
  );
}

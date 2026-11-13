import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

// Pool singleton (important sur serverless Vercel : ne pas créer un pool par requête)
const globalForDb = globalThis as unknown as { __pgPool?: Pool; __db?: NodePgDatabase<typeof schema> };

function getDb() {
  if (globalForDb.__db) return globalForDb.__db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquante — configurez-la (Vercel Postgres/Neon/Supabase). Voir .env.example");
  const pool = globalForDb.__pgPool ?? new Pool({ connectionString: url, max: 5, ssl: url.includes("localhost") ? undefined : { rejectUnauthorized: false } });
  globalForDb.__pgPool = pool;
  globalForDb.__db = drizzle(pool, { schema });
  return globalForDb.__db;
}

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get: (_t, prop) => (getDb() as unknown as Record<string, unknown>)[prop as string],
});

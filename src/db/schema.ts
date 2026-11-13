import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

/**
 * Schéma POÉSIE-MR — Bibliothèque numérique de poésie mauritanienne
 * Base: PostgreSQL (Vercel Postgres / Neon / Supabase via DATABASE_URL)
 */
export const poets = pgTable("poets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio"),
  birthYear: integer("birth_year"),
  deathYear: integer("death_year"),
  language: text("language").default("fr"), // fr | ar | ha (hassanya)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const poems = pgTable("poems", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  content: text("content").notNull(),
  language: text("language").default("fr"),
  category: text("category"), // amour, nature, patriotique, religieux, etc.
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Poet = typeof poets.$inferSelect;
export type NewPoet = typeof poets.$inferInsert;
export type Poem = typeof poems.$inferSelect;
export type NewPoem = typeof poems.$inferInsert;

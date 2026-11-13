# Déploiement POÉSIE-MR sur Vercel + Base de données

## ✅ État vérifié (2026-11-13)
- `npm run typecheck` → OK · `npm run lint` → OK · `npm run build` → OK (Next.js 16.2.6)
- Test local `http://localhost:3000/` → **200** (page + routes `/api/health`, `/api/poems`, `/api/poets` fonctionnelles)
- Sans `DATABASE_URL`, l'API répond 503 avec un message clair (comportement attendu, pas un bug)

## Architecture
| Couche | Techno | Note |
|---|---|---|
| Frontend + API | Next.js 16 (racine `/workspace`, dossier `src/app`) | L'ancien `frontend/` (Vite) et `backend/` (Django) n'existaient que comme `package.json`/`requirements.txt` sans code source : ils sont conservés pour référence mais **non déployés** |
| Base | PostgreSQL via Drizzle ORM (`src/db/schema.ts`) | Tables `poets`, `poems` |
| Cache/Redis/Celery | — | Supprimés du périmètre Vercel (serverless) ; à réintroduire via Upstash Redis si besoin |

## 1) Créer la base (gratuit, 2 min)
Choisissez **Neon** (recommandé) ou Supabase / Vercel Postgres :
- Neon : https://neon.tech → créer un projet → copier la chaîne `Connection string` (pooling activé)
- La chaîne ressemble à : `postgresql://user:password@ep-xxx.aws.neon.tech/dbname?sslmode=require`

## 2) Appliquer le schéma
```bash
export DATABASE_URL="postgresql://..."   # la chaîne Neon
npm run db:push        # crée les tables poets + poems
# Optionnel : npm run db:studio  → interface visuelle pour ajouter des poèmes
```

## 3) Déployer sur Vercel
```bash
npm i -g vercel
vercel login
vercel --prod          # détection auto Next.js (vercel.json présent)
```
Puis dans **Vercel → Project → Settings → Environment Variables**, ajouter :
```
DATABASE_URL = postgresql://...   (Production + Preview + Development)
```
Redéployer. Vérifier : `https://<votre-projet>.vercel.app/api/health` → `{"ok":true,"db":"connected"}`

## 4) Déploiement via GitHub (recommandé, CI auto)
Pousser sur `main` → Vercel importe le repo (github.com/mpmd16829-tech/mar) → définir `DATABASE_URL` → déploiement automatique à chaque push.

## Commandes utiles
```bash
npm run dev            # http://localhost:3000
curl localhost:3000/api/health
curl -X POST localhost:3000/api/poems -H 'Content-Type: application/json' \
  -d '{"title":"Le Fleuve Sénégal","author":"Auteur MR","content":"Vers...","language":"fr","category":"nature"}'
```

## ⚠️ Limites / prochaines étapes
- Auth, paiements (Bankily, Sedad…), upload PDF, i18n : présents dans `.env.example` (ancien Django) mais non implémentés côté Next.js — à spécifier avant développement.
- `frontend/` (Vite + React Router) et `backend/` (Django) sont des coquilles sans code : soit les supprimer, soit les compléter.

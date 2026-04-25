# Meeting Debrief

Turn meeting transcripts into structured, actionable debriefs — decisions, action items, blockers, and a follow-up email draft — powered by AI.

## Stack

- **Next.js 16+** — App Router, Turbopack, TypeScript strict
- **Supabase** — Auth (GitHub OAuth), Postgres, RLS
- **OpenRouter** → `openai/gpt-4o-mini` — AI debrief generation
- **Tailwind CSS v4** + shadcn/ui — UI
- **Vitest** — Unit tests (scoped to AI parser + action item utils)

## Getting Started

### 1. Clone & install

```bash
git clone <repo>
cd meeting-debrief
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase dashboard → Settings → API
- `OPENROUTER_API_KEY` — from [openrouter.ai](https://openrouter.ai)

### 3. Set up GitHub OAuth

1. Go to GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**
2. Set **Authorization callback URL** to:
   ```
   https://ppedomeelrjglzrvnngx.supabase.co/auth/v1/callback
   ```
3. Copy the Client ID and Client Secret
4. In Supabase dashboard → Authentication → Providers → GitHub → paste credentials
5. In Supabase dashboard → Authentication → URL Configuration:
   - **Site URL**: your Vercel deployment URL (or `http://localhost:3000` for dev)
   - **Redirect URLs**: add `http://localhost:3000/**`

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tests

```bash
npm run test
npm run test:coverage   # requires 90%+ line coverage on scoped files
```

## Deployment (Vercel)

1. Push to GitHub → connect to Vercel
2. Set environment variables in Vercel dashboard (same as `.env.local`)
3. Set Supabase Site URL to your Vercel deployment URL
4. Add your Vercel URL to Supabase Redirect URLs

Preferred region: `fra1` (EU West, closest to Supabase `eu-west-1`). Already set in `vercel.json`.

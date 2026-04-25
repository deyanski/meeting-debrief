# Plan: Meeting Debrief — Full Implementation

**TL;DR**: Next.js 16+ App Router app. Server Components for all reads (direct Supabase), Server Actions for all mutations (save/delete/toggle), one Route Handler (`/api/debrief`) for the OpenRouter call. Magic link auth only. Deployed to Vercel. 4-hour hard stop.

---

## Decisions locked
- New meeting: dedicated page `/meetings/new`
- Search: search bar on meetings list page (`?q=` query param)
- AI failure: keep textarea populated, no localStorage persistence
- Auth: magic link only, no OAuth

---

## Phase 1 — Scaffold + Auth + First Deploy (00:30–01:00)

### 1.1 Project init
- `npx create-next-app@latest` with TypeScript, Tailwind, App Router, Turbopack
- Install approved packages: `@supabase/supabase-js openai zod motion vitest @testing-library/react @vitejs/plugin-react`
- `vitest.config.ts` — separate from next.config.ts, jsdom, @vitejs/plugin-react, @/ alias
- shadcn/ui init

### 1.2 Supabase client
- `lib/supabase/server.ts` — `createServerClient` using async `cookies()` from `next/headers` (Next.js 16 async cookies API)
- `lib/supabase/browser.ts` — `createBrowserClient`

### 1.3 Auth guard (proxy.ts)
- Reads Supabase session via `lib/supabase/server.ts`
- Unauthenticated + protected route → redirect to `/sign-in?next={pathname}`
- Authenticated + auth route → redirect to `/dashboard`
- **Edge case**: `next` param must start with `/` — guard against open redirect

### 1.4 Auth pages
- `app/(auth)/sign-in/page.tsx` — email input → `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: /auth/callback } })`
- `app/auth/callback/route.ts` — `exchangeCodeForSession(code)`, validate `next.startsWith('/')`, handle `x-forwarded-host` for Vercel
- `app/auth/auth-code-error/page.tsx` — minimal fallback

### 1.5 First deploy
- Push to GitHub → connect Vercel → set env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENROUTER_API_KEY`
- Set Supabase Site URL to Vercel URL, add localhost to Redirect URLs
- Verify magic link flow works end-to-end on deployed URL

---

## Phase 2 — Debrief Flow End-to-End (01:00–02:00)

### 2.1 Database setup (do first, before writing any queries)
```sql
-- meetings
id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
user_id uuid REFERENCES auth.users NOT NULL,
title text NOT NULL,
date text NOT NULL,
summary text NOT NULL,
decisions jsonb NOT NULL DEFAULT '[]',
blockers jsonb NOT NULL DEFAULT '[]',
follow_up_email text NOT NULL,
raw_transcript text NOT NULL,
created_at timestamptz DEFAULT now(),
fts tsvector GENERATED ALWAYS AS (
  to_tsvector('english',
    coalesce(title,'') || ' ' ||
    coalesce(summary,'') || ' ' ||
    coalesce(raw_transcript,'')
  )
) STORED

-- action_items
id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
meeting_id uuid REFERENCES meetings ON DELETE CASCADE NOT NULL,
user_id uuid REFERENCES auth.users NOT NULL,
text text NOT NULL,
owner text,  -- nullable
completed_at timestamptz,  -- null = open
created_at timestamptz DEFAULT now()
```
- RLS on both tables: `user_id = auth.uid()` for all operations
- GIN index: `CREATE INDEX meetings_fts_idx ON meetings USING GIN(fts)`
- Run `supabase gen types typescript > types/database.ts`

### 2.2 AI layer
- `lib/ai/schema.ts` — Zod schema: `{ title, date, summary, decisions: string[], action_items: [{ text, owner: string|null }], blockers: string[], follow_up_email }`; also handle `{ error: "not_a_meeting" }` union
- `lib/ai/parseDebriefResponse.ts` — takes raw string, JSON.parse, validate against Zod schema, return typed object or throw
- `lib/ai/prompt.ts` — system prompt: instruct model to return JSON only, never invent owners, return `{"error":"not_a_meeting"}` for bad input
- `lib/ai/client.ts` — OpenAI SDK, `baseURL: "https://openrouter.ai/api/v1"`, `apiKey: process.env.OPENROUTER_API_KEY`

### 2.3 Route Handler: /api/debrief
- `app/api/debrief/route.ts` — POST only
- Input validation (Zod): `{ transcript: z.string().min(1) }`
- Auth check: get session from Supabase server client → 401 if no session
- Call OpenRouter → catch network errors → 500 `{ error: "internal" }`
- Parse response through `parseDebriefResponse` → catch parse failure → 500 `{ error: "internal" }`
- Return parsed object to client
- **Never expose raw error messages or stack traces**

### 2.4 New meeting page
- `app/(app)/meetings/new/page.tsx` — client component
- Textarea for transcript (controlled input — preserved on AI failure)
- Submit → POST `/api/debrief` → loading state (animation: debrief loading per Design Rules)
- On `{ error: "not_a_meeting" }` → inline friendly message in form (not toast, not redirect)
- On success → render editable draft form (title, summary, action items list, decisions, blockers, follow_up_email)
- Save button → Server Action `saveMeeting(formData)` → insert into `meetings` + `action_items` → redirect to `/meetings/[id]`
- **Edge case**: disable save button during save to prevent double-submit
- **Edge case**: owner can be null — render "Unassigned" not "null"

### 2.5 Unit tests
- `lib/ai/parseDebriefResponse.test.ts` — happy path, missing fields, null owner, malformed JSON, not_a_meeting union, empty arrays

---

## Phase 3 — List, Detail, Dashboard (02:00–03:00)

### 3.1 Meetings list page
- `app/(app)/meetings/page.tsx` — Server Component
- Reads `?q` from `searchParams` (await in Next.js 16)
- If `q`: `supabase.from('meetings').select('id,title,date,summary,created_at').textSearch('fts', q, { type: 'websearch' }).eq('user_id', uid).order('created_at', { ascending: false })`
- If no `q`: same query without textSearch
- Count open action items per meeting: include in select or separate query
- Empty state: "No meetings yet" (first time) vs "No results for '{q}'" (search miss) — distinguish these
- Search bar: form with `?q=` GET param, no JS required to function

### 3.2 Meeting detail page
- `app/(app)/meetings/[id]/page.tsx` — Server Component
- `supabase.from('meetings').select('id,title,date,summary,decisions,blockers,follow_up_email,raw_transcript').eq('id', id).eq('user_id', uid).single()`
- If null → `notFound()` (handles privacy: User B visiting User A's meeting gets 404, not a data leak)
- Action items: separate query ordered by `created_at ASC`
- **Sections**: summary, action items checklist, decisions, blockers, follow-up email + copy button, raw transcript (collapsible)
- Delete button → confirm dialog → Server Action `deleteMeeting(id)` → redirect to `/meetings`

### 3.3 Action item checklist
- `lib/utils/actionItems.ts` — `toggleActionItem(id, currentState)` → returns `{ completed_at: string | null }` (pure function, testable)
- Client component wrapping the checklist — calls Server Action on toggle
- Server Action: `updateActionItem(id, completed_at)` — verify `user_id = auth.uid()` before update (don't trust client)
- **Edge case**: rapid double-click — disable checkbox during in-flight update
- **Edge case**: `completed_at` stored as timestamptz — use `new Date().toISOString()` on completion, null on reopen
- Manual add: inline text input below list → Server Action `addActionItem(meetingId, text)` → revalidatePath

### 3.4 Unit tests
- `lib/utils/actionItems.test.ts` — toggle complete→null completed_at, toggle open→ISO string, idempotent calls

### 3.5 Dashboard
- `app/(app)/dashboard/page.tsx` — Server Component
- Query: `supabase.from('action_items').select('id,text,owner,created_at,meeting_id,meetings(title)').is('completed_at', null).eq('user_id', uid).order('created_at', { ascending: true })`
- Each item links to its meeting detail
- Toggle works identically to meeting detail (same Server Action)
- Empty state: "All caught up — no open action items"

---

## Phase 4 — Deploy + Search (03:00–03:30)

- Redeploy to Vercel — fix prod-only issues:
  - Supabase Site URL must match production domain (common miss)
  - `OPENROUTER_API_KEY` in Vercel env vars
  - `x-forwarded-host` handling in auth callback
- Search (already wired in 3.1 via `?q=` — verify it works in production)
- Manual privacy check: two browser sessions, different accounts

---

## Phase 5 — README + Demo (03:30–04:00)
- README: live URL, repo link, stack, setup instructions
- Demo video (2 min): sign up → paste transcript → debrief → edit → save → tick action item → dashboard → search
- Written reflection (200 words)
- Process screenshots: initial plan, refined plan, final task list, rejection paragraph

---

## Relevant files (full paths)

- `proxy.ts` — auth guard
- `lib/supabase/server.ts` / `lib/supabase/browser.ts`
- `lib/ai/schema.ts`, `parseDebriefResponse.ts`, `prompt.ts`, `client.ts`
- `lib/utils/actionItems.ts`
- `app/(auth)/sign-in/page.tsx`
- `app/auth/callback/route.ts`
- `app/auth/auth-code-error/page.tsx`
- `app/(app)/dashboard/page.tsx`
- `app/(app)/meetings/page.tsx`
- `app/(app)/meetings/new/page.tsx`
- `app/(app)/meetings/[id]/page.tsx`
- `app/api/debrief/route.ts`
- `vitest.config.ts`
- `lib/ai/parseDebriefResponse.test.ts`
- `lib/utils/actionItems.test.ts`
- `types/database.ts` (generated)

---

## Edge cases and failure modes

### Auth
- Magic link expired → `exchangeCodeForSession` error → redirect to auth-code-error
- No `code` in callback URL → redirect to auth-code-error
- `next` param is external URL → open redirect attack → validate `next.startsWith('/')`
- Session expires mid-session → proxy.ts catches on next navigation → redirects to sign-in (acceptable)

### AI / debrief
- Transcript < 50 chars → client-side validation before submitting, also system prompt instructs model to return not_a_meeting
- OpenRouter network failure → catch → 500 `{ error: "internal" }`, textarea stays populated
- Malformed JSON from AI → JSON.parse throws → catch → 500 `{ error: "internal" }`
- Zod parse failure → 500 (never expose schema structure)
- `not_a_meeting` → inline message in form
- AI invents owner → system prompt must explicitly forbid; Zod owner field is nullable

### Save / DB
- Double-submit → disable save button during in-flight request
- Supabase insert fails → show error in UI, keep draft form populated for retry
- `action_items` CASCADE DELETE from `meetings` — must be in migration, not app code

### Action items
- Rapid toggle (double-click) → disable during update
- `completed_at` must be server-time or client ISO string — null on reopen
- Owner null → render "Unassigned" not "null"/"undefined"

### Search
- Empty query → return all meetings (no WHERE fts)
- `websearch_to_tsquery` not `to_tsquery` — handles special chars safely
- No results → differentiate "no meetings at all" vs "no match for query"

### Privacy
- User B visits User A's meeting URL → RLS returns null → `notFound()` in Server Component — 404 not data leak
- Meeting IDs are UUIDs — not guessable

### Delete
- Confirmation UI: inline confirm buttons (not `window.confirm`)
- On success → redirect to `/meetings`
- On failure → show error, stay on page

---

## Explicit out-of-scope (do not build even if time allows)
- Calendar/video integration, live recording, sharing, actually sending email, tags/folders, recurring items, native app, pagination, real-time sync, profile/account page, email confirmation (magic link IS the confirmation)

---

## Verification checklist (before demo video)
1. `npm run test` passes with 90%+ coverage on scoped files
2. Magic link flow works on deployed URL (not localhost)
3. Sign in as User A → create meeting → copy URL → sign in as User B in private window → visit URL → 404
4. Tick action item → reload → still ticked
5. Dashboard shows action items from all meetings sorted oldest first
6. Search returns meeting by keyword in transcript
7. Empty state visible on meetings list for new account
8. Three graded screens usable on 375px width (iPhone SE)

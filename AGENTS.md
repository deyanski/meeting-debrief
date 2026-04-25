# AGENTS.md — Meeting Debrief

Primary configuration for Copilot agents and contributors working on this project.
Read this before writing any code.

---

## Skills

Load the relevant skill BEFORE starting any task. Use `read_file` on the SKILL.md path.

| Task type | Skill to load |
|---|---|
| Next.js routing, RSC boundaries, async APIs | `.agents/skills/next-best-practices/SKILL.md` |
| UI components, design, pages, dashboard, empty states | `.agents/skills/frontend-design/SKILL.md` |
| Writing or configuring unit tests | `.agents/skills/vitest/SKILL.md` |
| Verifying deployed URL before submission | `.agents/skills/webapp-testing/SKILL.md` |
| Missing library docs (Supabase, OpenRouter, etc.) | Use Context7 — see `.github/instructions/context7.instructions.md` |

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16+, App Router, TypeScript strict mode |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth + Database | Supabase — Auth, Postgres, JS client (no ORM) |
| Row-level security | Supabase RLS enabled on every table from day one |
| AI | OpenRouter API → `openai/gpt-4o-mini` via OpenAI SDK (`baseURL` override) |
| Response validation | Zod — parse every AI response before saving |
| Search | Postgres full-text search via `tsvector` + GIN index |
| Unit testing | Vitest + @testing-library/react |
| Dev bundler | Turbopack (default in Next.js 16+, no config needed) |
| Deployment | Vercel — `next build`, env vars set in Vercel dashboard |

---

## Project Structure

```
app/
├── (auth)/              # Sign-in, sign-up routes
├── (app)/               # Protected routes (proxy guards)
│   ├── dashboard/       # Open action items across all meetings
│   ├── meetings/        # Meeting list
│   └── meetings/[id]/   # Meeting detail + checklist
├── auth/
│   ├── callback/        # PKCE code exchange — required for magic link & OAuth
│   └── auth-code-error/ # Fallback shown when code exchange fails
├── api/
│   └── debrief/         # POST — calls OpenRouter, returns structured JSON
lib/
├── supabase/            # Supabase client (server + browser instances)
├── ai/                  # OpenRouter client, prompt, Zod schema
└── utils/               # Pure helpers
components/              # Shared UI components
hooks/                   # Custom React hooks
types/                   # TypeScript interfaces and Zod-inferred types
```

---

## Security Rules (Non-negotiable)

- **`OPENROUTER_API_KEY` is server-only.** Never prefix with `NEXT_PUBLIC_`. Never expose in client components.
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_URL`** are safe to expose — by design.
- **Use `proxy.ts` for request interception** in this project. In Next.js 16+, the old `middleware.ts` convention is renamed to `proxy.ts` / `proxy()` / `proxyConfig`.
- **RLS must be active** on `meetings` and `action_items` tables before any data is written. A user must never be able to read or write another user's rows.
- **Validate all Route Handler input with Zod** before touching the database or calling the AI.
- **Never trust client-supplied `user_id`** — always derive it server-side from the Supabase session.
- **Supabase auth** requires `app/auth/callback/route.ts` — this is mandatory for magic link and OAuth flows.
- Store all secrets in `.env.local` locally. Never commit `.env.local` to version control.

Note: `proxy.ts` in Next.js 16+ uses the Node.js runtime. If a future requirement depends on Edge runtime specifically, revisit this convention before implementing it.

---

## AI Layer Rules

- The `/api/debrief` route handler calls OpenRouter synchronously — no streaming needed.
- Use OpenAI SDK with `baseURL: "https://openrouter.ai/api/v1"` and `apiKey: process.env.OPENROUTER_API_KEY`.
- Request structured JSON output using `response_format: { type: "json_object" }` and a tight system prompt.
- **Always parse the response through a Zod schema** before returning to the client. If parsing fails, return a user-friendly error — not a 500.
- The Zod schema must enforce: `title`, `date`, `summary`, `decisions[]`, `action_items[]`, `blockers[]`, `follow_up_email`.
- `action_items[].owner` is nullable — never invent an owner if none was mentioned in the transcript.
- If the transcript is too short or clearly not a meeting, return a structured `{ error: "not_a_meeting" }` and show a friendly UI message.
- When `/api/debrief` returns `{ error: "not_a_meeting" }`, the client must render a friendly inline message inside the debrief form — not a toast, not a 500 page, not a raw JSON object.

---

## Testing Rules

**Override:** The general Next.js instruction (`nextjs.instructions.md`) says "write tests for all critical logic and components." That rule does **not** apply here. Follow only the scoped rules below.

Unit tests are **scoped** — do not test UI components or API route plumbing.

Test only:
1. `lib/ai/parseDebriefResponse.ts` — the Zod parser for AI output (all edge cases: missing fields, null owner, malformed JSON)
2. `lib/utils/actionItems.ts` — toggle logic (complete/reopen, timestamp stored on completion)

- Co-locate test files: `parseDebriefResponse.test.ts` next to the source file.
- Run tests: `npm run test`
- Run with coverage: `npm run test:coverage`
- **Coverage target: 90%+ lines on the two scoped files.** Do not ship if coverage drops below this.
- Never skip a failing test — fix it before moving on.
- Vitest needs its own `vitest.config.ts` — do not attempt to share `next.config.ts`.

### Manual verification (pre-submission)

The spec requires manual checks against the deployed URL — not an automated test suite. Use the `webapp-testing` skill for this.

Before recording the demo video, verify:
1. **Privacy** — sign in as User A, copy a meeting URL, open a private/incognito window and sign in as User B, confirm the URL returns a redirect or 404.
2. **Persistence** — tick an action item, reload the page, confirm the checkbox state is preserved.

---

## Design Rules

- Commit to a bold, specific aesthetic — see `frontend-design` skill for direction.
- No Inter font. No purple gradients. No generic layouts.
- Use CSS variables for all theme colors and spacing tokens.
- The three screens graded on mobile: dashboard, new meeting, meeting detail.
- Every list screen must have a **designed empty state** — not a blank page.
- Animations: only for meaningful moments (debrief loading, action item tick, save confirmation).

---

## TypeScript Rules

- `strict: true` in `tsconfig.json` — no exceptions.
- No `any` types. Use `unknown` + type guards where the shape is uncertain.
- All Supabase table shapes typed via generated types (`supabase gen types typescript`).
- All AI response shapes inferred from Zod schemas — not hand-written interfaces.

---

## Dependency Rules

- Do not add packages without approval. If you need a new package, note it explicitly and wait for confirmation before installing.
- Pre-approved packages for this project: `@supabase/supabase-js`, `openai`, `zod`, `tailwindcss`, `shadcn/ui`, `motion`, `vitest`, `@testing-library/react`, `@vitejs/plugin-react`.

---

## Key Constraints from Spec

- A user must **never** see another user's meetings or action items under any circumstance.
- The AI result must be **editable before saving** — it is a draft, not a final answer.
- Ticking an action item must **persist across a page refresh**.
- The dashboard shows open action items **across all meetings**, sorted oldest first.
- Do not build: calendar integration, live recording, sharing, email sending, tags/folders, recurring items, native app.

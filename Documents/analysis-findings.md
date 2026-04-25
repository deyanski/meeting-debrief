# Instruction & Skill Analysis — Meeting Debrief Project

_Date: April 25, 2026_

Analysis of all instruction files, skills, and the project spec to identify contradictions, overlaps, and gaps before build start.

---

## Sources Analysed

| Source | Path |
|---|---|
| Project spec | `Documents/homework-meeting-debrief-spec.md` |
| Primary project config | `AGENTS.md` |
| Repository instructions | `.github/copilot-instructions.md` |
| Next.js instructions | `.github/instructions/nextjs.instructions.md` |
| Next.js + Tailwind instructions | `.github/instructions/nextjs-tailwind.instructions.md` |
| Context7 instructions | `.github/instructions/context7.instructions.md` |
| Skill: next-best-practices | `.agents/skills/next-best-practices/SKILL.md` |
| Skill: frontend-design | `.agents/skills/frontend-design/SKILL.md` |
| Skill: vitest | `.agents/skills/vitest/SKILL.md` |
| Skill: webapp-testing | `.agents/skills/webapp-testing/SKILL.md` |

---

## CONTRADICTIONS (fix before building)

### 1. Next.js version mismatch — RESOLVED
- **Previous conflict:** `.github/instructions/nextjs.instructions.md` was pinned to **Next.js 16.1.1** while `AGENTS.md` declared **Next.js 15**.
- **Resolution:** The project decision is now **Next.js 16+**, and `AGENTS.md` has been updated to match the active instruction file.

### 2. Middleware file naming — RESOLVED
- **Previous conflict:** The generic Next.js instructions used the v16 `proxy.ts` convention while `AGENTS.md` still implied `middleware.ts`.
- **Resolution:** `AGENTS.md` now treats `proxy.ts` as the project convention and notes the Node.js runtime caveat for Next.js 16+ proxy files.

### 3. Motion library — RESOLVED
- **Previous conflict:** `motion` was used by the `frontend-design` skill but was not in the AGENTS.md pre-approved packages list.
- **Resolution:** `motion` has been added to the pre-approved packages list in `AGENTS.md`.

### 4. Test scope conflict — RESOLVED
- **Previous conflict:** `nextjs.instructions.md` said "write tests for all critical logic and components" while AGENTS.md scoped tests to exactly 2 files.
- **Resolution:** An explicit override note has been added to the AGENTS.md Testing Rules section making it unambiguous that AGENTS.md wins.

### 5. Zod vs yup ambiguity — RESOLVED
- **Previous conflict:** `nextjs.instructions.md` said "zod or yup" while AGENTS.md and the Tailwind instructions specified Zod exclusively.
- **Resolution:** The "or yup" wording has been removed from `nextjs.instructions.md`. Zod is the only validation library for this project.

---

## OVERLAPS (informational — no action required)

### 6. Design rules across 2 sources — non-issue
`nextjs-tailwind.instructions.md` does not exist in the workspace. Design guidance lives in exactly two places:
- **`frontend-design` SKILL.md** — on-demand design methodology (typography, color, motion, layout philosophy)
- **`AGENTS.md` Design Rules** — always-loaded project policy (graded screens, empty states, animation scope, no Inter/purple gradients)

These serve different purposes and are intentional layering, not redundancy. The one overlapping line ("no Inter / no purple gradients") is kept in AGENTS.md as a fast-read reminder that works without loading the skill. No action needed.

### 7. Zod mentions — non-issue
`nextjs-tailwind.instructions.md` does not exist. The "or yup" wording was removed in fix #5. Zod now appears in exactly two places with consistent meaning:
- `nextjs.instructions.md` — "Use `zod`" for Route Handler validation
- `AGENTS.md` — "Zod — parse every AI response before saving"

No drift risk. No action needed.

### 8. RSC / App Router rules — non-issue
`nextjs-tailwind.instructions.md` does not exist in the workspace. RSC and App Router guidance lives in exactly one place: `nextjs.instructions.md`. No duplication, no action needed.

---

## GAPS (spec requirements not covered anywhere)

### 9. Supabase auth callback route — HIGH RISK
- **Where:** Not mentioned in any instruction, skill, or AGENTS.md.
- **Spec requirement:** Frictionless sign-up (spec page 2). Supabase magic link / OAuth auth requires `app/auth/callback/route.ts` to exchange the code for a session.
- **Impact:** If this route is missing, auth silently fails after clicking the magic link email. The entire app becomes unusable.
- **Fix:** Add to AGENTS.md: _"Supabase auth requires `app/auth/callback/route.ts` — this is mandatory for magic link and OAuth flows."_

### 10. `not_a_meeting` client UI state — MEDIUM RISK
- **Where:** AGENTS.md covers the API response (`{ error: "not_a_meeting" }`), but no instruction covers how the client renders this state.
- **Spec requirement:** _"If the input clearly isn't a meeting, the user should see a friendly message, not a broken-looking result."_ (spec page 3)
- **Impact:** The API handles it correctly but the UI could display a raw error object or blank screen.
- **Fix:** Add to AGENTS.md UI/error section: _"When `/api/debrief` returns `{ error: 'not_a_meeting' }`, show a friendly inline message in the debrief form — not a toast, not a 500 page."_

### 11. Search scope vs demo checklist tension — MEDIUM RISK
- **Where:** Not addressed in AGENTS.md or any instruction.
- **Spec conflict:** Timeboxing (spec page 5) says _"cut search if behind at 02:00"_ but the demo video checklist (spec page 6) includes search as a required happy path step.
- **Impact:** If you cut search to meet the timebox, the demo video cannot demonstrate the full happy path and the self-check at page 7 will fail.
- **Fix:** Add to AGENTS.md Key Constraints: _"Search is in the demo checklist — treat it as required, not optional. Only cut it if you plan to rebuild it before the demo recording."_

### 12. `webapp-testing` skill uses Python Playwright — CLARIFICATION NEEDED
- **Where:** `webapp-testing` SKILL.md describes Python-based Playwright scripts, not `@playwright/test` (Node.js).
- **Conflict:** AGENTS.md stack lists `@playwright/test` (Node.js) for E2E tests.
- **Impact:** Agent will use the wrong Playwright implementation if the skill is invoked for E2E test writing.
- **Fix:** Update the skill table in AGENTS.md to clarify: _"webapp-testing skill = Python Playwright for manual post-deploy verification only. Use `@playwright/test` (Node.js) for automated E2E test suite."_

---

## Recommendations Summary

| # | Action | Priority | File to change |
|---|---|---|---|
| 1 | Resolved by adopting Next.js 16+ in `AGENTS.md` | Done | `AGENTS.md` |
| 2 | Resolved by adopting `proxy.ts` naming in `AGENTS.md` | Done | `AGENTS.md` |
| 3 | Resolved — `motion` added to approved packages | Done | `AGENTS.md` |
| 4 | Resolved — override note added to AGENTS.md Testing Rules | Done | `AGENTS.md` |
| 5 | Resolved — "or yup" removed; Zod only | Done | `nextjs.instructions.md` |
| 9 | Add Supabase auth callback route requirement to AGENTS.md | High | `AGENTS.md` |
| 10 | Add `not_a_meeting` client UI handling rule to AGENTS.md | Medium | `AGENTS.md` |
| 11 | Clarify search is required (not cuttable) in AGENTS.md | Medium | `AGENTS.md` |
| 12 | Clarify webapp-testing skill scope in AGENTS.md skills table | Low | `AGENTS.md` |

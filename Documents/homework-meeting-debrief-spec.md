# homework-meeting-debrief-spec

_Source:_ `homework-meeting-debrief-spec.pdf`

_Extraction method:_ `pdfplumber`

## Page 1

```text
V IBE CODING WORKSHOP   · HOMEWORK
             Meeting              Debrief
             Build a personal meeting intelligence tool in four hours using plan-
             mode, task tracking, and preview approval — the three disciplines that
             keep vibe coding honest.
             STACK              DELIVERABLE
             Next.js + your choice Deployed URL
```

## Page 2

```text
Meeting    Debrief   —  Homework      Specification
       Workshop: Vibe Coding Time budget: 4 hours, start to deployed URL Tech requirement: Next.js web app,
       deployed to a public URL. Everything else — database, auth provider, hosting, UI library — is your choice.
         1. Product concept
       Meeting Debrief is a personal meeting intelligence tool. The user pastes a meeting transcript or rough notes, an
       AI extracts structured intelligence from it — decisions, action items, blockers, a follow-up email draft — and
       saves everything to a searchable history. Action items become checkboxes the user ticks off over time, giving
       them a lightweight task manager scoped to the meetings those tasks came from.
       It's the tool every knowledge worker wishes existed after a 10-meeting day: somewhere the messy context goes
       in, and clean, trackable commitments come out.
         2. Business requirements
       2.1 Who uses it
       A single knowledge worker managing their own meetings. Not a team product. Each user sees only their own
       meetings and their own action items.
       2.2 Core user flows
       Sign in. The user authenticates so their data is private. Sign-up should be frictionless — no long onboarding
       form, no credit card.
       Debrief a meeting. The user pastes a transcript or notes into a textarea and triggers a debrief. Within a
       reasonable wait, they see a structured result: meeting title, date, short summary, the decisions that were made,
       a list of action items, any blockers or open questions, and a ready-to-send follow-up email draft addressed to
       meeting participants.
       Review and edit before saving. The AI output is a draft, not a final answer. The user can edit the title, adjust
       action items, remove things that don't apply, before committing the meeting to their history.
       Browse past meetings. The user can see a chronological list of every meeting they've saved, with enough
       context on each row to recognize it without opening it (title, date, a summary preview, how many action items
       are still open).
       Encorp — Vibe Coding Workshop                                  Page 2 of 7
```

## Page 3

```text
Open a past meeting. Full view of everything that was extracted: summary, action items as a live checklist,
       decisions, blockers, follow-up email, and access to the original raw transcript.
       Track action items over time. Every action item has a checkbox. When ticked, it's marked done and the
       completion time is stored. Unticking reopens it. Action items can be added manually to a meeting after the fact.
       See open work across all meetings. A dashboard view shows every open action item across every meeting the
       user has saved, sorted so the oldest rise to the top. Ticking one there behaves the same as ticking it inside the
       meeting. This is the "what do I actually owe people" view.
       Search. The user can search their meeting history by keyword and find relevant meetings from the title, the
       transcript, or the summary.
       Copy the follow-up email. One click copies the AI-generated follow-up email to the clipboard, ready to paste
       into the user's email client.
       Delete a meeting. The user can permanently delete a meeting they no longer want in their history, with a
       confirmation step to prevent mistakes.
       2.3 AI behavior expectations
       The AI debrief should feel competent, not magical. Specifically:
         • It should extract action items even when the transcript is vague — capturing implicit commitments is part
           of the value.
         • It should never invent people or attribute tasks to owners who weren't mentioned. If no owner is clear,
           leave it unassigned.
         • The follow-up email should be written from the user's first-person perspective, addressed to the meeting
           participants, confirming what was decided and listing what happens next. Professional tone, ~120–180
           words.
         • If the input clearly isn't a meeting (too short, or unrelated text), the user should see a friendly message,
           not a broken-looking result.
       Encorp — Vibe Coding Workshop                                  Page 3 of 7
```

## Page 4

```text
2.4 Quality bar
         • Privacy. A user never sees another user's meetings or action items under any circumstance. This is non-
           negotiable — test it with two accounts.
         • Persistence. Everything the user saves or ticks survives a page refresh. No "oh, it looked saved but wasn't"
           moments.
         • Error handling. When the AI call fails, or the database is unreachable, the user sees a clear message and
           their work-in-progress isn't lost.
         • Empty states. First-time users see a screen that tells them what to do next, not an empty list with no
           explanation.
         • Mobile. The primary flows (dashboard, new meeting, meeting detail) are usable on a phone-sized screen.
         • Deployed. The product lives at a public URL, not on localhost. A stranger with the link can sign up and use
           it.
       2.5 Out of scope
       Don't build any of the following, even if you finish early:
         • Calendar or video-conferencing integration
         • Live recording or transcription
         • Sharing meetings with other users, teams, or workspaces
         • Actually sending the follow-up email (drafting and copying is enough)
         • Tags, folders, or categories for meetings
         • Recurring action items or reminders
         • A native mobile app
       If you finish early, polish what you have. Scope creep is the enemy of a 4-hour build.
       Encorp — Vibe Coding Workshop                                  Page 4 of 7
```

## Page 5

```text
3. Workflow requirements
       This homework is assessed on the process as much as the product. You must demonstrate:
         1. A Plan Mode session before any code is written. Open your AI coding tool in an empty repo, engage plan
           mode, paste this spec, and let the AI produce a build plan. Screenshot the initial plan. Don't accept the first
           plan — push back on at least one thing (a missing edge case, a questionable decision, a scope concern).
           Screenshot the refined plan. Only then approve and start coding.
         1. A task list kept open throughout the build. Minimum 8 tasks. At least 6 marked completed by the end. If
           you're working on something that isn't on the list, either add it or stop doing it.
         1. At least one explicit rejection of an AI-proposed plan or edit. Somewhere during the build, the AI will
           suggest something that isn't quite right. Reject it deliberately and note why.
         1. Git discipline. Minimum 6 commits. Each commit message describes what changed and why, not "wip" or
           "fixes".
         4. Timeboxing (4 hours, hard stop)
         Block      Minutes  What you do
         00:00–00:30 30      Plan Mode. Spec in, plan out, refine, approve. No code yet.
         00:30–01:00 30      Project scaffold, auth, empty deployed app reachable at a public URL.
         01:00–02:00 60      Debrief flow end-to-end: paste, AI call, structured result, save.
         02:00–03:00 60      Meetings list, meeting detail, action item checklist, dashboard.
         03:00–03:30 30      Redeploy. Fix whatever only breaks in production. Search if time allows.
         03:30–04:00 30      README, 2-minute demo video, written reflection.
       If you're behind at 02:00, cut search. If you're behind at 03:00, ship without the dashboard — meeting detail
       with checklists is enough.
       Encorp — Vibe Coding Workshop                                  Page 5 of 7
```

## Page 6

```text
5. Deliverables
       Submit a single document (Notion page, GitHub README, whatever is easiest) containing:
         1. Live URL — deployed publicly. Localhost doesn't count.
         2. Source code repository — public or shared.
         3. Demo video (2 minutes max) — shows the full happy path: sign up, paste a transcript, debrief, save, tick
           an action item, check the dashboard, search.
         4. Process artifacts:
         • Screenshot of the initial Plan Mode plan.
         • Screenshot of the refined Plan Mode plan.
         • Screenshot of the final task list.
         • One paragraph on the rejection: what the AI proposed, why you rejected it, what you asked for instead.
         1. Written reflection (max 200 words): where plan/tasks/preview helped, where vibe coding broke down,
           what you'd do differently next time.
       Encorp — Vibe Coding Workshop                                  Page 6 of 7
```

## Page 7

```text
6. Self-check before submitting
           A stranger can open the live URL, sign up, paste a transcript, and get a useful debrief without asking
           you anything.
           The AI result is editable before it's saved.
           Ticking an action item persists across a page refresh.
           The dashboard shows open action items across all meetings, not just the current one.
           A second test account cannot see the first account's meetings or action items.
           Every list screen has a designed empty state, not a blank page.
           The demo video plays end-to-end with no "that's broken, ignore it" moments.
           The commit history reads like a story someone else could follow.
           You can describe, in one sentence, what the product does.
       Encorp — Vibe Coding Workshop                                  Page 7 of 7
```

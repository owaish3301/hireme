# hireme — build journal

A job application tracker that reads my own Gmail and keeps my applications,
status changes and follow-ups in one place. Built in the open, one phase at a time.
Repo: github.com/owaish3301/hireme

Raw notes at milestones — decisions, mistakes, what I'd do differently.
The polished version of this becomes the portfolio case study.

---

## 2026-11-20 — planning: spec first, code later

Wrote the full spec before touching code — 16 sections covering auth, the
Kanban board, the status timeline, Gmail sync, detection, the review queue,
reminders.

The MVP cut was the hard part. In: Google auth, applications CRUD + Kanban +
event-based status timeline, Gmail polling sync with rules-based detection,
a review queue for low-confidence matches, 7-day follow-up reminders,
Docker + CI + live deploy. Out (v2): LLM email classification, browser
extension, contacts/interview prep, analytics.

Decisions made today:

- **Stack: React + Express + Prisma + Postgres + BullMQ/Redis. Not Go.**
  I'm learning Go right now and it's tempting to build everything in it, but
  the hard parts of this project — OAuth, sync, detection — need my full
  attention. Those lessons are stack-independent anyway.
- **Auth: DIY Google-only. No Clerk, no Better Auth.** I need to own the
  Gmail refresh token, so the auth has to be mine. Sign-in asks only for
  `openid email profile`; Gmail gets connected later in a second, separate
  OAuth flow that asks for `gmail.readonly`.
- Spent the evening learning the full OAuth + token flow before writing any
  of it: short-lived access JWT, refresh token as a random string in an
  httpOnly cookie with only its hash stored, rotation on every use, and
  Gmail's tokens encrypted (AES-256-GCM), never hashed — a hash can only be
  checked, an encrypted token can be used.

Spec, MVP and 31 subtasks across 9 phases live in Eraser.

## 2026-11-21 — phase 0: the monorepo scaffold

Set up the repo as a Turborepo + pnpm monorepo and pushed it:
github.com/owaish3301/hireme

- `apps/client` — Vite + React 19 (package name `client`)
- `apps/server` — Express 5, run with `tsx watch`, entry `src/server.ts`
  (package name `hireme-server`)
- `packages/` — shared `typescript-config`, `eslint-config`, `ui`

Shared tsconfig: each app extends the shared package by name —
`@repo/typescript-config/base.json` for the server, `vite-react.json` for
the client. The config package has **no `exports` field on purpose**: with
exports, resolution goes strict and every JSON file has to be listed as a
subpath; one forgotten file and `extends` breaks. No exports, files resolve
by path.

Mistake of the day: ran `npm i` inside `apps/server` and got
`EUNSUPPORTEDPROTOCOL — Unsupported URL Type "workspace:"`. `workspace:*`
is pnpm syntax; npm doesn't speak it. Rule from now on: this repo is
pnpm-only, and installs always run from the root.

Docker call: compose carries only Postgres + Redis. The apps run on the
host with `turbo dev` — file-watching for Vite/tsx inside Docker on
Windows is pain with no payoff at this stage. Full Docker returns at
deploy time, where the build context has to be the repo root so the
workspace packages resolve.

Small wart, noted for later: the client pins TypeScript ~6.0.3 while the
root, server and ui are on 7.0.2. Align them before the skew bites.

Phase 0 remaining: the compose file itself, a `/health` endpoint that
checks db + redis, and the CI skeleton (install, typecheck, lint, build).

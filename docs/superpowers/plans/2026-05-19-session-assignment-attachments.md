# Session Assignment Attachments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make login survive refresh with an `.env`-controlled token lifetime, make assignees selectable from members, and allow requirement/Bug feedback to carry image/video attachments.

**Architecture:** Keep the existing single-page app and JSON API pattern. Add a small server-side session helper for signed tokens, persist the returned session in `localStorage`, and store lightweight attachment metadata/data URLs in PostgreSQL JSONB columns for requirements and bugs.

**Tech Stack:** Next.js App Router, JavaScript/JSX, PostgreSQL via `pg`, React state/localStorage, Tailwind CSS.

---

### Task 1: Session Token and Refresh Recovery

**Files:**
- Create: `lib/session.mjs`
- Modify: `app/api/auth/login/route.js`
- Modify: `.env.example`
- Modify: `main.jsx`
- Test: `tests/session.test.mjs`
- Test: `tests/main-regression.test.mjs`

- [ ] Write failing tests for configurable session TTL, login response shape, and client session recovery markers.
- [ ] Run `pnpm test` and confirm the new tests fail.
- [ ] Implement `lib/session.mjs` with HMAC-signed tokens, `SESSION_TTL_HOURS`, and expiry timestamps.
- [ ] Return `{ user, token, expiresAt }` from login.
- [ ] Persist the session in `localStorage`, restore it on mount, clear it on logout/password change, and expire it client-side.
- [ ] Run `pnpm test` and confirm all tests pass.

### Task 2: Member Dropdown Assignees

**Files:**
- Modify: `main.jsx`
- Test: `tests/main-regression.test.mjs`

- [ ] Write failing tests that task and Bug assignee controls are selects populated from `users`.
- [ ] Run `pnpm test` and confirm the tests fail.
- [ ] Replace assignee text inputs with `<select>` controls containing `未指派` plus every `user.username`.
- [ ] Run `pnpm test` and confirm all tests pass.

### Task 3: Requirement and Bug Attachments

**Files:**
- Modify: `lib/db.mjs`
- Modify: `lib/dataRepository.mjs`
- Modify: `main.jsx`
- Test: `tests/main-regression.test.mjs`

- [ ] Write failing tests that requirements and bugs persist `attachments`, migrate JSONB columns, and render file inputs/previews.
- [ ] Run `pnpm test` and confirm the tests fail.
- [ ] Add `attachments JSONB NOT NULL DEFAULT '[]'::jsonb` to requirements and bugs create/migration SQL.
- [ ] Include `attachments` in list/create/update repository methods.
- [ ] Add image/video file inputs to requirement and Bug forms with max 5 files and 10MB per file.
- [ ] Render attachment file names plus image/video previews in requirement and Bug cards.
- [ ] Run `pnpm test` and confirm all tests pass.

### Task 4: Runtime Verification

**Files:**
- No new files.

- [ ] Run `pnpm test`.
- [ ] Run `docker compose up -d --build web`.
- [ ] Verify `GET http://localhost:3000` returns HTTP 200.
- [ ] Verify login API returns a token and expiry.
- [ ] Verify data API includes `attachments` arrays.

# Bug Attachment Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Bug submission attachments so videos larger than 10MB can be uploaded, multiple files are supported, previews are clearer, and attachments remain optional.

**Architecture:** Keep the existing Data URL attachment model and scope the higher limits to Bug attachments only. Reuse `renderAttachments` with optional controls for upload-time removal, and keep requirement attachments on the existing lighter limits.

**Tech Stack:** Next.js App Router, React/JSX in `main.jsx`, Tailwind CSS, Node test runner.

---

### Task 1: Bug Attachment Limits and Preview Controls

**Files:**
- Modify: `tests/main-regression.test.mjs`
- Modify: `main.jsx`

- [ ] Write failing static regression checks for `BUG_ATTACHMENT_MAX_FILES`, `BUG_ATTACHMENT_MAX_SIZE`, `removeAttachment('bug'`, `showMeta`, and `canRemove`.
- [ ] Run `pnpm test` and confirm those checks fail.
- [ ] Add separate constants: requirement remains 5 files / 10MB, bug becomes 10 files / 100MB.
- [ ] Update `handleAttachmentChange` to choose limits by `kind` and append new selections to existing Bug attachments instead of replacing them.
- [ ] Update `renderAttachments` to show file size, clearer preview cards, and optional remove buttons.
- [ ] Render Bug upload preview with remove controls and keep the field optional.
- [ ] Run `pnpm test` and confirm all tests pass.

### Task 2: Runtime Verification

**Files:**
- No new source files.

- [ ] Run `pnpm test`.
- [ ] Run `docker compose up -d --build web`.
- [ ] Verify `GET http://localhost:3000` returns HTTP 200.

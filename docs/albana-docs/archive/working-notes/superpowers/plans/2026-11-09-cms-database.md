# CMS Database Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare and verify the Supabase dev data contract for CMS content and the three registration variants without changing existing public or intake behavior.

**Architecture:** PostgreSQL tables share the `public` schema. Internal tables keep RLS and no browser table grants; content tables use explicit grants and RLS. CMS routes and signed media upload are the next application stage, after database verification and admin account provisioning.

**Tech Stack:** Supabase PostgreSQL, SQL, Next.js REST catalog, Node tests.

**Spec:** `docs/archive/working-notes/superpowers/specs/2026-11-09-cms-database-design.md`

## Global Constraints

- Preserve existing tables, rows, REST catalog shape, and registration RPC.
- No invented prices, accounts, permissions, content, or consent.
- Keep sensitive rows out of public reads, including direct API requests, while keeping their tables in `public` for a simple database layout.
- Migration and checks must be idempotent and must not erase historical registrations.

## Review Focus

- `anon` can still invoke the registration RPC, but cannot read sensitive tables.
- A draft article and unapproved media cannot be selected by `anon`.
- Program and batch draft visibility remains as before.
- Rollback can disable new features without dropping stored rows.
- Historic `answers` retain variant meaning and price snapshots.

---

### Task 1: Audit and migration

**Files:** Create `web/db/cms-foundation.sql`, `web/db/verify-cms-foundation.sql`.

**Interfaces:** Consumes current `academy.sql`, `academy-content.sql`, `registration-intake.sql`. Produces public content tables, internal tables in `public`, and RLS/grants that keep sensitive rows out of the browser. These are schema-only; no UI/API contract changes.

- [x] Record current grants, policies, row counts, and RPC signatures without reading participant content.
- [x] Check that the four new tables were absent before migration; add read-only grant/RLS assertions in `verify-cms-foundation.sql`.
- [x] Write additive SQL with RLS, explicit grants, and checks. No approved content or users seeded.
- [x] Apply to dev through the schema migration tool; verify assertions, draft visibility with rollback, and advisors.
- [x] Check role privileges, REST catalog, and the registration RPC again.

### Task 2: Document the actual model

**Files:** Modify `docs/database.md`, `docs/tech.md`, `docs/implementation_plan/step-03-cms-dan-konten.md`.

**Interfaces:** Documents actual dev schema and clear future CMS requirements, with three form variants and Hostinger migration boundary.

- [x] Replace MySQL-only table map with actual Supabase PostgreSQL ownership, publication, and registration snapshots.
- [x] Mark planned CMS route/auth/upload behavior separately from implemented database behavior.
- [x] Verify local links and `git diff --check`.

### Task 3: Application CMS (separate follow-on plan)

**Files:** To be specified after database migration and provider configuration.

**Interfaces:** Admin session, editor, signed Storage upload, article routes and public contact projection consume Task 1 tables.

- [ ] Write a separate implementation plan and tests for authenticated server reads/mutations, editors, upload, and public visibility before implementing routes.


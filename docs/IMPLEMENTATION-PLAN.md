# IT Project Management System — Implementation Plan

This document describes **how** we will build the system defined in
[`IT-PROJECT-MANAGEMENT-SYSTEM.md`](./IT-PROJECT-MANAGEMENT-SYSTEM.md).

Each sidebar panel is built as its own phase, in dependency order, so that at
the end of every phase the app is in a working, demoable state.

**Status: Planning Only — no application code has been changed by this plan.**

---

## 1. Current State (what already exists)

- Frontend: Vite + React 19 + TypeScript (`src/`), Tailwind CSS.
- All panels already exist as **UI prototypes with in-memory mock data**:
  `DashboardView`, `CompaniesView`, `ProjectsView`, `TasksView`,
  `ResourcesView`, `TaskCalendarView`, `ProjectCalendarView`, `SettingsView`.
- State is held client-side in `src/context/DataContext.tsx`, seeded from
  `src/data/initialData.ts`. There is **no backend and no database yet**.
- `express` and `dotenv` are already listed as dependencies, but no server
  code exists yet.

This plan's job is to replace the mock data layer with a real MySQL-backed
API, one panel at a time, without breaking the panels that already work.

---

## 2. Tech Stack Decisions (ASSUMPTIONS — please confirm)

| Area | Decision | Why |
|---|---|---|
| Database | **MySQL** | Given by you |
| Backend runtime | **Node.js + Express** | Already a dependency; avoids introducing a second language/runtime |
| DB access | **Migration-based SQL (e.g. Knex or raw `mysql2` + a small migration runner)** | Keeps schema changes explicit and reviewable, matches "no ORM magic" style of the spec |
| Auth | **Session or JWT-based login against a `users` table** | Needed because "assignees" must be real accounts (spec §7), and every entity needs `created_by` |
| File storage (Resources) | **Local disk under `storage/resources/`** for now | Simplest MVP; see open question in Phase 7 about cloud storage later |

> ⚠️ These are reasonable defaults, not commitments. If you have a preferred
> ORM/migration tool or want auth handled differently, say so before Phase 0
> starts — everything downstream assumes this stack.

---

## 3. Repository Structure Changes

```
IT-Operations/
├── src/                     # existing frontend (untouched structure)
├── server/                  # NEW — backend API (Express), created in Phase 0
│   ├── db/                  #   migrations + seeds
│   ├── routes/              #   one file per resource (companies.ts, projects.ts, ...)
│   └── ...
├── storage/
│   └── resources/           # NEW — uploaded resource files (created now)
└── docs/
    ├── IT-PROJECT-MANAGEMENT-SYSTEM.md
    └── IMPLEMENTATION-PLAN.md   (this file)
```

The `storage/resources/` directory has been created already (with a
`.gitkeep`) so Phase 7 has somewhere to write to. Its contents are
git-ignored — only the folder itself is tracked.

### 3.1 Resource file storage convention

```
storage/resources/<project_id>/<uuid>__<original-filename>
```

- The DB row stores the relative path, original filename, mime type, and
  size — never the raw file blob in MySQL.
- No credentials/secrets are ever stored as a resource file or resource
  text field, per the spec's explicit constraint (§4).
- `Link` and `Domain` type resources don't touch this folder at all — they
  just store a URL/hostname string in the DB.

---

## 4. Phase Overview

| # | Phase | Panel? | Depends on |
|---|---|---|---|
| 0 | Foundation (DB, API skeleton, auth/users) | — (infra) | — |
| 1 | Companies | ✅ Companies | Phase 0 |
| 2 | Projects | ✅ Projects | Phase 1 |
| 3 | Task Types | ✅ Settings → Task Types | Phase 0 |
| 4 | Task Levels | ✅ Settings → Task Levels | Phase 0 |
| 5 | IT Assignees / Team Members | ✅ Settings → Assignees | Phase 0 |
| 6 | Tasks + Subtasks | ✅ Tasks | Phases 2, 3, 4, 5 |
| 7 | Resources | ✅ Resources | Phase 2 |
| 8 | Dashboard | ✅ Dashboard | Phases 1, 2, 6, 7 |
| 9 | Task Calendar | ✅ Task Calendar | Phase 6 |
| 10 | Project Calendar | ✅ Project Calendar | Phase 2 |
| 11 | Roles & Permissions hardening | — (cross-cutting) | All above |
| 12 | QA, Testing & Deployment prep | — | All above |

Phases 3, 4, and 5 have no dependency on each other or on Phase 2, so they
can be done in any order (or in parallel) — they're sequenced here only
because they're grouped under "Settings" in the sidebar.

---

## 5. Phase 0 — Foundation

**Goal:** a running MySQL-backed API with authentication, that the existing
frontend can eventually talk to. No business panels yet.

- Set up MySQL connection config via environment variables
  (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).
- Create migration tooling and the first migration: `users` table
  (id, name, email, password_hash, role, status `active`/`inactive`,
  timestamps). This **is** the one true user model — later phases (esp.
  Phase 5) build UI on top of it, never a second one (spec §7, §17).
- Roles at minimum: `admin`, `it_manager`, `it_staff` (who can assign/
  reassign work is enforced using these — see Phase 11).
- Basic Express app skeleton: health check route, error handling, auth
  middleware, login endpoint.
- Wire the frontend to call this API base URL instead of `initialData.ts`
  (a thin `api/` client layer), but keep `DataContext` shape the same so
  components don't need to change yet.

**Definition of done:** can log in, get a session/token, hit a protected
`/api/health` route, and the `users` table exists in MySQL.

---

## 6. Phase 1 — Companies

**Goal:** Companies panel is fully real (spec §2).

- Migration: `companies` table — id, name, contact_person, contact_email,
  contact_phone, description/industry, status, timestamps.
- API: `GET/POST /api/companies`, `GET/PATCH/DELETE /api/companies/:id`.
- Frontend: `CompaniesView` + related modals read/write through the API
  instead of `DataContext` mock array.

**Definition of done:** create/edit/list/archive a company end-to-end,
data persists in MySQL after a page reload.

---

## 7. Phase 2 — Projects

**Goal:** Projects panel is fully real (spec §3).

- Migration: `projects` table — id, company_id (FK → companies), name,
  description, start_date, deadline_date, status, manager_id (FK → users),
  created_by (FK → users), timestamps.
- Progress calculation: derived, not stored — `% = completed_tasks /
  total_tasks` for that project (recomputed on read; revisit if this gets
  slow). Documented already in the spec (§3); this phase implements it as
  a SQL aggregate or computed field in the API response.
- API: `GET/POST /api/companies/:companyId/projects`,
  `GET/PATCH/DELETE /api/projects/:id`.
- Frontend: `ProjectsView` wired to API; company detail view shows its
  projects.

**Definition of done:** a company can have multiple projects, deleting/
disabling a company's effect on its projects is decided and enforced
(see Open Questions).

---

## 8. Phase 3 — Task Types

**Goal:** configurable Task Types (spec §8), used by Phase 6.

- Migration: `task_types` table — id, name, description, color, timestamps.
- Seed the defaults from the spec (Development, Bug Fix, Testing,
  Deployment, Design, Documentation, Research, Maintenance).
- API + `SettingsView` CRUD for admins/IT managers only.

**Definition of done:** task types are DB-backed and editable from Settings,
not hardcoded.

---

## 9. Phase 4 — Task Levels

**Goal:** configurable Task Levels (spec §9), used by Phase 6.

- Migration: `task_levels` table — id, name, badge/dot styling, timestamps.
- Seed defaults (Low, Normal, High, Critical).
- API + `SettingsView` CRUD, same permission model as Task Types.

**Definition of done:** same as Phase 3, for levels.

---

## 10. Phase 5 — IT Assignees / Team Members

**Goal:** the admin-facing panel for managing who can be assigned work
(spec §7). This does **not** create a new table — it's CRUD/admin UI on
top of the `users` table from Phase 0.

- API: `GET /api/users` (filterable by active/inactive), `PATCH
  /api/users/:id` (role, active/inactive), invite/create endpoint.
- Frontend: rename the `DepartmentAssignee` type/panel — see naming
  decision below — and wire it to `/api/users`.
- Inactive users stay in the system (for history on old tasks) but are
  excluded from "assign to" dropdowns everywhere.

**Naming decision (spec §13 asks this be made explicitly, not silently):**
recommend renaming `DepartmentAssignee` → **`ITAssignee`** (or `TeamMember`)
throughout the codebase, and the sidebar label to **"IT Assignees"**, since
"Department Assignees" is a leftover from the old department-based model
this system explicitly replaces (spec §14). This is a naming/UI change,
executed in this phase.

**Definition of done:** admins can list, deactivate, and change roles of
IT staff; assignment dropdowns elsewhere only show active staff.

---

## 11. Phase 6 — Tasks + Subtasks

**Goal:** Tasks panel fully real (spec §5), including subtasks (spec §6).

- Migration: `tasks` table — id, project_id (FK), title, description,
  assigned_to (FK → users, nullable), task_type_id (FK), task_level_id
  (FK), status, start_time, deadline, notes, created_by (FK), timestamps.
- Migration: `subtasks` table — id, task_id (FK → tasks, **not** directly
  to projects — a subtask always inherits its parent task's project per
  the spec's default recommendation, §6), title, assignee_id (nullable),
  status, deadline, timestamps.
- Enforce task lifecycle in the API: `Unassigned → Assigned → In Progress
  → Completed`, with `Cancelled` reachable from any non-completed state.
  Assigning a task (setting `assigned_to`) is what moves it out of
  `Unassigned`.
- API: nested CRUD (`/api/projects/:id/tasks`, `/api/tasks/:id/subtasks`)
  plus a flat `/api/tasks` for the calendar/dashboard views.
- Frontend: `TasksView` + `TaskDetailModal` wired to API; subtask list
  lives inside the task detail view, matching the current UI.

**Definition of done:** full task + subtask CRUD and status transitions
persist in MySQL; only admin/IT manager roles can assign/reassign
(enforced here, finalized in Phase 11).

---

## 12. Phase 7 — Resources

**Goal:** Resources panel fully real (spec §4), including file upload.

- Migration: `resources` table — id, project_id (FK), name, type
  (`Domain`/`File`/`Report`/`Document`/`Link`/`Other`), description,
  reference (URL/hostname string **or** stored file path), added_by (FK),
  timestamps.
- File upload endpoint writes into `storage/resources/<project_id>/...`
  (convention from §3.1) and stores the relative path + metadata in the
  `reference`/companion columns — raw file bytes never go into MySQL.
- Explicitly reject any attempt to store passwords/credentials as plain
  resource text (spec §4) — add a lightweight pattern check or, at
  minimum, a documented policy + admin warning in the UI.
- API: `GET/POST /api/projects/:id/resources`, file upload/download
  endpoints, `DELETE /api/resources/:id` (also deletes the file on disk).
- Frontend: `ResourcesView` wired to API, with a real file picker for
  type `File`.

**Definition of done:** uploading a file resource actually stores a file
under `storage/resources/`, and it can be downloaded back; DB never holds
raw file contents or secrets.

---

## 13. Phase 8 — Dashboard

**Goal:** small, fast summary view (spec §10) — explicitly not a BI tool.

- API: a handful of aggregate endpoints (counts, "open tasks", "overdue
  tasks", project overview rows, upcoming tasks, upcoming deadlines,
  resource summary) — all backed by simple SQL aggregates over tables
  from Phases 1, 2, 6, 7.
- Frontend: `DashboardView` wired to these endpoints, replacing mock data.

**Definition of done:** dashboard numbers match what's actually in MySQL,
with no client-side recomputation of large datasets.

---

## 14. Phase 9 — Task Calendar

**Goal:** dedicated task calendar (spec §11).

- API: `GET /api/tasks/calendar` with filters (company, project, assignee,
  task type, task level, status) as query params.
- Frontend: `TaskCalendarView` wired to the filtered endpoint.

**Definition of done:** calendar reflects real task start/deadline dates
and supports all listed filters.

---

## 15. Phase 10 — Project Calendar

**Goal:** dedicated project calendar (spec §12), kept separate from the
task calendar's purpose.

- API: `GET /api/projects/calendar` (start_date, deadline_date, status,
  company).
- Frontend: `ProjectCalendarView` wired to this endpoint.

**Definition of done:** shows project-level timelines only — no task-level
detail leaks into this view.

---

## 16. Phase 11 — Roles & Permissions Hardening

**Goal:** finalize the "who can do what" questions raised throughout the
spec (§7), now that every entity exists to test against.

- Confirm and enforce: who can create companies/projects, who can assign/
  reassign tasks, who can edit Settings (Task Types/Levels/Assignees).
- Add server-side authorization checks to every mutating endpoint from
  Phases 1–10 (not just UI-level hiding of buttons).

**Definition of done:** attempting a forbidden action via the API directly
(not just the UI) is rejected with 403.

---

## 17. Phase 12 — QA, Testing & Deployment Prep

- Backend: integration tests per resource (CRUD + status transitions +
  auth checks) against a test MySQL database.
- Frontend: smoke tests for each panel's happy path.
- Seed script for demo/staging data.
- Deployment checklist (env vars, migrations run on deploy, storage
  volume for `storage/resources/` persists across deploys).

**Definition of done:** `npm test` (or equivalent) passes for both
frontend and backend; a fresh checkout + migration + seed produces a
working app.

---

## 18. Open Questions

These need a decision before or during the relevant phase — not silently
assumed:

1. **ORM/migration tool** — Knex, plain `mysql2` + hand-written migrations,
   or something else? (Phase 0)
2. **Auth mechanism** — server-side sessions vs. JWT? Any SSO requirement?
   (Phase 0)
3. **Deleting a Company** — soft-delete/archive only, or hard delete
   cascading to its projects/tasks/resources? Recommend **soft delete**
   (status-based) given client data sensitivity. (Phase 1/2)
4. **File size/type limits** for uploaded resources, and whether local
   disk storage is acceptable long-term vs. S3-compatible storage later.
   (Phase 7)
5. **Assignee naming** — confirm `ITAssignee` vs. `TeamMember` vs. keeping
   "Department Assignees" (recommendation above is `ITAssignee` /
   "IT Assignees"). (Phase 5)
6. **Progress calculation edge case** — a project with zero tasks: shows
   0% or "N/A"? Recommend "N/A"/em-dash rather than 0%, since 0% implies
   work exists and none is done. (Phase 2)

---

## Status: Planning / Specification Only

No migrations, controllers, models, routes, or frontend files have been
created or modified as part of this plan — only this document and the
empty `storage/resources/` directory (for Phase 7) have been added.
Implementation should begin phase-by-phase only after this plan is
reviewed and approved, starting with **Phase 0** then **Phase 1
(Companies)**.

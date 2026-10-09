# Smart Campus Analytics — Backend Implementation Tasks

**Purpose:** Execution checklist for the backend owner and coding agent. Complete tasks in order; do not skip the acceptance gates.

## Working instruction for Antigravity

Read `RULES.md`, `MEMORY.md`, `PRD.md`, `ARCHITECTURE.md`, and `DESIGN.md` first. Inspect the repository before changing files. Preserve existing work and use the current project conventions when they do not conflict with these contracts. Begin with Phase 0; do not try to implement everything in one unreviewed pass.

## Phase 0 — Repository and contract audit

- [x] Inspect the repository, package manager, existing app structure, scripts, and current changes.
- [x] Identify existing frontend/ML/backend directories; do not overwrite unrelated modules.
- [x] Summarize proposed backend file structure and any conflict with these docs.
- [x] Confirm environment/deployment constraints without printing secrets.
- [x] Create/update `.env.example` with placeholders only.
- [x] Create a contract checklist for endpoints and data categories.

**Acceptance gate:** We understand the current repository and have a safe implementation plan. Existing work is preserved. (PASSED)

## Phase 1 — Express service foundation

- [x] Set up/complete Node.js + Express service using current repo conventions.
- [x] Add startup configuration validation, JSON parsing and request size limits.
- [x] Add CORS configuration driven by allowed frontend origins.
- [x] Add request ID, centralized error handling and safe production error responses.
- [x] Implement `GET /health/live` and `GET /health/ready`.
- [x] Add `npm run dev`, `npm start`, and test/lint scripts as appropriate to the repository.
- [x] Add API documentation scaffold/OpenAPI contract.

**Acceptance gate:** App starts locally; liveness works without MongoDB; readiness accurately reports dependency state; production configuration contains no hard-coded secret. (PASSED)

## Phase 2 — MongoDB and domain schemas

- [x] Connect using `MONGODB_URI` and fail clearly on required connection errors.
- [x] Add schemas/models for users, students, seven source-data categories, imports, scores, predictions, segments, intervention catalog, interventions, scenarios and audit events as needed for current endpoint phase.
- [x] Add unique/compound indexes and schema/range validation.
- [x] Define DTO/serialization boundaries so raw persistence documents are not returned.
- [x] Add small synthetic seed fixtures and a documented reset/seed command for local/demo use.
- [x] Seed only placeholder demo users/passwords for local use; never seed production credentials.

**Acceptance gate:** Database models validate important constraints, stable student IDs are unique, and fixtures can be inserted into a local/test database reproducibly. (PASSED)

## Phase 3 — Authentication and role authorization

- [x] Implement login with password verification and JWT issuing.
- [x] Implement authentication middleware and `GET /auth/me`.
- [x] Implement admin-only user provisioning or an equivalent safe demo seed workflow.
- [x] Add roles: admin, faculty, placement_officer, student.
- [x] Add object-level checks so students can read only their own protected records.
- [x] Test expired/invalid token, inactive user, wrong role and cross-student access.

**Acceptance gate:** Protected routes deny unauthenticated calls; students cannot read another student's data even if they guess the ID; public requests cannot choose their own role. (PASSED)

## Phase 4 — Student profiles and integrated data

- [x] Implement student create/list/search/detail/update endpoints with pagination.
- [x] Implement a consistent stable `studentId` across all related records.
- [x] Implement CSV/JSON import preview and commit for all seven categories.
- [x] Validate input schema, range constraints, duplicates, missing IDs and date formats.
- [x] Return an import report with accepted/rejected/warning counts and bounded row errors.
- [x] Ensure missing values remain missing instead of silently becoming zero.
- [x] Add example import files or API fixtures so frontend and ML can test independently.

**Acceptance gate:** Each of the seven categories can be represented and imported; a malformed dataset produces actionable errors without corrupting existing data; successful imports link to students consistently. (PASSED)

## Phase 5 — Student Success Score

- [x] Confirm the formula and weights with the product/team before claiming a final score definition.
- [x] Define normalization, component scores, missing-data treatment, formula version and explanation output.
- [x] Implement score service independently from route/controller code.
- [x] Implement get/recalculate endpoints and persist versioned score snapshots.
- [x] Add unit tests for boundaries, missing fields, out-of-range data and repeatability.
- [x] Write a concise methodology note after the formula is approved.

**Acceptance gate:** Same valid input + same formula version produces the same result; output includes component drivers, missing fields and formula version; output is clearly not a probability. (PASSED)

## Phase 6 — ML service integration

- [x] Obtain the ML teammate's exact feature/target schema and inference API details.
- [x] Create/approve `ML_CONTRACT.md` before real integration if the team needs a standalone contract.
- [x] Implement a small ML client with configurable `ML_SERVICE_URL`, timeout, bounded safe retry policy and response validation.
- [x] Build features using an explicit feature builder and `as_of_date`; avoid target leakage.
- [x] Implement prediction generation, persistence, history retrieval and stable error responses.
- [x] Handle ML timeout, offline service, invalid output, unsupported target and model-version mismatch.
- [x] Never fabricate predictions when the ML service is missing.

**Acceptance gate:** Backend can call a local mocked ML service in tests; request/response matches the agreed contract; ML failure becomes a stable error and does not create a fake prediction record. (PASSED)

## Phase 7 — Institution analytics and segmentation

- [ ] Implement overview KPI endpoint based on actual data and explain available-data coverage.
- [ ] Implement trends and risk-summary endpoints with filters and bounded queries.
- [ ] Implement explainable segment rules and membership rebuild.
- [ ] Keep aggregates authorized; do not leak individual records through cohort endpoints.
- [ ] Test empty data, mixed periods, pagination/filters and inconsistent/missing category data.

**Acceptance gate:** Metrics derive from stored records; definitions and time windows are explicit; empty or missing data does not show invented counts or imply zero risk.

## Phase 8 — Intervention catalog and Sandbox

- [ ] Implement intervention catalog with versioned eligibility rules and capacity units.
- [ ] Implement scenario creation and validation.
- [ ] Implement deterministic selection/allocation strategies (targeted, uniform, mixed) using explicit rules.
- [ ] Return selected/excluded student reasons, capacity use, resource summary, rule version and assumptions.
- [ ] Do not fabricate outcome uplift; outcome estimates remain absent unless a validated method is available.
- [ ] Require authorized human approval before turning a scenario into assignments.
- [ ] Implement intervention assignment, status/progress updates and outcome recording.
- [ ] Test capacity limits, duplicate assignment, invalid strategy, role access and approval state transitions.

**Acceptance gate:** A scenario respects capacity; repeated runs on the same frozen input and version are reproducible; output separates assumptions from observations; interventions are created only after permitted approval.

## Phase 9 — Feedback, audit and optional copilot integration

- [ ] Implement feedback submission and authorized aggregated summaries.
- [ ] Ensure raw comments have restricted access and are not automatically model features.
- [ ] Add minimal audit events for imports, user provisioning, scenario approval and privileged actions.
- [ ] Implement a copilot route only after a provider/contract is approved; route only through authorized backend services.
- [ ] Do not allow arbitrary LLM-generated database queries.

**Acceptance gate:** Feedback privacy and role boundaries are tested; audit events avoid secrets; if copilot is not configured, API behavior is explicit rather than deceptive.

## Phase 10 — Deployment and integration hardening

- [ ] Add production Render configuration and start command.
- [ ] Configure MongoDB Atlas URI and least-privilege database access using service secrets.
- [ ] Configure CORS using the exact Vercel frontend origin(s).
- [ ] Configure ML endpoint URL and any agreed service-to-service protection.
- [ ] Verify no secret or local-only URL is committed.
- [ ] Test production-like health checks, startup, database failure and ML failure.
- [ ] Publish OpenAPI docs and a small API smoke-test collection/script.
- [ ] Run full regression tests and fix integration contract mismatches.

**Acceptance gate:** Deployed frontend can call backend, backend can access Atlas and call the deployed ML service, and a complete path from student data to prediction/dashboard response works.

## Required integration demo

Demonstrate one end-to-end vertical slice:
1. Authorized staff logs in.
2. A student record and records from multiple categories are available/imported.
3. Backend returns a documented Success Score with components.
4. Backend requests a prediction from the ML service (or clearly demonstrates a mock in test mode).
5. The response is stored and returned to the authorized frontend.
6. Staff creates and runs a capacity-limited intervention scenario.
7. Staff approves a plan, assignments are persisted, and progress/outcomes can be updated.

## Definition of done for each task

- Code follows `RULES.md`.
- A validation path/test has been added or updated.
- API schemas/docs and any shared contract are up to date.
- Role access is tested for protected data.
- No hardcoded secret, fabricated prediction, or silent missing-data-to-zero conversion has been introduced.
- Relevant decisions/state are updated in `MEMORY.md`.

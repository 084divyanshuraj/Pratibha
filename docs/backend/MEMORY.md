# Smart Campus Analytics — Backend Working Memory

**Purpose:** Persistent context for coding agents and team handoffs. Keep this concise and update it when a decision changes.

## Project goal

Build the backend and MongoDB layer for the KPMG Smart Campus Analytics hackathon project. The platform unifies student data, calculates a transparent Student Success Score, identifies academic/placement risks, and supports interventions and a resource-aware Intervention Sandbox.

## Current agreed decisions

- Primary database: MongoDB Atlas.
- Backend: Node.js + Express REST API.
- Backend deployment: Render.
- Frontend deployment: Vercel.
- ML inference: separate Python + FastAPI service, expected to deploy on Render.
- Model training is owned by the ML teammate; backend does not train models.
- Frontend, backend and ML integrate through documented HTTP/JSON contracts.
- Shared API prefix: `/api/v1`.
- Backend is the source of truth for auth/permissions, persisted data, Success Score calculations, ML orchestration and intervention allocation rules.
- Use a modular monolith initially; do not introduce microservices beyond the separate ML inference service.
- Institution Portal and Student Portal consume the same backend but have different authorization scopes.
- The Intervention Sandbox is our differentiator. Initial allocation/simulation logic must be deterministic, transparent and testable.
- Every mandatory problem-statement requirement remains higher priority than optional polish.

## Data categories to support

Academic, Attendance, LMS, Engagement, Placement, Skills, and Feedback. Use a stable `studentId`/API `student_id` mapping consistently. Missing data is not zero.

## Key domain distinctions

- **Student Success Score:** deterministic composite indicator, not a probability.
- **Risk prediction:** output of a defined and evaluated model or clearly labelled rule.
- **Scenario simulation:** hypothetical comparison with explicit assumptions and resource limits.
- **Causal impact:** cannot be claimed from a risk prediction or a simple before/after comparison alone.
- Never fabricate accuracy, risk probabilities, predictions, or improvement percentages.

## Contract rules

- Frontend calls backend only. Browser must not call MongoDB or the ML service directly.
- Backend calls ML through `ML_SERVICE_URL`, validates input/output and persists accepted result snapshots.
- Stable JSON success/error envelope is defined in `DESIGN.md`.
- Keep shared field names unchanged unless all consumers and tests are updated.
- API routes live under `/api/v1`; health checks live at `/health/live` and `/health/ready`.
- Model request features are not final until the ML teammate documents their schema and target labels.

## Authorization expectations

Roles: `admin`, `faculty`, `placement_officer`, `student`. No public user can self-assign an elevated role. A student may see only their own protected records. Enforce authorization at the backend on every route; UI hiding is not security.

## Documents to read

1. `RULES.md` — hard constraints for implementation.
2. `PRD.md` — backend scope and requirements.
3. `ARCHITECTURE.md` — components, data flow and deployment.
4. `DESIGN.md` — MongoDB and API contracts.
5. `TASK.md` — implementation order and acceptance criteria.

## Current project state

- Monorepo layout confirmed (Option B):
  - `docs/backend/` — architecture and contracts
  - `backend/` — Node.js + Express application
  - `frontend/` — reserved for frontend teammate
  - `ml-service/` — reserved for Python + FastAPI ML teammate
- Phase 0 (Repository & contract audit) completed and verified.
- Phase 1 (Express service foundation) completed and verified:
  - Backend initialized inside `backend/` with Express, Helmet, CORS, Morgan, and native `node:test` + Supertest.
  - Startup environment validation in `backend/src/config/env.js`.
  - Request ID tracking via `requestIdMiddleware` (`req.id` / `X-Request-Id`).
  - Strict CORS origin whitelisting in `backend/src/middleware/cors.js`.
  - Centralized error handler and 404 handler matching `DESIGN.md` envelopes.
  - Safe health probes: `GET /health/live` (process liveness) and `GET /health/ready` (dependency readiness reporting, 0 secrets exposed, 503 when disconnected).
  - Base API router scaffold at `GET /api/v1`.
  - OpenAPI 3.0 specification scaffold in `docs/backend/openapi.yaml`.
  - Automated tests: 12 tests passed across 3 test suites with 0 failures.

- Phase 2 (MongoDB and domain schemas) completed and verified:
  - Mongoose ODM installed and integrated with database lifecycle manager (`backend/src/db/connection.js`).
  - Safe logging (credentials masked) and seamless readiness probe hook (`/health/ready` accurately reflects Mongoose readyState).
  - Implemented 18 domain models in `backend/src/models/` matching `DESIGN.md`: `User`, `Student`, `AcademicRecord`, `AttendanceRecord`, `LmsActivity`, `EngagementRecord`, `PlacementAssessment`, `SkillAssessment`, `FeedbackRecord`, `Import`, `StudentFeature`, `StudentScore`, `RiskPrediction`, `StudentSegment`, `InterventionCatalog`, `Intervention`, `SimulationScenario`, and `AuditEvent`.
  - Added unique and compound indexes for fast lookups and constraint enforcement.
  - Added schema validation constraints (e.g. `classesAttended <= classesHeld`, `marksObtained <= maxMarks`, `assignmentsCompleted <= assignmentsAssigned`, score bounds, rating bounds, role enums).
  - Created DTO serializers in `backend/src/serializers/index.js` preventing leakage of `passwordHash` or internal `__v` fields.
  - Created synthetic demonstration fixtures (`backend/src/db/seeds/fixtures.js`) across all 4 roles and all 7 data categories.
  - Implemented CLI seed command (`npm run seed`) in `backend/scripts/seed.js` with bcrypt password hashing and strict production protection flags.
  - Automated tests: 35 tests passed across 4 test suites with 0 failures.

- Phase 3 (Authentication and role authorization) completed and verified:
  - Installed `jsonwebtoken` and configured JWT signing and verification with `config.jwtSecret` and `config.jwtExpiresIn`.
  - Implemented `auth.service.js` for login, JWT issuance, token verification, and user provisioning.
  - Implemented `authenticate` middleware enforcing Bearer tokens, checking user existence and `isActive` state.
  - Implemented `authorizeRoles(...roles)` middleware enforcing RBAC across `admin`, `faculty`, `placement_officer`, and `student`.
  - Implemented `authorizeStudentScope` object-level authorization middleware ensuring students can only access their own student records (`req.user.studentId === req.params.studentId`).
  - Implemented `POST /api/v1/auth/login` and `GET /api/v1/auth/me` with standard response envelopes and user DTOs (strictly excluding `passwordHash`).
  - Implemented `POST /api/v1/institution/users` for admin-only user provisioning with bcrypt password hashing.
  - Updated OpenAPI 3.0 specification (`docs/backend/openapi.yaml`) with auth and institution user endpoints, DTO schemas, and BearerAuth security scheme.
  - Updated `docs/backend/CONTRACT_CHECKLIST.md` marking completed auth routes and collections.
  - Automated tests: 53 tests passed across 5 test suites with 0 failures.

## Completed phases

- **Phase 0:** Repository & contract audit, `.gitignore`, `.env.example`, `CONTRACT_CHECKLIST.md`. (PASSED)
- **Phase 1:** Express service foundation, security middleware, health probes (`/health/live`, `/health/ready`), centralized errors, OpenAPI scaffold, and automated tests. (PASSED)
- **Phase 2:** MongoDB Atlas connectivity, 18 Mongoose domain models, compound indexes, constraints validation, DTO serializers, synthetic fixtures, and `npm run seed`. (PASSED)
- **Phase 3:** Authentication & role authorization (`/auth/login`, `/auth/me`, `/institution/users`), JWT issuance/verification, RBAC, object-level student scoping, and security tests. (PASSED)

## Coding-agent next action

Wait for user review of Phase 3 authentication and authorization implementation. Upon review approval, proceed to Phase 4 (Student profiles and integrated data: student CRUD, pagination/filtering, CSV/JSON import preview & commit for all 7 categories with row error reports and data-quality feedback).

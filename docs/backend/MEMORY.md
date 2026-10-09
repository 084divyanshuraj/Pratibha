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

- Phase 4 (Student profiles and integrated data) completed and verified:
  - Installed `multer` (for in-memory file uploads) and `csv-parse` (with `relax_column_count: true`).
  - Implemented `student.service.js`, `student.controller.js`, `student.routes.js`:
    - `GET /api/v1/students`: Staff only, paginated (`page`, `limit`), filterable (`department`, `semester`, `cohort`, `status`), substring search (`studentId`, `firstName`, `lastName`, `email`).
    - `POST /api/v1/students`: Admin only, validates uniqueness of stable uppercase `studentId`, returns 201 with `StudentDTO`.
    - `GET /api/v1/students/:studentId`: Staff or owner student (`authorizeStudentScope`), 404 if not found.
    - `PATCH /api/v1/students/:studentId`: Admin or faculty only, prevents modifying immutable `studentId`, updates allowed profile fields.
    - `GET /api/v1/students/:studentId/records`: Staff or owner student, aggregates records across all 7 categories (`academic`, `attendance`, `lms`, `engagement`, `placement`, `skills`, `feedback`). Enforces feedback privacy: students cannot view `staff_only` feedback.
  - Implemented `ingestion.service.js`, `ingestion.controller.js`, `ingestion.routes.js`:
    - `POST /api/v1/imports/:datasetType/preview`: Admin dry-run validation returning accepted/rejected/warning counts, sample valid records, and bounded row errors without touching DB.
    - `POST /api/v1/imports/:datasetType`: Admin batch commit, tags persisted records with `sourceImportId`, creates `Import` log with status (`completed`, `partially_imported`, `failed`), returns `importId`.
    - `GET /api/v1/imports/:importId`: Admin inspection of import job and bounded row errors.
    - Supports all 7 data categories plus bulk student import.
    - Missing data rule strictly enforced: empty/missing values remain `null` and are never silently coerced to zero.
    - Created sample dataset files in `backend/data/samples/` (`students.csv`, `academic.csv`, `attendance.csv`, `lms.csv`, `engagement.csv`, `placement.csv`, `skills.csv`, `feedback.csv`).
  - Updated OpenAPI 3.0 specification (`docs/backend/openapi.yaml`) and `CONTRACT_CHECKLIST.md`.
  - Automated tests: 82 tests passing across 36 test suites with 0 failures.

- Phase 5 (Student Success Score) completed and verified:
  - Designed explainable, transparent composite indicator `sss-v1` across 5 pillars (academic 35%, attendance 20%, lms 15%, placement_skills 20%, engagement 10%).
  - Implemented pure calculation engine in `backend/src/scores/score.calculator.js`:
    - Strict missing-data policy: weights dynamically renormalize across available components so students with unobserved domains are never penalized with zero.
    - Explicit `dataCompleteness` metric (0–100%) and `missingFields` tracking.
    - Explainable contribution drivers generated for every evaluated domain.
  - Implemented service layer in `backend/src/scores/score.service.js`:
    - Versioned persistence in `StudentScore` collection.
    - `getStudentScore`: returns existing snapshot or computes and persists on demand.
    - `recalculateStudentScore`: refreshes snapshot from live category records.
  - Implemented controller and endpoints in `student.routes.js`:
    - `GET /api/v1/students/:studentId/success-score`: staff or owner student (`authorizeStudentScope`).
    - `POST /api/v1/students/:studentId/success-score/recalculate`: staff only.
  - Documented complete formulation in `docs/backend/SUCCESS_SCORE_METHODOLOGY.md`.
  - Updated OpenAPI specification (`docs/backend/openapi.yaml`) and `CONTRACT_CHECKLIST.md`.
  - Automated tests: 100 tests passing across 42 test suites with 0 failures (12 pure formula unit tests + 6 API integration tests).

- Phase 6 (ML service integration) completed and verified:
  - Documented complete shared ML inference contract in `docs/backend/ML_CONTRACT.md` based on teammate's trained models in `models/model_metadata.json` (`academic_risk` ~91% accuracy, `placement_risk` ~69% accuracy).
  - Implemented `backend/src/ml/feature.builder.js`:
    - Constructs exact 17 features: `cgpa`, `backlogs`, `overall_attendance_pct`, `lms_assignment_completion_pct`, `lms_logins_per_week`, `aptitude_score`, `coding_skills`, `dsa_score`, `system_design`, `internships`, `projects_count`, `certifications`, `hackathons`, `open_source`, `communication_skills`, `ml_knowledge`, `faculty_feedback_rating`.
    - Enforces strict `asOfDate` cutoff filtering across all 7 categories to prevent target leakage.
    - Captures source record watermarks.
  - Implemented resilient ML client in `backend/src/ml/ml.client.js`:
    - Configurable `ML_SERVICE_URL`, timeout (`5000ms`), and abort signals.
    - Pluggable mock inference handler for deterministic testing.
    - Zero-fabrication error policy: returns 503/504 and never fabricates synthetic predictions on service failure.
  - Implemented service layer in `backend/src/ml/ml.service.js`:
    - Persists `StudentFeature` vectors.
    - Manages versioned `RiskPrediction` records (`valid` vs `superseded`).
  - Mounted REST endpoints in `backend/src/students/student.routes.js`:
    - `GET /api/v1/students/:studentId/predictions`: staff or owner student (`authorizeStudentScope`).
    - `POST /api/v1/students/:studentId/predictions`: staff only.
  - Updated OpenAPI spec (`docs/backend/openapi.yaml`) and `CONTRACT_CHECKLIST.md`.
  - Automated tests: 110 tests passing across 46 test suites with 0 failures (3 unit tests for features and leakage + 7 API integration tests including zero-fabrication safety gate).

- Phase 7 (Institution analytics and segmentation) completed and verified:
  - Implemented Analytics Engine in `backend/src/analytics/analytics.service.js`:
    - `getOverviewKpis`: returns student counts (`total`, `active`, `inactive`), Success Score distribution (`critical`, `moderate`, `good`, `excellent`), decoupled independent risk counts (`academicRisk` and `placementRisk` with `unassessed` tracking), 7-category data coverage metrics, and human-readable `coverageNotes`.
    - `getTrends`: time-series performance and attendance trends grouped by period.
    - `getRiskSummary`: department and semester breakdowns, top cohort risk drivers, and decoupled risk divergence detection (identifying high academic standing with high placement risk).
  - Implemented Segmentation Engine in `backend/src/segments/segment.service.js` & `segment.definitions.js`:
    - 5 explainable, versioned (`v1`) supportive archetypes matching KPMG Challenge brief:
      1. `high_academic_low_placement`: CGPA >= 7.5 or Academic >= 75% with Placement Assessment < 60% or High Placement Risk.
      2. `attendance_critical_risk`: Overall attendance < 75%.
      3. `lms_disengaged`: Assignment completion < 50% or logins per week < 2.
      4. `high_potential_achievers`: Success Score >= 85 and CGPA >= 8.5.
      5. `holistic_support_needed`: Success Score < 60, active backlogs >= 2, or High Academic Risk.
    - Versioned persistence in `StudentSegment` collection (`criteriaVersion: 'v1'`, `studentIds`, aggregate `indicators`, `generatedAt`).
    - Seed script integration: `npm run seed` automatically triggers `rebuildSegments()` for initial demonstration data.
  - Mounted REST Endpoints in `backend/src/api/v1/index.js`:
    - `GET /api/v1/analytics/overview`: staff only (`admin`, `faculty`, `placement_officer`).
    - `GET /api/v1/analytics/trends`: staff only.
    - `GET /api/v1/analytics/risk-summary`: staff only.
    - `GET /api/v1/segments`: staff only; returns definitions and member counts (studentIds omitted by default for privacy).
    - `POST /api/v1/segments/rebuild`: admin and faculty only; recomputes segment memberships.
    - `GET /api/v1/segments/:segmentKey`: staff only; detailed criteria and member student IDs.
  - Updated OpenAPI spec (`docs/backend/openapi.yaml`) and `CONTRACT_CHECKLIST.md`.
  - Automated tests: 126 tests passing across 54 test suites with 0 failures (16 new tests across `analytics.test.js` and `segments.test.js`).

- Phase 8 (Intervention catalog and Sandbox) completed and verified:
  - Implemented Catalog Service in `backend/src/interventions/catalog.service.js`:
    - `listCatalog`, `getCatalogEntry`, `upsertCatalogEntry` (admin only).
    - Manages versioned eligibility rules, capacity units, and duration.
  - Implemented Deterministic Simulation Engine in `backend/src/interventions/simulation.engine.js`:
    - Strict capacity enforcement against `capacityConstraints`.
    - Strategies: `targeted` (need/deficit prioritized), `uniform` (order-based), `mixed` (multi-criteria hybrid).
    - Explicit reasons for allocated and excluded students (e.g. "Exceeded capacity limit of 2 seats").
    - Transparent assumptions generated with zero outcome fabrication (`outcomeEstimates: null`, `estimateMethod: 'none'`).
    - Repeatable and deterministic across frozen inputs.
  - Implemented Scenario Lifecycle & Human Approval in `backend/src/interventions/simulation.service.js`:
    - `createScenario`: creates draft scenario.
    - `runScenario`: runs allocation engine, stores results and resource summary, marks status as `simulated`.
    - `getScenario`: retrieves full simulation report.
    - `approveScenario`: human-in-the-loop gate requiring admin/faculty approval; transitions status to `approved` and creates official, persistent `Intervention` documents in MongoDB.
  - Implemented Intervention Tracking & Outcomes in `backend/src/interventions/intervention.service.js`:
    - `listInterventions`: paginated, object-level student scoping (students see own only; staff can filter).
    - `getInterventionById`: student authorization gate preventing cross-student inspection.
    - `updateInterventionStatus`: transitions status (`assigned`, `in_progress`, `completed`, `cancelled`) and records participation metrics.
    - `recordOutcomes`: records observed outcomes with timestamps.
  - Mounted REST Endpoints in `backend/src/api/v1/index.js`:
    - `/api/v1/intervention-catalog` (GET, POST)
    - `/api/v1/simulations` (POST, GET, run, approve)
    - `/api/v1/interventions` (GET, PATCH, outcomes)
  - Updated OpenAPI spec (`docs/backend/openapi.yaml`) and `CONTRACT_CHECKLIST.md`.
  - Automated tests: 145 tests passing across 61 test suites with 0 failures (19 new tests across `interventions.test.js` and `simulations.test.js`).

## Completed phases

- **Phase 0:** Repository & contract audit, `.gitignore`, `.env.example`, `CONTRACT_CHECKLIST.md`. (PASSED)
- **Phase 1:** Express service foundation, security middleware, health probes (`/health/live`, `/health/ready`), centralized errors, OpenAPI scaffold, and automated tests. (PASSED)
- **Phase 2:** MongoDB Atlas connectivity, 18 Mongoose domain models, compound indexes, constraints validation, DTO serializers, synthetic fixtures, and `npm run seed`. (PASSED)
- **Phase 3:** Authentication & role authorization (`/auth/login`, `/auth/me`, `/institution/users`), JWT issuance/verification, RBAC, object-level student scoping, and security tests. (PASSED)
- **Phase 4:** Student profiles, search & pagination, integrated category records, batch CSV/JSON ingestion engine (preview, commit, inspection), missing-data preservation, sample dataset files, and automated tests. (PASSED)
- **Phase 5:** Student Success Score formula engine (`sss-v1`), normalization, dynamic weight renormalization, drivers, versioned persistence, API endpoints, methodology documentation, and tests. (PASSED)
- **Phase 6:** ML service integration (`ML_CONTRACT.md`), 17-feature builder with leakage prevention, resilient client, prediction persistence, zero-fabrication gate, and automated tests. (PASSED)
- **Phase 7:** Institution analytics and segmentation (overview KPIs, coverage notes, trends, risk summary, decoupled risk divergence, explainable segment rules, rebuild endpoint, and automated tests). (PASSED)
- **Phase 8:** Intervention catalog and Sandbox (catalog management, deterministic allocation engine, capacity limits, scenario run & approval workflow, intervention tracking, outcome recording, and automated tests). (PASSED)
- **Phase 9:** Feedback, audit and optional copilot integration:
  - Feedback subsystem (`backend/src/feedback/`): `POST /api/v1/feedback`, `GET /api/v1/feedback/summary`, `GET /api/v1/feedback` with strict student self-scoping and aggregated privacy boundaries (comments strictly withheld from aggregate summaries and masked for private records).
  - Audit logging subsystem (`backend/src/audit/`): `GET /api/v1/audit/events` (admin-only), automatic credential/token scrubbing from metadata, hooked into user provisioning, import commit, scenario approval, outcome recording, and segment rebuilds.
  - Copilot subsystem (`backend/src/copilot/`): `POST /api/v1/copilot/query`, explicit non-deceptive `not_configured` response when disabled, zero arbitrary SQL/NoSQL query execution, safe grounded routing to verified internal analytical services (`/overview`, `/risk-summary`, `/segments`, `/intervention-catalog`).
  - Automated tests: 27 new tests in `feedback.test.js`, `audit.test.js`, `copilot.test.js` (total test suite: 172 passing tests across 70 suites, 0 failures). (PASSED)

## Coding-agent next action

Proceed to Phase 10 (Deployment and integration hardening: Render production configuration, MongoDB Atlas URI verification, CORS configuration for Vercel frontend, smoke-test script, final verification).

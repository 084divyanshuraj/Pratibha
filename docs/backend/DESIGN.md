# Smart Campus Analytics — Backend Design & API Contracts

**Version:** 1.0  
**Purpose:** Shared contract for backend, frontend and ML teammates.  
**Base path:** `/api/v1`  
**Wire format:** JSON, except documented multipart CSV upload.

> This is the proposed v1 contract. Treat field names and response shapes as shared integration interfaces. If a field must change, update this file and affected tests before changing code.

## 1. API conventions

- Use plural nouns for collections (`/students`, `/interventions`).
- Use ISO-8601 UTC timestamps (`2026-10-09T12:00:00.000Z`). Dates representing a term or date-only value must be clearly documented.
- Use stable `student_id` strings in API paths and model contracts. MongoDB `_id` is an internal persistence key.
- Pagination: `?page=1&limit=20`; default limit 20, maximum 100.
- Filters use explicit named parameters (for example, `?department=CSE&semester=5&riskLevel=high`). Validate every filter.
- Use `201 Created` for a created resource, `200 OK` for successful reads/actions, `202 Accepted` only for truly asynchronous processing, `400` for malformed input, `401` for missing/invalid auth, `403` for forbidden access, `404` for missing records, `409` for conflict, `413` for oversized upload, `422` for structurally valid but semantically invalid data if adopted consistently, `429` for rate limits, and `500`/`503` for server/dependency failures.
- Do not return Mongoose internal documents directly. Map documents to API DTOs and exclude passwords/internal fields.

## 2. Standard response envelopes

### Successful response

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "req_example"
  }
}
```

List response:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 125,
    "totalPages": 7
  },
  "meta": { "requestId": "req_example" }
}
```

### Error response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": [
      { "field": "semester", "message": "Must be an integer from 1 to 12." }
    ]
  },
  "meta": { "requestId": "req_example" }
}
```

Error codes should be stable and documented. Never include stack traces, database credentials, raw tokens or sensitive student data in production error responses.

## 3. Authentication and roles

Initial roles:
- `admin`: user provisioning, imports, institution-wide analytics and configuration.
- `faculty`: authorized student profile reads, academic-support interventions and scoped analytics.
- `placement_officer`: placement records/analytics and placement-support interventions.
- `student`: own profile, scores, approved personal recommendations, feedback and own intervention status.

Enforce scope on the server. Do not allow public self-registration with arbitrary role assignment. Development seed accounts are acceptable only for local/demo use and must use documented placeholder credentials that are changed for deployment.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/auth/login` | Public, rate-limited | Verify credentials and return token + user profile |
| `GET` | `/auth/me` | Authenticated | Return current user's safe profile and role |
| `POST` | `/institution/users` | Admin | Provision a user; never accept a raw password to persist unhashed |

Login request:

```json
{ "email": "faculty@example.edu", "password": "<secret>" }
```

Login response data:

```json
{
  "accessToken": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": { "id": "usr_001", "displayName": "Demo Faculty", "role": "faculty", "studentId": null }
}
```

The sample token value and expiry above are illustrative. Configure expiry in environment/settings. Passwords must be hashed with a suitable password-hashing function; JWT signing secrets must never be committed.

## 4. MongoDB collection design

Use Mongoose schemas (or an explicitly agreed equivalent) to validate persisted documents. The fields below are logical fields; timestamps and internal `_id` may be added. Avoid embedding unbounded histories inside `students`.

### `users`
`email` (normalized, unique), `passwordHash`, `displayName`, `role`, optional `studentId`, `isActive`, timestamps. Do not expose `passwordHash` in API responses.

### `students`
`studentId` (unique stable ID), `firstName`, `lastName`, `institutionId`, `department`, `program`, `semester`, `cohort`, `enrollmentYear`, `status`, optional `email`/`userId`, timestamps. Minimize personal data; use synthetic demo records until a lawful real dataset is available.

### `academic_records`
`studentId`, `term`, optional `subjectCode`/`subjectName`, `assessmentType`, `marksObtained`, `maxMarks`, optional `grade`, optional `cgpa`, optional `backlog`, `observedAt`, `sourceImportId`.

### `attendance_records`
`studentId`, `term`, optional `subjectCode`, `classesAttended`, `classesHeld`, `attendancePercentage` (derivable; validate consistency), `periodStart`, `periodEnd`, `observedAt`, `sourceImportId`.

### `lms_activity`
`studentId`, `periodStart`, `periodEnd`, `loginCount`, `activeDays`, `assignmentsAssigned`, `assignmentsCompleted`, optional `engagementMinutes`, `observedAt`, `sourceImportId`.

### `engagement_records`
`studentId`, `activityType` (event/club/hackathon/certification/other), `activityName`, optional `hours`, optional `result`, `occurredAt`, `sourceImportId`.

### `placement_assessments`
`studentId`, `assessmentType` (aptitude/coding/mock_interview/placement_outcome/readiness), optional `score`, optional `maxScore`, optional `outcomeLabel`, `assessedAt`, optional `employerOrProgram` only if appropriate, `sourceImportId`.

### `skill_assessments`
`studentId`, `skillCategory` (technical/soft_skill), `skillName`, `score`, optional `maxScore`, `assessedAt`, `sourceImportId`.

### `feedback_records`
`studentId`, `feedbackType` (student_satisfaction/faculty_feedback/other), optional structured `rating`, optional redacted `comment`, `createdAt`, `visibility`, `sourceImportId`. Restrict access. Do not include free-text feedback in ML features without a separate approved design and privacy review.

### `imports`
`importId`, `datasetType`, `status` (received/validated/partially_imported/completed/failed), `uploadedBy`, `createdAt`, counts (`received`, `accepted`, `rejected`, `warnings`), `rowErrors` (bounded), `fileName` (safe display name only), `dryRun`, optional `completedAt`. Do not keep uploaded files indefinitely without a requirement.

### `student_features`
`studentId`, `featureSetVersion`, `asOfDate`, `features` (schema-controlled object), `sourceRecordWatermarks`, `createdAt`. Features must be derived from data available on or before `asOfDate` to prevent leakage.

### `student_scores`
`studentId`, `period`, `score` (0–100), `formulaVersion`, `components` (named values and normalized values), `drivers` (bounded list of `{name, observedValue, contribution, explanation}`), `missingFields`, `calculatedAt`. The score is a deterministic composite indicator, not a probability.

### `risk_predictions`
`studentId`, `target` (for example `academic_risk` or `placement_readiness`; only use targets that have been agreed), `riskLevel` (low/medium/high/unknown), optional `probability` (0–1 only when model output has a supported probability interpretation), `modelVersion`, `featureSetVersion`, `predictedAt`, `drivers`, `limitations`, `status`. Store only results returned by the contracted inference service; do not invent probability values.

### `student_segments`
`segmentKey`, `name`, `description`, `criteriaVersion`, `studentIds` or a query-based membership strategy, `generatedAt`, `indicators`. Choose an approach appropriate for expected data size; do not make a huge student list document.

### `intervention_catalog`
`interventionType`, `name`, `description`, `eligibilityRules` (versioned, deterministic at first), `capacityUnit`, optional `costUnits`, `durationDays`, `active`, `version`, timestamps.

### `interventions`
`interventionId`, `studentId`, `scenarioId` optional, `interventionType`, `assignedBy`, `assignedAt`, `dueAt`, `status` (planned/assigned/in_progress/completed/cancelled), `participation`, `observedOutcomes`, `notes` (safe/minimal), timestamps. Track observed outcomes separately from predictions.

### `simulation_scenarios`
`scenarioId`, `createdBy`, `cohortFilters`, `strategy` (targeted/uniform/mixed/custom), `interventionTypes`, `capacityConstraints`, `eligibilitySnapshot`, `allocationResults`, `excludedResults`, `resourceSummary`, `assumptions`, optional `outcomeEstimates`, `estimateMethod` (none/rule_based/model_estimate), `modelVersion` optional, `status` (draft/simulated/approved/rejected/implemented), timestamps. Scenario estimates must be visibly labelled and must not claim causality.

### `audit_events`
`actorUserId`, `action`, `resourceType`, optional `resourceId`, `createdAt`, `requestId`, minimal metadata. Never record credentials, JWTs, or unnecessary raw sensitive records.

## 5. Index and data integrity requirements

At minimum, evaluate indexes for:
- unique `users.email`, unique `students.studentId`;
- `studentId + term/period` on academic/attendance records;
- `studentId + observedAt/assessedAt` on dated records;
- `studentId + predictedAt` on predictions and `studentId + calculatedAt` on scores;
- `status + createdAt` on imports/interventions/scenarios where filtered frequently.

Add indexes based on actual queries and validate write paths. Validate percentages and counts; for example `classesAttended <= classesHeld`, `classesHeld >= 0`, marks must be within the declared scale, and completion counts must not exceed assignment counts. Do not assume a missing field is zero.

## 6. Route catalogue

### Health

| Method | Endpoint | Access | Result |
|---|---|---|---|
| `GET` | `/health/live` | Public | Process is running |
| `GET` | `/health/ready` | Public | Process and required dependencies are ready; expose only safe status |

### Students

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/students` | Staff roles | Search/filter/paginate; student role must not enumerate peers |
| `POST` | `/students` | Admin | Create student identity |
| `GET` | `/students/:studentId` | Staff with scope, or owner student | Safe profile and authorized summary |
| `PATCH` | `/students/:studentId` | Admin/authorized staff | Update permitted profile fields; disallow arbitrary IDs/roles |
| `GET` | `/students/:studentId/records` | Staff with scope, or owner student | Time-bounded category summary |

### Data ingestion

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/imports/:datasetType/preview` | Admin | Validate CSV/JSON without persisting accepted records |
| `POST` | `/imports/:datasetType` | Admin | Validate and import records; return import ID and report |
| `GET` | `/imports/:importId` | Admin | Import status and bounded row errors |

Allowed `datasetType`: `academic`, `attendance`, `lms`, `engagement`, `placement`, `skills`, `feedback`. Validate file type/size and row counts. For first implementation, synchronous processing is acceptable for small demo files; document a threshold before adding asynchronous jobs.

### Scores and analytics

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/students/:studentId/success-score?period=...` | Staff with scope, or owner student | Current/latest score with components and formula version |
| `POST` | `/students/:studentId/success-score/recalculate` | Staff/admin or trusted internal use | Recalculate and persist score |
| `GET` | `/analytics/overview` | Institution staff | Aggregate KPIs and data-quality notes |
| `GET` | `/analytics/trends?metric=...&period=...` | Institution staff | Time-series trend from persisted records |
| `GET` | `/analytics/risk-summary?target=...` | Institution staff | Risk counts and aggregated breakdown |
| `GET` | `/students/:studentId/predictions?target=...` | Staff with scope, or owner student | Latest appropriate prediction |
| `POST` | `/students/:studentId/predictions` | Authorized staff | Generate prediction via ML service, validate and persist |
| `GET` | `/segments` | Institution staff | List segment definitions and aggregate counts |
| `POST` | `/segments/rebuild` | Admin/authorized analytics role | Rebuild memberships from versioned rules |

### ML service request contract

The backend is the only application component that calls the ML service. The exact input feature names must be agreed by the ML teammate and documented in `ML_CONTRACT.md` (create it before the first integration test if the team uses a separate contract file). Do not let the model infer arbitrary fields from an entire MongoDB document.

Proposed request:

```json
{
  "student_id": "STU_001",
  "target": "academic_risk",
  "as_of_date": "2026-10-01",
  "feature_set_version": "student-features-v1",
  "features": {
    "attendance_rate": 0.72,
    "assessment_average": 61.5,
    "assignment_completion_rate": 0.8
  }
}
```

The field names above are examples only; they are not final training features. The API contract must match the trained model's declared schema.

Proposed response:

```json
{
  "student_id": "STU_001",
  "target": "academic_risk",
  "risk_level": "medium",
  "probability": null,
  "model_version": "academic-risk-v1",
  "feature_set_version": "student-features-v1",
  "predicted_at": "2026-10-09T08:00:00.000Z",
  "drivers": [
    { "name": "attendance_rate", "direction": "increases_risk", "observed_value": 0.72, "explanation": "Attendance is below the configured reference range." }
  ],
  "limitations": ["Illustrative contract; replace with validated model output semantics."]
}
```

A null probability means no probability is available/approved. The backend must not convert a score into a probability. ML client behavior: connect timeout and response timeout, bounded retries only where safe, structured logs without private student payloads, and stable handling for `503`/timeout/invalid response.

### Interventions and simulator

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/intervention-catalog` | Institution staff | List active intervention types/capacity definitions |
| `POST` | `/intervention-catalog` | Admin | Create/update catalog item |
| `POST` | `/simulations` | Institution staff | Save a new scenario definition |
| `POST` | `/simulations/:scenarioId/run` | Institution staff | Execute deterministic allocation and compare plan outputs |
| `GET` | `/simulations/:scenarioId` | Authorized scenario creator/role | Inspect assumptions, selected/excluded records and resource summary |
| `POST` | `/simulations/:scenarioId/approve` | Authorized staff | Approve scenario and create planned/assigned interventions according to policy |
| `GET` | `/interventions` | Institution staff; student sees own only | Filter intervention records |
| `PATCH` | `/interventions/:interventionId` | Assigned/authorized staff; student only permitted self-status actions | Update state/participation |
| `POST` | `/interventions/:interventionId/outcomes` | Authorized staff | Record observed outcome values with measurement date |

Simulation output must include selected/excluded students and a reason, capacity usage, strategy name, rule/version, assumptions, and the method used for any estimate. The first version may produce no outcome estimates. Never display invented expected improvement.

### Feedback and copilot

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/feedback` | Authenticated | Submit feedback under agreed validation/privacy rules |
| `GET` | `/feedback/summary` | Authorized staff | Aggregated feedback summary; no broad exposure of raw comments |
| `POST` | `/copilot/query` | Authenticated, role-scoped | Optional later phase; route requests only through approved authorized services |

Do not implement an ungrounded LLM response path just to show a chatbot. If no provider has been approved, return a documented not-configured response or defer this route.

## 7. Student Success Score contract

The score is computed by backend business logic, not by the frontend and not by asking the LLM. It should return:

```json
{
  "student_id": "STU_001",
  "period": "2026-S1",
  "score": 74.2,
  "formula_version": "sss-v1",
  "components": [
    { "key": "academic", "raw_value": 72, "normalized_value": 72, "weight": null },
    { "key": "attendance", "raw_value": 80, "normalized_value": 80, "weight": null }
  ],
  "drivers": [],
  "missing_fields": [],
  "calculated_at": "2026-10-09T08:00:00.000Z"
}
```

Values are illustrative. Do not use this example to imply the score weights are finalized. Final formula, component weights, normalization and missing-data behavior must be agreed and written down before treating scores as official.

## 8. Testing and API documentation

- Generate and maintain OpenAPI/Swagger documentation from the implemented route contract, or keep an equivalent versioned OpenAPI file.
- Provide fixture data and an import sample for all seven categories.
- Test authorization (especially student cannot view another student), validation, pagination, empty data, duplicates, missing fields, database unavailable, ML timeout, invalid ML response and simulation capacity limits.
- Provide a shared Postman collection or equivalent API smoke-test script where practical.

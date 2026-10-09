# Smart Campus Analytics — API & Data Contract Checklist

**Version:** 1.0  
**Status:** Baseline established (Phase 0)  
**Base Path:** `/api/v1`

---

## 1. Standard Response Envelope

- [ ] **Success Envelope:**
  ```json
  {
    "success": true,
    "data": {},
    "meta": { "requestId": "req_xyz" }
  }
  ```
- [ ] **Paginated List Envelope:**
  ```json
  {
    "success": true,
    "data": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 0
    },
    "meta": { "requestId": "req_xyz" }
  }
  ```
- [ ] **Error Envelope:**
  ```json
  {
    "success": false,
    "error": {
      "code": "ERROR_CODE",
      "message": "Human readable message",
      "details": []
    },
    "meta": { "requestId": "req_xyz" }
  }
  ```

---

## 2. Seven Source Data Categories

| Category | Logical Schema Target | Primary Fields | Missing Data Rule |
|---|---|---|---|
| 1. Academic | `academic_records` | `studentId`, `term`, `subjectCode`, `assessmentType`, `marksObtained`, `maxMarks`, `cgpa`, `backlog` | Keep null; do not coerce to 0 |
| 2. Attendance | `attendance_records` | `studentId`, `term`, `subjectCode`, `classesAttended`, `classesHeld`, `attendancePercentage` | Validate attended <= held; no negative |
| 3. LMS | `lms_activity` | `studentId`, `periodStart`, `periodEnd`, `loginCount`, `activeDays`, `assignmentsAssigned`, `assignmentsCompleted` | Validate completed <= assigned |
| 4. Engagement | `engagement_records` | `studentId`, `activityType`, `activityName`, `hours`, `result`, `occurredAt` | Nullable hours and result |
| 5. Placement | `placement_assessments` | `studentId`, `assessmentType`, `score`, `maxScore`, `outcomeLabel`, `assessedAt` | Distinct from predictive risk |
| 6. Skills | `skill_assessments` | `studentId`, `skillCategory`, `skillName`, `score`, `maxScore`, `assessedAt` | Normalizable scales |
| 7. Feedback | `feedback_records` | `studentId`, `feedbackType`, `rating`, `comment`, `visibility` | Access-restricted; not automatic ML feature |

---

## 3. MongoDB Collections Checklist (18 Collections)

- [x] `users` (email, passwordHash, displayName, role, studentId, isActive)
- [x] `students` (studentId, firstName, lastName, institutionId, department, program, semester, cohort, status)
- [x] `academic_records`
- [x] `attendance_records`
- [x] `lms_activity`
- [x] `engagement_records`
- [x] `placement_assessments`
- [x] `skill_assessments`
- [x] `feedback_records`
- [x] `imports` (importId, datasetType, status, counts, rowErrors, fileName, dryRun)
- [x] `student_features` (studentId, featureSetVersion, asOfDate, features, sourceRecordWatermarks)
- [x] `student_scores` (studentId, period, score, formulaVersion, components, drivers, missingFields)
- [x] `risk_predictions` (studentId, target, riskLevel, probability, modelVersion, drivers, limitations)
- [x] `student_segments` (segmentKey, name, description, criteriaVersion, studentIds/membership)
- [x] `intervention_catalog` (interventionType, name, description, eligibilityRules, capacityUnit, active)
- [x] `interventions` (interventionId, studentId, scenarioId, interventionType, assignedBy, status, outcomes)
- [x] `simulation_scenarios` (scenarioId, createdBy, cohortFilters, strategy, capacityConstraints, allocationResults)
- [x] `audit_events` (actorUserId, action, resourceType, resourceId, requestId)

---

## 4. Endpoint Checklist

### Health Checks
- [x] `GET /health/live` — Public liveness probe
- [x] `GET /health/ready` — Public readiness probe (reports DB and critical subsystem status safely)

### Authentication & Authorization
- [x] `POST /api/v1/auth/login` — Public, rate-limited, returns JWT + user profile DTO
- [x] `GET /api/v1/auth/me` — Authenticated, returns current user's profile and role
- [x] `POST /api/v1/institution/users` — Admin only, provisions user with hashed password

### Student Profiles
- [x] `GET /api/v1/students` — Staff roles only; paginated, filterable
- [x] `POST /api/v1/students` — Admin only; create student profile
- [x] `GET /api/v1/students/:studentId` — Staff or owner student only
- [x] `PATCH /api/v1/students/:studentId` — Admin / authorized staff only
- [x] `GET /api/v1/students/:studentId/records` — Staff or owner student; category records summary

### Data Ingestion
- [x] `POST /api/v1/imports/:datasetType/preview` — Admin; dry-run validation with row error report
- [x] `POST /api/v1/imports/:datasetType` — Admin; batch ingest with status report
- [x] `GET /api/v1/imports/:importId` — Admin; inspect import execution status and row errors

### Student Success Score
- [x] `GET /api/v1/students/:studentId/success-score` — Staff or owner student; deterministic score + components
- [x] `POST /api/v1/students/:studentId/success-score/recalculate` — Staff/internal recalculation

### ML Predictions & Integration
- [x] `GET /api/v1/students/:studentId/predictions` — Staff or owner student; latest risk prediction
- [x] `POST /api/v1/students/:studentId/predictions` — Staff only; orchestrates external ML call, validates, persists

### Analytics & Segments
- [ ] `GET /api/v1/analytics/overview` — Staff only; institutional KPIs and coverage notes
- [ ] `GET /api/v1/analytics/trends` — Staff only; time-series trends
- [ ] `GET /api/v1/analytics/risk-summary` — Staff only; risk level distribution
- [ ] `GET /api/v1/segments` — Staff only; segment definitions & aggregate counts
- [ ] `POST /api/v1/segments/rebuild` — Admin/analytics role; rebuild memberships

### Interventions & Sandbox Simulator
- [ ] `GET /api/v1/intervention-catalog` — Staff only; catalog of interventions
- [ ] `POST /api/v1/intervention-catalog` — Admin only; create/update catalog entry
- [ ] `POST /api/v1/simulations` — Staff only; save new scenario definition
- [ ] `POST /api/v1/simulations/:scenarioId/run` — Staff only; run deterministic allocation
- [ ] `GET /api/v1/simulations/:scenarioId` — Staff; view assumptions, selected/excluded lists, capacity
- [ ] `POST /api/v1/simulations/:scenarioId/approve` — Authorized staff; approve scenario & generate intervention assignments
- [ ] `GET /api/v1/interventions` — Staff; student sees own only
- [ ] `PATCH /api/v1/interventions/:interventionId` — Assigned staff; status update
- [ ] `POST /api/v1/interventions/:interventionId/outcomes` — Authorized staff; record observed outcomes

### Feedback & Copilot
- [ ] `POST /api/v1/feedback` — Authenticated; submit rating/feedback
- [ ] `GET /api/v1/feedback/summary` — Staff only; aggregated summary (comments redacted/protected)
- [ ] `POST /api/v1/copilot/query` — (Optional / deferred until approved provider)

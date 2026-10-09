# PRATIBHA — Backend API Service

**Node.js + Express REST API | Port 5000**  
*Part of the PRATIBHA Student Success Intelligence Platform — KPMG Challenge 4*

---

## Overview

This is the central backend for PRATIBHA. It acts as the single source of truth for:
- Authentication and role-based access control (RBAC)
- All student data persistence and retrieval
- Student Success Score calculation (`sss-v1`)
- ML inference orchestration (Academic & Placement risk)
- Deterministic Intervention Sandbox simulation
- Institution analytics, segmentation, and audit logging

The frontend and ML inference service connect **only** through this API. MongoDB and ML models are never exposed directly to the browser.

---

## Quick Start

```bash
# From the repository root
cd backend

# 1. Configure environment
cp .env.example .env
# Edit .env: set MONGODB_URI and JWT_SECRET at minimum

# 2. Install dependencies
npm install

# 3. Seed demo data (120 synthetic students + all 7 category records)
npm run seed

# 4. Start the server
npm start              # Production
npm run dev            # Watch mode (auto-restart on file changes)
```

**Verify it's running:**
```bash
curl http://localhost:5000/health/ready
# Expected: { "success": true, "data": { "ready": true, "status": "ready", ... } }
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
| :--- | :---: | :--- |
| `PORT` | No | Server port (default: `5000`) |
| `MONGODB_URI` | **Yes** | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | **Yes** | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `ALLOWED_ORIGINS` | No | Comma-separated frontend URLs for CORS |
| `ML_SERVICE_URL` | No | Python ML inference service URL (default: `http://localhost:8000`) |
| `NODE_ENV` | No | `development` or `production` |

---

## Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| Start server | `npm start` | Run production server |
| Dev server | `npm run dev` | Run with Node --watch (auto-restart) |
| Seed database | `npm run seed` | Populate MongoDB with 120 synthetic demo students and all category records |
| Run tests | `npm test` | Execute all 177 automated tests across 75 suites |
| Smoke test | `npm run smoke` | End-to-end API vertical slice test against running server |

---

## API Reference

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication

All protected routes require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

Obtain a token:
```bash
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "admin@example.edu", "password": "DemoUser123!" }
```

Response includes `data.accessToken`.

---

### Roles

| Role | Access Level |
| :--- | :--- |
| `admin` | Full access — provisioning, imports, segment rebuild, simulation approval |
| `faculty` | Read/write student records, approve interventions, view analytics |
| `placement_officer` | View students, placement data, and analytics |
| `student` | Own data only — profile, score, interventions, feedback |

---

### Core Endpoints

#### Health
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health/live` | Process liveness (never fails unless process is dead) |
| `GET` | `/health/ready` | Readiness check — reports MongoDB connection state |

#### Authentication
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Login, receive JWT |
| `GET` | `/api/v1/auth/me` | 🔐 Any | Get current authenticated user profile |
| `POST` | `/api/v1/institution/users` | 🔐 Admin | Provision a new platform user |

#### Students
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/students` | 🔐 Staff | List students (paginated, filterable, searchable) |
| `POST` | `/api/v1/students` | 🔐 Admin | Create a student record |
| `GET` | `/api/v1/students/:studentId` | 🔐 Staff or Owner | Get student profile |
| `PATCH` | `/api/v1/students/:studentId` | 🔐 Admin/Faculty | Update student profile fields |
| `GET` | `/api/v1/students/:studentId/records` | 🔐 Staff or Owner | Get all 7 category records for student |

#### Student Success Score
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/students/:studentId/success-score` | 🔐 Staff or Owner | Get or compute student's `sss-v1` score with drivers |
| `POST` | `/api/v1/students/:studentId/success-score/recalculate` | 🔐 Staff | Force recalculation from fresh category data |

#### Risk Predictions (ML)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/students/:studentId/predictions` | 🔐 Staff or Owner | Get stored predictions |
| `POST` | `/api/v1/students/:studentId/predictions` | 🔐 Staff | Request new prediction from ML service |

#### Data Ingestion
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/imports/:datasetType/preview` | 🔐 Admin | Dry-run validate a CSV/JSON file — no DB writes |
| `POST` | `/api/v1/imports/:datasetType` | 🔐 Admin | Commit import — writes validated rows to DB |
| `GET` | `/api/v1/imports/:importId` | 🔐 Admin | Inspect an import job's report and row errors |

Supported `datasetType` values: `students`, `academic`, `attendance`, `lms`, `engagement`, `placement`, `skills`, `feedback`

#### Analytics
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/overview` | 🔐 Staff | Institution KPIs: score distribution, risk counts, data coverage |
| `GET` | `/api/v1/analytics/trends` | 🔐 Staff | Time-series performance and attendance trends |
| `GET` | `/api/v1/analytics/risk-summary` | 🔐 Staff | Department/semester breakdowns, decoupled divergence detection |

#### Segmentation *(Bonus Feature)*
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/segments` | 🔐 Staff | List all 5 archetypes with member counts and indicators |
| `POST` | `/api/v1/segments/rebuild` | 🔐 Admin/Faculty | Recompute segment memberships from live data |
| `GET` | `/api/v1/segments/:segmentKey` | 🔐 Staff | Get segment criteria, indicators, and member student IDs |

#### Intervention Sandbox
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/intervention-catalog` | 🔐 Staff | List available intervention types |
| `POST` | `/api/v1/intervention-catalog` | 🔐 Admin | Create or update an intervention catalog entry |
| `POST` | `/api/v1/simulations` | 🔐 Staff | Create a draft scenario |
| `POST` | `/api/v1/simulations/:scenarioId/run` | 🔐 Staff | Run allocation engine on scenario |
| `GET` | `/api/v1/simulations/:scenarioId` | 🔐 Staff | Retrieve full simulation report |
| `POST` | `/api/v1/simulations/:scenarioId/approve` | 🔐 Admin/Faculty | Approve plan — creates persistent Intervention records |
| `GET` | `/api/v1/interventions` | 🔐 Staff or Owner | List interventions (students see own only) |
| `PATCH` | `/api/v1/interventions/:id/status` | 🔐 Staff | Update intervention progress status |
| `POST` | `/api/v1/interventions/:id/outcomes` | 🔐 Staff | Record observed outcomes |

#### Feedback & Audit
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/feedback` | 🔐 Student/Staff | Submit feedback |
| `GET` | `/api/v1/feedback/summary` | 🔐 Staff | Aggregated feedback metrics (no raw comments) |
| `GET` | `/api/v1/audit/events` | 🔐 Admin | View immutable audit log |

#### Copilot
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/copilot/query` | 🔐 Staff | Grounded natural language queries routed to verified analytics endpoints |

---

## Response Envelope

All responses follow this consistent structure:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "requestId": "req_..." }
}
```

Errors:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": []
  },
  "meta": { "requestId": "req_..." }
}
```

---

## Project Structure

```
backend/
├── src/
│   ├── server.js              # Entry point — starts HTTP server
│   ├── app.js                 # Express app setup, middleware, route mounting
│   ├── config/env.js          # Startup environment validation
│   ├── middleware/            # CORS, request ID, error handler, 404
│   ├── auth/                  # Login, JWT, authenticate, authorizeRoles
│   ├── models/                # 18 Mongoose schemas (Student, AcademicRecord, etc.)
│   ├── serializers/           # DTO transformers (strips passwordHash, __v)
│   ├── students/              # Student CRUD controller, routes, service
│   ├── ingestion/             # CSV/JSON import parser, validator, committer
│   ├── scores/                # sss-v1 calculator + score service
│   ├── ml/                    # Feature builder, ML client, prediction service
│   ├── segments/              # Segment definitions (v1) + rebuild service
│   ├── interventions/         # Catalog, simulation engine, approval workflow
│   ├── analytics/             # Overview KPIs, trends, risk summary
│   ├── feedback/              # Feedback submission + aggregation
│   ├── audit/                 # Audit event creation + retrieval
│   ├── copilot/               # Grounded copilot router
│   ├── institution/           # User provisioning
│   ├── health/                # /health/live and /health/ready
│   └── db/
│       ├── connection.js      # Mongoose connection manager
│       └── seeds/
│           ├── fixtures.js    # Synthetic demo data definitions
│           └── (seed logic embedded in scripts/seed.js)
├── scripts/
│   ├── seed.js                # Idempotent DB seeder
│   └── smoke-test.js          # End-to-end smoke test runner
├── tests/                     # 75 test suites, 177 tests, 0 failures
├── data/samples/              # Sample CSV files for all 7 data categories
├── .env.example               # Environment variable template
├── render.yaml                # Render deployment configuration
└── package.json
```

---

## Test Coverage Summary

```
✓ Auth & RBAC:          Token validation, role enforcement, cross-student access
✓ Student CRUD:         Pagination, search, filters, uniqueness
✓ Ingestion:            Preview validation, commit, error bounds, missing-data preservation
✓ Success Score:        Formula repeatability, boundary conditions, missing field handling
✓ ML Integration:       Feature construction, zero-fabrication gate, error handling
✓ Analytics:            KPI aggregation, empty data handling, coverage metrics
✓ Segmentation:         Archetype rule evaluation, rebuild idempotency
✓ Intervention:         Capacity limits, strategy selection, approval state machine
✓ Feedback:             Privacy boundaries, role scoping
✓ Audit:                Credential scrubbing, event creation
✓ Deployment:           Helmet headers, production stack masking, CORS validation
```

---

## Deployment (Render)

The `render.yaml` file configures the backend as a Render Web Service:

1. **Build command:** `npm install`
2. **Start command:** `node src/server.js`
3. **Environment variables:** Set `MONGODB_URI`, `JWT_SECRET`, `ALLOWED_ORIGINS` (Vercel frontend URL) in Render dashboard.
4. **Health probe:** `/health/live`

See `../docs/backend/DEPLOYMENT.md` for the full step-by-step guide.

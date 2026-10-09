# PRATIBHA — Student Success Intelligence Platform

**Hackathon:** HacXLerate 2026 — KPMG in India Challenge 4  
**Team:** Team AARYA  
**Track:** AI-Powered Student Analytics & Success Platform

---

## What Is PRATIBHA?

Most campus analytics tools stop at showing charts. **PRATIBHA** goes further — it converts fragmented student data into explainable, actionable intelligence and helps institutions make resource-aware decisions before students fall behind.

The platform unifies 7 categories of institutional data (Academic, Attendance, LMS, Engagement, Placement, Skills, Feedback) into a single student view, calculates a transparent **Student Success Score**, identifies students at risk, and enables institutions to model and approve targeted intervention plans — all within real resource constraints.

---

## Live Links

| Service | URL |
| :--- | :--- |
| 🌐 **Frontend Application** | *(Deploy URL — add before submission)* |
| ⚙️ **Backend API** | *(Render URL — add before submission)* |
| 📖 **API Health Check** | `[backend-url]/health/ready` |

---

## Evaluation Criteria Mapping

| Criterion | Weight | Where It Is In This Repo |
| :--- | :---: | :--- |
| **Data Integration & Analysis** | 30% | `backend/src/ingestion/` — 7-category CSV/JSON ingestion engine with schema validation, missing-data preservation, and import reports. Sample data in `backend/data/samples/`. |
| **Success Score & Risk Identification** | 25% | `backend/src/scores/` — explainable `sss-v1` composite formula. `backend/src/ml/` — decoupled Academic & Placement risk models. `backend/src/segments/` — 5 rule-based student archetypes *(Bonus)*. |
| **Dashboard & Visualization** | 25% | `Frontend/src/pages/institution/` — 8 interactive institution views. `Frontend/src/pages/student/` — student self-portal. Score drivers visible per student *(Bonus)*. |
| **Problem Understanding** | 10% | See Section "Why This Approach" below. |
| **Presentation & Demo** | 10% | [`docs/backend/SUCCESS_SCORE_METHODOLOGY.md`](docs/backend/SUCCESS_SCORE_METHODOLOGY.md) — methodology note. This README acts as submission documentation. |

---

## The Two Portals

### 1. Institution Portal (`/institution/*`)

Built for University Administrators, Faculty Mentors, and Placement Officers (TPOs):

| Page | Route | What It Does |
| :--- | :--- | :--- |
| **Executive Dashboard** | `/institution/dashboard` | KPI tiles — active students, avg success score, risk distribution |
| **Student 360° Directory** | `/institution/students` | Search, filter, and view every student's full profile, score, and decoupled risk badges |
| **Decoupled Risk Radar** | `/institution/risk-analysis` | 2×2 Academic vs Placement risk matrix; identifies the "High CGPA but Low Placement Readiness" divergent cluster |
| **Student Archetypes** | `/institution/segmentation` | 5 live behavioral cohorts with criteria, member counts, and rebuild action |
| **Intervention Sandbox** | `/institution/sandbox` | Resource-constrained simulation engine — configure capacity, strategy, approve allocations |
| **Data Integration Studio** | `/institution/data-integration` | Bulk CSV upload for all 7 data categories with dry-run preview and bounded row error reports |
| **Campus Feedback** | `/institution/feedback` | Aggregated sentiment analytics with privacy boundaries (raw comments staff-only) |
| **Audit Trail** | `/institution/audit` | Immutable log of all privileged actions (imports, approvals, provisioning) |

### 2. Student Self-Portal (`/student/*`)

Built for individual students:

- Explainable Student Success Score with all 5 contributing domain drivers.
- Course-level attendance breakdown and LMS completion tracking.
- Placement readiness assessment and recommended improvement actions.
- Active intervention enrollment status and progress milestones.
- Anonymous faculty feedback submission.

---

## The Key Differentiator: Intervention Sandbox

Most platforms identify at-risk students and stop there. The **Intervention Sandbox** answers *"What do we actually do about it, given our real constraints?"*

**How it works:**
1. Administrator sets capacity (e.g., 30 mentoring seats), budget, and duration.
2. Chooses an allocation strategy: **Targeted** (skill-gap prioritized), **Uniform** (cohort-based), or **Mixed** (multi-criteria hybrid).
3. The deterministic allocation engine simulates which students qualify, why, and who is excluded.
4. A human **approves** the plan — only then are assignments persisted.
5. Progress and outcomes are tracked post-assignment.

> All allocation logic is deterministic and reproducible. No outcome percentages are fabricated.

---

## Student Success Score — `sss-v1`

A transparent, explainable composite readiness index (0–100 scale). **Not** an actuarial probability of graduation.

| Pillar | Weight | Key Indicators |
| :--- | :---: | :--- |
| Academic Performance | 35% | CGPA (0–10), active backlog count |
| Placement & Skills | 20% | Aptitude score, coding assessment, DSA score |
| Attendance Consistency | 20% | Overall session attendance percentage |
| LMS Engagement | 15% | Assignment completion rate, weekly login frequency |
| Co-Curricular Activity | 10% | Hackathons, certifications, club participation |

**Missing Data Policy:** If a student's data is absent for any pillar, the weight dynamically redistributes across available pillars. Missing data is **never** defaulted to zero. A `dataCompleteness` percentage is always displayed alongside the score.

Every student receives human-readable driver explanations, e.g.:
> *"Academic Performance: CGPA 7.45/10, zero active backlogs → +26.1 pts"*

> 📖 **Full Formulation Note:** Detailed mathematical formulation, weight justifications, and ethical boundaries: [`docs/backend/SUCCESS_SCORE_METHODOLOGY.md`](docs/backend/SUCCESS_SCORE_METHODOLOGY.md)

---

## Risk Identification — Decoupled Dual Engines

Academic Risk and Placement Risk are computed by **independent models** and presented independently. This surfaces the critical divergence case: a student with a strong CGPA who will struggle at placement interviews.

| Engine | Model | Training Data | Performance |
| :--- | :--- | :--- | :--- |
| **Academic Risk** | LightGBM Classifier | 50,000 student records | F1: 0.8570 \| ROC-AUC: 0.9497 |
| **Placement Risk** | Logistic Regression | 50,000 student records | ROC-AUC: 0.6572 |

Predictions include top contributing risk factors with observed vs benchmark values (e.g., *"Attendance 68.5% vs 75% threshold — HIGH severity"*).

---

## Student Segmentation — 5 Behavioral Archetypes *(KPMG Bonus Feature)*

Students are grouped into 5 explainable, rule-based segments using `sss-v1` scores and category records:

| Segment | Criteria | Typical Action |
| :--- | :--- | :--- |
| **High Academic, Low Placement Readiness** | CGPA ≥ 7.5 but Placement score < 60% or High Placement Risk | Mock interview bootcamp, aptitude coaching |
| **Critical Attendance Shortfall** | Overall attendance < 75% | Immediate mentor outreach, debarment alert |
| **Digital & LMS Disengagement** | Assignment completion < 50% or < 2 logins/week | LMS engagement nudges, digital literacy support |
| **Comprehensive Academic Support** | Success Score < 60, ≥ 2 backlogs, or High Academic Risk | Paired remedial coaching + counselling |
| **High Potential / Top Achievers** | Success Score ≥ 85 and CGPA ≥ 8.5 | Leadership tracks, research internships |

Segments are rebuilt dynamically from live data via `POST /api/v1/segments/rebuild`.

---

## System Architecture

```
Browser
  │
  ▼
Frontend (React 18 + Vite) ──────────────── Port 3000 / Vercel
  │  JWT Bearer Token on every request
  ▼
Backend API (Node.js + Express) ─────────── Port 5000 / Render
  │  Helmet, CORS, Rate-limiting, Winston
  ├── MongoDB Atlas (18 Domain Collections)
  └── ML Inference Service (Python FastAPI) ─ Port 8000 / Render
        └── Trained .joblib model artifacts
```

```
┌─────────────────────────────────────────────────────────────┐
│  PRATIBHA Platform                                          │
│                                                             │
│  Campus Data Sources (7 Pillars)                            │
│    Academic · Attendance · LMS · Engagement                 │
│    Placement · Skills · Feedback                            │
│           │                                                 │
│           ▼                                                 │
│  Batch Ingestion Studio (CSV/JSON + Validation)             │
│           │                                                 │
│           ▼                                                 │
│  MongoDB Atlas (18 Collections)                             │
│           │                                                 │
│    ┌──────┴──────┐                                          │
│    ▼             ▼                                          │
│  Score Engine   ML Engine                                   │
│  (sss-v1)       Academic Risk (LightGBM ~91% AUC)          │
│                 Placement Risk (Logistic Regression)        │
│           │                                                 │
│           ▼                                                 │
│  Segmentation Engine (5 Archetypes)                         │
│           │                                                 │
│           ▼                                                 │
│  Intervention Sandbox (Deterministic Allocation)            │
│           │                                                 │
│           ▼                                                 │
│  Institution Portal    Student Self-Portal                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Repository Structure

```
PRATIBHA/
│
├── README.md                        ← You are here
├── docs/
│   └── backend/
│       └── SUCCESS_SCORE_METHODOLOGY.md ← KPMG Deliverable: Score methodology note
├── ml_service.py                    ← Python ML inference entry point
├── kaggle.csv                       ← 50,000-record training dataset
│
├── Frontend/                        ← React 18 + Vite application
│   ├── README.md                    ← Frontend setup & architecture guide
│   └── src/
│       ├── pages/institution/       ← 8 institution portal pages
│       ├── pages/student/           ← Student self-portal
│       ├── components/              ← Shared UI: layout, drawer, copilot
│       ├── services/api.js          ← Unified API client (live + offline fallback)
│       └── styles/                  ← tokens.css + global.css design system
│
├── backend/                         ← Node.js + Express REST API
│   ├── README.md                    ← Backend setup & API reference
│   ├── src/
│   │   ├── scores/                  ← sss-v1 success score engine
│   │   ├── ml/                      ← ML client, feature builder (17 features)
│   │   ├── segments/                ← 5 archetype segmentation rules
│   │   ├── interventions/           ← Sandbox simulator + allocation engine
│   │   ├── ingestion/               ← CSV/JSON importer with validation
│   │   ├── models/                  ← 18 Mongoose domain schemas
│   │   ├── auth/                    ← JWT authentication & RBAC
│   │   ├── analytics/               ← KPI aggregation, trends, risk summary
│   │   ├── feedback/                ← Feedback with privacy boundaries
│   │   ├── audit/                   ← Immutable audit event logging
│   │   └── copilot/                 ← Grounded AI copilot (no hallucinations)
│   ├── scripts/
│   │   ├── seed.js                  ← Seeds 120 synthetic demo students
│   │   └── smoke-test.js            ← End-to-end API smoke test
│   ├── tests/                       ← 177 automated tests, 75 suites, 0 failures
│   └── data/samples/                ← Sample CSV files for each data category
│
└── models/                          ← Serialized ML model artifacts
    ├── README.md                    ← Model registry & integration guide
    ├── academic_risk_model.joblib   ← LightGBM academic risk classifier
    ├── placement_risk_model.joblib  ← Logistic Regression placement classifier
    ├── feature_scaler.joblib        ← StandardScaler for 17 input features
    └── model_metadata.json          ← Feature schema, benchmark leaderboard
```

---

## Quick Start

### Prerequisites
- Node.js ≥ 20.0
- MongoDB running locally (or set `MONGODB_URI` to Atlas connection string)
- Python ≥ 3.9 (only for ML inference service)

### 1. Backend API

```bash
cd backend
cp .env.example .env           # Fill in MONGODB_URI and JWT_SECRET
npm install
npm run seed                   # Seeds 120 synthetic demo students + all category records
npm start                      # Starts at http://localhost:5000
```

Verify: `curl http://localhost:5000/health/ready`

### 2. Frontend Application

```bash
cd Frontend
npm install
npm run dev                    # Starts at http://localhost:3000
```

Open `http://localhost:3000` in your browser.

### 3. ML Inference Service (Optional)

The backend falls back to calibrated heuristics if the ML service is offline. To run the full inference service:

```bash
pip install fastapi uvicorn scikit-learn lightgbm joblib pandas numpy
python ml_service.py           # Starts at http://localhost:8000
```

---

## Demo Credentials

Once seeded, log in at the login page using:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.edu` | `DemoUser123!` |
| **Faculty** | `faculty@example.edu` | `DemoUser123!` |
| **Placement Officer** | `placement@example.edu` | `DemoUser123!` |
| **Student** | `student@example.edu` | `DemoUser123!` |

> All student data is **synthetic and fictional**. No real PII is used.

---

## Why This Approach

Campus data is siloed. Existing tools either show a single blended risk score (which hides important divergences) or lack any decision-support capability. Our core design decisions:

1. **Decoupled risk engines** — A high-CGPA student with poor placement readiness gets a Low Academic Risk but High Placement Risk flag. Collapsing these into one metric would hide the problem.
2. **Dynamic weight renormalization** — Students missing data for some pillars are not penalized with zero scores. Their available data determines their relative score.
3. **Deterministic Intervention Sandbox** — Advisors don't just see *who* is at risk; they can simulate *what to do* under real seat and budget constraints, then require human approval.
4. **Explainability on every output** — Every score and risk flag shows the exact indicators contributing to it, so a faculty mentor can have an informed conversation with a student.

---

## Responsible AI Principles

- **No fabricated predictions:** If the ML service is unavailable, the backend returns a clear error — it never fabricates a synthetic prediction.
- **Privacy by design:** Students cannot view peers' records. Feedback comments are staff-only. Audit logs strip credentials before storage.
- **Human-in-the-loop:** Intervention plans require explicit administrator/faculty approval before any assignments are persisted.
- **Fair features:** Sensitive demographic attributes (gender, caste, religion, income) are excluded from all models.
- **Clear demo labeling:** All data is synthetic. The platform does not claim validated ML accuracy on real institutional data.

---

## Backend Test Coverage

```
✓ 177 tests passing
✓ 75 test suites
✓ 0 failures
```

Covers: Auth security, RBAC, cross-student access prevention, score repeatability, ML zero-fabrication gate, ingestion validation, capacity limits, scenario approval state machine, feedback privacy, and audit log integrity.

---

## Tech Stack Summary

| Layer | Technology |
| :--- | :--- |
| Frontend | React 18, Vite, React Router v6, Recharts, Lucide React, Vanilla CSS |
| Backend | Node.js 20, Express 4, Mongoose, JWT, Helmet, Morgan |
| Database | MongoDB (18 collections, compound indexes, schema validation) |
| ML Inference | Python, LightGBM, Scikit-learn, joblib, FastAPI |
| Deployment | Render (Backend + ML), Vercel (Frontend), MongoDB Atlas |

# PRATIBHA — Backend API Service

**Node.js + Express REST API | Port 5000**  
*Part of PRATIBHA: Student Success Intelligence Platform — KPMG Challenge 4*

---

## ⚙️ Overview

The backend service is the centralized data persistence, scoring, and orchestration engine for the PRATIBHA platform. It provides:
- Secure JWT-based authentication with role-based access control (RBAC).
- Student privacy enforcement preventing horizontal IDOR tampering (`authorizeStudentScope`).
- Deterministic Success Score computation (`sss-v1`) with dynamic missing-data weight renormalization.
- Orchestration for decoupled Academic and Placement ML risk prediction.
- Resource-constrained Intervention Sandbox simulation logic.
- Multi-pillar batch data ingestion pipelines with relational validation and audit logging.

---

## 🚀 Quick Start

```bash
# Navigate to backend directory
cd backend

# 1. Setup Environment
cp .env.example .env
# Configure MONGODB_URI and JWT_SECRET in .env

# 2. Install Dependencies
npm install

# 3. Seed Synthetic Campus Data
npm run seed
# Populates 120 synthetic students, 952 course records, 464 attendance records,
# 180 LMS records, 180 placement assessments, and all 4 demo users.

# 4. Start Server
npm start              # Production mode (Port 5000)
npm run dev            # Development mode with --watch
```

**Verify Service Health:**
```bash
curl http://localhost:5000/health/live
# Returns: { "success": true, "status": "ok", "uptime": ... }
```

---

## 🔒 Security & Architectural Guardrails

| Security Mechanism | Implementation File | Protection Provided |
| :--- | :--- | :--- |
| **JWT Verification** | `src/middleware/auth.js` | Cryptographically verifies signed bearer tokens; rejects tampered payloads with `401`. |
| **Account Kill-Switch** | `src/middleware/auth.js` | Checks `user.isActive` on every request; instantly blocks revoked accounts with `403`. |
| **Student Privacy Scoping** | `src/middleware/auth.js` | Enforces `req.user.studentId === req.params.studentId` to mathematically prevent IDOR. |
| **Role-Based Guards** | `src/middleware/auth.js` | Protects privileged endpoints (ingestion, audit) using `authorizeRoles('admin')`. |
| **Centralized Error Envelope** | `src/middleware/errorHandler.js` | Catches unhandled exceptions, sanitizes stack traces, and prevents server process termination. |
| **HTTP Security Headers** | `src/app.js` (`helmet`) | Mitigates XSS, MIME-sniffing, and clickjacking attacks. |
| **Payload Size Protection** | `src/app.js` | Restricts request bodies to `1mb` to prevent memory exhaustion DOS. |

---

## 📡 API Endpoints Specification (`/api/v1`)

### Authentication & Profiles
- `POST /api/v1/auth/login` — Authenticate via email, username, or student roll ID.
- `POST /api/v1/auth/register` — Self-register new student or faculty account.
- `GET /api/v1/auth/me` — Retrieve authenticated user profile and permissions.
- `PATCH /api/v1/auth/profile` — Update academic details (department, degree, semester, roll ID).

### Institutional Analytics & KPIs
- `GET /api/v1/analytics/overview` — Executive KPIs, score distributions, and decoupled divergence counts.
- `GET /api/v1/analytics/risk-summary` — Aggregated Academic and Placement risk radar counts.

### Student Roster & 360° Profiles
- `GET /api/v1/students` — Filterable student directory (pagination, department, risk levels).
- `GET /api/v1/students/:studentId` — Full 360° student record with longitudinal telemetry and score drivers.

### Success Score Engine
- `POST /api/v1/scores/calculate` — Execute explainable `sss-v1` composite formula with dynamic weight renormalization.

### Decision Intelligence & Simulation
- `POST /api/v1/interventions/simulate` — Model intervention budget, mentor capacity, and projected Success Score impact.
- `POST /api/v1/interventions/allocate` — Commit intervention assignments for selected student cohorts.

### Batch Data Ingestion (8 Pillars)
- `POST /api/v1/ingestion/:datasetType` — Stream and commit CSV/Excel dumps across any of the 8 institutional pillars.
- `POST /api/v1/institution/clear-data` — Reset synthetic records for fresh custom CSV onboarding.

### Campus Feedback & Audit
- `POST /api/v1/feedback` — Submit student satisfaction or course feedback.
- `GET /api/v1/feedback/summary` — Retrieve privacy-preserving aggregated sentiment metrics.
- `GET /api/v1/audit/events` — Query immutable administrative action log *(Admin only)*.

### Conversational Copilot
- `POST /api/v1/copilot/query` — Grounded natural-language query dispatcher answering campus analytics questions.

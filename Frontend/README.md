# PRATIBHA — Frontend Web Application

**React 18 + Vite | Enterprise Institution Portal + Student Self-Service Portal**  
*Part of PRATIBHA: Student Success Intelligence Platform — KPMG Challenge 4*

---

## 🌐 Live Application

- **Production URL (24/7 High-Availability):** [https://pratibha-five.vercel.app/](https://pratibha-five.vercel.app/)
- **Local Dev Server:** `http://localhost:3000`

---

## 🚀 Key Architectural Highlights

1. **Dual-Atmosphere Design System:**
   - Cinematic dark navy hero on the public landing page (`#0A1128`).
   - Clean, light enterprise analytics canvas (`#F8FAFC`) on institutional and student dashboards.
   - 100% tokenized Vanilla CSS using semantic tokens from `src/styles/tokens.css` and `src/styles/global.css`.

2. **Self-Reliant Client Engine (Zero Crash Guarantee):**
   - The application connects to the Express API (`/api/v1`) when available.
   - If the backend is unreachable or offline, the client seamlessly falls back to high-fidelity in-memory data fixtures (1,420 synthetic students, 5 cohort archetypes, complete 7-pillar telemetry).
   - Ingestion Studio uses in-browser **SheetJS (XLSX)** parsing to process CSVs and update campus analytics reactively in `localStorage`.

3. **1-Click Persona Switcher:**
   - Evaluators can immediately toggle between **Institution Admin**, **Faculty Mentor**, **Placement Officer (TPO)**, and **Student Portal** directly from the top navigation bar.

---

## 🗺️ Application Page Routes

### Public Routes
| Route | Page Component | Purpose |
| :--- | :--- | :--- |
| `/` | `LandingPage.jsx` | Cinematic landing experience, value pillars, and demo role switcher |
| `/login` | `LoginPage.jsx` | Secure login gateway supporting email, username, and student roll ID |

### Institutional Intelligence Portal (`/institution/*`)
| Route | Page Component | Features & Scopes |
| :--- | :--- | :--- |
| `/institution/overview` | `OverviewPage.jsx` | Executive campus KPIs, cohort distribution chart, semester line chart, decoupled divergence card |
| `/institution/students` | `StudentDirectoryPage.jsx` | 360° student roster with search, multi-facet filtering, and slide-out inspection drawer |
| `/institution/risk-radar` | `RiskRadarPage.jsx` | 2×2 Decoupled Risk Matrix (Academic vs Placement) surfacing divergent students |
| `/institution/segments` | `SegmentsPage.jsx` | 5 rule-based behavioral cohorts supporting targeted intervention grouping *(Bonus)* |
| `/institution/sandbox` | `SandboxPage.jsx` | Resource-constrained policy simulator modeling remedial intervention cost and score ROI |
| `/institution/ingestion` | `IngestionPage.jsx` | Multi-pillar CSV batch ingestion studio with dry-run schema validation |
| `/institution/feedback` | `FeedbackPage.jsx` | Campus satisfaction sentiment analytics with privacy-preserving aggregation |
| `/institution/audit` | `AuditPage.jsx` | Immutable audit log of administrative actions and batch data commits |

### Student Self-Service Portal (`/student/*`)
| Route | Page Component | Features & Scopes |
| :--- | :--- | :--- |
| `/student/portal` | `StudentPortalPage.jsx` | Personal 360° scorecard, radar chart, positive/negative score drivers, attendance warnings |
| `/student/profile` | `ProfilePage.jsx` | Profile onboarding and settings for degree, department, semester, and roll ID |

---

## 🛠️ Development & Build Scripts

```bash
# Install dependencies
npm install

# Start local Vite development server (Port 3000)
npm run dev

# Production build (Outputs to dist/)
npm run build

# Preview production build locally
npm run preview
```

---

## 📦 Tech Stack & Libraries

- **Framework:** React 18, Vite 5
- **Routing:** React Router v6 (`HashRouter` for zero-404 cloud proxy compatibility)
- **Visualizations:** Recharts (Bar, Line, Radar, Area)
- **Icons:** Lucide React
- **Client Data Engine:** SheetJS (`xlsx`) for client-side spreadsheet ingestion
- **Styling:** Modular CSS Design System (`tokens.css`, `global.css`)

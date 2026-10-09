# PRATIBHA — Frontend Application

**React 18 + Vite | Institution Portal + Student Self-Portal**  
*Part of the PRATIBHA Student Success Intelligence Platform — KPMG Challenge 4*

---

## Overview

The PRATIBHA frontend is a dual-portal web application for campus administrators, faculty mentors, placement officers, and students. It connects to the backend API for live data and falls back to realistic synthetic fixtures when the backend is offline — so the demo always works.

**Two portals, one codebase:**
- **Institution Portal** — analytics, risk radar, student directory, segmentation, intervention sandbox, data ingestion, audit trail.
- **Student Self-Portal** — personal dashboard, success score breakdown, attendance tracking, placement readiness, active interventions, feedback.

---

## Quick Start

```bash
# From repository root
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev       # Starts at http://localhost:3000
```

Open `http://localhost:3000` in your browser. Use the role switcher on the landing page to explore as Admin, Faculty, Placement Officer, or Student.

**Build for production:**
```bash
npm run build     # Output in dist/
```

---

## Environment Variables

Create a `.env` file in the `Frontend/` directory (or set in Vercel dashboard):

| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:5000/api/v1` | Backend API URL |

---

## Application Routes

### Public Routes
| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | Landing Page | Platform overview, 7-domain constellation, role-based demo gateway |
| `/login` | Login | JWT-based login form |

### Institution Portal Routes
| Route | Page | Description |
| :--- | :--- | :--- |
| `/institution/dashboard` | Executive Dashboard | KPI tiles — success score distribution, risk counts, data coverage |
| `/institution/students` | Student 360° Directory | Searchable, filterable table with inline risk badges; click a row to open the full student drawer |
| `/institution/risk-analysis` | Decoupled Risk Radar | 2×2 Academic vs Placement risk matrix, divergent cluster detection |
| `/institution/segmentation` | Student Archetypes | 5 behavioral cohorts with live member counts and rebuild action |
| `/institution/sandbox` | Intervention Sandbox | Strategy selector, capacity configurator, simulation runner, approval workflow |
| `/institution/data-integration` | Data Integration Studio | CSV/JSON uploader for all 7 data categories with dry-run preview |
| `/institution/feedback` | Campus Feedback | Aggregated sentiment with rating distribution charts |
| `/institution/audit` | Audit Trail | Paginated immutable security and action event log |

### Student Portal Routes
| Route | Page | Description |
| :--- | :--- | :--- |
| `/student` | Student Self-Portal | Full personal dashboard: success score, attendance, placement, interventions, feedback |

---

## Key Components

### `StudentDrawer`
Slide-in panel showing a complete 360° student view:
- **Header:** Name, ID badge, program, semester, department.
- **Score Bar:** Live `sss-v1` score with `dataCompleteness` percentage, decoupled Academic Risk and Placement Risk badges.
- **Driver Panel:** *(Bonus Feature)* — Colour-coded pills showing each domain's `+contribution pts` to the score.
- **7-Tab Body:** Academic records, attendance breakdown, LMS activity, placement scores, skills, engagement, feedback.

### `CopilotDrawer`
Floating AI assistant supporting natural language and Hinglish queries. Routes all answers through verified backend analytics endpoints — no hallucinated responses.

### `api.js` — Unified API Client
Located at `src/services/api.js`. All backend calls go through this single module which:
- Attaches JWT Bearer token automatically.
- Enforces a configurable request timeout (default 8 seconds).
- Automatically falls back to realistic static fixtures when the backend is unreachable, so the demo is never broken.

---

## Design System

PRATIBHA uses a dual-atmosphere design:
- **Dark Navy Canvas** — Landing page hero with cinematic depth.
- **Clean Light Analytics Canvas** — Institution and Student dashboards for readability at scale.

Design tokens are centrally managed in `src/styles/tokens.css`. Global resets, typography, and utility classes are in `src/styles/global.css`.

**Typography:** Inter (Google Fonts)  
**Icons:** Lucide React  
**Charts:** Recharts (AreaChart, BarChart, PieChart, RadarChart)  
**No hardcoded hex colours in component files** — all colours reference CSS variables from `tokens.css`.

---

## Project Structure

```
Frontend/
├── index.html                 # HTML entry point
├── vite.config.js             # Vite configuration
├── package.json
│
└── src/
    ├── main.jsx               # React root mount
    ├── App.jsx                # Router setup (React Router v6)
    │
    ├── styles/
    │   ├── tokens.css         # Design system CSS custom properties
    │   └── global.css         # Global resets, typography, utility classes
    │
    ├── assets/
    │   └── images.js          # Image/avatar constants
    │
    ├── context/               # React context (auth state, role switcher)
    │
    ├── services/
    │   └── api.js             # Unified API client (live + offline fallback)
    │
    ├── components/
    │   ├── layout/            # AppShell, Sidebar, TopBar
    │   ├── students/          # StudentDrawer (360° student panel)
    │   ├── copilot/           # CopilotDrawer (grounded AI assistant)
    │   ├── landing/           # Landing page sections and animations
    │   ├── common/            # Shared: MetricCard, RiskBadge, LoadingSpinner
    │   └── ui/                # Base UI: Button, Input, Select, Modal
    │
    └── pages/
        ├── public/            # LandingPage, LoginPage
        ├── institution/       # 8 institution portal pages
        │   ├── CampusDashboard.jsx
        │   ├── StudentDirectoryPage.jsx
        │   ├── RiskRadarPage.jsx
        │   ├── SegmentsPage.jsx          ← Bonus: Segmentation
        │   ├── SandboxPage.jsx
        │   ├── IngestionPage.jsx
        │   ├── FeedbackPage.jsx
        │   └── AuditPage.jsx
        ├── student/           # Student self-portal
        │   └── StudentPortalPage.jsx     ← Explainable score drivers (Bonus)
        └── NotFoundPage.jsx
```

---

## Tech Stack

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| React | 18 | UI library |
| Vite | 5 | Build tool and dev server |
| React Router | v6 | Client-side routing |
| Recharts | Latest | Analytics charts (Area, Bar, Pie, Radar) |
| Lucide React | Latest | Icon library |
| Vanilla CSS | — | Styling via centralized tokens |

No Tailwind. No CSS-in-JS. No component library — full design control through tokens.

---

## Offline / Demo Mode

The API client in `src/services/api.js` tracks backend availability in memory. If any request times out or returns a network error, it automatically serves realistic static fixtures that match the exact shape of the live API response. This means:

- The demo **always works**, even if the backend goes down during a presentation.
- Fixtures include synthetic student profiles, risk predictions, segment data, and score drivers.
- The UI shows the same data structure whether live or offline — no special demo mode toggle needed.

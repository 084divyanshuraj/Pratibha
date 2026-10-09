# Student Success Score (SSS) — Methodology & Formulation Note

**Version:** `sss-v1`  
**Platform:** PRATIBHA — Smart Campus Analytics (KPMG Challenge)  
**Implementation File:** [`backend/src/scores/score.calculator.js`](file:///d:/Pratibha/backend/src/scores/score.calculator.js)

---

## 1. Core Principles

1. **Deterministic Indicator, Not a Probability:**
   The Student Success Score is an explainable composite readiness index calibrated on a continuous scale from `0.0` to `100.0`. It is **not** an actuarial or statistical probability of graduation or placement.
2. **Never Silently Zero Missing Data:**
   Missing student data from any category (e.g., absence of placement tests in early semesters or unlogged LMS activity) must **never** default to zero. Instead, weights renormalize dynamically across observed domains, and omissions are reported explicitly in `missingFields` alongside a `dataCompleteness` percentage.
3. **Transparent Explainability:**
   Every calculated score produces ranked, human-readable contribution drivers highlighting positive strengths and risk indicators.
4. **Reproducibility & Idempotency:**
   Identical input data evaluated under formula version `sss-v1` guarantees identical numerical and qualitative output.

---

## 2. Pillar Weights & Normalization

The composite score evaluates up to five distinct student performance pillars:

| Pillar Key | Name | Base Weight | Normalization Formula | Risk / Alert Threshold |
| :--- | :--- | :---: | :--- | :--- |
| `academic` | Academic Performance | **35%** (0.35) | `(CGPA / 10.0) * 100` (or marks % fallback) minus `(backlogs * 5.0)` | Active backlogs > 0 or CGPA < 6.0 |
| `attendance` | Attendance Consistency | **20%** (0.20) | `(Classes Attended / Classes Held) * 100` | Attendance < 75.0% (Mandatory institutional cutoff) |
| `lms` | LMS Engagement | **15%** (0.15) | `0.7 * (Assignments Completed / Assigned) + 0.3 * (Logins / Target)` | Completion < 60% or zero logins |
| `placement_skills` | Placement & Skills | **20%** (0.20) | Average percentage across aptitude tests, coding scores, and skill assessments | Assessment average < 60.0% |
| `engagement` | Co-Curricular Engagement | **10%** (0.10) | `(Activity Count * 25) + Hours Bonus` (clamped to 100) | Zero verified activities |

---

## 3. Dynamic Weight Renormalization (Missing Data Policy)

When a student lacks records in one or more categories, the platform does not penalize them with zero points.

Let $A \subseteq \{\text{academic}, \text{attendance}, \text{lms}, \text{placement\_skills}, \text{engagement}\}$ be the set of available categories for the student.

The sum of available base weights is:
$$W_A = \sum_{k \in A} w_k^{\text{base}}$$

If $W_A > 0$, the effective weight $w_k^{\text{effective}}$ for each available component is:
$$w_k^{\text{effective}} = \frac{w_k^{\text{base}}}{W_A}$$

The overall Student Success Score is computed as:
$$\text{Score} = \sum_{k \in A} \left( \text{normalizedValue}_k \times w_k^{\text{effective}} \right)$$

### Completeness Metric
$$\text{dataCompleteness} = \text{round}\left( \frac{|A|}{5} \times 100 \right)$$

If all five pillars are missing ($|A| = 0$), `score` returns `null` with `dataCompleteness = 0` and an explicit note that insufficient data is available.

---

## 4. Explainable Drivers

Each component outputs a structured driver object:
- `name`: Category title (e.g. "Attendance Consistency")
- `observedValue`: Raw metric string (e.g. "93.3%" or "CGPA 8.5/10")
- `contribution`: Numerical contribution towards the final score (e.g. `+18.7`)
- `explanation`: Contextual statement highlighting whether the metric satisfies institutional expectations or signals academic/placement risk.

---

## 5. API Endpoints

- `GET /api/v1/students/:studentId/success-score?period=current`  
  Accessible by staff roles (`admin`, `faculty`, `placement_officer`) and the student themselves (strictly scoped to their own `studentId`). Returns latest score snapshot or calculates on demand.
- `POST /api/v1/students/:studentId/success-score/recalculate`  
  Staff-only endpoint to recalculate fresh score snapshots from recently imported category records and persist them to MongoDB (`student_scores` collection).

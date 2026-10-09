# ML Models & Artifacts Registry

**Trained ML models for Academic Risk and Placement Risk prediction**  
*Part of the PRATIBHA Student Success Intelligence Platform — KPMG Challenge 4*

---

## Overview

This directory contains the serialized machine learning models, preprocessors, and metadata used by the PRATIBHA platform's ML inference layer. These artifacts are loaded by `ml_service.py` at startup and served via a FastAPI endpoint called by the backend.

The platform uses **two independent (decoupled) risk models** — a core design decision that allows identifying divergent cases like high-CGPA students who still face high placement risk.

---

## Directory Contents

| File | Type | Description |
| :--- | :--- | :--- |
| `academic_risk_model.joblib` | LightGBM Classifier | Predicts whether a student is at risk of academic failure, semester backlog, or probation |
| `placement_risk_model.joblib` | Logistic Regression | Predicts whether a student faces placement readiness gaps or unplaced risk |
| `feature_scaler.joblib` | Scikit-learn StandardScaler | Normalizes the 17 input features before model inference |
| `model_metadata.json` | JSON | Feature schema, input column ordering, benchmark leaderboard, model version tags |

---

## Training Dataset

| Property | Value |
| :--- | :--- |
| Source file | `kaggle.csv` (repository root) |
| Total records | 50,000 verified student records |
| Train/Test split | 80% train / 20% held-out test (10,000 records) |
| Features engineered | 17 dimensions across 6 domain categories |
| Demographic attributes excluded | Gender, caste, religion, income — excluded for fairness |

---

## Input Feature Contract — Exact 17 Dimensions

Features **must** be provided in this exact order when calling the models directly. The `model_metadata.json` file is the authoritative source.

| # | Feature | Expected Range | Domain | Description |
| :- | :--- | :--- | :--- | :--- |
| 0 | `cgpa` | 0.0 – 10.0 | Academic | Cumulative Grade Point Average |
| 1 | `backlogs` | 0 – 10 | Academic | Count of active uncleared backlogs |
| 2 | `overall_attendance_pct` | 0.0 – 100.0 | Attendance | Overall semester attendance percentage |
| 3 | `lms_assignment_completion_pct` | 0.0 – 100.0 | LMS | Percentage of submitted LMS assignments |
| 4 | `lms_logins_per_week` | 0 – 30 | LMS | Average weekly LMS portal login count |
| 5 | `aptitude_score` | 0.0 – 100.0 | Placement | Quantitative, logical, and verbal aptitude score |
| 6 | `coding_skills` | 0.0 – 10.0 | Placement | Practical programming assessment score |
| 7 | `dsa_score` | 0.0 – 10.0 | Placement | Data structures and algorithms score |
| 8 | `system_design` | 0.0 – 10.0 | Skills | System architecture and design rating |
| 9 | `internships` | 0 – 5 | Experience | Number of completed internships |
| 10 | `projects_count` | 0 – 10 | Experience | Number of completed technical projects |
| 11 | `certifications` | 0 – 10 | Engagement | Industry or course certifications earned |
| 12 | `hackathons` | 0 – 10 | Engagement | Hackathons or coding competitions participated |
| 13 | `open_source` | 0 – 10 | Engagement | Open source contributions or public repositories |
| 14 | `communication_skills` | 0.0 – 10.0 | Skills | Soft skills and interview communication rating |
| 15 | `ml_knowledge` | 0.0 – 10.0 | Skills | Advanced technical domain knowledge score |
| 16 | `faculty_feedback_rating` | 1.0 – 5.0 | Feedback | Faculty's holistic assessment of student engagement |

---

## Benchmark Performance Metrics

Evaluated on 10,000 held-out test records with an 80/20 stratified split:

### Academic Risk Model

| Model | Accuracy | Precision | Recall | F1 Score | ROC-AUC | Selected |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **LightGBM** | 90.97% | 0.7736 | 0.9606 | **0.8570** | **0.9497** | ✅ |
| XGBoost | 90.95% | 0.7735 | 0.9599 | 0.8566 | 0.9502 | |
| Random Forest | 90.95% | 0.7735 | 0.9599 | 0.8566 | 0.9504 | |
| Logistic Regression | 84.94% | 0.8033 | 0.6163 | 0.6975 | 0.9458 | |

LightGBM was selected for superior F1 score and strong probability calibration for the minority (at-risk) class.

### Placement Risk Model

| Model | Accuracy | Precision | Recall | F1 Score | ROC-AUC | Selected |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **Logistic Regression** | 69.30% | 0.5649 | 0.1332 | **0.2156** | **0.6572** | ✅ |
| LightGBM | 69.09% | 0.5554 | 0.1203 | 0.1978 | 0.6498 | |
| XGBoost | 69.01% | 0.5642 | 0.0944 | 0.1618 | 0.6507 | |
| Random Forest | 68.76% | 0.5900 | 0.0445 | 0.0828 | 0.6448 | |

Logistic Regression was selected as the best baseline for the placement task due to higher ROC-AUC. A calibrated decision threshold of **0.35** (instead of 0.50) is applied to account for class imbalance in placement outcomes.

> **Note:** Placement risk classification is inherently harder than academic risk due to lower signal correlation and smaller minority class. Ongoing improvement with richer placement-specific features is planned.

---

## Risk Band Thresholds

| Target | HIGH | MEDIUM | LOW |
| :--- | :--- | :--- | :--- |
| Academic Risk | probability ≥ 0.50 | 0.30 – 0.50 | < 0.30 |
| Placement Risk | probability ≥ 0.35 | 0.20 – 0.35 | < 0.20 |

---

## Usage via `ml_service.py`

The `ml_service.py` at the repository root provides three callable functions:

```python
from ml_service import analyze_student

student = {
    "student_id": "STU_0001",
    "cgpa": 7.45,
    "backlogs": 0,
    "overall_attendance_pct": 80.0,
    "lms_assignment_completion_pct": 100.0,
    "lms_logins_per_week": 7,
    "aptitude_score": 68.0,
    "coding_skills": 6.5,
    "dsa_score": 6.0,
    "system_design": 5.5,
    "internships": 1,
    "projects_count": 2,
    "certifications": 1,
    "hackathons": 1,
    "open_source": 0,
    "communication_skills": 6.5,
    "ml_knowledge": 4.0,
    "faculty_feedback_rating": 3.8
}

result = analyze_student(student)
# Returns: { student_id, success_score: {...}, risks: { academic_risk, placement_risk, top_risk_factors } }
```

**Functions available:**
- `calculate_student_success_score(student)` — Returns the deterministic `sss-v1` composite score with component breakdown.
- `predict_student_risks(student)` — Returns academic and placement risk bands with top 3 contributing risk factors.
- `analyze_student(student)` — Combined convenience wrapper returning both score and risks.
- `get_model_registry()` — Returns model metadata, feature schema, and benchmark scores for the admin portal.

---

## Fallback Behaviour

If model `.joblib` files are missing or fail to load, `ml_service.py` automatically falls back to **calibrated heuristics**:

- **Academic Risk Heuristic:** `min(0.95, (backlogs × 0.35) + (1 − attendance/100) × 0.40 + (1 − cgpa/10) × 0.25)`
- **Placement Risk Heuristic:** `min(0.95, (1 − coding/10) × 0.50 + (1 − aptitude/100) × 0.40)`

This ensures the platform always produces risk assessments, even in demo environments where full model binaries are not yet deployed.

The backend also never fabricates predictions — if the ML service returns an error or is unreachable, the backend returns a clean `503` with a clear message.

---

## Responsible AI Notes

- **No demographic features:** Gender, caste, religion, and socioeconomic indicators are strictly excluded from all models.
- **Decoupled outputs:** Academic risk and placement risk are presented independently. They are never blended into a single "overall risk" score.
- **Advisory signals only:** All model outputs are decision-support signals. No automated actions are taken on model outputs without human approval.
- **Probability transparency:** Risk probabilities are surfaced alongside band labels so staff can assess model confidence, not just binary flags.

# ML Inference Service Contract (FastAPI ↔ Express Backend)

**Platform:** PRATIBHA — Smart Campus Analytics  
**Document Version:** 1.0  
**Model Training Artifacts:** `models/model_metadata.json`, `models/academic_risk_model.joblib`, `models/placement_risk_model.joblib`

---

## 1. Overview & Service Boundaries

The machine learning inference engine runs as a standalone Python + FastAPI service.  
The Express backend acts as the sole orchestrator:
- The browser/frontend **never** calls the ML service directly.
- The backend aggregates student category records, extracts features as of `asOfDate`, and sends feature vectors to the ML service.
- The backend validates the ML response, persists accepted prediction snapshots in MongoDB (`risk_predictions`), and returns explainable results to authorized callers.
- **Strict Rule:** If the ML service is unreachable, timed out, or returns an error, the backend returns a clear 503/504 error and **never** fabricates synthetic predictions.

---

## 2. Model Specifications & Leaderboard

Based on model training on `kaggle.csv` (50,000 synthetic campus records):

### Academic Risk Model (`academic_risk`)
- **Primary Model:** Random Forest / LightGBM
- **Accuracy:** ~90.97%
- **Recall:** 96.06% (high sensitivity to prevent at-risk students from going unnoticed)
- **ROC-AUC:** 0.9504

### Placement Risk Model (`placement_risk`)
- **Primary Model:** Logistic Regression / LightGBM
- **Accuracy:** ~69.3%
- **ROC-AUC:** 0.6572

---

## 3. Feature Contract (`fs-v1`)

The backend feature builder produces an exact 17-feature vector matching `model_metadata.json`:

| Feature Name | Type | Range / Unit | Source / Derivation |
| :--- | :--- | :--- | :--- |
| `cgpa` | float | 0.0 – 10.0 | AcademicRecord latest CGPA |
| `backlogs` | integer | ≥ 0 | Count of active backlogs |
| `overall_attendance_pct` | float | 0.0 – 100.0 | Overall classes attended / classes held |
| `lms_assignment_completion_pct`| float | 0.0 – 100.0 | LMS assignments completed / assigned |
| `lms_logins_per_week` | float | ≥ 0.0 | LMS login frequency averaged per week |
| `aptitude_score` | float | 0.0 – 100.0 | Latest Aptitude assessment score |
| `coding_skills` | float | 0.0 – 10.0 | Coding skill evaluation (normalized to 10) |
| `dsa_score` | float | 0.0 – 10.0 | DSA technical assessment (normalized to 10) |
| `system_design` | float | 0.0 – 10.0 | System Design skill score (normalized to 10) |
| `internships` | integer | ≥ 0 | Count of completed internships |
| `projects_count` | integer | ≥ 0 | Count of verified projects |
| `certifications` | integer | ≥ 0 | Count of verified certifications |
| `hackathons` | integer | ≥ 0 | Count of hackathons participated/won |
| `open_source` | integer | ≥ 0 | Count of open source contributions |
| `communication_skills` | float | 0.0 – 10.0 | Soft skills evaluation (normalized to 10) |
| `ml_knowledge` | float | 0.0 – 10.0 | Machine Learning skill rating (normalized to 10) |
| `faculty_feedback_rating`| float | 1.0 – 5.0 | Average faculty feedback score |

---

## 4. API Specification

### Endpoint: `POST /predict`

#### Request Body
```json
{
  "studentId": "STU_2024_001",
  "target": "academic_risk",
  "asOfDate": "2026-10-09T16:30:00Z",
  "features": {
    "cgpa": 7.8,
    "backlogs": 1,
    "overall_attendance_pct": 82.5,
    "lms_assignment_completion_pct": 85.0,
    "lms_logins_per_week": 4.5,
    "aptitude_score": 72.0,
    "coding_skills": 7.0,
    "dsa_score": 6.5,
    "system_design": 5.0,
    "internships": 1,
    "projects_count": 3,
    "certifications": 2,
    "hackathons": 1,
    "open_source": 0,
    "communication_skills": 7.5,
    "ml_knowledge": 6.0,
    "faculty_feedback_rating": 4.0
  }
}
```

#### Successful Response (`200 OK`)
```json
{
  "studentId": "STU_2024_001",
  "target": "academic_risk",
  "riskLevel": "medium",
  "probability": 0.42,
  "modelVersion": "academic_rf_v1.0",
  "featureSetVersion": "fs-v1",
  "drivers": [
    {
      "name": "backlogs",
      "direction": "increases_risk",
      "observedValue": 1,
      "explanation": "Active backlog increases academic risk probability."
    },
    {
      "name": "cgpa",
      "direction": "decreases_risk",
      "observedValue": 7.8,
      "explanation": "CGPA of 7.8 provides strong academic baseline."
    }
  ],
  "limitations": [
    "Trained on synthetic campus records cohort v1.0",
    "Model confidence is bounded for early semester transfers"
  ],
  "predictedAt": "2026-10-09T16:30:01Z"
}
```

#### Error Contract
- `400 Bad Request`: Feature schema mismatch or missing required feature.
- `422 Unprocessable Entity`: Value out of valid range.
- `500 Internal Server Error`: Model inference failure.

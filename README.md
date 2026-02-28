# 🏥 HealthPredict AI — Smart Healthcare Risk Prediction & Patient Segmentation System

> Production-grade ML-powered healthcare risk prediction system with real-time predictions, interactive visualizations, and explainable AI.

---

## 📐 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 15)                 │
│  ┌─────────┐ ┌───────────┐ ┌─────────────┐ ┌────────────┐  │
│  │  Home   │ │   Data    │ │ Predictions │ │   Metrics  │  │
│  │  Page   │ │ Generator │ │    Page     │ │    Page    │  │
│  └─────────┘ └───────────┘ └─────────────┘ └────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Visualizations Page (Recharts)             │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────────┘
                           │ REST API (JSON)
┌──────────────────────────▼───────────────────────────────────┐
│                     Backend (FastAPI)                         │
│  ┌───────────────────────────────────────────────────────┐   │
│  │                    API Routers                        │   │
│  │   /generate-data  /train-models  /predict  /clusters  │   │
│  │   /metrics  /feature-importance  /shap-explanation    │   │
│  └───────────────────────┬───────────────────────────────┘   │
│  ┌───────────────────────▼───────────────────────────────┐   │
│  │                 ML Service Layer                      │   │
│  │  Linear Regression │ Decision Tree │ KNN │ K-Means   │   │
│  │  SHAP Explainer    │ Risk Scorer   │ PDF Generator   │   │
│  └───────────────────────┬───────────────────────────────┘   │
│  ┌───────────────────────▼───────────────────────────────┐   │
│  │         Data Layer (Pandas + joblib persistence)      │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Tech Stack

| Layer     | Technology                                    |
| --------- | --------------------------------------------- |
| Backend   | Python 3.11, FastAPI, Pydantic                |
| ML        | scikit-learn, SHAP, NumPy, Pandas             |
| Reports   | ReportLab (PDF generation)                    |
| Frontend  | Next.js 15, TypeScript, Tailwind CSS, Recharts|
| DevOps    | Docker, docker-compose                        |

---

## 📂 Project Structure

```
HEALTHCARE/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Configuration constants
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic schemas
│   │   ├── services/
│   │   │   ├── data_generator.py  # Synthetic dataset generator
│   │   │   ├── ml_service.py      # ML training, prediction, SHAP
│   │   │   └── report_service.py  # PDF report generator
│   │   ├── routers/
│   │   │   ├── data.py          # /generate-data, /upload-csv, /data/*
│   │   │   ├── models.py        # /train-models, /metrics, /shap-*
│   │   │   ├── predictions.py   # /predict, /predict/report
│   │   │   └── clusters.py      # /clusters
│   │   └── utils/
│   │       └── helpers.py       # Input normalization
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── page.tsx         # Home page
│   │   │   ├── globals.css      # Global styles
│   │   │   ├── data-generator/page.tsx
│   │   │   ├── predictions/page.tsx
│   │   │   ├── visualizations/page.tsx
│   │   │   └── metrics/page.tsx
│   │   ├── components/
│   │   │   └── Navbar.tsx
│   │   └── lib/
│   │       └── api.ts           # API client
│   ├── package.json
│   ├── next.config.ts
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🛠️ Installation & Running

### Prerequisites
- Python 3.11+
- Node.js 20+
- npm / pnpm

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API is live at **http://localhost:8000**  
Swagger docs: **http://localhost:8000/docs**  
ReDoc: **http://localhost:8000/redoc**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI is live at **http://localhost:3000**

---

## 🐳 Docker Deployment

```bash
# Build and run both services
docker-compose up --build

# Access:
# Frontend → http://localhost:3000
# Backend  → http://localhost:8000
# API Docs → http://localhost:8000/docs
```

---

## ☁️ Cloud Deployment

### Render
1. Create two services: **backend** (Docker) and **frontend** (Docker).
2. Set `FRONTEND_URL` env var on backend to your frontend URL.
3. Set `NEXT_PUBLIC_API_URL` on the frontend to `https://your-backend.onrender.com/api`.

### Railway
1. Create a new project, add both `backend/` and `frontend/` as services.
2. Railway auto-detects the Dockerfiles.
3. Set the same environment variables as above.

### Fly.io
```bash
# Backend
cd backend
fly launch --name healthcare-backend
fly deploy

# Frontend
cd frontend
fly launch --name healthcare-frontend
fly deploy
```

---

## 📡 API Documentation

### Endpoints

| Method | Endpoint               | Description                          |
| ------ | ---------------------- | ------------------------------------ |
| POST   | `/api/generate-data`   | Generate synthetic dataset           |
| POST   | `/api/upload-csv`      | Upload CSV dataset                   |
| GET    | `/api/data/preview`    | Preview current dataset              |
| GET    | `/api/data/download`   | Download dataset as CSV              |
| POST   | `/api/train-models`    | Train all 4 ML models                |
| GET    | `/api/metrics`         | Get all model evaluation metrics     |
| POST   | `/api/predict`         | Predict from patient vitals          |
| POST   | `/api/predict/report`  | Predict + download PDF report        |
| GET    | `/api/clusters`        | Get cluster data + PCA projection    |
| GET    | `/api/feature-importance` | Feature importance analysis       |
| GET    | `/api/shap-explanation`| SHAP explainability data             |
| GET    | `/api/tree-visualization`| Decision tree text visualization   |
| GET    | `/api/download-model`  | Download trained model file          |

### Example: Generate Data

```bash
curl -X POST http://localhost:8000/api/generate-data \
  -H "Content-Type: application/json" \
  -d '{"num_records": 1500, "seed": 42}'
```

### Example: Train Models

```bash
curl -X POST http://localhost:8000/api/train-models \
  -H "Content-Type: application/json" \
  -d '{"test_size": 0.2, "random_state": 42}'
```

### Example: Predict

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 55,
    "gender": "Male",
    "bmi": 31.2,
    "blood_pressure": 150,
    "cholesterol_level": 260,
    "glucose_level": 180,
    "smoking_habit": true,
    "physical_activity_level": "Low",
    "family_medical_history": true,
    "previous_hospital_visits": 7
  }'
```

### Example Response

```json
{
  "disease_presence": 1,
  "disease_probability": 0.8234,
  "risk_category": "High",
  "risk_probabilities": {"High": 0.72, "Medium": 0.21, "Low": 0.07},
  "predicted_medical_expenses": 28453.12,
  "risk_score": 68.4,
  "risk_explanation": "Risk Score: 68.4/100 — High risk. Contributing factors: advanced age (>60), elevated BMI (obese range), high blood pressure, high cholesterol, elevated glucose levels, active smoking habit, low physical activity, family medical history. Immediate medical consultation is recommended."
}
```

---

## 🧠 ML Models

| Model              | Task                    | Target Variable    |
| ------------------- | ---------------------- | ------------------ |
| Linear Regression   | Regression             | Medical_Expenses   |
| Decision Tree       | Binary Classification  | Disease_Presence   |
| KNN                 | Multi-class Classification | Risk_Category  |
| K-Means             | Unsupervised Clustering | Patient Segments  |

---

## 🌟 Innovation Features

- **SHAP Explainability** — Understand Decision Tree predictions
- **Feature Importance Charts** — Compare feature impact across models
- **Risk Scoring Engine** — 0-100 composite risk score with explanations
- **PDF Patient Reports** — Professional downloadable summaries
- **K-Optimization Visualization** — Interactive KNN hyperparameter tuning
- **Elbow & Silhouette Analysis** — Optimal cluster selection
- **Responsive Mobile Design** — Full mobile support

---

## 📸 Screenshots

> Run the application and navigate to each page to see the UI in action.

| Page | Description |
|------|-------------|
| Home | Project overview with features, architecture, and tech stack |
| Data Generator | Generate synthetic data or upload CSV with live preview |
| Predictions | Real-time patient risk predictions with KPI cards |
| Visualizations | Interactive charts: clusters, elbow, feature importance |
| Model Metrics | Detailed metrics for all 4 models with confusion matrices |

---

## 📄 License

MIT License — Built for hackathon excellence.

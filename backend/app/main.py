"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import FRONTEND_URL
from app.routers import data, models, predictions, clusters

# ── Application Factory ──────────────────────────────────────────────────────
app = FastAPI(
    title="Smart Healthcare Risk Prediction API",
    description=(
        "Production-grade API for healthcare risk prediction, "
        "patient segmentation, and ML model management."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(data.router)
app.include_router(models.router)
app.include_router(predictions.router)
app.include_router(clusters.router)


# ── Health Check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    """Root health-check endpoint."""
    from app.services.ml_service import is_trained
    from app.services.data_generator import load_dataset

    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "Smart Healthcare Risk Prediction API",
        "models_trained": is_trained(),
        "data_available": load_dataset() is not None,
    }


@app.get("/health", tags=["Health"])
async def health():
    """Detailed health check."""
    from app.services.ml_service import is_trained
    from app.services.data_generator import load_dataset

    return {
        "status": "healthy",
        "version": "1.0.0",
        "models_trained": is_trained(),
        "data_available": load_dataset() is not None,
    }

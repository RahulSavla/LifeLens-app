"""Application configuration settings."""

import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# Dataset settings
DEFAULT_NUM_RECORDS = 1500
RANDOM_SEED = 42

# Model settings
TEST_SIZE = 0.2
KNN_MAX_K = 25
KMEANS_MAX_CLUSTERS = 10

# CORS settings
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

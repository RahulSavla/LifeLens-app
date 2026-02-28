"""Data generation and CSV upload router."""

import io
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException

from app.models.schemas import DataGenerationRequest, DataGenerationResponse, CSVUploadResponse
from app.services.data_generator import generate_synthetic_data, save_dataset, load_dataset

router = APIRouter(prefix="/api", tags=["Data"])


@router.post("/generate-data", response_model=DataGenerationResponse)
async def generate_data(request: DataGenerationRequest):
    """Generate synthetic healthcare dataset."""
    try:
        df = generate_synthetic_data(
            num_records=request.num_records,
            seed=request.seed,
        )
        filepath = save_dataset(df)
        sample = df.head(10).to_dict(orient="records")

        return DataGenerationResponse(
            message=f"Successfully generated {len(df)} patient records.",
            num_records=len(df),
            columns=list(df.columns),
            sample_data=sample,
            file_path=filepath,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-csv", response_model=CSVUploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    """Upload a CSV file as the dataset."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        required_cols = [
            "Age", "Gender", "BMI", "Blood_Pressure", "Cholesterol_Level",
            "Glucose_Level", "Smoking_Habit", "Physical_Activity_Level",
            "Family_Medical_History", "Previous_Hospital_Visits",
            "Disease_Presence", "Risk_Category", "Medical_Expenses",
        ]
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {missing}",
            )

        save_dataset(df)

        return CSVUploadResponse(
            message=f"Uploaded {len(df)} records successfully.",
            num_records=len(df),
            columns=list(df.columns),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/data/preview")
async def preview_data(rows: int = 20):
    """Preview the current dataset."""
    df = load_dataset()
    if df is None:
        raise HTTPException(status_code=404, detail="No dataset found. Generate or upload data first.")

    return {
        "total_records": len(df),
        "columns": list(df.columns),
        "data": df.head(rows).to_dict(orient="records"),
        "statistics": {
            col: {
                "mean": round(float(df[col].mean()), 2),
                "std": round(float(df[col].std()), 2),
                "min": round(float(df[col].min()), 2),
                "max": round(float(df[col].max()), 2),
            }
            for col in df.select_dtypes(include="number").columns
        },
    }


@router.get("/data/download")
async def download_data():
    """Download the current dataset as CSV."""
    from fastapi.responses import FileResponse
    from app.config import DATA_DIR

    filepath = DATA_DIR / "healthcare_dataset.csv"
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="No dataset available.")

    return FileResponse(
        path=str(filepath),
        media_type="text/csv",
        filename="healthcare_dataset.csv",
    )

"""Prediction and report generation router."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.models.schemas import PatientInput, PredictionResponse
from app.services.ml_service import predict_patient, is_trained
from app.services.report_service import generate_patient_report
from app.utils.helpers import clean_patient_input

router = APIRouter(prefix="/api", tags=["Predictions"])


@router.post("/predict", response_model=PredictionResponse)
async def predict(patient: PatientInput):
    """Run all models on a patient and return predictions."""
    if not is_trained():
        raise HTTPException(
            status_code=400,
            detail="Models not trained yet. Call /api/train-models first.",
        )

    try:
        patient_dict = clean_patient_input(patient.model_dump())
        result = predict_patient(patient_dict)
        return PredictionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict/report")
async def predict_and_report(patient: PatientInput):
    """Predict + generate a downloadable PDF report."""
    if not is_trained():
        raise HTTPException(
            status_code=400,
            detail="Models not trained yet. Call /api/train-models first.",
        )

    try:
        raw = patient.model_dump()
        patient_dict = clean_patient_input(raw)
        prediction = predict_patient(patient_dict)
        pdf_bytes = generate_patient_report(raw, prediction)

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=patient_report.pdf"
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

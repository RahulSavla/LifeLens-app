"""Model training and metrics router."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.models.schemas import TrainModelsRequest, AllMetricsResponse
from app.services.data_generator import load_dataset
from app.services.ml_service import (
    train_all_models, get_all_metrics, is_trained,
    get_feature_importance, get_shap_explanation, get_model_download_path,
    get_tree_structure,
)

router = APIRouter(prefix="/api", tags=["Models"])


@router.post("/train-models")
async def train_models(request: TrainModelsRequest = TrainModelsRequest()):
    """Train all ML models on the current dataset."""
    df = load_dataset()
    if df is None:
        raise HTTPException(
            status_code=404,
            detail="No dataset found. Generate or upload data first.",
        )

    try:
        results = train_all_models(
            df, test_size=request.test_size, random_state=request.random_state
        )
        return {
            "message": "All models trained successfully.",
            **results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    """Get evaluation metrics for all trained models."""
    metrics = get_all_metrics()
    if not metrics or (len(metrics) == 1 and "training_timestamp" in metrics):
        raise HTTPException(
            status_code=404,
            detail="No metrics available. Train models first.",
        )
    return metrics


@router.get("/feature-importance")
async def feature_importance():
    """Get feature importance from Decision Tree and SHAP."""
    result = get_feature_importance()
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/shap-explanation")
async def shap_explanation():
    """Get SHAP explainability data for the Decision Tree model."""
    df = load_dataset()
    if df is None:
        raise HTTPException(status_code=404, detail="No dataset found.")

    if not is_trained():
        raise HTTPException(status_code=404, detail="Models not trained yet.")

    try:
        result = get_shap_explanation(df)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download-model")
async def download_model():
    """Download the trained model file."""
    path = get_model_download_path("all")
    if not path:
        raise HTTPException(status_code=404, detail="No trained model file found.")

    return FileResponse(
        path=path,
        media_type="application/octet-stream",
        filename="trained_models.pkl",
    )


@router.get("/tree-visualization")
async def tree_visualization():
    """Get the Decision Tree text and structured representation."""
    from app.config import MODELS_DIR

    tree_path = MODELS_DIR / "decision_tree_text.txt"
    tree_text = tree_path.read_text() if tree_path.exists() else None

    try:
        tree_structure = get_tree_structure(max_depth=4)
    except Exception:
        tree_structure = None

    if not tree_text and not tree_structure:
        raise HTTPException(status_code=404, detail="Tree not trained yet.")

    return {"tree_text": tree_text, "tree_structure": tree_structure}


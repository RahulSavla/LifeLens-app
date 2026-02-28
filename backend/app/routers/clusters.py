"""Clustering and visualization router."""

from fastapi import APIRouter, HTTPException

from app.services.data_generator import load_dataset
from app.services.ml_service import get_cluster_data, is_trained

router = APIRouter(prefix="/api", tags=["Clusters"])


@router.get("/clusters")
async def clusters():
    """Get cluster assignments, PCA projection, and cluster summaries."""
    df = load_dataset()
    if df is None:
        raise HTTPException(status_code=404, detail="No dataset found.")
    if not is_trained():
        raise HTTPException(status_code=400, detail="Models not trained yet.")

    try:
        result = get_cluster_data(df)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

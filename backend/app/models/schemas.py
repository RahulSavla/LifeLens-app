"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, Field, AliasChoices
from typing import Optional, List, Dict, Any
from enum import Enum


class GenderEnum(str, Enum):
    male = "Male"
    female = "Female"
    other = "Other"


class ActivityLevelEnum(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


class RiskCategoryEnum(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


# ── Request Schemas ──────────────────────────────────────────────────────────

class DataGenerationRequest(BaseModel):
    """Request schema for synthetic data generation."""
    num_records: int = Field(default=1500, ge=100, le=10000, description="Number of records to generate")
    seed: Optional[int] = Field(default=42, description="Random seed for reproducibility")


class PatientInput(BaseModel):
    """Single patient input for prediction."""
    model_config = {"populate_by_name": True}

    age: int = Field(..., validation_alias=AliasChoices("age", "Age"), ge=18, le=85)
    gender: GenderEnum = Field(..., validation_alias=AliasChoices("gender", "Gender"))
    bmi: float = Field(..., validation_alias=AliasChoices("bmi", "BMI"), ge=10.0, le=60.0)
    blood_pressure: float = Field(..., validation_alias=AliasChoices("blood_pressure", "Blood_Pressure"), ge=60.0, le=250.0)
    cholesterol_level: float = Field(..., validation_alias=AliasChoices("cholesterol_level", "Cholesterol_Level"), ge=100.0, le=400.0)
    glucose_level: float = Field(..., validation_alias=AliasChoices("glucose_level", "Glucose_Level"), ge=50.0, le=400.0)
    smoking_habit: bool = Field(..., validation_alias=AliasChoices("smoking_habit", "Smoking_Habit"))
    physical_activity_level: ActivityLevelEnum = Field(..., validation_alias=AliasChoices("physical_activity_level", "Physical_Activity_Level"))
    family_medical_history: bool = Field(..., validation_alias=AliasChoices("family_medical_history", "Family_Medical_History"))
    previous_hospital_visits: int = Field(..., validation_alias=AliasChoices("previous_hospital_visits", "Previous_Hospital_Visits"), ge=0, le=50)


class TrainModelsRequest(BaseModel):
    """Request schema for model training."""
    test_size: float = Field(default=0.2, ge=0.1, le=0.4, description="Test split ratio")
    random_state: int = Field(default=42, description="Random state for reproducibility")


class CSVUploadResponse(BaseModel):
    """Response after CSV upload."""
    message: str
    num_records: int
    columns: List[str]


# ── Response Schemas ─────────────────────────────────────────────────────────

class DataGenerationResponse(BaseModel):
    """Response schema for data generation."""
    message: str
    num_records: int
    columns: List[str]
    sample_data: List[Dict[str, Any]]
    file_path: str


class PredictionResponse(BaseModel):
    """Response schema for predictions."""
    patient_id: Optional[str] = None
    disease_presence: int
    disease_probability: float
    risk_category: str
    risk_probabilities: Dict[str, float]
    predicted_medical_expenses: float
    risk_score: float
    risk_explanation: str
    recommendations: List[str]


class LinearRegressionMetrics(BaseModel):
    """Metrics for Linear Regression."""
    r2_score: float
    mae: float
    rmse: float
    coefficients: Dict[str, float]


class DecisionTreeMetrics(BaseModel):
    """Metrics for Decision Tree."""
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: List[List[int]]
    feature_importances: Dict[str, float]


class KNNMetrics(BaseModel):
    """Metrics for KNN."""
    best_k: int
    accuracy: float
    precision_macro: float
    recall_macro: float
    f1_macro: float
    k_scores: Dict[int, float]
    confusion_matrix: List[List[int]]


class KMeansMetrics(BaseModel):
    """Metrics for K-Means."""
    optimal_clusters: int
    inertias: Dict[int, float]
    silhouette_scores: Dict[int, float]
    cluster_sizes: Dict[int, int]
    cluster_centers: List[List[float]]


class AllMetricsResponse(BaseModel):
    """Combined metrics for all models."""
    linear_regression: Optional[LinearRegressionMetrics] = None
    decision_tree: Optional[DecisionTreeMetrics] = None
    knn: Optional[KNNMetrics] = None
    kmeans: Optional[KMeansMetrics] = None
    training_timestamp: Optional[str] = None


class ClusterResponse(BaseModel):
    """Response for cluster information."""
    cluster_assignments: List[int]
    cluster_summary: List[Dict[str, Any]]
    pca_data: List[Dict[str, float]]
    optimal_clusters: int


class SHAPExplanation(BaseModel):
    """SHAP explainability response."""
    feature_names: List[str]
    shap_values: List[List[float]]
    base_value: float
    mean_abs_shap: Dict[str, float]


class FeatureImportanceResponse(BaseModel):
    """Feature importance response."""
    decision_tree: Dict[str, float]
    shap_importance: Dict[str, float]


class HealthCheckResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    models_trained: bool
    data_available: bool

"""Machine Learning service: training, prediction, and evaluation."""

import numpy as np
import pandas as pd
import joblib
import json
from datetime import datetime
from typing import Dict, Any, Optional, Tuple, List

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.neighbors import KNeighborsClassifier
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import (
    r2_score, mean_absolute_error, mean_squared_error,
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, silhouette_score,
)

from app.config import MODELS_DIR, DATA_DIR, TEST_SIZE, KNN_MAX_K, KMEANS_MAX_CLUSTERS


# ── Global state ─────────────────────────────────────────────────────────────
_trained_models: Dict[str, Any] = {}
_scalers: Dict[str, Any] = {}
_encoders: Dict[str, Any] = {}
_metrics: Dict[str, Any] = {}
_training_timestamp: Optional[str] = None

FEATURE_COLS = [
    "Age", "Gender", "BMI", "Blood_Pressure", "Cholesterol_Level",
    "Glucose_Level", "Smoking_Habit", "Physical_Activity_Level",
    "Family_Medical_History", "Previous_Hospital_Visits",
]


# ── Helper functions ─────────────────────────────────────────────────────────

def _encode_features(df: pd.DataFrame, fit: bool = True) -> pd.DataFrame:
    """Encode categorical features."""
    df_encoded = df.copy()

    # Gender encoding
    if fit:
        le_gender = LabelEncoder()
        df_encoded["Gender"] = le_gender.fit_transform(df_encoded["Gender"])
        _encoders["gender"] = le_gender
    else:
        df_encoded["Gender"] = _encoders["gender"].transform(df_encoded["Gender"])

    # Activity level encoding
    if fit:
        le_activity = LabelEncoder()
        df_encoded["Physical_Activity_Level"] = le_activity.fit_transform(
            df_encoded["Physical_Activity_Level"]
        )
        _encoders["activity"] = le_activity
    else:
        df_encoded["Physical_Activity_Level"] = _encoders["activity"].transform(
            df_encoded["Physical_Activity_Level"]
        )

    return df_encoded


def _prepare_data(df: pd.DataFrame) -> pd.DataFrame:
    """Prepare the full dataset: encode + ensure correct types."""
    df_copy = df[FEATURE_COLS].copy()
    df_encoded = _encode_features(df_copy, fit=True)
    return df_encoded


def _prepare_input(patient_dict: Dict) -> pd.DataFrame:
    """Prepare a single patient input for prediction."""
    df = pd.DataFrame([patient_dict])
    df_encoded = _encode_features(df, fit=False)
    return df_encoded


# ── Training ─────────────────────────────────────────────────────────────────

def train_all_models(
    df: pd.DataFrame,
    test_size: float = TEST_SIZE,
    random_state: int = 42,
) -> Dict[str, Any]:
    """Train all four ML models and store metrics."""
    global _training_timestamp
    _training_timestamp = datetime.utcnow().isoformat()

    X = _prepare_data(df)

    # Scale features
    scaler = StandardScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns)
    _scalers["main"] = scaler
    feature_names = list(X.columns)

    results: Dict[str, Any] = {}

    # ── 1. Linear Regression  ────────────────────────────────────────────
    y_lr = df["Medical_Expenses"].values
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_lr, test_size=test_size, random_state=random_state
    )
    lr_model = LinearRegression()
    lr_model.fit(X_train, y_train)
    y_pred_lr = lr_model.predict(X_test)

    lr_metrics = {
        "r2_score": round(r2_score(y_test, y_pred_lr), 4),
        "mae": round(mean_absolute_error(y_test, y_pred_lr), 2),
        "rmse": round(np.sqrt(mean_squared_error(y_test, y_pred_lr)), 2),
        "coefficients": {
            name: round(coef, 4)
            for name, coef in zip(feature_names, lr_model.coef_)
        },
    }
    _trained_models["linear_regression"] = lr_model
    _metrics["linear_regression"] = lr_metrics
    results["linear_regression"] = lr_metrics

    # ── 2. Decision Tree  ────────────────────────────────────────────────
    y_dt = df["Disease_Presence"].values
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_dt, test_size=test_size, random_state=random_state
    )
    dt_model = DecisionTreeClassifier(
        max_depth=8, min_samples_split=10, random_state=random_state
    )
    dt_model.fit(X_train, y_train)
    y_pred_dt = dt_model.predict(X_test)

    cm = confusion_matrix(y_test, y_pred_dt).tolist()
    dt_metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred_dt), 4),
        "precision": round(precision_score(y_test, y_pred_dt, zero_division=0), 4),
        "recall": round(recall_score(y_test, y_pred_dt, zero_division=0), 4),
        "f1_score": round(f1_score(y_test, y_pred_dt, zero_division=0), 4),
        "confusion_matrix": cm,
        "feature_importances": {
            name: round(imp, 4)
            for name, imp in zip(feature_names, dt_model.feature_importances_)
        },
    }
    _trained_models["decision_tree"] = dt_model
    _metrics["decision_tree"] = dt_metrics
    results["decision_tree"] = dt_metrics

    # Save tree text
    tree_text = export_text(dt_model, feature_names=feature_names, max_depth=5)
    (MODELS_DIR / "decision_tree_text.txt").write_text(tree_text)

    # ── 3. KNN  ──────────────────────────────────────────────────────────
    le_risk = LabelEncoder()
    y_knn = le_risk.fit_transform(df["Risk_Category"].values)
    _encoders["risk_category"] = le_risk

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_knn, test_size=test_size, random_state=random_state
    )

    # Hyperparameter tuning — find best k
    k_scores: Dict[int, float] = {}
    for k in range(1, KNN_MAX_K + 1):
        knn_temp = KNeighborsClassifier(n_neighbors=k)
        knn_temp.fit(X_train, y_train)
        k_scores[k] = round(accuracy_score(y_test, knn_temp.predict(X_test)), 4)

    best_k = max(k_scores, key=k_scores.get)
    knn_model = KNeighborsClassifier(n_neighbors=best_k)
    knn_model.fit(X_train, y_train)
    y_pred_knn = knn_model.predict(X_test)

    knn_cm = confusion_matrix(y_test, y_pred_knn).tolist()
    knn_metrics = {
        "best_k": best_k,
        "accuracy": round(accuracy_score(y_test, y_pred_knn), 4),
        "precision_macro": round(precision_score(y_test, y_pred_knn, average="macro", zero_division=0), 4),
        "recall_macro": round(recall_score(y_test, y_pred_knn, average="macro", zero_division=0), 4),
        "f1_macro": round(f1_score(y_test, y_pred_knn, average="macro", zero_division=0), 4),
        "k_scores": k_scores,
        "confusion_matrix": knn_cm,
    }
    _trained_models["knn"] = knn_model
    _metrics["knn"] = knn_metrics
    results["knn"] = knn_metrics

    # ── 4. K-Means ───────────────────────────────────────────────────────
    inertias: Dict[int, float] = {}
    sil_scores: Dict[int, float] = {}

    for n in range(2, KMEANS_MAX_CLUSTERS + 1):
        km = KMeans(n_clusters=n, random_state=random_state, n_init=10)
        labels = km.fit_predict(X_scaled)
        inertias[n] = round(float(km.inertia_), 2)
        sil_scores[n] = round(float(silhouette_score(X_scaled, labels)), 4)

    optimal_k = max(sil_scores, key=sil_scores.get)
    km_final = KMeans(n_clusters=optimal_k, random_state=random_state, n_init=10)
    cluster_labels = km_final.fit_predict(X_scaled)

    cluster_sizes = {int(k): int(v) for k, v in zip(*np.unique(cluster_labels, return_counts=True))}

    kmeans_metrics = {
        "optimal_clusters": optimal_k,
        "inertias": inertias,
        "silhouette_scores": sil_scores,
        "cluster_sizes": cluster_sizes,
        "cluster_centers": km_final.cluster_centers_.tolist(),
    }
    _trained_models["kmeans"] = km_final
    _metrics["kmeans"] = kmeans_metrics
    results["kmeans"] = kmeans_metrics

    # ── Persist models ───────────────────────────────────────────────────
    _save_models()

    results["training_timestamp"] = _training_timestamp
    return results


# ── Prediction ───────────────────────────────────────────────────────────────

def predict_patient(patient_dict: Dict) -> Dict[str, Any]:
    """Run all models on a single patient and return predictions."""
    if not _trained_models:
        _load_models()
    if not _trained_models:
        raise RuntimeError("Models not trained yet. Call /train-models first.")

    X_input = _prepare_input(patient_dict)
    scaler = _scalers["main"]
    X_scaled = pd.DataFrame(scaler.transform(X_input), columns=X_input.columns)

    # Decision Tree
    dt = _trained_models["decision_tree"]
    disease_pred = int(dt.predict(X_scaled)[0])
    disease_prob = float(dt.predict_proba(X_scaled)[0][1])

    # KNN
    knn = _trained_models["knn"]
    risk_encoded = int(knn.predict(X_scaled)[0])
    risk_label = _encoders["risk_category"].inverse_transform([risk_encoded])[0]
    risk_probs_arr = knn.predict_proba(X_scaled)[0]
    risk_classes = _encoders["risk_category"].classes_
    risk_probs = {cls: round(float(p), 4) for cls, p in zip(risk_classes, risk_probs_arr)}

    # Linear Regression
    lr = _trained_models["linear_regression"]
    expenses = float(lr.predict(X_scaled)[0])
    expenses = max(expenses, 0.0)

    # Risk Score
    risk_score = _compute_risk_score(patient_dict)
    
    # AI Recommendations
    recommendations = _generate_health_recommendations(patient_dict, risk_score, disease_pred)

    return {
        "disease_presence": disease_pred,
        "disease_probability": round(disease_prob, 4),
        "risk_category": risk_label,
        "risk_probabilities": risk_probs,
        "predicted_medical_expenses": round(expenses, 2),
        "risk_score": round(risk_score, 2),
        "risk_explanation": _generate_risk_explanation(patient_dict, risk_score, risk_label),
        "recommendations": recommendations,
    }


def get_cluster_data(df: pd.DataFrame) -> Dict[str, Any]:
    """Get cluster assignments and PCA projection for visualization."""
    if "kmeans" not in _trained_models:
        _load_models()
    if "kmeans" not in _trained_models:
        raise RuntimeError("Models not trained. Call /train-models first.")

    X = _prepare_data(df)
    scaler = _scalers["main"]
    X_scaled = scaler.transform(X)

    km = _trained_models["kmeans"]
    labels = km.predict(X_scaled)

    # PCA for 2D visualization
    pca = PCA(n_components=2)
    pca_result = pca.fit_transform(X_scaled)

    pca_data = [
        {"x": round(float(pca_result[i, 0]), 4),
         "y": round(float(pca_result[i, 1]), 4),
         "cluster": int(labels[i])}
        for i in range(len(labels))
    ]

    # Cluster summary
    df_with_cluster = df.copy()
    df_with_cluster["Cluster"] = labels
    summary = []
    for c in sorted(df_with_cluster["Cluster"].unique()):
        grp = df_with_cluster[df_with_cluster["Cluster"] == c]
        summary.append({
            "cluster": int(c),
            "size": int(len(grp)),
            "avg_age": round(float(grp["Age"].mean()), 1),
            "avg_bmi": round(float(grp["BMI"].mean()), 1),
            "avg_bp": round(float(grp["Blood_Pressure"].mean()), 1),
            "avg_cholesterol": round(float(grp["Cholesterol_Level"].mean()), 1),
            "avg_glucose": round(float(grp["Glucose_Level"].mean()), 1),
            "avg_expenses": round(float(grp["Medical_Expenses"].mean()), 2),
            "disease_rate": round(float(grp["Disease_Presence"].mean()), 4),
            "smoking_rate": round(float(grp["Smoking_Habit"].mean()), 4),
        })

    return {
        "cluster_assignments": [int(l) for l in labels],
        "cluster_summary": summary,
        "pca_data": pca_data,
        "optimal_clusters": int(km.n_clusters),
    }


def get_shap_explanation(df: pd.DataFrame) -> Dict[str, Any]:
    """Compute SHAP values for Decision Tree model."""
    try:
        import shap
    except ImportError:
        return {"error": "shap package not installed"}

    if "decision_tree" not in _trained_models:
        _load_models()

    dt = _trained_models["decision_tree"]
    X = _prepare_data(df)
    scaler = _scalers["main"]
    X_scaled = pd.DataFrame(scaler.transform(X), columns=X.columns)

    explainer = shap.TreeExplainer(dt)
    shap_values = explainer.shap_values(X_scaled)

    # For binary classification, shap_values may be a list of two arrays
    if isinstance(shap_values, list):
        sv = shap_values[1]  # class 1 (disease present)
    else:
        sv = shap_values

    feature_names = list(X.columns)
    mean_abs = np.abs(sv).mean(axis=0)
    mean_abs_dict = {
        name: round(float(val), 4)
        for name, val in sorted(zip(feature_names, mean_abs), key=lambda x: -x[1])
    }

    return {
        "feature_names": feature_names,
        "shap_values": sv[:50].tolist(),  # first 50 samples
        "base_value": round(float(explainer.expected_value if not isinstance(
            explainer.expected_value, np.ndarray) else explainer.expected_value[1]), 4),
        "mean_abs_shap": mean_abs_dict,
    }


def get_tree_structure(max_depth: int = 4) -> Dict[str, Any]:
    """Extract the decision tree structure as nested JSON for visualization."""
    if "decision_tree" not in _trained_models:
        _load_models()
    if "decision_tree" not in _trained_models:
        raise RuntimeError("Decision tree not trained yet.")

    dt = _trained_models["decision_tree"]
    tree = dt.tree_
    feature_names = list(FEATURE_COLS)

    # Remap feature indices to names used after encoding
    scaler = _scalers.get("main")
    if scaler and hasattr(scaler, "feature_names_in_"):
        feature_names = list(scaler.feature_names_in_)

    def walk(node_id: int, depth: int) -> Dict[str, Any]:
        left = tree.children_left[node_id]
        right = tree.children_right[node_id]
        samples = int(tree.n_node_samples[node_id])
        value = tree.value[node_id].tolist()
        # value shape: [[count_class_0, count_class_1]]
        class_counts = value[0] if len(value) > 0 else value
        predicted_class = int(np.argmax(class_counts))

        # Leaf node or depth limit reached
        if left == right or depth >= max_depth:
            return {
                "type": "leaf",
                "class": predicted_class,
                "samples": samples,
                "class_counts": [int(c) for c in class_counts],
            }

        feat_index = tree.feature[node_id]
        feat_name = feature_names[feat_index] if feat_index < len(feature_names) else f"feature_{feat_index}"
        threshold = round(float(tree.threshold[node_id]), 2)

        return {
            "type": "decision",
            "feature": feat_name,
            "threshold": threshold,
            "samples": samples,
            "class_counts": [int(c) for c in class_counts],
            "left": walk(left, depth + 1),
            "right": walk(right, depth + 1),
        }

    return walk(0, 0)


def get_feature_importance() -> Dict[str, Any]:
    """Get feature importance from Decision Tree and SHAP."""
    if "decision_tree" not in _metrics:
        return {"error": "Models not trained yet."}

    result = {
        "decision_tree": _metrics["decision_tree"]["feature_importances"],
    }

    # Include SHAP if available
    shap_path = MODELS_DIR / "shap_importance.json"
    if shap_path.exists():
        result["shap_importance"] = json.loads(shap_path.read_text())

    return result


# ── Metrics retrieval ────────────────────────────────────────────────────────

def get_all_metrics() -> Dict[str, Any]:
    """Return stored metrics for all models."""
    if not _metrics:
        _load_models()
    return {**_metrics, "training_timestamp": _training_timestamp}


def is_trained() -> bool:
    """Check if models are trained."""
    if _trained_models:
        return True
    _load_models()
    return bool(_trained_models)


# ── Risk scoring helpers ─────────────────────────────────────────────────────

def _compute_risk_score(patient: Dict) -> float:
    """Compute a 0-100 risk score from patient features."""
    score = 0.0
    score += (patient.get("Age", 40) / 85) * 20
    score += (patient.get("BMI", 25) / 55) * 15
    score += (patient.get("Blood_Pressure", 120) / 220) * 15
    score += (patient.get("Cholesterol_Level", 200) / 380) * 15
    score += (patient.get("Glucose_Level", 100) / 350) * 10
    if patient.get("Smoking_Habit"):
        score += 10
    activity = patient.get("Physical_Activity_Level", "Medium")
    if activity == "Low":
        score += 8
    elif activity == "Medium":
        score += 4
    if patient.get("Family_Medical_History"):
        score += 7
    return min(score, 100.0)


def _generate_risk_explanation(patient: Dict, score: float, category: str) -> str:
    """Generate a human-readable risk explanation."""
    factors = []
    if patient.get("Age", 0) > 60:
        factors.append("advanced age (>60)")
    if patient.get("BMI", 0) > 30:
        factors.append("elevated BMI (obese range)")
    if patient.get("Blood_Pressure", 0) > 140:
        factors.append("high blood pressure")
    if patient.get("Cholesterol_Level", 0) > 240:
        factors.append("high cholesterol")
    if patient.get("Glucose_Level", 0) > 140:
        factors.append("elevated glucose levels")
    if patient.get("Smoking_Habit"):
        factors.append("active smoking habit")
    if patient.get("Physical_Activity_Level") == "Low":
        factors.append("low physical activity")
    if patient.get("Family_Medical_History"):
        factors.append("family medical history")

    if not factors:
        return (
            f"Risk Score: {score:.1f}/100 — {category} risk. "
            "No major risk factors identified. Maintain healthy habits."
        )

    explanation = (
        f"Risk Score: {score:.1f}/100 — {category} risk. "
        f"Contributing factors: {', '.join(factors)}. "
    )
    if category == "High":
        explanation += "Immediate medical consultation is recommended."
    elif category == "Medium":
        explanation += "Regular monitoring and lifestyle improvements advised."
    else:
        explanation += "Continue maintaining a healthy lifestyle."

    return explanation


def _generate_health_recommendations(patient: Dict, score: float, disease_presence: int) -> List[str]:
    """Generate personalized, AI-like medical recommendations based on inputs and risks."""
    recs = []
    
    # High-level urgent
    if disease_presence == 1:
        recs.append("Immediate Medical Consultation: Early indicators of disease presence detected. Please schedule a comprehensive check-up with your primary care provider this week to confirm diagnostics.")
    elif score > 70:
        recs.append("Preventative Care Visit: Your overall risk profile is highly elevated. A preventative health screening is strongly recommended within the next 30 days.")
        
    # Categorical vitals
    bp = patient.get("Blood_Pressure", 120)
    if bp > 140:
        recs.append("Blood Pressure Management: Adopt the DASH (Dietary Approaches to Stop Hypertension) diet. Focus on reducing sodium intake below 1,500mg daily and increasing potassium-rich foods like bananas and spinach.")
    elif bp > 120:
        recs.append("Blood Pressure Monitoring: Your blood pressure is slightly elevated. Monitor it weekly and minimize processed foods to prevent hypertension progression.")
        
    bmi = patient.get("BMI", 25)
    if bmi > 30:
        recs.append("Weight Management: Consult a dietitian for a structured caloric deficit plan. Aiming for a gradual 5-10% weight reduction can significantly lower cardiovascular and metabolic risks.")
    elif bmi < 18.5:
        recs.append("Nutritional Support: Your BMI indicates you are underweight. Consider consulting a nutritionist to build lean muscle mass through nutrient-dense meals and protein integration.")
        
    chol = patient.get("Cholesterol_Level", 200)
    if chol > 240:
        recs.append("Lipid Control: High cholesterol detected. Limit saturated fats (red meat, full-fat dairy) and eliminate trans fats. Increase soluble fiber intake (oats, beans) to naturally lower LDL markers.")
        
    glu = patient.get("Glucose_Level", 100)
    if glu > 140:
        recs.append("Pre-Diabetes Protocol: Elevated fasting glucose levels found. Strictly limit refined carbohydrates and sugary beverages. Pair carbohydrates with proteins/fats to prevent glucose spiking.")
        
    # Lifestyle
    if patient.get("Smoking_Habit"):
        recs.append("Smoking Cessation: Smoking exponentially multiplies all other health risks. Connect with a smoking cessation program and consider nicotine replacement therapies.")
        
    activity = patient.get("Physical_Activity_Level", "Medium")
    if activity == "Low":
        recs.append("Activity Prescription: Transition from a sedentary routine by starting with 15 minutes of brisk walking daily. Gradually build up to the AHA-recommended 150 minutes of moderate aerobic activity per week.")
        
    # General baseline if healthy
    if len(recs) < 3:
        recs.append("Routine Maintenance: Maintain your excellent vitals by continuing annual blood panels and continuing a balanced Mediterranean-style diet.")
        recs.append("Stress & Sleep: Ensure 7-9 hours of restorative sleep per night and integrate cortisol-lowering practices like mindfulness or yoga.")
        
    return recs[:5]  # Return top 5 most relevant recommendations


# ── Persistence ──────────────────────────────────────────────────────────────

def _save_models():
    """Persist models, scalers, encoders, and metrics to disk."""
    joblib.dump(_trained_models, MODELS_DIR / "trained_models.pkl")
    joblib.dump(_scalers, MODELS_DIR / "scalers.pkl")
    joblib.dump(_encoders, MODELS_DIR / "encoders.pkl")

    metrics_out = {}
    for k, v in _metrics.items():
        if isinstance(v, dict):
            # Convert any numpy types to native Python
            metrics_out[k] = _convert_to_serializable(v)
        else:
            metrics_out[k] = v

    with open(MODELS_DIR / "metrics.json", "w") as f:
        json.dump(metrics_out, f, indent=2, default=str)


def _load_models():
    """Load persisted models from disk."""
    global _trained_models, _scalers, _encoders, _metrics, _training_timestamp

    models_path = MODELS_DIR / "trained_models.pkl"
    if models_path.exists():
        _trained_models = joblib.load(models_path)
        _scalers = joblib.load(MODELS_DIR / "scalers.pkl")
        _encoders = joblib.load(MODELS_DIR / "encoders.pkl")

        metrics_path = MODELS_DIR / "metrics.json"
        if metrics_path.exists():
            with open(metrics_path) as f:
                loaded = json.load(f)
                _training_timestamp = loaded.pop("training_timestamp", None)
                _metrics = loaded


def _convert_to_serializable(obj):
    """Recursively convert numpy types to Python native types."""
    if isinstance(obj, dict):
        return {str(k): _convert_to_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [_convert_to_serializable(i) for i in obj]
    elif isinstance(obj, (np.integer,)):
        return int(obj)
    elif isinstance(obj, (np.floating,)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    return obj


def get_model_download_path(model_name: str) -> Optional[str]:
    """Return the file path for a saved model."""
    path = MODELS_DIR / "trained_models.pkl"
    return str(path) if path.exists() else None

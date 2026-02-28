"""Synthetic healthcare dataset generator with realistic correlations."""

import numpy as np
import pandas as pd
from typing import Optional
from app.config import DATA_DIR, DEFAULT_NUM_RECORDS, RANDOM_SEED


def generate_synthetic_data(
    num_records: int = DEFAULT_NUM_RECORDS,
    seed: int = RANDOM_SEED
) -> pd.DataFrame:
    """
    Generate a synthetic healthcare dataset with realistic feature correlations.

    Args:
        num_records: Number of patient records to generate.
        seed: Random seed for reproducibility.

    Returns:
        pd.DataFrame with patient features and target variables.
    """
    rng = np.random.RandomState(seed)

    # ── Base Features ────────────────────────────────────────────────────
    age = rng.randint(18, 86, size=num_records)
    gender = rng.choice(["Male", "Female", "Other"], size=num_records, p=[0.48, 0.48, 0.04])

    # BMI: correlated with age; older patients tend to have slightly higher BMI
    bmi_base = 18.5 + (age - 18) * 0.08 + rng.normal(0, 3.5, num_records)
    bmi = np.clip(bmi_base, 15.0, 55.0).round(1)

    # Blood Pressure: increases with age and BMI
    bp_base = 90 + (age - 18) * 0.6 + (bmi - 22) * 1.2 + rng.normal(0, 12, num_records)
    blood_pressure = np.clip(bp_base, 70, 220).round(0)

    # Cholesterol: correlated with age, BMI, and gender
    gender_factor = np.where(np.array(gender) == "Male", 8, 0)
    chol_base = 150 + (age - 18) * 0.8 + (bmi - 22) * 2.5 + gender_factor + rng.normal(0, 25, num_records)
    cholesterol_level = np.clip(chol_base, 110, 380).round(0)

    # Glucose Level: correlated with BMI and age
    glucose_base = 75 + (bmi - 22) * 2.0 + (age - 18) * 0.3 + rng.normal(0, 18, num_records)
    glucose_level = np.clip(glucose_base, 55, 350).round(0)

    # Smoking Habit: higher probability for males
    smoking_prob = np.where(np.array(gender) == "Male", 0.30, 0.18)
    smoking_prob = np.where(np.array(gender) == "Other", 0.22, smoking_prob)
    smoking_habit = rng.binomial(1, smoking_prob)

    # Physical Activity Level: inversely correlated with age and BMI
    activity_score = 2 - (age - 18) * 0.015 - (bmi - 22) * 0.04 + rng.normal(0, 0.5, num_records)
    activity_labels = np.where(activity_score > 1.3, "High",
                               np.where(activity_score > 0.5, "Medium", "Low"))

    # Family Medical History: baseline ~35% probability
    family_history = rng.binomial(1, 0.35, size=num_records)

    # Previous Hospital Visits: correlated with age
    visits_lambda = 1.0 + (age - 18) * 0.06
    previous_hospital_visits = rng.poisson(visits_lambda)
    previous_hospital_visits = np.clip(previous_hospital_visits, 0, 40).astype(int)

    # ── Target Variables ─────────────────────────────────────────────────

    # Disease Presence (binary): logistic model
    disease_logit = (
        -5.5
        + 0.04 * age
        + 0.08 * (bmi - 22)
        + 0.015 * (blood_pressure - 120)
        + 0.008 * (cholesterol_level - 200)
        + 0.006 * (glucose_level - 100)
        + 0.8 * smoking_habit
        + np.where(activity_labels == "Low", 0.6,
                   np.where(activity_labels == "Medium", 0.0, -0.4))
        + 0.5 * family_history
        + 0.05 * previous_hospital_visits
    )
    disease_prob = 1 / (1 + np.exp(-disease_logit))
    disease_presence = rng.binomial(1, disease_prob)

    # Risk Category: based on a composite risk score
    risk_score = (
        (age / 85) * 20
        + (bmi / 55) * 15
        + (blood_pressure / 220) * 15
        + (cholesterol_level / 380) * 15
        + (glucose_level / 350) * 10
        + smoking_habit * 10
        + np.where(activity_labels == "Low", 8,
                   np.where(activity_labels == "Medium", 4, 0))
        + family_history * 7
    )
    risk_category = np.where(risk_score > 55, "High",
                             np.where(risk_score > 38, "Medium", "Low"))

    # Medical Expenses: continuous, correlated with features
    expenses_base = (
        2000
        + age * 80
        + (bmi - 22) ** 2 * 15
        + (blood_pressure - 120) * 25
        + (cholesterol_level - 200) * 12
        + (glucose_level - 100) * 15
        + smoking_habit * 5500
        + np.where(activity_labels == "Low", 3000,
                   np.where(activity_labels == "Medium", 1000, 0))
        + family_history * 2500
        + previous_hospital_visits * 800
        + disease_presence * 8000
        + rng.normal(0, 2500, num_records)
    )
    medical_expenses = np.clip(expenses_base, 500, None).round(2)

    # ── Build DataFrame ──────────────────────────────────────────────────
    df = pd.DataFrame({
        "Age": age,
        "Gender": gender,
        "BMI": bmi,
        "Blood_Pressure": blood_pressure,
        "Cholesterol_Level": cholesterol_level,
        "Glucose_Level": glucose_level,
        "Smoking_Habit": smoking_habit,
        "Physical_Activity_Level": activity_labels,
        "Family_Medical_History": family_history,
        "Previous_Hospital_Visits": previous_hospital_visits,
        "Disease_Presence": disease_presence,
        "Risk_Category": risk_category,
        "Medical_Expenses": medical_expenses,
    })

    return df


def save_dataset(df: pd.DataFrame, filename: str = "healthcare_dataset.csv") -> str:
    """Save generated dataset to CSV."""
    filepath = DATA_DIR / filename
    df.to_csv(filepath, index=False)
    return str(filepath)


def load_dataset(filename: str = "healthcare_dataset.csv") -> Optional[pd.DataFrame]:
    """Load dataset from CSV."""
    filepath = DATA_DIR / filename
    if filepath.exists():
        return pd.read_csv(filepath)
    return None

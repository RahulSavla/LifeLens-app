"""Utility helpers."""

from typing import Any, Dict


def clean_patient_input(data: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize patient input keys to match DataFrame column names."""
    key_map = {
        "age": "Age",
        "gender": "Gender",
        "bmi": "BMI",
        "blood_pressure": "Blood_Pressure",
        "cholesterol_level": "Cholesterol_Level",
        "glucose_level": "Glucose_Level",
        "smoking_habit": "Smoking_Habit",
        "physical_activity_level": "Physical_Activity_Level",
        "family_medical_history": "Family_Medical_History",
        "previous_hospital_visits": "Previous_Hospital_Visits",
    }
    cleaned = {}
    for api_key, df_key in key_map.items():
        val = data.get(api_key)
        if val is not None:
            # Convert booleans to int for Smoking / Family History
            if api_key in ("smoking_habit", "family_medical_history"):
                val = int(val) if isinstance(val, bool) else val
            # Convert enum values
            if hasattr(val, "value"):
                val = val.value
            cleaned[df_key] = val
    return cleaned

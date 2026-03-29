"""
services/ml_service.py

ML Service Layer — wraps the psychic-train-ai ML model.

Responsibilities:
- Load and run the RandomForest fraud + risk models
- Provide a clean predict() interface for Flask routes
- Decouple the raw sklearn logic from route handlers

Place this file at:
    gig-insurance-platform/backend/services/ml_service.py

The actual models live in:
    psychic-train-ai/models/ml_model/ml_model.py

We import from there via sys.path injection so the backend
does NOT need the model code copied in.
"""

import os
import sys
import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# PATH INJECTION
# ---------------------------------------------------------------------------
# Since psychic-train-ai sits OUTSIDE the backend folder, we add it to
# sys.path so Python can find its packages.
#
# Expected on-disk layout:
#   gig-insurance-platform/
#       backend/                  ← Flask app lives here
#       psychic-train-ai/         ← AI repo lives here
#
# Change AI_REPO_PATH if your folder name or location differs.
# ---------------------------------------------------------------------------

_HERE = os.path.dirname(os.path.abspath(__file__))           # .../backend/services
_BACKEND_ROOT = os.path.dirname(_HERE)                        # .../backend
_PLATFORM_ROOT = os.path.dirname(_BACKEND_ROOT)               # .../gig-insurance-platform
AI_REPO_PATH = os.path.join(_PLATFORM_ROOT, "psychic-train-ai")

if AI_REPO_PATH not in sys.path:
    sys.path.insert(0, AI_REPO_PATH)

# ---------------------------------------------------------------------------
# LAZY MODEL IMPORT
# ---------------------------------------------------------------------------
# We import lazily so that if the AI repo is not present, only the AI
# endpoints fail — the rest of the Flask app still boots.
# ---------------------------------------------------------------------------

_predict_ml = None


def _load_model():
    """Import predict_ml once and cache it."""
    global _predict_ml
    if _predict_ml is None:
        try:
            from models.ml_model.ml_model import predict_ml   # noqa: E402
            _predict_ml = predict_ml
            logger.info("[MLService] ML model loaded successfully.")
        except Exception as exc:
            logger.error(f"[MLService] Failed to load ML model: {exc}")
            raise RuntimeError(
                "ML model could not be loaded. "
                "Make sure psychic-train-ai is present and its dependencies are installed."
            ) from exc
    return _predict_ml


# ---------------------------------------------------------------------------
# PUBLIC API
# ---------------------------------------------------------------------------

def get_risk_and_fraud(data: dict) -> dict:
    """
    Run the RandomForest models and return risk + fraud scores.

    Parameters
    ----------
    data : dict
        Must contain keys: rainfall, aqi, temperature,
                           flood_risk, zone_risk, curfew

    Returns
    -------
    dict
        {
            "risk_score": float,          # 0.0 – 1.0 (proxy: flood_risk regressor)
            "fraud_probability": float    # 0.0 – 1.0
        }

    Raises
    ------
    ValueError  – if a required field is missing
    RuntimeError – if the model cannot be loaded
    """
    required = ["rainfall", "aqi", "temperature", "flood_risk", "curfew"]
    missing = [f for f in required if f not in data]
    if missing:
        raise ValueError(f"Missing required fields: {missing}")

    predict_fn = _load_model()
    result = predict_fn(data)

    return {
        "risk_score": round(float(result["risk_score"]), 4),
        "fraud_probability": round(float(result["fraud_probability"]), 4),
    }
"""
routes/ai_routes.py

AI Routes Blueprint — exposes the three parametric-insurance AI endpoints.

Endpoints
---------
POST /ai/risk-score      → risk score + fraud probability
POST /ai/check-triggers  → parametric trigger detection
POST /ai/run-automation  → full pipeline (fetch → trigger → claim)

Place this file at:
    gig-insurance-platform/backend/routes/ai_routes.py
"""

from flask import Blueprint, request, jsonify
import logging

logger = logging.getLogger(__name__)

ai_bp = Blueprint("ai", __name__, url_prefix="/ai")


# ---------------------------------------------------------------------------
# HELPER
# ---------------------------------------------------------------------------

def _bad_request(message: str, status: int = 400):
    return jsonify({"error": message}), status


def _server_error(message: str):
    return jsonify({"error": message}), 500


# ===========================================================================
# POST /ai/risk-score
# ===========================================================================

@ai_bp.route("/risk-score", methods=["POST"])
def risk_score():
    """
    Compute risk score and fraud probability using the ML model.

    Request body (JSON)
    -------------------
    {
        "rainfall":    float,   # mm/hr
        "aqi":         float,   # Air Quality Index
        "temperature": float,   # °C
        "flood_risk":  float,   # 0.0 – 1.0
        "zone_risk":   float,   # 0.0 – 1.0  (optional, default 0.5)
        "curfew":      int      # 0 or 1
    }

    Response 200
    ------------
    {
        "risk_score":        float,   # 0.0 – 1.0
        "fraud_probability": float    # 0.0 – 1.0
    }

    Example request
    ---------------
    curl -X POST http://localhost:5000/ai/risk-score \\
         -H "Content-Type: application/json" \\
         -d '{
               "rainfall": 95,
               "aqi": 420,
               "temperature": 46,
               "flood_risk": 0.85,
               "zone_risk": 0.7,
               "curfew": 1
             }'

    Example response
    ----------------
    {
        "risk_score": 0.8723,
        "fraud_probability": 0.0312
    }
    """
    body = request.get_json(silent=True)
    if not body:
        return _bad_request("Request body must be valid JSON.")

    try:
        from services.ml_service import get_risk_and_fraud
        result = get_risk_and_fraud(body)
        return jsonify(result), 200

    except ValueError as exc:
        return _bad_request(str(exc))
    except RuntimeError as exc:
        logger.error(f"[/ai/risk-score] Runtime error: {exc}")
        return _server_error(str(exc))
    except Exception as exc:
        logger.exception(f"[/ai/risk-score] Unexpected error: {exc}")
        return _server_error("An unexpected error occurred.")


# ===========================================================================
# POST /ai/check-triggers
# ===========================================================================

@ai_bp.route("/check-triggers", methods=["POST"])
def check_triggers():
    """
    Run the parametric trigger rule engine against sensor data.

    Request body (JSON)
    -------------------
    {
        "location":    str,
        "rainfall":    float,
        "aqi":         float,
        "temperature": float,
        "flood_risk":  float,
        "curfew":      int     # 0 or 1
    }

    Response 200
    ------------
    {
        "events_detected": [
            {
                "event_type": str,   # HEAVY_RAIN | AQI_SPIKE | HEATWAVE | FLOOD | CURFEW
                "severity":   str,   # LOW | MEDIUM | HIGH
                "location":   str,
                "reason":     str
            }
        ],
        "severity_levels": ["HIGH", "MEDIUM"]   # parallel array
    }

    Example request
    ---------------
    curl -X POST http://localhost:5000/ai/check-triggers \\
         -H "Content-Type: application/json" \\
         -d '{
               "location": "Delhi",
               "rainfall": 95,
               "aqi": 420,
               "temperature": 46,
               "flood_risk": 0.85,
               "curfew": 1
             }'

    Example response
    ----------------
    {
        "events_detected": [
            {
                "event_type": "HEAVY_RAIN",
                "severity": "HIGH",
                "location": "Delhi",
                "reason": "Heavy rainfall detected (value=95, threshold=50)"
            },
            {
                "event_type": "AQI_SPIKE",
                "severity": "MEDIUM",
                "location": "Delhi",
                "reason": "Hazardous air quality (value=420, threshold=300)"
            }
        ],
        "severity_levels": ["HIGH", "MEDIUM"]
    }
    """
    body = request.get_json(silent=True)
    if not body:
        return _bad_request("Request body must be valid JSON.")

    try:
        from services.trigger_service import detect_triggers
        result = detect_triggers(body)
        return jsonify(result), 200

    except (ValueError, TypeError) as exc:
        return _bad_request(str(exc))
    except RuntimeError as exc:
        logger.error(f"[/ai/check-triggers] Runtime error: {exc}")
        return _server_error(str(exc))
    except Exception as exc:
        logger.exception(f"[/ai/check-triggers] Unexpected error: {exc}")
        return _server_error("An unexpected error occurred.")


# ===========================================================================
# POST /ai/run-automation
# ===========================================================================

@ai_bp.route("/run-automation", methods=["POST"])
def run_automation():
    """
    Full automation pipeline:
        1. Fetch real-time weather + AQI data for the location
        2. Run trigger engine to detect disruption events
        3. Run claim engine to generate payouts
        4. Return events and claims

    Request body (JSON) — optional
    -------------------------------
    {
        "location": str,   # default: "Delhi"
        "user_id":  str    # policy holder ID, default: "U123"
    }

    Response 200
    ------------
    {
        "location": str,
        "env_data": {
            "rainfall":    float,
            "aqi":         float,
            "temperature": float,
            "flood_risk":  float,
            "curfew":      int
        },
        "events": [
            {
                "event_type": str,
                "severity":   str,
                "location":   str,
                "reason":     str
            }
        ],
        "claims": [
            {
                "claim_id":    str,
                "event_type":  str,
                "status":      str,   # APPROVED | REJECTED
                "payout":      int,   # ₹ amount
                "fraud_flag":  bool,
                "risk_score":  float,
                "fraud_score": float,
                "reason":      str
            }
        ]
    }

    Example request
    ---------------
    curl -X POST http://localhost:5000/ai/run-automation \\
         -H "Content-Type: application/json" \\
         -d '{"location": "Mumbai", "user_id": "U456"}'

    Example response
    ----------------
    {
        "location": "Mumbai",
        "env_data": {
            "rainfall": 98.5,
            "aqi": 432,
            "temperature": 44.2,
            "flood_risk": 0.88,
            "curfew": 1
        },
        "events": [
            {
                "event_type": "HEAVY_RAIN",
                "severity": "HIGH",
                "location": "Mumbai",
                "reason": "Heavy rainfall detected (value=98.5, threshold=50)"
            }
        ],
        "claims": [
            {
                "claim_id": "a1b2c3d4-...",
                "event_type": "HEAVY_RAIN",
                "status": "APPROVED",
                "payout": 1000,
                "fraud_flag": false,
                "risk_score": 0.9,
                "fraud_score": 0.0,
                "reason": "Valid parametric claim"
            }
        ]
    }
    """
    body = request.get_json(silent=True) or {}

    location = body.get("location", "Delhi")
    user_id  = body.get("user_id",  "U123")

    try:
        from services.claim_service import run_full_automation
        result = run_full_automation(location=location, user_id=user_id)
        return jsonify(result), 200

    except RuntimeError as exc:
        logger.error(f"[/ai/run-automation] Runtime error: {exc}")
        return _server_error(str(exc))
    except Exception as exc:
        logger.exception(f"[/ai/run-automation] Unexpected error: {exc}")
        return _server_error("An unexpected error occurred.")
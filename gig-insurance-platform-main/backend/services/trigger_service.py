"""
services/trigger_service.py

Trigger Service Layer — wraps the psychic-train-ai TriggerEngine.

Responsibilities:
- Run parametric trigger rules against environmental sensor data
- Return serialisable event + severity lists for the Flask route
- Keep all psychic-train-ai imports isolated here

Place this file at:
    gig-insurance-platform/backend/services/trigger_service.py
"""

import os
import sys
import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# PATH INJECTION  (same logic as ml_service.py)
# ---------------------------------------------------------------------------

_HERE = os.path.dirname(os.path.abspath(__file__))
_BACKEND_ROOT = os.path.dirname(_HERE)
_PLATFORM_ROOT = os.path.dirname(_BACKEND_ROOT)
AI_REPO_PATH = os.path.join(_PLATFORM_ROOT, "psychic-train-ai")

if AI_REPO_PATH not in sys.path:
    sys.path.insert(0, AI_REPO_PATH)

# ---------------------------------------------------------------------------
# LAZY ENGINE IMPORT
# ---------------------------------------------------------------------------

_engine = None


def _get_engine():
    """Instantiate the TriggerEngine once and cache it."""
    global _engine
    if _engine is None:
        try:
            from engines.trigger.trigger_engine import TriggerEngine, RULES
            _engine = TriggerEngine(RULES)
            logger.info("[TriggerService] TriggerEngine loaded successfully.")
        except Exception as exc:
            logger.error(f"[TriggerService] Failed to load TriggerEngine: {exc}")
            raise RuntimeError(
                "TriggerEngine could not be loaded. "
                "Make sure psychic-train-ai is present."
            ) from exc
    return _engine


# ---------------------------------------------------------------------------
# PUBLIC API
# ---------------------------------------------------------------------------

def detect_triggers(data: dict) -> dict:
    """
    Run the rule-based trigger engine against live sensor data.

    Parameters
    ----------
    data : dict
        Must contain: location, rainfall, aqi, temperature,
                      flood_risk, curfew

    Returns
    -------
    dict
        {
            "events_detected": [
                {
                    "event_type": str,
                    "severity": str,       # LOW | MEDIUM | HIGH
                    "location": str,
                    "reason": str
                },
                ...
            ],
            "severity_levels": ["HIGH", "MEDIUM", ...]   # one per event
        }

    Raises
    ------
    ValueError   – if a required field is missing or has wrong type
    RuntimeError – if the engine cannot be loaded
    """
    required = ["location", "rainfall", "aqi", "temperature", "flood_risk", "curfew"]
    missing = [f for f in required if f not in data]
    if missing:
        raise ValueError(f"Missing required fields: {missing}")

    engine = _get_engine()
    events = engine.process(data)          # returns List[TriggerEvent]

    events_out = []
    severities = []

    for ev in events:
        events_out.append({
            "event_type": ev.event_type,
            "severity":   ev.severity,
            "location":   ev.location,
            "reason":     ev.reason,
        })
        severities.append(ev.severity)

    return {
        "events_detected": events_out,
        "severity_levels": severities,
    }
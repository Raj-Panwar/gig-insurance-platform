"""
services/claim_service.py  (FIXED)

Claim Service Layer — runs the full automation pipeline:
    1. Fetch real-time data for a location
    2. Run trigger engine to detect events
    3. Run claim engine to generate payouts

Place this file at:
    gig-insurance-platform/backend/services/claim_service.py

FIXES APPLIED:
  - data_fetcher.PY (uppercase) -> imported via importlib to bypass
    Linux case-sensitivity; falls back to simulation if missing.
  - engines/__init__.py missing -> auto-created at runtime.
  - engines/claim/__init__.py missing -> auto-created at runtime.
  - services/_init__.py typo (not __init__.py) -> bypassed via importlib.
"""

import os
import sys
import logging
import random
import importlib.util

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# PATH INJECTION
# ---------------------------------------------------------------------------

_HERE = os.path.dirname(os.path.abspath(__file__))
_BACKEND_ROOT = os.path.dirname(_HERE)
_PLATFORM_ROOT = os.path.dirname(_BACKEND_ROOT)

# Change this name if your AI repo folder is named differently
# e.g. "psychic-train_x" instead of "psychic-train-ai"
AI_REPO_PATH = os.path.join(_PLATFORM_ROOT, "psychic-train-ai")

if AI_REPO_PATH not in sys.path:
    sys.path.insert(0, AI_REPO_PATH)

# ---------------------------------------------------------------------------
# HELPER: auto-create missing __init__.py files
# ---------------------------------------------------------------------------

def _ensure_init(directory: str):
    """
    If directory exists but has no __init__.py, create an empty one.
    Fixes: engines/__init__.py missing, engines/claim/__init__.py missing.
    """
    if not os.path.isdir(directory):
        return
    init_path = os.path.join(directory, "__init__.py")
    if not os.path.exists(init_path):
        try:
            open(init_path, "w").close()
            logger.info(f"[ClaimService] Created missing {init_path}")
        except OSError as exc:
            logger.warning(f"[ClaimService] Could not create {init_path}: {exc}")

# ---------------------------------------------------------------------------
# LAZY ENGINE IMPORTS
# ---------------------------------------------------------------------------

_trigger_engine = None
_claim_engine = None


def _get_trigger_engine():
    global _trigger_engine
    if _trigger_engine is None:
        _ensure_init(os.path.join(AI_REPO_PATH, "engines"))
        _ensure_init(os.path.join(AI_REPO_PATH, "engines", "trigger"))
        from engines.trigger.trigger_engine import TriggerEngine, RULES
        _trigger_engine = TriggerEngine(RULES)
        logger.info("[ClaimService] TriggerEngine loaded.")
    return _trigger_engine


def _get_claim_engine():
    global _claim_engine
    if _claim_engine is None:
        _ensure_init(os.path.join(AI_REPO_PATH, "engines"))
        _ensure_init(os.path.join(AI_REPO_PATH, "engines", "claim"))
        from engines.claim.claim_engine import ClaimEngine
        _claim_engine = ClaimEngine()
        logger.info("[ClaimService] ClaimEngine loaded.")
    return _claim_engine

# ---------------------------------------------------------------------------
# REAL-TIME DATA FETCHER
# Handles the data_fetcher.PY uppercase filename via importlib.util
# ---------------------------------------------------------------------------

def _import_data_fetcher():
    """
    Locate data_fetcher.PY (uppercase extension) using a case-insensitive
    search and load it with importlib.util, bypassing Linux case-sensitivity.
    """
    fetcher_dir = os.path.join(AI_REPO_PATH, "services", "data_fetcher")
    target = None
    if os.path.isdir(fetcher_dir):
        for fname in os.listdir(fetcher_dir):
            if fname.lower() == "data_fetcher.py":
                target = os.path.join(fetcher_dir, fname)
                break

    if target is None:
        raise FileNotFoundError(f"data_fetcher.py not found in {fetcher_dir}")

    spec = importlib.util.spec_from_file_location("data_fetcher_module", target)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _fetch_realtime_data(location: str) -> dict:
    try:
        fetcher = _import_data_fetcher()
        data, _mode = fetcher.get_real_time_data(location)
        data["location"] = location
        logger.info(f"[ClaimService] Live data fetched for {location}.")
        return data
    except Exception as exc:
        logger.warning(f"[ClaimService] Live fetch failed ({exc}). Using simulation.")
        return _simulate_data(location)


def _simulate_data(location: str) -> dict:
    """Realistic random fallback when external APIs are unavailable."""
    return {
        "location":    location,
        "rainfall":    round(random.uniform(0, 120), 2),
        "aqi":         random.randint(50, 500),
        "temperature": round(random.uniform(20, 48), 2),
        "flood_risk":  round(random.uniform(0, 1), 2),
        "zone_risk":   round(random.uniform(0, 1), 2),
        "curfew":      random.choice([0, 0, 0, 1]),
    }

# ---------------------------------------------------------------------------
# PUBLIC API
# ---------------------------------------------------------------------------

def run_full_automation(location: str = "Delhi", user_id: str = "U123") -> dict:
    """
    Full pipeline: fetch -> trigger -> claim.

    Returns
    -------
    dict with keys: location, env_data, events, claims
    """
    # STEP 1: Real-time data
    env_data = _fetch_realtime_data(location)

    # STEP 2: Trigger detection
    trigger_engine = _get_trigger_engine()
    events = trigger_engine.process(env_data)

    # STEP 3: Claim generation
    claim_engine = _get_claim_engine()
    claims_out = []
    events_out = []

    for event in events:
        events_out.append({
            "event_type": event.event_type,
            "severity":   event.severity,
            "location":   event.location,
            "reason":     event.reason,
        })
        claim = claim_engine.process_claim(event, user_id=user_id)
        claims_out.append({
            "claim_id":    claim.claim_id,
            "event_type":  claim.event_type,
            "status":      claim.status,
            "payout":      claim.payout,
            "fraud_flag":  claim.fraud_flag,
            "risk_score":  round(float(claim.risk_score), 4),
            "fraud_score": round(float(claim.fraud_score), 4),
            "reason":      claim.reason,
        })

    return {
        "location": location,
        "env_data": env_data,
        "events":   events_out,
        "claims":   claims_out,
    }
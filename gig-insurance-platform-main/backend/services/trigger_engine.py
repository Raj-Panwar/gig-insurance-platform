"""
services/trigger_engine.py

Parametric Trigger Engine — evaluates disruption events against thresholds,
auto-creates claims and payouts for all active policies in the affected location.
Integrates GPS-based fraud detection using stored worker locations.
"""

from database.db import db
from models.disruption_event import DisruptionEvent
from models.policy import Policy
from models.claim import Claim
from models.payout import Payout
from services.fraud_detection import check_location_fraud, validate_worker_location
from services.notification_service import notify_claim_created, notify_fraud_flagged
from datetime import datetime


# ---------------------------------------------------------------------------
# Parametric trigger thresholds
# ---------------------------------------------------------------------------
TRIGGER_THRESHOLDS = {
    "rain": 50,
    "aqi":  400,
    "heat": 45,
}

# Default zone coordinates when a zone has no GPS fields yet (New Delhi)
DEFAULT_ZONE_LAT = 28.6139
DEFAULT_ZONE_LNG = 77.2090


def _is_threshold_crossed(event_type: str, severity: float) -> bool:
    """Return True if severity crosses the registered threshold for this event type."""
    threshold = TRIGGER_THRESHOLDS.get(event_type.lower())
    if threshold is None:
        return False
    return severity >= threshold


def _get_zone_coords(zone) -> tuple:
    """
    Extract GPS coordinates from a Zone object.
    Falls back to Delhi defaults if the zone has no lat/lng fields.
    """
    lat = getattr(zone, "latitude",  None) or DEFAULT_ZONE_LAT
    lng = getattr(zone, "longitude", None) or DEFAULT_ZONE_LNG
    return float(lat), float(lng)


def _get_worker_coords(user_id: int):
    """
    Look up the worker's last known GPS location from the worker_locations table.

    Returns:
        (latitude, longitude) tuple if a record exists, otherwise (None, None).
    """
    try:
        from models.worker_location import WorkerLocation
        record = WorkerLocation.query.filter_by(user_id=user_id).first()
        if record:
            return record.latitude, record.longitude
    except Exception:
        pass
    return None, None


def process_event(
    event_type: str,
    location: str,
    severity: float,
) -> dict:
    """
    Core parametric trigger logic with integrated GPS fraud detection.

    Worker GPS coordinates are fetched automatically from the
    worker_locations table — no GPS input needed at call time.

    Steps:
        1. Check threshold — return early if not crossed.
        2. Persist the DisruptionEvent.
        3. Find all ACTIVE policies in the affected location.
        4. For each policy:
               a. Look up worker's stored GPS coordinates.
               b. Run fraud check against zone coordinates.
               c. Create Claim — APPROVED or FLAGGED.
               d. Create Payout only for APPROVED claims.
        5. Commit everything atomically and return summary.
    """

    # ── Step 1: Threshold check ──────────────────────────────────────────────
    if not _is_threshold_crossed(event_type, severity):
        return {
            "trigger":           "not_activated",
            "message":           "No disruption detected — severity below threshold.",
            "claims_created":    0,
            "payouts_generated": 0,
            "fraud_flags":       0,
        }

    # ── Step 2: Persist the DisruptionEvent ─────────────────────────────────
    event = DisruptionEvent(
        event_type = event_type.strip().lower(),
        location   = location.strip(),
        severity   = severity,
        timestamp  = datetime.utcnow(),
    )
    db.session.add(event)
    db.session.flush()

    # ── Step 3: Find ACTIVE policies in the affected location ────────────────
    try:
        from models.zone import Zone
        active_policies = (
            Policy.query
            .join(Zone, Policy.zone_id == Zone.zone_id)
            .filter(
                Policy.status == "ACTIVE",
                Zone.city.ilike(location.strip()),
            )
            .all()
        )
        zone_map = {p.zone_id: Zone.query.get(p.zone_id) for p in active_policies}
    except Exception:
        active_policies = Policy.query.filter_by(status="ACTIVE").all()
        zone_map = {}

    if not active_policies:
        db.session.commit()
        return {
            "trigger":           "activated",
            "message":           "Threshold crossed but no active policies found in this location.",
            "event_id":          event.event_id,
            "claims_created":    0,
            "payouts_generated": 0,
            "fraud_flags":       0,
        }

    # ── Step 4: Create Claims + conditional Payouts with fraud check ─────────
    claims_created    = 0
    payouts_generated = 0
    fraud_flags       = 0

    for policy in active_policies:

        # ── 4a. Look up worker's stored GPS and city from DB ─────────────────
        worker_lat, worker_lng = _get_worker_coords(policy.user_id)

        # Fetch stored city for the simple city-match check
        worker_city = None
        try:
            from models.worker_location import WorkerLocation
            wl = WorkerLocation.query.filter_by(user_id=policy.user_id).first()
            if wl:
                worker_city = wl.city
        except Exception:
            pass

        # ── 4b. Two-tier fraud check ─────────────────────────────────────────
        #
        # Tier 1 — city string match (fast)
        #   Worker's stored city must match the event location.
        #   Mismatch → claim REJECTED immediately, no payout.
        #
        # Tier 2 — Haversine GPS distance (precise)
        #   Runs only when city matches AND GPS coords are on file.
        #   Distance > 20 km → claim FLAGGED, no payout.
        #
        city_match = validate_worker_location(worker_city, location)

        if not city_match:
            # City mismatch — reject claim outright
            claim = Claim(
                user_id      = policy.user_id,
                policy_id    = policy.policy_id,
                event_id     = event.event_id,
                trigger_type = event_type.strip().lower(),
                status       = "REJECTED",
                created_at   = datetime.utcnow(),
            )
            db.session.add(claim)
            db.session.flush()
            claims_created += 1
            fraud_flags    += 1
            continue   # skip payout creation for this policy

        # City matched — run Haversine check if GPS coordinates are available
        if worker_lat is not None and worker_lng is not None:
            zone = zone_map.get(policy.zone_id)
            zone_lat, zone_lng = _get_zone_coords(zone) if zone else (DEFAULT_ZONE_LAT, DEFAULT_ZONE_LNG)

            fraud_result = check_location_fraud(
                worker_lat = worker_lat,
                worker_lng = worker_lng,
                policy_lat = zone_lat,
                policy_lng = zone_lng,
            )
            is_fraud = fraud_result["fraud_flag"]
        else:
            is_fraud = False   # city matched, no GPS on file — approve

        # ── 4c. Create Claim ─────────────────────────────────────────────────
        claim = Claim(
            user_id      = policy.user_id,
            policy_id    = policy.policy_id,
            event_id     = event.event_id,
            trigger_type = event_type.strip().lower(),
            status       = "FLAGGED" if is_fraud else "APPROVED",
            created_at   = datetime.utcnow(),
        )
        db.session.add(claim)
        db.session.flush()

        claims_created += 1
        if is_fraud:
            fraud_flags += 1

        # ── 4d. Payout only for APPROVED claims ──────────────────────────────
        if not is_fraud:
            payout = Payout(
                claim_id     = claim.claim_id,
                amount       = float(policy.coverage_amount),
                status       = "PROCESSED",
                processed_at = datetime.utcnow(),
            )
            db.session.add(payout)
            payouts_generated += 1

    # ── Step 5: Atomic commit ────────────────────────────────────────────────
    db.session.commit()

    # ── Step 6: Fire notifications (after commit — non-blocking) ────────────
    for policy in active_policies:
        claims_for_policy = Claim.query.filter_by(
            user_id=policy.user_id, event_id=event.event_id
        ).first()
        if claims_for_policy:
            if claims_for_policy.status in ("REJECTED", "FLAGGED"):
                notify_fraud_flagged(
                    user_id  = policy.user_id,
                    claim_id = claims_for_policy.claim_id,
                    reason   = claims_for_policy.status,
                )
            else:
                notify_claim_created(
                    user_id      = policy.user_id,
                    claim_id     = claims_for_policy.claim_id,
                    trigger_type = event_type,
                    status       = claims_for_policy.status,
                )

    return {
        "trigger":           "activated",
        "event_id":          event.event_id,
        "claims_created":    claims_created,
        "payouts_generated": payouts_generated,
        "fraud_flags":       fraud_flags,
        "claims_rejected":   fraud_flags,
        "message":           (
            "Claim rejected due to location mismatch"
            if fraud_flags == claims_created and claims_created > 0
            else None
        ),
    }
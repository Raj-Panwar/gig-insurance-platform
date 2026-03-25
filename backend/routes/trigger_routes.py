from flask import Blueprint, request, jsonify
from database.db import db
from models.disruption_event import DisruptionEvent
from models.policy import Policy
from models.claim import Claim
from datetime import datetime

trigger_bp = Blueprint("trigger", __name__, url_prefix="/trigger")


# ---------------------------------------------------------------------------
# POST /trigger/event
# ---------------------------------------------------------------------------
@trigger_bp.route("/event", methods=["POST"])
def trigger_event():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    # Validate required fields
    required_fields = ["event_type", "location", "severity"]
    missing = [f for f in required_fields if data.get(f) is None]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    # Validate severity is numeric and in range
    try:
        severity = float(data["severity"])
    except (ValueError, TypeError):
        return jsonify({"error": "severity must be a numeric value."}), 400

    if not (0 <= severity <= 100):
        return jsonify({"error": "severity must be between 0 and 100."}), 400

    # ── Step 1: Create the DisruptionEvent ──────────────────────────────────
    event = DisruptionEvent(
        event_type = data["event_type"].strip(),
        location   = data["location"].strip(),
        severity   = severity,
        timestamp  = datetime.utcnow(),
    )
    db.session.add(event)
    db.session.flush()   # writes event to DB and gets event.event_id without full commit

    # ── Step 2: Find all ACTIVE policies ────────────────────────────────────
    active_policies = Policy.query.filter_by(status="ACTIVE").all()

    if not active_policies:
        db.session.commit()   # still save the event even if no policies matched
        return jsonify({
            "message": "Event recorded. No active policies found — no claims created.",
            "event_id": event.event_id,
            "claims_created": 0,
        }), 200

    # ── Step 3: Create a Claim for every active policy ──────────────────────
    claims = []
    for policy in active_policies:
        claim = Claim(
            user_id      = policy.user_id,
            policy_id    = policy.policy_id,
            event_id     = event.event_id,
            trigger_type = data["event_type"].strip(),
            status       = "PENDING",
            created_at   = datetime.utcnow(),
        )
        claims.append(claim)

    db.session.add_all(claims)

    # ── Step 4: Commit everything in one transaction ─────────────────────────
    db.session.commit()

    return jsonify({
        "message": "Event processed.",
        "event_id": event.event_id,
        "claims_created": len(claims),
    }), 201
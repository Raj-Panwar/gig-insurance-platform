from flask import Blueprint, request, jsonify
from database.db import db
from models.parametric_trigger import ParametricTrigger
from utils.jwt_helper import admin_required

threshold_bp = Blueprint("threshold", __name__, url_prefix="/thresholds")

VALID_SEVERITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}


# ---------------------------------------------------------------------------
# GET /thresholds
# List all parametric triggers. Admin only.
# ---------------------------------------------------------------------------
@threshold_bp.route("", methods=["GET"])
@admin_required
def list_thresholds():
    triggers = ParametricTrigger.query.all()
    return jsonify({
        "total": len(triggers),
        "thresholds": [_serialize(t) for t in triggers],
    }), 200


# ---------------------------------------------------------------------------
# POST /thresholds
# Create a new parametric trigger threshold. Admin only.
# ---------------------------------------------------------------------------
@threshold_bp.route("", methods=["POST"])
@admin_required
def create_threshold():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    required = ["event_type", "threshold_value", "severity"]
    missing  = [f for f in required if data.get(f) is None]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    severity = str(data["severity"]).upper()
    if severity not in VALID_SEVERITIES:
        return jsonify({"error": f"severity must be one of: {', '.join(VALID_SEVERITIES)}"}), 400

    try:
        threshold_value = float(data["threshold_value"])
    except (ValueError, TypeError):
        return jsonify({"error": "threshold_value must be numeric."}), 400

    trigger = ParametricTrigger(
        event_type      = str(data["event_type"]).strip().lower(),
        threshold_value = threshold_value,
        severity        = severity,
        description     = data.get("description", "").strip() or None,
    )
    db.session.add(trigger)
    db.session.commit()

    return jsonify({"message": "Threshold created.", "threshold": _serialize(trigger)}), 201


# ---------------------------------------------------------------------------
# PUT /thresholds/<trigger_id>
# Update an existing threshold. Admin only.
# ---------------------------------------------------------------------------
@threshold_bp.route("/<int:trigger_id>", methods=["PUT"])
@admin_required
def update_threshold(trigger_id):
    trigger = ParametricTrigger.query.get(trigger_id)
    if not trigger:
        return jsonify({"error": f"Threshold {trigger_id} not found."}), 404

    data = request.get_json(silent=True) or {}

    if data.get("threshold_value") is not None:
        try:
            trigger.threshold_value = float(data["threshold_value"])
        except (ValueError, TypeError):
            return jsonify({"error": "threshold_value must be numeric."}), 400

    if data.get("severity"):
        severity = str(data["severity"]).upper()
        if severity not in VALID_SEVERITIES:
            return jsonify({"error": f"severity must be one of: {', '.join(VALID_SEVERITIES)}"}), 400
        trigger.severity = severity

    if data.get("description") is not None:
        trigger.description = data["description"].strip() or None

    db.session.commit()
    return jsonify({"message": "Threshold updated.", "threshold": _serialize(trigger)}), 200


# ---------------------------------------------------------------------------
# DELETE /thresholds/<trigger_id>
# Delete a threshold. Admin only.
# ---------------------------------------------------------------------------
@threshold_bp.route("/<int:trigger_id>", methods=["DELETE"])
@admin_required
def delete_threshold(trigger_id):
    trigger = ParametricTrigger.query.get(trigger_id)
    if not trigger:
        return jsonify({"error": f"Threshold {trigger_id} not found."}), 404

    db.session.delete(trigger)
    db.session.commit()
    return jsonify({"message": f"Threshold {trigger_id} deleted."}), 200


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
def _serialize(t: ParametricTrigger) -> dict:
    return {
        "trigger_id":      t.trigger_id,
        "event_type":      t.event_type,
        "threshold_value": t.threshold_value,
        "severity":        t.severity,
        "description":     t.description,
    }
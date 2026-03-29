from flask import Blueprint, request, jsonify
from services.trigger_engine import process_event

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

    # Validate severity is numeric
    try:
        severity = float(data["severity"])
    except (ValueError, TypeError):
        return jsonify({"error": "'severity' must be a numeric value."}), 400

    event_type = str(data["event_type"]).strip().lower()
    location   = str(data["location"]).strip()

    # Worker GPS is now read from DB automatically inside the trigger engine
    try:
        result = process_event(
            event_type = event_type,
            location   = location,
            severity   = severity,
        )
    except Exception as e:
        return jsonify({"error": "Failed to process event.", "details": str(e)}), 500

    status_code = 201 if result.get("trigger") == "activated" else 200
    return jsonify(result), status_code
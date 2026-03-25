from flask import Blueprint, request, jsonify

premium_bp = Blueprint("premium", __name__, url_prefix="/premium")

BASE_PREMIUM = 30  # mock value — replace with real risk logic later


# ---------------------------------------------------------------------------
# POST /premium/calculate
# ---------------------------------------------------------------------------
@premium_bp.route("/calculate", methods=["POST"])
def calculate_premium():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    zone_id = data.get("zone_id")
    if zone_id is None:
        return jsonify({"error": "Field 'zone_id' is required."}), 400

    if not isinstance(zone_id, int) or zone_id <= 0:
        return jsonify({"error": "'zone_id' must be a positive integer."}), 400

    return jsonify({
        "zone_id":        zone_id,
        "weekly_premium": BASE_PREMIUM,
    }), 200
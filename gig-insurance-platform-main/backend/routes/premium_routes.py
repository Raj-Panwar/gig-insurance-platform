from flask import Blueprint, request, jsonify
from services.premium_engine import calculate_premium

premium_bp = Blueprint("premium", __name__, url_prefix="/premium")


# ---------------------------------------------------------------------------
# POST /premium/calculate
# ---------------------------------------------------------------------------
@premium_bp.route("/calculate", methods=["POST"])
def calculate_premium_route():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    # Validate required fields
    required_fields = ["zone_risk_level", "weather_risk", "coverage_amount"]
    missing = [f for f in required_fields if data.get(f) is None]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    # Validate numeric types
    try:
        weather_risk    = float(data["weather_risk"])
        coverage_amount = float(data["coverage_amount"])
    except (ValueError, TypeError):
        return jsonify({"error": "'weather_risk' and 'coverage_amount' must be numeric."}), 400

    zone_risk_level = str(data["zone_risk_level"]).strip().upper()

    # Delegate all calculation logic to the premium engine
    try:
        result = calculate_premium(
            zone_risk_level      = zone_risk_level,
            weather_risk         = weather_risk,
            base_coverage_amount = coverage_amount,
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify(result), 200
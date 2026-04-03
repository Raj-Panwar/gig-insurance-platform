from flask import Blueprint, request, jsonify
from services.disruption_data_service import get_all_disruption_data
from services.trigger_engine import process_event

simulate_bp = Blueprint("simulate", __name__, url_prefix="/simulate")

# ---------------------------------------------------------------------------
# Thresholds — must stay in sync with trigger_engine.TRIGGER_THRESHOLDS
# ---------------------------------------------------------------------------
RAIN_THRESHOLD      = 50    # mm
HEATWAVE_THRESHOLD  = 45    # °C
POLLUTION_THRESHOLD = 400   # AQI


def _run_trigger(event_type: str, location: str, severity: float) -> dict:
    """Thin wrapper — calls the trigger engine and returns its result."""
    return process_event(
        event_type = event_type,
        location   = location,
        severity   = severity,
    )


# ---------------------------------------------------------------------------
# POST /simulate/rain
# ---------------------------------------------------------------------------
@simulate_bp.route("/rain", methods=["POST"])
def simulate_rain():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    location    = data.get("location", "").strip()
    rainfall_mm = data.get("rainfall_mm")

    if not location:
        return jsonify({"error": "Field 'location' is required."}), 400
    if rainfall_mm is None:
        return jsonify({"error": "Field 'rainfall_mm' is required."}), 400

    try:
        rainfall_mm = float(rainfall_mm)
    except (ValueError, TypeError):
        return jsonify({"error": "'rainfall_mm' must be numeric."}), 400

    if rainfall_mm < RAIN_THRESHOLD:
        return jsonify({
            "message":          "Rainfall below threshold — no disruption triggered.",
            "rainfall_mm":      rainfall_mm,
            "threshold":        RAIN_THRESHOLD,
            "claims_generated": 0,
        }), 200

    try:
        result = _run_trigger("rain", location, rainfall_mm)
        return jsonify({
            "message":          "Rain disruption simulated.",
            "location":         location,
            "rainfall_mm":      rainfall_mm,
            "claims_generated": result.get("claims_created", 0),
            "payouts_generated": result.get("payouts_generated", 0),
            "fraud_flags":      result.get("fraud_flags", 0),
        }), 201

    except Exception as e:
        return jsonify({"error": "Rain simulation failed.", "details": str(e)}), 500


# ---------------------------------------------------------------------------
# POST /simulate/heatwave
# ---------------------------------------------------------------------------
@simulate_bp.route("/heatwave", methods=["POST"])
def simulate_heatwave():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    location    = data.get("location", "").strip()
    temperature = data.get("temperature")

    if not location:
        return jsonify({"error": "Field 'location' is required."}), 400
    if temperature is None:
        return jsonify({"error": "Field 'temperature' is required."}), 400

    try:
        temperature = float(temperature)
    except (ValueError, TypeError):
        return jsonify({"error": "'temperature' must be numeric."}), 400

    if temperature < HEATWAVE_THRESHOLD:
        return jsonify({
            "message":          "Temperature below threshold — no heatwave triggered.",
            "temperature":      temperature,
            "threshold":        HEATWAVE_THRESHOLD,
            "claims_generated": 0,
        }), 200

    try:
        result = _run_trigger("heat", location, temperature)
        return jsonify({
            "message":           "Heatwave simulated.",
            "location":          location,
            "temperature":       temperature,
            "claims_generated":  result.get("claims_created", 0),
            "payouts_generated": result.get("payouts_generated", 0),
            "fraud_flags":       result.get("fraud_flags", 0),
        }), 201

    except Exception as e:
        return jsonify({"error": "Heatwave simulation failed.", "details": str(e)}), 500


# ---------------------------------------------------------------------------
# POST /simulate/pollution
# ---------------------------------------------------------------------------
@simulate_bp.route("/pollution", methods=["POST"])
def simulate_pollution():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    location = data.get("location", "").strip()
    aqi      = data.get("aqi")

    if not location:
        return jsonify({"error": "Field 'location' is required."}), 400
    if aqi is None:
        return jsonify({"error": "Field 'aqi' is required."}), 400

    try:
        aqi = float(aqi)
    except (ValueError, TypeError):
        return jsonify({"error": "'aqi' must be numeric."}), 400

    if aqi < POLLUTION_THRESHOLD:
        return jsonify({
            "message":          "AQI below threshold — no pollution alert triggered.",
            "aqi":              aqi,
            "threshold":        POLLUTION_THRESHOLD,
            "claims_generated": 0,
        }), 200

    try:
        result = _run_trigger("aqi", location, aqi)
        return jsonify({
            "message":           "Pollution disruption simulated.",
            "location":          location,
            "aqi":               aqi,
            "claims_generated":  result.get("claims_created", 0),
            "payouts_generated": result.get("payouts_generated", 0),
            "fraud_flags":       result.get("fraud_flags", 0),
        }), 201

    except Exception as e:
        return jsonify({"error": "Pollution simulation failed.", "details": str(e)}), 500


# ---------------------------------------------------------------------------
# POST /simulate/disruption  (original — random all-event simulation)
# ---------------------------------------------------------------------------
@simulate_bp.route("/disruption", methods=["POST"])
def simulate_disruption():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    location = data.get("location", "").strip()
    if not location:
        return jsonify({"error": "Field 'location' is required."}), 400

    try:
        disruption_events = get_all_disruption_data(location)

        results         = []
        total_claims    = 0
        payouts   = 0
        total_fraud     = 0
        triggered_count = 0

        for event in disruption_events:
            result = process_event(
                event_type = event["event_type"],
                location   = event["location"],
                severity   = event["severity"],
            )

            result["simulated_severity"] = event["severity"]
            result["event_type"]         = event["event_type"]
            results.append(result)

            if result.get("trigger") == "activated":
                triggered_count += 1
                total_claims  += result.get("claims_created",    0)
                payouts += result.get("payouts_generated", 0)
                total_fraud   += result.get("fraud_flags",        0)

        return jsonify({
            "location":          location,
            "events_simulated":  len(disruption_events),
            "events_triggered":  triggered_count,
            "claims_created":    total_claims,
            "payouts_generated": payouts,
            "fraud_flags":       total_fraud,
            "breakdown":         results,
        }), 200 if triggered_count == 0 else 201

    except Exception as e:
        return jsonify({
            "error":   "Simulation failed.",
            "details": str(e),
        }), 500
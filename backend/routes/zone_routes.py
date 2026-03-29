from flask import Blueprint, jsonify
from models.zone import Zone

zone_bp = Blueprint("zone", __name__, url_prefix="/zone")


# ---------------------------------------------------------------------------
# GET /zone/by-city/<city>
# Returns zone risk info for a given city name (case-insensitive).
# Used by the frontend to auto-calculate premium based on user's city.
# ---------------------------------------------------------------------------
@zone_bp.route("/by-city/<string:city>", methods=["GET"])
def get_zone_by_city(city):
    zone = Zone.query.filter(Zone.city.ilike(city.strip())).first()

    if not zone:
        # Fallback: return a MEDIUM risk default so the app never hard-fails
        return jsonify({
            "found":          False,
            "zone_id":        None,
            "city":           city,
            "risk_level":     "MEDIUM",
            "weather_risk":   0.5,
            "flood_risk":     0.5,
            "pollution_risk": 0.5,
            "heat_risk":      0.5,
        }), 200

    # weather_risk = average of the three risk scores stored in the zone
    weather_risk = round(
        (zone.flood_risk + zone.pollution_risk + zone.heat_risk) / 3, 2
    )

    return jsonify({
        "found":          True,
        "zone_id":        zone.zone_id,
        "city":           zone.city,
        "risk_level":     zone.risk_level,
        "weather_risk":   weather_risk,
        "flood_risk":     zone.flood_risk,
        "pollution_risk": zone.pollution_risk,
        "heat_risk":      zone.heat_risk,
    }), 200
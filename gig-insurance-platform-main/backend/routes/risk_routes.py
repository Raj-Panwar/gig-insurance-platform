from flask import Blueprint, request, jsonify
from database.db import db
from models.risk_profile import RiskProfile
from models.user import User
from models.zone import Zone
from utils.jwt_helper import login_required, admin_required
from datetime import datetime

risk_bp = Blueprint("risk", __name__, url_prefix="/risk")


# ---------------------------------------------------------------------------
# POST /risk/profile
# Create or update a risk profile for a user+zone. Admin only.
# ---------------------------------------------------------------------------
@risk_bp.route("/profile", methods=["POST"])
@admin_required
def upsert_risk_profile():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    required = ["user_id", "zone_id", "risk_score"]
    missing  = [f for f in required if data.get(f) is None]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    try:
        user_id    = int(data["user_id"])
        zone_id    = int(data["zone_id"])
        risk_score = float(data["risk_score"])
    except (ValueError, TypeError):
        return jsonify({"error": "user_id and zone_id must be integers, risk_score must be numeric."}), 400

    if not (0 <= risk_score <= 100):
        return jsonify({"error": "risk_score must be between 0 and 100."}), 400

    if not User.query.get(user_id):
        return jsonify({"error": f"User {user_id} not found."}), 404
    if not Zone.query.get(zone_id):
        return jsonify({"error": f"Zone {zone_id} not found."}), 404

    profile = RiskProfile.query.filter_by(user_id=user_id, zone_id=zone_id).first()
    if profile:
        profile.risk_score   = risk_score
        profile.last_updated = datetime.utcnow()
    else:
        profile = RiskProfile(
            user_id      = user_id,
            zone_id      = zone_id,
            risk_score   = risk_score,
            last_updated = datetime.utcnow(),
        )
        db.session.add(profile)

    db.session.commit()
    return jsonify({
        "message":      "Risk profile saved.",
        "profile_id":   profile.profile_id,
        "user_id":      profile.user_id,
        "zone_id":      profile.zone_id,
        "risk_score":   profile.risk_score,
        "last_updated": profile.last_updated.isoformat(),
    }), 200


# ---------------------------------------------------------------------------
# GET /risk/profile/<user_id>
# Get all risk profiles for a worker. Login required.
# ---------------------------------------------------------------------------
@risk_bp.route("/profile/<int:user_id>", methods=["GET"])
@login_required
def get_risk_profiles(user_id):
    try:
        if not User.query.get(user_id):
            return jsonify({"error": f"User {user_id} not found."}), 404

        profiles = RiskProfile.query.filter_by(user_id=user_id).all()
        return jsonify({
            "user_id":  user_id,
            "profiles": [{
                "profile_id":   p.profile_id,
                "zone_id":      p.zone_id,
                "risk_score":   p.risk_score,
                "last_updated": p.last_updated.isoformat(),
            } for p in profiles],
        }), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch risk profiles.", "details": str(e)}), 500
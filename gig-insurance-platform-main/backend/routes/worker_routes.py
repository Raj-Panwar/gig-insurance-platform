from flask import Blueprint, request, jsonify
from database.db import db
from models.user import User
from models.policy import Policy
from models.claim import Claim
from models.payout import Payout
from models.worker_location import WorkerLocation
from utils.jwt_helper import login_required, worker_self_only
from datetime import datetime

worker_bp = Blueprint("worker", __name__, url_prefix="/worker")


# ---------------------------------------------------------------------------
# POST /worker/location  (login required — any authenticated worker)
# ---------------------------------------------------------------------------
@worker_bp.route("/location", methods=["POST"])
@login_required
def update_location():
    from flask import g
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    required_fields = ["latitude", "longitude"]
    missing = [f for f in required_fields if data.get(f) is None]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    try:
        latitude  = float(data["latitude"])
        longitude = float(data["longitude"])
    except (ValueError, TypeError):
        return jsonify({"error": "lat/lng must be numeric."}), 400

    if not (-90 <= latitude <= 90):
        return jsonify({"error": "'latitude' must be between -90 and 90."}), 400
    if not (-180 <= longitude <= 180):
        return jsonify({"error": "'longitude' must be between -180 and 180."}), 400

    city    = data.get("city", "").strip() or None
    user_id = g.current_user.id   # from JWT — not from request body

    location = WorkerLocation.query.filter_by(user_id=user_id).first()
    if location:
        location.latitude  = latitude
        location.longitude = longitude
        location.city      = city
        location.timestamp = datetime.utcnow()
    else:
        location = WorkerLocation(
            user_id=user_id, latitude=latitude,
            longitude=longitude, city=city, timestamp=datetime.utcnow(),
        )
        db.session.add(location)

    db.session.commit()
    return jsonify({
        "status": "location updated", "user_id": user_id,
        "latitude": latitude, "longitude": longitude,
        "city": location.city, "timestamp": location.timestamp.isoformat(),
    }), 200


# ---------------------------------------------------------------------------
# GET /worker/policy/<user_id>
# ---------------------------------------------------------------------------
@worker_bp.route("/policy/<int:user_id>", methods=["GET"])
@login_required
@worker_self_only
def get_worker_policy(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": f"User {user_id} not found."}), 404

        policy = Policy.query.filter_by(user_id=user_id, status="ACTIVE").first()
        if not policy:
            return jsonify({"user_id": user_id, "active_policy": False,
                            "message": "No active policy found."}), 200

        return jsonify({
            "user_id": user_id, "policy_id": policy.policy_id,
            "coverage_amount": float(policy.coverage_amount),
            "weekly_premium":  float(policy.weekly_premium),
            "status":          policy.status,
            "start_date":      policy.start_date.strftime("%Y-%m-%d"),
            "end_date":        policy.end_date.strftime("%Y-%m-%d") if policy.end_date else None,
        }), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch policy.", "details": str(e)}), 500


# ---------------------------------------------------------------------------
# GET /worker/claims/<user_id>
# ---------------------------------------------------------------------------
@worker_bp.route("/claims/<int:user_id>", methods=["GET"])
@login_required
@worker_self_only
def get_worker_claims(user_id):
    try:
        if not User.query.get(user_id):
            return jsonify({"error": f"User {user_id} not found."}), 404

        claims = Claim.query.filter_by(user_id=user_id).order_by(Claim.created_at.desc()).all()
        return jsonify({
            "user_id": user_id, "total_claims": len(claims),
            "claims": [{
                "claim_id":   c.claim_id,
                "event_type": c.trigger_type,
                "status":     c.status,
                "amount":     float(c.payout.amount) if c.payout else 0,
                "created_at": c.created_at.strftime("%Y-%m-%d"),
            } for c in claims],
        }), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch claims.", "details": str(e)}), 500


# ---------------------------------------------------------------------------
# GET /worker/payouts/<user_id>
# ---------------------------------------------------------------------------
@worker_bp.route("/payouts/<int:user_id>", methods=["GET"])
@login_required
@worker_self_only
def get_worker_payouts(user_id):
    try:
        if not User.query.get(user_id):
            return jsonify({"error": f"User {user_id} not found."}), 404

        claims  = Claim.query.filter_by(user_id=user_id).all()
        payouts = [c.payout for c in claims if c.payout is not None]

        return jsonify({
            "user_id":       user_id,
            "payouts": len(payouts),
            "total_amount":  round(sum(float(p.amount) for p in payouts), 2),
            "payouts": [{
                "transaction_id": p.transaction_id or f"TXN-{p.payout_id}",
                "amount":         float(p.amount),
                "status":         p.status,
                "processed_at":   p.processed_at.strftime("%Y-%m-%d") if p.processed_at else None,
            } for p in payouts],
        }), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch payouts.", "details": str(e)}), 500
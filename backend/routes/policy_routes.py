from flask import Blueprint, request, jsonify
from database.db import db
from models.user import User
from models.policy import Policy
from datetime import datetime

policy_bp = Blueprint("policy", __name__, url_prefix="/policy")


# ---------------------------------------------------------------------------
# POST /policy/create
# ---------------------------------------------------------------------------
@policy_bp.route("/create", methods=["POST"])
def create_policy():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    # Validate required fields
    required_fields = ["user_id", "zone_id", "weekly_premium", "coverage_amount"]
    missing = [f for f in required_fields if data.get(f) is None]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    # Check user exists
    user = User.query.get(data["user_id"])
    if not user:
        return jsonify({"error": f"User with id {data['user_id']} not found."}), 404

    # Validate numeric values
    try:
        weekly_premium  = float(data["weekly_premium"])
        coverage_amount = float(data["coverage_amount"])
    except (ValueError, TypeError):
        return jsonify({"error": "weekly_premium and coverage_amount must be numeric."}), 400

    if weekly_premium <= 0 or coverage_amount <= 0:
        return jsonify({"error": "weekly_premium and coverage_amount must be greater than 0."}), 400

    policy = Policy(
        user_id         = data["user_id"],
        zone_id         = data["zone_id"],
        weekly_premium  = weekly_premium,
        coverage_amount = coverage_amount,
        policy_type     = data.get("policy_type", "standard"),
        status          = "ACTIVE",
        start_date      = datetime.utcnow(),
    )

    db.session.add(policy)
    db.session.commit()

    return jsonify({
        "message": "Policy created successfully.",
        "policy": _serialize(policy),
    }), 201


# ---------------------------------------------------------------------------
# GET /policy/<user_id>
# ---------------------------------------------------------------------------
@policy_bp.route("/<int:user_id>", methods=["GET"])
def get_user_policies(user_id):

    # Check user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": f"User with id {user_id} not found."}), 404

    policies = Policy.query.filter_by(user_id=user_id).all()

    if not policies:
        return jsonify({
            "message": f"No policies found for user {user_id}.",
            "policies": [],
        }), 200

    return jsonify({
        "user_id": user_id,
        "total": len(policies),
        "policies": [_serialize(p) for p in policies],
    }), 200


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
def _serialize(policy: Policy) -> dict:
    return {
        "policy_id":       policy.policy_id,
        "user_id":         policy.user_id,
        "zone_id":         policy.zone_id,
        "weekly_premium":  float(policy.weekly_premium),
        "coverage_amount": float(policy.coverage_amount),
        "policy_type":     policy.policy_type,
        "status":          policy.status,
        "start_date":      policy.start_date.isoformat() if policy.start_date else None,
        "end_date":        policy.end_date.isoformat()   if policy.end_date   else None,
    }
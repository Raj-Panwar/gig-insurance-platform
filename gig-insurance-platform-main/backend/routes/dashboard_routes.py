from flask import Blueprint, jsonify
from models.user import User
from models.policy import Policy
from models.claim import Claim
from models.payout import Payout
from services.trigger_engine import process_event
from services.claim_service import process_claim
from database.db import db
import random

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


# ---------------------------------------------------------------------------
# GET /dashboard/stats (Admin stats)
# ---------------------------------------------------------------------------
@dashboard_bp.route("/stats", methods=["GET"])
def get_stats():
    try:
        total_users     = User.query.count()
        active_policies = Policy.query.filter_by(status="ACTIVE").count()
        total_claims    = Claim.query.count()
        approved_claims = Claim.query.filter_by(status="APPROVED").count()
        payouts   = Payout.query.count()

        return jsonify({
            "total_users":      total_users,
            "active_policies":  active_policies,
            "total_claims":     total_claims,
            "approved_claims":  approved_claims,
            "payouts":    payouts,
        }), 200

    except Exception as e:
        return jsonify({
            "error":   "Failed to fetch dashboard stats.",
            "details": str(e),
        }), 500


# ---------------------------------------------------------------------------
# GET /dashboard/<user_id> (User dashboard + AUTO CLAIM)
# ---------------------------------------------------------------------------
@dashboard_bp.route("/<int:user_id>", methods=["GET"])
def get_user_dashboard(user_id):
    try:
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        

        # ✅ GET ACTIVE POLICY
        policy = Policy.query.filter(
            Policy.user_id == user_id,
            Policy.status == "ACTIVE"
            ).order_by(Policy.start_date.desc()).first()
        print("🔥 USER ID:", user_id)
        print("🔥 POLICY FOUND:", policy)

        # 🔥 STEP 4: Fetch updated claims
        claims = Claim.query.filter_by(user_id=user_id).all()

        return jsonify({
        "user": user.name,
        "city": user.city,
        "total_claims": len(claims),

        "active_policy": True if policy else False,
        "policy_type": policy.policy_type if policy else None
        }), 200

    except Exception as e:
        print("❌ ERROR:", str(e))
        return jsonify({"error": str(e)}), 500
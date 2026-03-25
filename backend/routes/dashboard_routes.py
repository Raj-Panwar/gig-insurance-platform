from flask import Blueprint, jsonify
from models.user import User
from models.policy import Policy
from models.claim import Claim
from models.payout import Payout

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


# ---------------------------------------------------------------------------
# GET /dashboard/stats
# ---------------------------------------------------------------------------
@dashboard_bp.route("/stats", methods=["GET"])
def get_stats():
    try:
        total_users     = User.query.count()
        active_policies = Policy.query.filter_by(status="ACTIVE").count()
        total_claims    = Claim.query.count()
        approved_claims = Claim.query.filter_by(status="APPROVED").count()
        total_payouts   = Payout.query.count()

        return jsonify({
            "total_users":      total_users,
            "active_policies":  active_policies,
            "total_claims":     total_claims,
            "approved_claims":  approved_claims,
            "total_payouts":    total_payouts,
        }), 200

    except Exception as e:
        return jsonify({
            "error":   "Failed to fetch dashboard stats.",
            "details": str(e),
        }), 500
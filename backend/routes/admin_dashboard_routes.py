from flask import Blueprint, jsonify
from database.db import db
from models.claim import Claim
from models.payout import Payout
from models.policy import Policy
from models.user import User
from utils.jwt_helper import admin_required

admin_dashboard_bp = Blueprint("admin_dashboard", __name__, url_prefix="/dashboard")


# ---------------------------------------------------------------------------
# GET /dashboard/claims
# Returns all claims with joined payout amount. Admin only.
# ---------------------------------------------------------------------------
@admin_dashboard_bp.route("/claims", methods=["GET"])
@admin_required
def get_all_claims():
    try:
        claims = Claim.query.all()

        return jsonify({
            "claims": [
                {
                    "claim_id":     c.claim_id,
                    "user_id":      c.user_id,
                    "policy_id":    c.policy_id,
                    "trigger_type": c.trigger_type,
                    "status":       c.status,
                    # payout lives in the payouts table — use the relationship
                    "payout_amount": float(c.payout.amount) if c.payout else 0,
                    "created_at":   c.created_at.strftime("%Y-%m-%d"),
                }
                for c in claims
            ]
        }), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch claims.", "details": str(e)}), 500


# ---------------------------------------------------------------------------
# GET /dashboard/payouts
# Returns full payout history with running total. Admin only.
# ---------------------------------------------------------------------------
@admin_dashboard_bp.route("/payouts", methods=["GET"])
@admin_required
def get_all_payouts():
    try:
        payouts = Payout.query.all()

        payout_list = [
            {
                "claim_id":     p.claim_id,
                "user_id":      p.claim.user_id,   # via Payout → Claim backref
                "payout_amount": float(p.amount),
                "status":       p.status,
                "processed_at": p.processed_at.strftime("%Y-%m-%d") if p.processed_at else None,
            }
            for p in payouts
        ]

        total_payout = sum(row["payout_amount"] for row in payout_list)

        return jsonify({
            "payouts":      payout_list,
            "total_payout": round(total_payout, 2),
        }), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch payouts.", "details": str(e)}), 500


# ---------------------------------------------------------------------------
# GET /dashboard/workers
# Returns a per-worker overview: location, policy count, claim count. Admin only.
# ---------------------------------------------------------------------------
@admin_dashboard_bp.route("/workers", methods=["GET"])
@admin_required
def get_worker_overview():
    try:
        workers = User.query.filter_by(role="worker").all()

        return jsonify({
            "workers": [
                {
                    "user_id":  w.id,
                    "name":     w.name,
                    "location": w.city,
                    "policies": len(w.policies),
                    "claims":   len(w.claims),
                }
                for w in workers
            ]
        }), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch worker overview.", "details": str(e)}), 500
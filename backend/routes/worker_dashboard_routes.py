from flask import Blueprint, jsonify
from models.user import User
from models.policy import Policy
from models.claim import Claim
from models.payout import Payout

worker_dashboard_bp = Blueprint("worker_dashboard", __name__, url_prefix="/worker")


def _get_user_or_404(user_id: int):
    """Fetch user by id, return (user, error_response) tuple."""
    user = User.query.get(user_id)
    if not user:
        return None, (jsonify({"error": f"User with id {user_id} not found."}), 404)
    return user, None


def _active_policy(user_id: int):
    """Return the first ACTIVE policy for a user, or None."""
    return Policy.query.filter_by(user_id=user_id, status="ACTIVE").first()


def _total_payout_for_user(user_id: int) -> float:
    """Sum all processed payout amounts across all claims for a user."""
    claims = Claim.query.filter_by(user_id=user_id).all()
    total = 0.0
    for claim in claims:
        if claim.payout and claim.payout.status == "PROCESSED":
            total += float(claim.payout.amount)
    return round(total, 2)


# ---------------------------------------------------------------------------
# GET /worker/dashboard/<user_id>
# Returns a quick overview of the worker's insurance status.
# ---------------------------------------------------------------------------
@worker_dashboard_bp.route("/dashboard/<int:user_id>", methods=["GET"])
def worker_dashboard(user_id):
    try:
        user, err = _get_user_or_404(user_id)
        if err:
            return err

        policy       = _active_policy(user_id)
        total_claims = Claim.query.filter_by(user_id=user_id).count()
        total_payout = _total_payout_for_user(user_id)

        return jsonify({
            "user_id":         user_id,
            "name":            user.name,
            "active_policy":   policy is not None,
            "weekly_premium":  float(policy.weekly_premium)  if policy else None,
            "coverage_amount": float(policy.coverage_amount) if policy else None,
            "policy_type":     policy.policy_type if policy else None,
            "total_claims":    total_claims,
            "total_payout":    total_payout,
        }), 200

    except Exception as e:
        return jsonify({"error": "Failed to load worker dashboard.", "details": str(e)}), 500


# ---------------------------------------------------------------------------
# GET /worker/claims/<user_id>
# Returns all claims filed by the worker.
# ---------------------------------------------------------------------------
@worker_dashboard_bp.route("/claims/<int:user_id>", methods=["GET"])
def worker_claims(user_id):
    try:
        _, err = _get_user_or_404(user_id)
        if err:
            return err

        claims = Claim.query.filter_by(user_id=user_id).order_by(Claim.created_at.desc()).all()

        return jsonify({
            "user_id":      user_id,
            "total_claims": len(claims),
            "claims": [
                {
                    "claim_id":     c.claim_id,
                    "trigger_type": c.trigger_type,
                    "status":       c.status,
                    "payout_amount": float(c.payout.amount) if c.payout else 0,
                    "created_at":   c.created_at.strftime("%Y-%m-%d"),
                }
                for c in claims
            ],
        }), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch claims.", "details": str(e)}), 500


# ---------------------------------------------------------------------------
# GET /worker/policy/<user_id>
# Returns the worker's active policy details.
# ---------------------------------------------------------------------------
@worker_dashboard_bp.route("/policy/<int:user_id>", methods=["GET"])
def worker_policy(user_id):
    try:
        _, err = _get_user_or_404(user_id)
        if err:
            return err

        policy = _active_policy(user_id)

        if not policy:
            return jsonify({
                "user_id":       user_id,
                "active_policy": False,
                "message":       "No active policy found for this worker.",
            }), 200

        return jsonify({
            "policy_id":       policy.policy_id,
            "weekly_premium":  float(policy.weekly_premium),
            "coverage_amount": float(policy.coverage_amount),
            "policy_type":     policy.policy_type,
            "status":          policy.status,
            "start_date":      policy.start_date.strftime("%Y-%m-%d"),
            "end_date":        policy.end_date.strftime("%Y-%m-%d") if policy.end_date else None,
        }), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch policy.", "details": str(e)}), 500
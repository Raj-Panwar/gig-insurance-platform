from flask import Blueprint, jsonify, g
from utils.jwt_helper import admin_required
from models.user import User
from models.policy import Policy
from models.claim import Claim

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


# ---------------------------------------------------------------------------
# GET /admin/workers
# Returns all registered workers. Admin only.
# ---------------------------------------------------------------------------
@admin_bp.route("/workers", methods=["GET"])
@admin_required
def get_all_workers():
    workers = User.query.filter_by(role="worker").all()
    return jsonify([
        {
            "user_id": w.id,
            "name":    w.name,
            "email":   w.email,
            "role":    w.role,
        }
        for w in workers
    ]), 200


# ---------------------------------------------------------------------------
# GET /admin/policies
# Returns all policies across all users. Admin only.
# ---------------------------------------------------------------------------
@admin_bp.route("/policies", methods=["GET"])
@admin_required
def get_all_policies():
    policies = Policy.query.all()
    return jsonify({
        "requested_by":   g.current_user.name,
        "total_policies": len(policies),
        "policies": [
            {
                "policy_id":       p.policy_id,
                "user_id":         p.user_id,
                "zone_id":         p.zone_id,
                "status":          p.status,
                "weekly_premium":  float(p.weekly_premium),
                "coverage_amount": float(p.coverage_amount),
            }
            for p in policies
        ],
    }), 200


# ---------------------------------------------------------------------------
# GET /admin/claims
# Returns all claims across all policies. Admin only.
# ---------------------------------------------------------------------------
@admin_bp.route("/claims", methods=["GET"])
@admin_required
def get_all_claims():
    claims = Claim.query.all()
    return jsonify({
        "requested_by": g.current_user.name,
        "total_claims": len(claims),
        "claims": [
            {
                "claim_id":     c.claim_id,
                "user_id":      c.user_id,
                "policy_id":    c.policy_id,
                "event_id":     c.event_id,
                "trigger_type": c.trigger_type,
                "status":       c.status,
                "created_at":   c.created_at.isoformat(),
            }
            for c in claims
        ],
    }), 200
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

        # 🔥 STEP 1: Simulate event (dynamic)
        event = {
            "type": "RAIN",
            "city": user.city,
            "value": random.randint(50, 150)  # dynamic severity
        }

        print("🌦️ Checking trigger:", event)

        # 🔥 STEP 2: Run trigger engine
        trigger_result = process_event(
            event_type=event["type"],
            location=event["city"],
            severity=event["value"]
        )

        print("⚡ Trigger result:", trigger_result)

        # 🔥 STEP 3: Auto claim (ONLY if triggered)
        if trigger_result.get("trigger") == "activated":

            # 🔒 Prevent duplicate claim
            existing_claim = None

            if existing_claim:
                print("⚠️ Claim already exists, skipping")
            else:
                claim_data = process_claim(event, user_id)

                print("💰 AUTO CLAIM:", claim_data)
                print("DEBUG Claim class:", Claim)

                new_claim = Claim(
                    user_id=user_id,
                    trigger_type=event["type"],
                    policy_id=1,
    event_id=1,
                    status="APPROVED",
                  #  payout=claim_data.get("payout", 0)
                )
                print("DEBUG TYPE:", type(new_claim))

                db.session.add(new_claim)
                db.session.commit()
                new_payout = Payout(
                    claim_id=new_claim.claim_id,
                    amount=claim_data.get("payout", 0)
                )

                db.session.add(new_payout)
                db.session.commit()

        # 🔥 STEP 4: Fetch updated claims
        claims = Claim.query.filter_by(user_id=user_id).all()

        return jsonify({
            "user": user.name,
            "city": user.city,
            "total_claims": len(claims)
        }), 200

    except Exception as e:
        print("❌ ERROR:", str(e))
        return jsonify({"error": str(e)}), 500
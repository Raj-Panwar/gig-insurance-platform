from flask import Blueprint, request, jsonify
from database.db import db
from models.claim import Claim
from models.policy import Policy
from models.payout import Payout
from services.payment_service import process_mock_payment
from services.notification_service import notify_payout_processed
from datetime import datetime

payout_bp = Blueprint("payout", __name__, url_prefix="/payout")

PAYOUT_PERCENTAGE = 0.50   # 50% of coverage_amount


# ---------------------------------------------------------------------------
# POST /payout/process
# ---------------------------------------------------------------------------
@payout_bp.route("/process", methods=["POST"])
def process_payout():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    claim_id = data.get("claim_id")
    if claim_id is None:
        return jsonify({"error": "Field 'claim_id' is required."}), 400

    # Step 1: Check claim exists
    claim = Claim.query.get(claim_id)
    if not claim:
        return jsonify({"error": f"Claim with id {claim_id} not found."}), 404

    # Step 2: Check claim is eligible for payout
    if claim.status != "PENDING":
        return jsonify({
            "error": f"Claim is not eligible for payout. Current status: '{claim.status}'."
        }), 409

    # Step 3: Get the linked policy and its coverage amount
    policy = Policy.query.get(claim.policy_id)
    if not policy:
        return jsonify({"error": f"Policy with id {claim.policy_id} not found."}), 404

    # Step 4: Calculate payout amount (50% of coverage)
    payout = round(float(policy.coverage_amount) * PAYOUT_PERCENTAGE, 2)

    # Step 5: Call mock payment gateway
    try:
        transaction = process_mock_payment(
            user_id = claim.user_id,
            amount  = payout,
        )
    except ValueError as e:
        return jsonify({"error": "Payment failed.", "details": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Payment gateway error.", "details": str(e)}), 502

    # Step 6: Create Payout record (store transaction_id for reference)
    payout = Payout(
        claim_id       = claim.claim_id,
        amount         = payout,
        status         = "PROCESSED",
        transaction_id = transaction["transaction_id"],
        processed_at   = datetime.utcnow(),
    )
    db.session.add(payout)

    # Step 7: Update claim status to PAID
    claim.status = "PAID"

    db.session.commit()

    # Fire notification (non-blocking, after commit)
    notify_payout_processed(
        user_id        = claim.user_id,
        amount         = payout,
        transaction_id = transaction["transaction_id"],
    )

    return jsonify({
        "message": "Payout processed successfully.",
        "claim_id":        claim.claim_id,
        "policy_id":       policy.policy_id,
        "coverage_amount": float(policy.coverage_amount),
        "transaction": {
            "transaction_id": transaction["transaction_id"],
            "amount":         transaction["amount"],
            "method":         transaction["method"],
            "status":         transaction["status"],
            "timestamp":      transaction["timestamp"],
        },
    }), 201
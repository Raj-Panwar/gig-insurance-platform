from flask import Blueprint, request, jsonify
from database.db import db
from models.claim import Claim
from models.policy import Policy
from models.payout import Payout
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

    # Step 2: Check claim status is PENDING
    if claim.status != "PENDING":
        return jsonify({
            "error": f"Claim is not eligible for payout. Current status: '{claim.status}'."
        }), 409

    # Step 3: Get the linked policy and its coverage amount
    policy = Policy.query.get(claim.policy_id)
    if not policy:
        return jsonify({"error": f"Policy with id {claim.policy_id} not found."}), 404

    # Step 4: Calculate payout amount (50% of coverage)
    payout_amount = round(float(policy.coverage_amount) * PAYOUT_PERCENTAGE, 2)

    # Step 5: Create Payout record
    payout = Payout(
        claim_id     = claim.claim_id,
        amount       = payout_amount,
        status       = "PROCESSED",
        processed_at = datetime.utcnow(),
    )
    db.session.add(payout)

    # Step 6: Update claim status to PAID
    claim.status = "PAID"

    db.session.commit()

    return jsonify({
        "message":         "Payout processed.",
        "claim_id":        claim.claim_id,
        "policy_id":       policy.policy_id,
        "coverage_amount": float(policy.coverage_amount),
        "payout_amount":   payout_amount,
        "payout_status":   payout.status,
        "processed_at":    payout.processed_at.isoformat(),
    }), 201
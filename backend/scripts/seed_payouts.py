# scripts/seed_payouts.py

"""
Creates payouts for approved claims.

Run:
    cd backend
    python scripts/seed_payouts.py
"""

import sys
import os
from datetime import datetime, timezone

# Add backend path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from database.db import db
from models.claim import Claim
from models.payout import Payout
from models.policy import Policy

def seed():
    app = create_app()

    with app.app_context():
        approved_claims = Claim.query.filter_by(status="APPROVED").all()

        if not approved_claims:
            print("⚠️ No approved claims found. Seed claims first.")
            return

        created = 0
        skipped = 0

        for claim in approved_claims:
            # ✅ Use correct ID (handles both cases)
            claim_id = getattr(claim, "claim_id", getattr(claim, "id", None))

            existing = Payout.query.filter_by(claim_id=claim_id).first()
            if existing:
                skipped += 1
                continue

            # ✅ Get coverage amount safely
            policy = Policy.query.filter_by(
                policy_id=getattr(claim, "policy_id", getattr(claim, "policyId", None))
            ).first()

            amount = policy.coverage_amount if policy else 500

            payout = Payout(
                claim_id=claim_id,
                amount=amount,
                status="PENDING",
                transaction_id=None,
                processed_at=None
            )

            db.session.add(payout)
            created += 1

        db.session.commit()

        print("✅ Payout seeding completed!")
        print(f"✔ Created: {created}")
        print(f"⏭ Skipped: {skipped}")


if __name__ == "__main__":
    seed()
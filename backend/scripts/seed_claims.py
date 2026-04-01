# scripts/seed_claims.py

"""
Creates sample claims for policies.

Run:
    cd backend
    python scripts/seed_claims.py
"""

import sys
import os
import random
from datetime import datetime, timezone

# Add backend path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from database.db import db
from models.policy import Policy
from models.claim import Claim

TRIGGER_TYPES = ["FLOOD", "HEATWAVE", "POLLUTION", "CURFEW"]

def seed():
    app = create_app()

    with app.app_context():
        policies = Policy.query.all()

        if not policies:
            print("⚠️ No policies found. Seed policies first.")
            return

        created = 0
        skipped = 0

        for policy in policies:
            # ✅ Handle both id / policy_id
            policy_id = getattr(policy, "policy_id", getattr(policy, "id", None))

            # 🔒 Prevent duplicate claims per policy
            existing = Claim.query.filter_by(policy_id=policy_id).first()
            if existing:
                skipped += 1
                continue

            # 🎯 Ensure we ALWAYS get some APPROVED claims
            status = random.choices(
                ["APPROVED", "PENDING", "REJECTED"],
                weights=[0.6, 0.3, 0.1]
            )[0]

            claim = Claim(
                user_id=policy.user_id,
                policy_id=policy_id,
                event_id=random.randint(1, 100),
                trigger_type=random.choice(TRIGGER_TYPES),
                status=status,
                created_at=datetime.now(timezone.utc)
            )

            db.session.add(claim)
            created += 1

        db.session.commit()

        print("✅ Claim seeding completed!")
        print(f"✔ Created: {created}")
        print(f"⏭ Skipped (already existed): {skipped}")


if __name__ == "__main__":
    seed()
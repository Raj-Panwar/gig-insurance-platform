# scripts/seed_policies.py
"""
Creates sample policies for workers.
Run once after workers are seeded:

    cd backend
    python scripts/seed_policies.py
"""

import sys
import os
import random
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from database.db import db
from models.user import User
from models.policy import Policy

ZONES = [1,2,3,4,5]  # sample zone IDs

def seed():
    app = create_app()
    with app.app_context():
        workers = User.query.filter_by(role="worker").all()
        for worker in workers:
            existing = Policy.query.filter_by(user_id=worker.id).first()
            if existing:
                continue
            policy = Policy(
                user_id=worker.id,
                zone_id=random.choice(ZONES),
                weekly_premium=random.randint(25,40),
                coverage_amount=random.randint(500,1500),
                status="ACTIVE",
                start_date=datetime.utcnow(),
                end_date=datetime.utcnow() + timedelta(days=7*4)  # 4 weeks
            )
            db.session.add(policy)
        db.session.commit()
        print(f"✅ Policies created for {len(workers)} workers.")

if __name__ == "__main__":
    seed()
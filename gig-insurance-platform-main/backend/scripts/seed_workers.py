# scripts/seed_workers.py

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from database.db import db
from models.user import User

# 🔥 FIXED DATA (NO RANDOM DUPLICATES)
WORKERS = [
    {"id": 2, "name": "Amit",   "email": "amit@gigshield.com"},
    {"id": 3, "name": "Priya",  "email": "priya@gigshield.com"},
    {"id": 4, "name": "Rahul",  "email": "rahul@gigshield.com"},
    {"id": 5, "name": "Sneha",  "email": "sneha@gigshield.com"},
    {"id": 6, "name": "Karan",  "email": "karan@gigshield.com"},
    {"id": 7, "name": "Ananya", "email": "ananya@gigshield.com"},
    {"id": 8, "name": "Vikram", "email": "vikram@gigshield.com"},
    {"id": 9, "name": "Isha",   "email": "isha@gigshield.com"},
    {"id": 10,"name": "Rohan",  "email": "rohan@gigshield.com"},
    {"id": 11,"name": "Meera",  "email": "meera@gigshield.com"},
]

def seed():
    app = create_app()
    with app.app_context():
        count = 0

        for w in WORKERS:

            existing = User.query.filter_by(email=w["email"]).first()

            if existing:
                continue

            worker = User(
                name=w["name"],
                email=w["email"],
                phone=f"900000{w['id']:04}",  # stable phone
                city="Delhi",
                role="worker",
                platform="food_delivery"
            )

            db.session.add(worker)
            count += 1

        db.session.commit()
        print(f"✅ Seeded {count} workers (no duplicates).")

if __name__ == "__main__":
    seed()
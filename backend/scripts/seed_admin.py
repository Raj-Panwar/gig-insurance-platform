"""
scripts/seed_admin.py

Creates the initial admin user.
Run once after the database is created:

    cd backend
    python scripts/seed_admin.py
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from database.db import db
from models.user import User

ADMIN = {
    "name":     "Platform Admin",
    "phone":    "9000000000",
    "email":    "admin@giginsure.in",
    "city":     "Delhi",
    "platform": "internal",
    "role":     "admin",
}


def seed():
    app = create_app()
    with app.app_context():
        existing = User.query.filter_by(role="admin").first()
        if existing:
            print(f"Admin already exists: {existing.name} (id={existing.id}). Skipping.")
            return

        admin = User(**ADMIN)
        db.session.add(admin)
        db.session.commit()
        print(f"✅ Admin created — id={admin.id}, phone={admin.phone}")
        print("   Login with POST /auth/login  body: {\"phone\": \"9000000000\"}")


if __name__ == "__main__":
    seed()
"""
scripts/seed_zones.py

Seed the zones table with Indian cities and risk profiles.
Run once after the database is created:

    cd backend
    python scripts/seed_zones.py
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from database.db import db
from models.zone import Zone

ZONES = [
    # city            risk_level  flood  pollution  heat   lat        lng
    ("Delhi",         "HIGH",     0.5,   0.9,       0.8,   28.6139,   77.2090),
    ("Mumbai",        "HIGH",     0.9,   0.7,       0.5,   19.0760,   72.8777),
    ("Chennai",       "HIGH",     0.7,   0.6,       0.8,   13.0827,   80.2707),
    ("Kolkata",       "HIGH",     0.8,   0.7,       0.6,   22.5726,   88.3639),
    ("Bangalore",     "MEDIUM",   0.3,   0.5,       0.4,   12.9716,   77.5946),
    ("Hyderabad",     "MEDIUM",   0.4,   0.5,       0.6,   17.3850,   78.4867),
    ("Pune",          "MEDIUM",   0.5,   0.4,       0.5,   18.5204,   73.8567),
    ("Ahmedabad",     "MEDIUM",   0.3,   0.6,       0.7,   23.0225,   72.5714),
    ("Jaipur",        "MEDIUM",   0.2,   0.5,       0.8,   26.9124,   75.7873),
    ("Lucknow",       "MEDIUM",   0.4,   0.6,       0.6,   26.8467,   80.9462),
    ("Surat",         "LOW",      0.4,   0.4,       0.5,   21.1702,   72.8311),
    ("Bhopal",        "LOW",      0.3,   0.3,       0.5,   23.2599,   77.4126),
    ("Patna",         "HIGH",     0.8,   0.6,       0.6,   25.5941,   85.1376),
    ("Nagpur",        "LOW",      0.2,   0.3,       0.6,   21.1458,   79.0882),
    ("Chandigarh",    "LOW",      0.2,   0.3,       0.5,   30.7333,   76.7794),
]


def seed():
    app = create_app()
    with app.app_context():
        existing = Zone.query.count()
        if existing > 0:
            print(f"Zones already seeded ({existing} records). Skipping.")
            return

        for city, risk_level, flood_risk, pollution_risk, heat_risk, lat, lng in ZONES:
            zone = Zone(
                city           = city,
                risk_level     = risk_level,
                flood_risk     = flood_risk,
                pollution_risk = pollution_risk,
                heat_risk      = heat_risk,
            )
            # Store lat/lng if the Zone model has those fields
            if hasattr(zone, "latitude"):
                zone.latitude  = lat
                zone.longitude = lng
            db.session.add(zone)

        db.session.commit()
        print(f"✅ Seeded {len(ZONES)} zones successfully.")


if __name__ == "__main__":
    seed()
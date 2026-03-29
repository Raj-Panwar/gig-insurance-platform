#remove if u don't need this
"""
scripts/seed_triggers.py

Seeds parametric triggers and sample disruption events.

Run once after database + zones are created:

    cd backend
    python scripts/seed_triggers.py
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from database.db import db

from models.parametric_trigger import ParametricTrigger
from models.disruption_event import DisruptionEvent


TRIGGERS = [
    ("FLOOD", 200, "HIGH", "Rainfall above 200mm triggers payout"),
    ("HEATWAVE", 45, "CRITICAL", "Temperature above 45°C triggers payout"),
    ("POLLUTION", 300, "HIGH", "AQI above 300 triggers payout"),
]

EVENTS = [
    ("FLOOD", "Mumbai", "HIGH"),
    ("HEATWAVE", "Delhi", "CRITICAL"),
    ("POLLUTION", "Delhi", "HIGH"),
]


def seed():
    app = create_app()

    with app.app_context():

        # Seed triggers
        if ParametricTrigger.query.count() == 0:
            for event_type, threshold, severity, desc in TRIGGERS:
                trigger = ParametricTrigger(
                    event_type=event_type,
                    threshold_value=threshold,
                    severity=severity,
                    description=desc
                )
                db.session.add(trigger)

            print(f"Added {len(TRIGGERS)} parametric triggers")

        else:
            print("Triggers already exist — skipping")

        # Seed disruption events
        if DisruptionEvent.query.count() == 0:
            for event_type, location, severity in EVENTS:
                event = DisruptionEvent(
                    event_type=event_type,
                    location=location,
                    severity=severity
                )
                db.session.add(event)

            print(f"Added {len(EVENTS)} disruption events")

        else:
            print("Events already exist — skipping")

        db.session.commit()
        print("✅ Trigger + event seeding complete")


if __name__ == "__main__":
    seed()
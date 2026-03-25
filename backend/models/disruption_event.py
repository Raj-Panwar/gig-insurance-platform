from database.db import db
from datetime import datetime


class DisruptionEvent(db.Model):
    __tablename__ = "disruption_events"

    event_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_type = db.Column(db.String(50), nullable=False)    # e.g. FLOOD, HEATWAVE, POLLUTION
    location = db.Column(db.String(150), nullable=False)     # City / lat-lon / zone label
    severity = db.Column(db.String(20), nullable=False)      # LOW, MEDIUM, HIGH, CRITICAL
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    claims = db.relationship("Claim", backref="event", lazy=True)

    def __repr__(self):
        return (
            f"<DisruptionEvent event_id={self.event_id} "
            f"event_type={self.event_type} location={self.location}>"
        )
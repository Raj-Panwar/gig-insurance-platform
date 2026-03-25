from database.db import db
from datetime import datetime


class Claim(db.Model):
    __tablename__ = "claims"

    claim_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    policy_id = db.Column(db.Integer, db.ForeignKey("policies.policy_id"), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey("disruption_events.event_id"), nullable=False)
    trigger_type = db.Column(db.String(50), nullable=False)   # e.g. FLOOD, HEATWAVE, POLLUTION
    status = db.Column(db.String(20), nullable=False, default="PENDING")  # PENDING, APPROVED, REJECTED, PAID
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    payout = db.relationship("Payout", backref="claim", uselist=False, lazy=True)  # one-to-one

    def __repr__(self):
        return f"<Claim claim_id={self.claim_id} user_id={self.user_id} status={self.status}>"
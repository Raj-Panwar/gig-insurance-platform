from database.db import db
from datetime import datetime


class Payout(db.Model):
    __tablename__ = "payouts"

    payout_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    claim_id = db.Column(db.Integer, db.ForeignKey("claims.claim_id"), nullable=False, unique=True)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="PENDING")  # PENDING, PROCESSED, FAILED
    processed_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f"<Payout payout_id={self.payout_id} claim_id={self.claim_id} status={self.status}>" 
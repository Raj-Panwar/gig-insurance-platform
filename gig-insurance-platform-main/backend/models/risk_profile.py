from database.db import db
from datetime import datetime


class RiskProfile(db.Model):
    __tablename__ = "risk_profiles"

    profile_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    zone_id = db.Column(db.Integer, db.ForeignKey("zones.zone_id"), nullable=False)
    risk_score = db.Column(db.Float, nullable=False, default=0.0)  # Composite score 0.0 – 100.0
    last_updated = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<RiskProfile profile_id={self.profile_id} user_id={self.user_id} risk_score={self.risk_score}>"
from database.db import db


class Zone(db.Model):
    __tablename__ = "zones"

    zone_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    city = db.Column(db.String(100), nullable=False)
    risk_level = db.Column(db.String(20), nullable=False)   # e.g. LOW, MEDIUM, HIGH, CRITICAL
    flood_risk = db.Column(db.Float, nullable=False, default=0.0)       # 0.0 – 1.0 score
    pollution_risk = db.Column(db.Float, nullable=False, default=0.0)
    heat_risk = db.Column(db.Float, nullable=False, default=0.0)

    # Relationships
    policies = db.relationship("Policy", backref="zone", lazy=True)
    risk_profiles = db.relationship("RiskProfile", backref="zone", lazy=True)

    def __repr__(self):
        return f"<Zone zone_id={self.zone_id} city={self.city} risk_level={self.risk_level}>"
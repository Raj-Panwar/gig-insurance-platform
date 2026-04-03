from database.db import db
from datetime import datetime


class Policy(db.Model):
    __tablename__ = "policies"
   #no need of user id
    policy_id       = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id         = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    zone_id         = db.Column(db.Integer, db.ForeignKey("zones.zone_id"), nullable=False)
    policy_type     = db.Column(db.String(20), nullable=False, default="standard")  # basic | standard | premium
    weekly_premium  = db.Column(db.Numeric(10, 2), nullable=False)
    coverage_amount = db.Column(db.Numeric(12, 2), nullable=False)
    status          = db.Column(db.String(20), nullable=False, default="ACTIVE")   # ACTIVE, EXPIRED, CANCELLED
    start_date      = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    end_date        = db.Column(db.DateTime, nullable=True)

    # Relationships
    claims = db.relationship("Claim", backref="policy", lazy=True)

    def __repr__(self):
        return f"<Policy policy_id={self.policy_id} user_id={self.user_id} type={self.policy_type} status={self.status}>"
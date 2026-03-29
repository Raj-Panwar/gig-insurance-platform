from database.db import db
from datetime import datetime

VALID_ROLES = {"worker", "admin"}


class User(db.Model):
    __tablename__ = "users"

    id         = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name       = db.Column(db.String(120), nullable=False)
    phone      = db.Column(db.String(20), nullable=False, unique=True)
    email      = db.Column(db.String(120), nullable=True, unique=True)   # optional at registration
    city       = db.Column(db.String(100), nullable=False)
    platform   = db.Column(db.String(100), nullable=True)   # e.g. Uber, Swiggy, Dunzo
    role       = db.Column(db.String(20), nullable=False, default="worker")  # "worker" | "admin"
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    policies      = db.relationship("Policy", backref="user", lazy=True)
    risk_profiles = db.relationship("RiskProfile", backref="user", lazy=True)
    claims        = db.relationship("Claim", backref="user", lazy=True)

    def __repr__(self):
        return f"<User id={self.id} name={self.name} role={self.role}>"
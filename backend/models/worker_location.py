from database.db import db
from datetime import datetime


class WorkerLocation(db.Model):
    __tablename__ = "worker_locations"

    id        = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id   = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)
    latitude  = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    city      = db.Column(db.String(100), nullable=True)   # city used for simple location matching
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationship back to User
    user = db.relationship("User", backref=db.backref("location", uselist=False))

    def __repr__(self):
        return (
            f"<WorkerLocation user_id={self.user_id} "
            f"lat={self.latitude} lng={self.longitude} city={self.city}>"
        )
from database.db import db


class ParametricTrigger(db.Model):
    __tablename__ = "parametric_triggers"

    trigger_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_type = db.Column(db.String(50), nullable=False)        # e.g. FLOOD, HEATWAVE, POLLUTION
    threshold_value = db.Column(db.Float, nullable=False)        # Numeric threshold that activates trigger
    severity = db.Column(db.String(20), nullable=False)          # LOW, MEDIUM, HIGH, CRITICAL
    description = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return (
            f"<ParametricTrigger trigger_id={self.trigger_id} "
            f"event_type={self.event_type} severity={self.severity}>"
        )
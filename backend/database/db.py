from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def init_db(app):
    """Initialize the database with the Flask app."""
    db.init_app(app)

    with app.app_context():
        # Import all models so SQLAlchemy registers them before create_all
        from models.user import User          # noqa: F401
        from models.zone import Zone          # noqa: F401
        from models.policy import Policy      # noqa: F401
        from models.risk_profile import RiskProfile  # noqa: F401
        from models.parametric_trigger import ParametricTrigger  # noqa: F401
        from models.disruption_event import DisruptionEvent  # noqa: F401
        from models.claim import Claim        # noqa: F401
        from models.payout import Payout      # noqa: F401

        db.create_all()
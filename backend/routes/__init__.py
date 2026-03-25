from routes.auth_routes import auth_bp
from routes.policy_routes import policy_bp
from routes.trigger_routes import trigger_bp
from routes.payout_routes import payout_bp
from routes.premium_routes import premium_bp
from routes.dashboard_routes import dashboard_bp

__all__ = ["auth_bp", "policy_bp", "trigger_bp", "payout_bp", "premium_bp", "dashboard_bp"]
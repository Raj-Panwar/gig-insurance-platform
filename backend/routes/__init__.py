from routes.auth_routes import auth_bp
from routes.policy_routes import policy_bp
from routes.trigger_routes import trigger_bp
from routes.payout_routes import payout_bp
from routes.premium_routes import premium_bp
from routes.dashboard_routes import dashboard_bp
from routes.simulate_routes import simulate_bp
from routes.worker_routes import worker_bp
from routes.admin_routes import admin_bp
from routes.admin_dashboard_routes import admin_dashboard_bp
from routes.worker_dashboard_routes import worker_dashboard_bp
from routes.ai_routes import ai_bp
from routes.zone_routes import zone_bp      # ← zone city lookup

__all__ = [
    "auth_bp", "policy_bp", "trigger_bp", "payout_bp", "premium_bp",
    "dashboard_bp", "simulate_bp", "worker_bp", "admin_bp",
    "admin_dashboard_bp", "worker_dashboard_bp",
    "ai_bp",
    "zone_bp",                               # ← zone city lookup
]
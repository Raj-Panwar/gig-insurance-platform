"""
app.py  (UPDATED — added AI blueprint)

Place this file at:
    gig-insurance-platform/backend/app.py

Changes from original:
    + Import ai_bp from routes.ai_routes
    + Register ai_bp  →  /ai/*
"""

from flask import Flask
from config import Config
from flask_cors import CORS
from database.db import init_db

# ── Existing route imports (unchanged) ──────────────────────────────────────
from routes.auth_routes             import auth_bp
from routes.policy_routes           import policy_bp
from routes.trigger_routes          import trigger_bp
from routes.payout_routes           import payout_bp
from routes.premium_routes          import premium_bp
from routes.dashboard_routes        import dashboard_bp
from routes.simulate_routes         import simulate_bp
from routes.worker_routes           import worker_bp
from routes.admin_routes            import admin_bp
from routes.admin_dashboard_routes  import admin_dashboard_bp
from routes.worker_dashboard_routes import worker_dashboard_bp
from routes.risk_routes             import risk_bp
from routes.threshold_routes        import threshold_bp

# ── NEW: AI routes ───────────────────────────────────────────────────────────
from routes.ai_routes               import ai_bp
from routes.zone_routes             import zone_bp


def create_app(config_class=Config):

    app = Flask(__name__)
    CORS(app)
    app.config.from_object(config_class)

    init_db(app)

    # ── Existing blueprints (unchanged) ──────────────────────────────────────
    app.register_blueprint(auth_bp)              # /auth/*
    app.register_blueprint(policy_bp)            # /policy/*
    app.register_blueprint(trigger_bp)           # /trigger/*
    app.register_blueprint(payout_bp)            # /payout/*
    app.register_blueprint(premium_bp)           # /premium/*
    app.register_blueprint(dashboard_bp)         # /dashboard/stats
    app.register_blueprint(simulate_bp)          # /simulate/*
    app.register_blueprint(worker_bp)            # /worker/*
    app.register_blueprint(admin_bp)             # /admin/*
    app.register_blueprint(admin_dashboard_bp)   # /dashboard/claims|payouts|workers
    app.register_blueprint(worker_dashboard_bp)  # /worker/dashboard|claims|policy
    app.register_blueprint(risk_bp)              # /risk/*
    app.register_blueprint(threshold_bp)         # /thresholds/*

    # ── NEW: AI blueprint ─────────────────────────────────────────────────────
    app.register_blueprint(ai_bp)                # /ai/*
    app.register_blueprint(zone_bp)              # /zone/*

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
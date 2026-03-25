from flask import Flask
from config import Config
from database.db import init_db
from routes.auth_routes import auth_bp
from routes.policy_routes import policy_bp
from routes.trigger_routes import trigger_bp
from routes.payout_routes import payout_bp
from routes.premium_routes import premium_bp
from routes.dashboard_routes import dashboard_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize database
    init_db(app)

    # Register blueprints
    app.register_blueprint(auth_bp)       # /auth/register, /auth/login
    app.register_blueprint(policy_bp)     # /policy/create, /policy/<user_id>
    app.register_blueprint(trigger_bp)    # /trigger/event
    app.register_blueprint(payout_bp)     # /payout/process
    app.register_blueprint(premium_bp)    # /premium/calculate
    app.register_blueprint(dashboard_bp)  # /dashboard/stats

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)